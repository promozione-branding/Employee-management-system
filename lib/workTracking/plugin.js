// lib/workTracking/plugin.js
//
// Global Mongoose plugin that records every create / update / delete made by a logged-in user
// (admin, manager, sales, employee) into the EmployeeWorkLog collection.
//
// Safety rules, because this runs on every write in the ERP:
//   - it never throws and never changes the operation it observes;
//   - the log is written after the response is sent (Next `after()`), so it adds no latency
//     beyond one indexed read of the "before" state for updates;
//   - writes with no logged-in user (cron jobs, ad syncs) are ignored, except call webhooks,
//     whose agent is taken from the call record itself;
//   - it must not import any model: it is registered before models are compiled.

import mongoose from 'mongoose';
import { jwtVerify } from 'jose';
import { MODEL_REGISTRY, EXCLUDED_MODELS, IGNORED_FIELDS, SENSITIVE_FIELD, describeDocument, clientOf } from './registry';

const LOG_COLLECTION = 'employeeworklogs';
const MULTI_LIMIT = 50; // max documents described for one updateMany / deleteMany
const CACHE_MS = 5 * 60 * 1000;
const EXPLICIT_WINDOW_MS = 2 * 60 * 1000;
const MAX_STRING = 1000;
const MAX_ARRAY = 50;

const UPDATE_OPS = ['findOneAndUpdate', 'updateOne', 'updateMany', 'findOneAndReplace', 'replaceOne'];
const DELETE_OPS = ['findOneAndDelete', 'deleteOne', 'deleteMany'];
const SINGLE_OPS = new Set(['findOneAndUpdate', 'updateOne', 'findOneAndReplace', 'replaceOne', 'findOneAndDelete', 'deleteOne']);

// Next.js request helpers, loaded lazily so this file also works in plain Node scripts.
let nextHeaders = null;
let nextAfter = null;
import('next/headers').then((m) => (nextHeaders = m)).catch(() => {});
import('next/server').then((m) => (nextAfter = m.after)).catch(() => {});

const str = (v) => (v === null || v === undefined ? '' : String(v));
const isTracked = (modelName) => !!modelName && !EXCLUDED_MODELS.has(modelName);
// Logs go to the same database as the model that changed.
const dbOf = (model) => model?.db?.db || mongoose.connection?.db;
const usesDocActor = (modelName) => MODEL_REGISTRY[modelName]?.special === 'call';

/* ------------------------------------------------------------------------------------------ */
/* Who is making the request                                                                   */
/* ------------------------------------------------------------------------------------------ */

async function requestUserId() {
    try {
        if (!nextHeaders) nextHeaders = await import('next/headers');
        const jar = await nextHeaders.cookies();
        const token = jar.get('token')?.value;
        if (!token || !process.env.JWT_SECRET) return null;
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        return payload?.id ? String(payload.id) : null;
    } catch {
        return null; // not inside a request (cron, script) or no valid login
    }
}

function schedule(task) {
    const run = () => Promise.resolve().then(task).catch((error) => console.error('[work-tracker]', error?.message || error));
    try {
        if (nextAfter) {
            nextAfter(run);
            return;
        }
    } catch {
        // outside a request scope
    }
    setTimeout(run, 1500);
}

/* ------------------------------------------------------------------------------------------ */
/* Lookups (cached)                                                                            */
/* ------------------------------------------------------------------------------------------ */

const cache = new Map();
async function cached(key, load) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;
    const value = await load();
    if (value === null || value === undefined) return value; // retry next time
    cache.set(key, { value, expires: Date.now() + CACHE_MS });
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
    return value;
}

const toObjectId = (v) => (v && mongoose.Types.ObjectId.isValid(str(v)) ? new mongoose.Types.ObjectId(str(v)) : null);

