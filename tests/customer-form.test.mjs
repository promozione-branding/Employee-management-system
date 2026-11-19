// tests/customer-form.test.mjs
// Run: node --test tests/customer-form.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { addCustomerFormControl } from '../config/data.js';
import { initalCustomerFormData } from '../config/initialFormDate.js';
import { buildCustomerFormData, buildCustomerPayload, escapeRegExp, matchesCategory, validateCustomerForm } from '../lib/customerForm.js';

test('category is in the shared controls and initial data', () => {
    assert.ok(addCustomerFormControl.some((c) => c.name === 'category'));
    assert.equal(initalCustomerFormData.category, '');
});

test('only name and phone are required controls', () => {
    const required = addCustomerFormControl.filter((c) => c.required).map((c) => c.name);
    assert.deepEqual(required.sort(), ['name', 'phone']);
});

test('validation: only name + phone compulsory', () => {
    assert.match(validateCustomerForm({ name: '', phone: '' }), /name/i);
    assert.match(validateCustomerForm({ name: 'Asha', phone: '' }), /contact/i);
    assert.match(validateCustomerForm({ name: 'Asha', phone: 'abc' }), /contact/i);
    // Everything else (category, GST, city, ...) may stay blank.
    assert.equal(validateCustomerForm({ name: 'Asha', phone: '9876543210' }), null);
});

test('payload drops blank optional fields, keeps category', () => {
    const payload = buildCustomerPayload({
        ...initalCustomerFormData,
        name: ' Asha ',
        phone: '9876543210',
        category: ' Retail ',
        GSTIN: '',
        city: '',
    });
    assert.equal(payload.name, 'Asha');
    assert.equal(payload.category, 'Retail');
    assert.equal('GSTIN' in payload, false);
    assert.equal('city' in payload, false);
    assert.equal(payload.isPaid, false);
});

test('payload converts Paid and salesExecutive select value', () => {
    const payload = buildCustomerPayload({ ...initalCustomerFormData, name: 'A', phone: '123', isPaid: 'Paid', salesExecutive: 'emp1' });
    assert.equal(payload.isPaid, true);
    assert.deepEqual(payload.salesExecutive, ['emp1']);
    const noExec = buildCustomerPayload({ ...initalCustomerFormData, name: 'A', phone: '123' });
    assert.equal('salesExecutive' in noExec, false);
});

test('category filter: manual typing matches partially, case-insensitive', () => {
    assert.equal(matchesCategory('Retail Store', 'retail'), true);
    assert.equal(matchesCategory('Retail Store', 'RET'), true);
    assert.equal(matchesCategory('Retail Store', 'wholesale'), false);
    assert.equal(matchesCategory('', 'retail'), false);
    assert.equal(matchesCategory(undefined, ''), true);
    assert.equal(escapeRegExp('a.b(c)'), 'a\\.b\\(c\\)');
});

test('edit form data: old customer without category does not break', () => {
    const form = buildCustomerFormData({ name: 'Old', phone: 9876543210, isPaid: true, notes: ['hello'], salesExecutive: [{ _id: 'e1' }] });
    assert.equal(form.category, '');
    assert.equal(form.phone, '9876543210');
    assert.equal(form.isPaid, 'Paid');
    assert.equal(form.notes, 'hello');
    assert.equal(form.salesExecutive, 'e1');
    assert.equal('_id' in form, false);
});
