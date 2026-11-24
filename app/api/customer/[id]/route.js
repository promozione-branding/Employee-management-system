// app/api/customer/[id]/route.js

import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import SalesEmployee from '@/models/employee/sales/SalesEmployee';
import Employee from '@/models/employee/Employee';
import { createAuditLog } from '@/utils/createAuditLog';
import { getAuthUser } from '@/lib/getAuthUser';
import { recordEdit, diffObjects } from '@/lib/auditLog';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { recordEmployeeWork } from '@/lib/employeeWorkTracker';

// Fields that are optional: submitting a blank value keeps the existing stored value.
const OPTIONAL_TEXT_FIELDS = ['company', 'GSTIN', 'tanNo', 'email', 'website', 'Address', 'city', 'state', 'pincode', 'country', 'category'];

// Per-field max lengths — protects against pasted junk bloating the DB.
const MAX_LENGTH_BY_FIELD = {
    company: 200,
    GSTIN: 15,
    tanNo: 20,
    email: 200,
    website: 300,
    Address: 500,
    city: 100,
    state: 100,
    pincode: 20,
    country: 100,
    category: 60,
};

// Explicitly whitelist the fields we allow to be updated
const ALLOWED_UPDATE_FIELDS = [
    'name', 'company', 'GSTIN', 'tanNo', 'email', 'phone', 'website',
    'Address', 'city', 'state', 'pincode', 'country', 'category',
    'meetingDate', 'isPaid', 'notes', 'salesExecutive'
];