async function loadActor(db, { userId, employeeId }) {
    return cached(`actor:${userId || ''}:${employeeId || ''}`, async () => {
        const users = db.collection('users');
        const user = userId ? await users.findOne({ _id: toObjectId(userId) }, { projection: { username: 1, role: 1, employeeId: 1 } }) : employeeId ? await users.findOne({ employeeId: toObjectId(employeeId) }, { projection: { username: 1, role: 1, employeeId: 1 } }) : null;
        const empId = employeeId || user?.employeeId;
        const employee = empId ? await db.collection('employees').findOne({ _id: toObjectId(empId) }, { projection: { 'basicDetails.name': 1, 'basicDetails.designation': 1 } }) : null;
        if (!user && !employee) return null;
        return {
            actorUserId: user?._id || null,
            employeeId: employee?._id || null,
            employeeName: employee?.basicDetails?.name || user?.username || 'Unknown user',
            designation: employee?.basicDetails?.designation || '',
            actorRole: user?.role || 'employee',
        };
    });
}

async function loadClient(db, clientId, fallbackName = '') {
    const id = toObjectId(clientId);
    if (!id) return { clientId: null, clientName: fallbackName || '', clientCompany: '' };
    const customer = await cached(`client:${id}`, () => db.collection('customers').findOne({ _id: id }, { projection: { name: 1, company: 1 } }));
    return { clientId: id, clientName: customer?.name || fallbackName || '', clientCompany: customer?.company || '' };
}

/* ------------------------------------------------------------------------------------------ */
/* Diffing                                                                                     */
/* ------------------------------------------------------------------------------------------ */

const plain = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject({ depopulate: true }) : doc);

function stable(value) {
    return JSON.stringify(value, (key, v) => {
        if (IGNORED_FIELDS.has(key) && key !== '_id') return undefined;
        if (v && typeof v === 'object' && (v._bsontype === 'ObjectId' || v._bsontype === 'ObjectID')) return String(v);
        return v;
    });
}

function sanitize(value, depth = 0, field = '') {
    if (field && SENSITIVE_FIELD.test(field)) return value ? '[hidden]' : value;
    if (value === null || value === undefined) return null;
    if (depth > 4) return '[nested]';
    if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
    if (typeof value !== 'object') return value;
    if (value instanceof Date) return value;
    if (value._bsontype === 'ObjectId' || value._bsontype === 'ObjectID') return String(value);
    if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map((v) => sanitize(v, depth + 1));
    const out = {};
    for (const [k, v] of Object.entries(value)) if (!IGNORED_FIELDS.has(k) || k === '_id') out[k] = sanitize(v, depth + 1, k);
    return out;
}

// Readable before/after value for the "what changed" table.
function displayable(field, value, redact) {
    if (redact || SENSITIVE_FIELD.test(field)) return value ? '[hidden]' : null;
    if (Array.isArray(value)) {
        if (value.some((v) => v && typeof v === 'object' && !(v._bsontype === 'ObjectId'))) return `${value.length} item${value.length === 1 ? '' : 's'}`;
        return value.slice(0, 20).map(String).join(', ');
    }
    return sanitize(value, 2, field);
}

function fieldChanges(modelName, before = {}, after = {}) {
    const cfg = MODEL_REGISTRY[modelName] || {};
    const skip = new Set([...(cfg.ignore || []), ...(cfg.arrays || []).map((a) => a.field)]);
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    const changes = [];
    for (const field of keys) {
        if (IGNORED_FIELDS.has(field) || skip.has(field)) continue;
        if (stable(before?.[field] ?? null) === stable(after?.[field] ?? null)) continue;
        changes.push({ field, oldValue: displayable(field, before?.[field] ?? null, cfg.redactValues), newValue: displayable(field, after?.[field] ?? null, cfg.redactValues) });
    }
    return changes;
}

