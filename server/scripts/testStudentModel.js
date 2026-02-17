const studentModel = require('../models/studentModel');
const bcrypt = require('bcrypt');

async function run() {
  try {
    console.log('Ensuring students table exists...');
    await studentModel.ensureTable();

    const test = {
      registrationId: 'TEST1001',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      mobile: '9999999999',
      confirmPassword: null,
      dob: '2000-01-01',
      addressLine1: '123 Street',
      addressLine2: null,
      city: 'City',
      state: 'State',
      pincode: '123456',
      country: 'Country',
      qualification: 'BSc',
      fieldOfStudy: 'Testing',
      institution: 'Test University',
      yearOfPassing: 2020,
      grade: 'A',
      experience: null,
      company: null,
    };

    console.log('Inserting test student (if not exists)...');
    const cnt = await studentModel.countByEmail(test.email);
    if (cnt === 0) {
      // hash password and insert
      const hashed = await bcrypt.hash('secret123', 10);
      test.confirmPassword = hashed;
      const r = await studentModel.insertStudent(test);
      console.log('Inserted student:', r.insertId || r);
    } else {
      console.log('Student already exists, skipping insert');
    }

    console.log('Finding by email...');
    const found = await studentModel.findByEmail(test.email);
    console.log('Found:', found);

    console.log('Finding by registrationId...');
    const found2 = await studentModel.findByRegistrationId(test.registrationId);
    console.log('Found2:', found2);

    console.log('Updating password...');
    const newHash = await bcrypt.hash('newpass', 10);
    await studentModel.updatePasswordByRegistrationId(test.registrationId, newHash);
    const after = await studentModel.findByRegistrationId(test.registrationId);
    console.log('After update confirmPassword startsWith $2:', typeof after.confirmPassword === 'string' && after.confirmPassword.startsWith('$2'));

    console.log('Done');
  } catch (e) {
    console.error('Test script error:', e && e.message ? e.message : e);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();