const isValidId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid customer ID' }, { status: 400 });
        }

        const customer = await Customer.findById(id).populate({
            path: 'salesExecutive',
            select: 'basicDetails.name',
        });

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: customer }, { status: 200 });
    } catch (error) {
        console.error('Get customer by ID error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid customer ID' }, { status: 400 });
        }

        const authUser = await getAuthUser(req);

        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        const oldData = customer.toObject();

        await customer.deleteOne();

        const assignedEmployeeIds = (customer.salesExecutive || []).map((employeeId) => employeeId.toString());
        for (const employeeId of assignedEmployeeIds) {
            await SalesEmployee.updateOne({ employeeId }, { $pull: { client: customer._id } });
        }

        await createAuditLog({
            entityType: 'Customer',
            entityId: customer._id,
            action: 'DELETE',
            oldData,
            userId: authUser._id,
        });

        try {
            await recordEdit({
                clientId: customer._id,
                module: 'customer',
                entityId: customer._id,
                action: 'DELETE',
                summary: `Deleted customer "${customer.name}"`,
                actor: { userId: authUser._id },
                isConfidential: false,
                beforeSnapshot: oldData,
                req,
            });
        } catch (auditErr) {
            console.error('[edit-history] failed to record customer delete:', auditErr);
        }

        await recordEmployeeWork({
            req,
            clientId: customer._id,
            clientName: customer.name,
            clientCompany: customer.company,
            action: 'CLIENT_DELETED',
            summary: `Deleted client ${customer.name}`,
            details: { company: customer.company || '', email: customer.email || '', phone: customer.phone || '' },
            entityType: 'Customer',
            entityId: customer._id,
        });

        return NextResponse.json({ success: true, message: `${customer.name} customer deleted successfully` }, { status: 200 });
    } catch (error) {
        console.error('Delete customer error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid customer ID' }, { status: 400 });
        }

        const authUser = await getAuthUser(req);

        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer does not exist' }, { status: 404 });
        }

        const oldData = customer.toObject();
        const oldEmployeeIds = (customer.salesExecutive || []).map((employeeId) => employeeId.toString());

        // Validate GSTIN only when a non-empty value is provided.
        if (Object.prototype.hasOwnProperty.call(body, 'GSTIN')) {
            if (body.GSTIN !== null && body.GSTIN !== undefined && typeof body.GSTIN !== 'string') {
                return NextResponse.json({ success: false, message: 'GSTIN must be a string' }, { status: 400 });
            }

            const gstin = body.GSTIN?.trim().toUpperCase();

            if (gstin && !/^[0-9A-Z]{15}$/.test(gstin)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'GSTIN must contain exactly 15 alphanumeric characters.',
                        errors: [{ field: 'GSTIN', message: 'Please enter a valid 15-character GSTIN.' }],
                    },
                    { status: 400 }
                );
            }

            if (!gstin) {
                delete body.GSTIN;
            } else {
                body.GSTIN = gstin;
            }
        }

        // Keep the existing assignment if the form sends an empty array.
        let newEmployeeIds = oldEmployeeIds;

        if (Object.prototype.hasOwnProperty.call(body, 'salesExecutive')) {
            const rawIds = Array.isArray(body.salesExecutive) ? body.salesExecutive : body.salesExecutive ? [body.salesExecutive] : [];

            const ids = [
                ...new Set(rawIds.filter((employeeId) => typeof employeeId === 'string' && employeeId.trim() !== '').map((employeeId) => employeeId.trim())),
            ];

            if (ids.some((employeeId) => !isValidId(employeeId))) {
                return NextResponse.json({ success: false, message: 'Invalid sales employee ID' }, { status: 400 });
            }

            if (ids.length > 0) {
                for (const employeeId of ids) {
                    const employee = await Employee.findById(employeeId);
                    if (!employee) {
                        return NextResponse.json({ success: false, message: 'Sales employee not found' }, { status: 404 });
                    }
                }
                newEmployeeIds = ids;
                body.salesExecutive = ids;
            } else {
                delete body.salesExecutive;
            }
        }

        // Only update fields that we allow.
        for (const key of Object.keys(body)) {
            // 🛑 THE FIX: We check our explicit ALLOWED_UPDATE_FIELDS list instead of Customer.schema.path(key)
            if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
                continue;
            }

            let value = body[key];

            // Preserve saved values when optional text fields are blank.
            if (OPTIONAL_TEXT_FIELDS.includes(key)) {
                if (value !== null && value !== undefined && typeof value !== 'string') {
                    return NextResponse.json(
                        {
                            success: false,
                            message: `${key} must be a string`,
                            errors: [{ field: key, message: `${key} must be a string.` }],
                        },
                        { status: 400 }
                    );
                }

                if (typeof value === 'string') {
                    value = value.trim();

                    if (!value) {
                        continue;
                    }

                    const maxLen = MAX_LENGTH_BY_FIELD[key];
                    if (maxLen && value.length > maxLen) {
                        return NextResponse.json(
                            {
                                success: false,
                                message: `${key} must be at most ${maxLen} characters.`,
                                errors: [{ field: key, message: `${key} must be at most ${maxLen} characters.` }],
                            },
                            { status: 400 }
                        );
                    }

                    if (key === 'email') value = value.toLowerCase();
                    if (key === 'GSTIN') value = value.toUpperCase();
                } else {
                    continue;
                }
            }

            if (key === 'name') {
                if (typeof value !== 'string' || !value.trim()) {
                    continue;
                }
                value = value.trim();
            }

            if (key === 'phone') {
                const phone = String(value ?? '').trim();
                if (!phone || !Number.isFinite(Number(phone))) {
                    return NextResponse.json({ success: false, message: 'Please enter a valid client phone number' }, { status: 400 });
                }
                value = Number(phone);
            }

            if (key === 'isPaid' && value === '') {
                value = false;
            }

            customer.set(key, value);
        }

        const editedCustomer = await customer.save();

        const changes = Object.keys(body).filter((key) => {
            if (!ALLOWED_UPDATE_FIELDS.includes(key)) return false;
            const before = oldData[key];
            const after = editedCustomer.get(key);
            return JSON.stringify(before) !== JSON.stringify(after);
        }).map((field) => ({ field, oldValue: oldData[field] ?? null, newValue: editedCustomer.get(field) ?? null }));
        if (changes.length) {
            await recordEmployeeWork({
                req,
                clientId: editedCustomer._id,
                action: 'CLIENT_UPDATED',
                summary: `Updated client profile (${changes.length} field${changes.length === 1 ? '' : 's'})`,
                details: { changes },
                entityType: 'Customer',
                entityId: editedCustomer._id,
            });
        }

        // Synchronize the SalesEmployee client lists if the assignment changed.
        const assignmentsChanged = oldEmployeeIds.length !== newEmployeeIds.length || oldEmployeeIds.some((employeeId) => !newEmployeeIds.includes(employeeId));

        if (assignmentsChanged) {
            const removedEmployeeIds = oldEmployeeIds.filter((employeeId) => !newEmployeeIds.includes(employeeId));

            for (const employeeId of removedEmployeeIds) {
                await SalesEmployee.updateOne({ employeeId }, { $pull: { client: editedCustomer._id } });
            }

            for (const employeeId of newEmployeeIds) {
                let salesEmployee = await SalesEmployee.findOne({ employeeId });

                if (!salesEmployee) {
                    salesEmployee = await SalesEmployee.create({
                        employeeId,
                        client: [editedCustomer._id],
                    });

                    const employee = await Employee.findById(employeeId);
                    if (employee) {
                        employee.salesDetails = salesEmployee._id;
                        await employee.save();
                    }
                } else {
                    const alreadyAssigned = (salesEmployee.client || []).some((clientId) => clientId.toString() === editedCustomer._id.toString());
                    if (!alreadyAssigned) {
                        salesEmployee.client.push(editedCustomer._id);
                        await salesEmployee.save();
                    }
                }
            }
        }

        // Create the audit log
        const auditLog = await createAuditLog({
            clientId: id,
            entityType: 'Customer',
            entityId: editedCustomer._id,
            action: 'UPDATE',
            oldData,
            newData: editedCustomer.toObject(),
            userId: authUser._id,
        });

        if (auditLog?._id) {
            editedCustomer.history.push(auditLog._id);
            await editedCustomer.save();
        }

        // Mirror to unified EditHistory
        try {
            const changes = diffObjects(oldData, editedCustomer.toObject());
            if (changes.length > 0) {
                await recordEdit({
                    clientId: editedCustomer._id,
                    module: 'customer',
                    entityId: editedCustomer._id,
                    action: 'UPDATE',
                    summary: `Updated customer profile (${changes.length} field${changes.length === 1 ? '' : 's'} changed)`,
                    changes,
                    actor: { userId: authUser._id },
                    isConfidential: false,
                    beforeSnapshot: oldData,
                    afterSnapshot: editedCustomer.toObject(),
                    req,
                });
            }
        } catch (auditErr) {
            console.error('[edit-history] failed to record customer update:', auditErr);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Customer updated successfully',
                data: editedCustomer,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Edit customer by ID error:', error);

        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Customer validation failed',
                    errors:
                        error.name === 'ValidationError'
                            ? Object.values(error.errors).map((err) => ({
                                  field: err.path,
                                  message: err.message,
                              }))
                            : [{ field: error.path || 'unknown', message: error.message }],
                },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