function itemChanges(beforeItems = [], afterItems = []) {
    const keyOf = (item, i) => (item?._id ? String(item._id) : `#${i}:${stable(item)}`);
    const beforeMap = new Map((beforeItems || []).map((item, i) => [keyOf(item, i), item]));
    const afterMap = new Map((afterItems || []).map((item, i) => [keyOf(item, i), item]));
    const out = [];
    for (const [key, item] of afterMap) {
        const prev = beforeMap.get(key);
        if (!prev) out.push({ change: 'added', item });
        else if (stable(prev) !== stable(item)) out.push({ change: 'edited', item, before: prev });
    }
    for (const [key, item] of beforeMap) if (!afterMap.has(key)) out.push({ change: 'removed', item });
    return out;
}

/* ------------------------------------------------------------------------------------------ */
/* Turning a document change into timeline entries                                             */
/* ------------------------------------------------------------------------------------------ */

function buildEvents(modelName, kind, before, after) {
    const cfg = MODEL_REGISTRY[modelName] || {};
    const doc = after || before;
    const events = [];

    for (const spec of cfg.arrays || []) {
        let items = [];
        if (kind === 'created') items = (after?.[spec.field] || []).map((item) => ({ change: 'added', item }));
        else if (kind === 'deleted') items = cfg.container ? (before?.[spec.field] || []).map((item) => ({ change: 'removed', item })) : [];
        else items = itemChanges(before?.[spec.field], after?.[spec.field]);

        for (const { change, item, before: prevItem } of items.slice(0, MULTI_LIMIT)) {
            const described = spec.describe(item, change, prevItem, doc);
            if (!described) continue;
            events.push({
                ...described,
                clientId: spec.client?.(item) || clientOf(modelName, doc),
                details: spec.details ? spec.details(item, doc) : sanitize(item),
                sourceKey: change === 'added' && item?._id ? `${spec.keyPrefix}:${item._id}` : null,
            });
        }
    }

    if (!cfg.container) {
        if (kind === 'created' || kind === 'deleted') {
            const described = describeDocument(modelName, doc, kind);
            events.unshift({ ...described, clientId: clientOf(modelName, doc), details: {}, sourceKey: `${kind === 'created' ? 'create' : 'delete'}:${modelName}:${doc?._id}` });
        } else {
            const changes = fieldChanges(modelName, before, after);
            if (changes.length) events.unshift({ ...describeDocument(modelName, doc, 'updated', changes), clientId: clientOf(modelName, doc), details: { changes }, sourceKey: null });
        }
    }
    return events;
}

async function alreadyLoggedByRoute(col, actor, modelName, entityId, clientId) {
    // Some routes log their own, richer entry via recordEmployeeWork; don't double count those.
    const who = [actor.actorUserId && { actorUserId: actor.actorUserId }, actor.employeeId && { employeeId: actor.employeeId }].filter(Boolean);
    const what = [{ entityId: str(entityId) }, clientId ? { entityType: modelName, clientId } : null].filter(Boolean);
    if (!who.length) return false;
    return !!(await col.findOne({ source: 'live', createdAt: { $gte: new Date(Date.now() - EXPLICIT_WINDOW_MS) }, $and: [{ $or: who }, { $or: what }] }, { projection: { _id: 1 } }));
}

async function handleDocEvent(db, modelName, kind, before, after, userIdPromise, at = new Date()) {
    if (!db) return;
    const cfg = MODEL_REGISTRY[modelName] || {};
    const doc = after || before;
    if (!doc) return;

    if (cfg.special === 'call') return trackCall(db, doc, await userIdPromise);

    const userId = await userIdPromise;
    if (!userId) return;
    const actor = await loadActor(db, { userId });
    if (!actor) return;

    const events = buildEvents(modelName, kind, before, after);
    if (!events.length) return;

    const col = db.collection(LOG_COLLECTION);
    let resolvedClient = null;
    if (cfg.resolveClient && !clientOf(modelName, doc)) resolvedClient = await cfg.resolveClient(doc, db).catch(() => null);
    const firstClient = toObjectId(events[0].clientId || resolvedClient);
    if (await alreadyLoggedByRoute(col, actor, modelName, doc._id, firstClient)) return;

    const now = at;
    const ownName = modelName === 'Customer' ? { name: doc.name, company: doc.company } : null;
    for (const event of events) {
        const client = await loadClient(db, event.clientId || resolvedClient, cfg.clientName?.(doc) || ownName?.name);
        if (ownName && !client.clientCompany) client.clientCompany = ownName.company || '';
        const entry = {
            ...actor,
            ...client,
            action: event.action,
            summary: String(event.summary || '').slice(0, 500),
            details: sanitize(event.details || {}),
            entityType: modelName,
            entityId: str(doc._id),
            source: 'auto',
            createdAt: now,
            updatedAt: now,
        };
        if (event.sourceKey) await col.updateOne({ sourceKey: event.sourceKey }, { $setOnInsert: { ...entry, sourceKey: event.sourceKey } }, { upsert: true });
        else await col.insertOne(entry);
    }
}

// One timeline entry per phone call, kept up to date as the call progresses (webhooks).
async function trackCall(db, call, cookieUserId) {
    const actor = (call.agentErpUserId && (await loadActor(db, { employeeId: call.agentErpUserId }))) || (cookieUserId && (await loadActor(db, { userId: cookieUserId })));
    if (!actor || !call._id) return;
    const client = await loadClient(db, call.customerId, call.customerName);
    const inbound = call.direction === 'inbound';
    const who = call.customerName || client.clientName || call.customerPhone || (inbound ? call.fromNumber : call.toNumber) || 'unknown number';
    const secs = Number(call.durationSeconds) || 0;
    const duration = secs ? ` · ${Math.floor(secs / 60)}m ${secs % 60}s` : '';
    const status = call.status ? ` (${call.status})` : '';
    const at = call.startedAt || call.createdAt || new Date();
    await db.collection(LOG_COLLECTION).updateOne(
        { sourceKey: `call:${call._id}` },
        {
            $set: {
                ...actor,
                ...client,
                action: inbound ? 'CALL_RECEIVED' : 'CALL_MADE',
                summary: `${inbound ? 'Call from' : 'Called'} ${who}${status}${duration}`.slice(0, 500),
                details: sanitize({ status: call.status || '', connected: !!call.connected, durationSeconds: secs, direction: call.direction || '', phone: call.customerPhone || '', disposition: call.disposition || '', note: call.note || '', recording: call.recordingStoredUrl || call.recordingUrl || '' }),
                updatedAt: new Date(),
            },
            $setOnInsert: { entityType: 'CallLog', entityId: str(call._id), source: 'auto', createdAt: new Date(at) },
        },
        { upsert: true }
    );
}

/* ------------------------------------------------------------------------------------------ */
/* The plugin                                                                                  */
/* ------------------------------------------------------------------------------------------ */

export function workTrackingPlugin(schema) {
    if (schema.__workTracking) return;
    schema.__workTracking = true;

    // --- create / update through doc.save() or Model.create() ---
    schema.pre('save', async function () {
        try {
            const modelName = this.constructor?.modelName;
            if (this.$isSubdocument || !isTracked(modelName)) return;
            const userId = requestUserId();
            const wt = { userId, isNew: this.isNew, before: null, at: new Date() };
            this.$locals.workTracking = wt;
            if (!this.isNew && !usesDocActor(modelName) && (await userId)) wt.before = await this.constructor.findById(this._id).lean();
        } catch {
            // never block a save
        }
    });

    schema.post('save', function (doc) {
        try {
            const wt = doc?.$locals?.workTracking;
            if (!wt) return;
            doc.$locals.workTracking = null;
            const modelName = doc.constructor.modelName;
            const db = dbOf(doc.constructor);
            const after = plain(doc);
            schedule(() => handleDocEvent(db, modelName, wt.isNew ? 'created' : 'updated', wt.before, after, wt.userId, wt.at));
        } catch {
            // ignore
        }
    });

    // --- Model.insertMany() ---
    schema.post('insertMany', function (docs) {
        try {
            const modelName = this?.modelName;
            if (!isTracked(modelName) || !Array.isArray(docs)) return;
            const userId = requestUserId();
            const db = dbOf(this);
            const at = new Date();
            for (const doc of docs.slice(0, MULTI_LIMIT)) {
                const after = plain(doc);
                schedule(() => handleDocEvent(db, modelName, 'created', null, after, userId, at));
            }
        } catch {
            // ignore
        }
    });

    // --- doc.deleteOne() ---
    schema.pre('deleteOne', { document: true, query: false }, function () {
        try {
            const modelName = this.constructor?.modelName;
            if (this.$isSubdocument || !isTracked(modelName)) return;
            this.$locals.workTrackingDelete = { userId: requestUserId(), before: plain(this), at: new Date() };
        } catch {
            // ignore
        }
    });
    schema.post('deleteOne', { document: true, query: false }, function (doc) {
        try {
            const target = doc && doc.$locals ? doc : this;
            const wt = target?.$locals?.workTrackingDelete;
            if (!wt) return;
            target.$locals.workTrackingDelete = null;
            const modelName = target.constructor.modelName;
            const db = dbOf(target.constructor);
            schedule(() => handleDocEvent(db, modelName, 'deleted', wt.before, null, wt.userId, wt.at));
        } catch {
            // ignore
        }
    });

    // --- query updates / deletes (findByIdAndUpdate, updateOne, deleteMany, ...) ---
    schema.pre([...UPDATE_OPS, ...DELETE_OPS], { document: false, query: true }, async function () {
        try {
            const modelName = this.model?.modelName;
            if (!isTracked(modelName)) return;
            const userIdPromise = requestUserId();
            const userId = await userIdPromise;
            if (!userId && !usesDocActor(modelName)) return;
            const single = SINGLE_OPS.has(this.op);
            const sort = this.getOptions?.().sort;
            let finder = this.model.find(this.getFilter()).limit(single ? 1 : MULTI_LIMIT);
            if (single && sort) finder = finder.sort(sort);
            const before = await finder.lean();
            this._workTracking = { userId: userIdPromise, before, op: this.op };
        } catch {
            // never block an update
        }
    });

    schema.post([...UPDATE_OPS, ...DELETE_OPS], { document: false, query: true }, function (result) {
        try {
            const wt = this._workTracking;
            if (!wt) return;
            this._workTracking = null;
            const model = this.model;
            const modelName = model.modelName;
            const db = dbOf(model);
            const upsertedId = result?.upsertedId || (wt.op === 'findOneAndUpdate' && !wt.before.length && result?._id ? result._id : null);

            const at = new Date();
            const isDelete = DELETE_OPS.includes(wt.op);
            const ids = wt.before.map((d) => d._id);
            if (!ids.length && upsertedId) ids.push(upsertedId);
            // Read the after-state right away (not awaited), before later writes in the same request change it.
            const aftersPromise = !isDelete && ids.length ? model.find({ _id: { $in: ids } }).lean().exec() : null;
            aftersPromise?.catch(() => {});

            schedule(async () => {
                if (isDelete) {
                    for (const before of wt.before) await handleDocEvent(db, modelName, 'deleted', before, null, wt.userId, at);
                    return;
                }
                if (!aftersPromise) return;
                const afters = await aftersPromise;
                const beforeById = new Map(wt.before.map((d) => [String(d._id), d]));
                for (const after of afters) {
                    const before = beforeById.get(String(after._id));
                    await handleDocEvent(db, modelName, before ? 'updated' : 'created', before || null, after, wt.userId, at);
                }
            });
        } catch {
            // ignore
        }
    });
}

/** Registers the plugin globally, once per Mongoose instance. Call before any model is compiled. */
export function registerWorkTracking(instance = mongoose) {
    if (instance.__workTrackingRegistered) return;
    instance.__workTrackingRegistered = true;
    instance.plugin(workTrackingPlugin);
}
