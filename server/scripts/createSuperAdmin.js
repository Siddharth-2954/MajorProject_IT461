/**
 * Script to create the first super admin user
 * Run this once to initialize the super admin account
 * 
 * Usage: node scripts/createSuperAdmin.js
 */

require('dotenv').config();
const readline = require('readline');
const adminModel = require('../models/adminModel');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createSuperAdmin() {
  console.log('\n=== Super Admin Account Setup ===\n');
  console.log('This will create the first super admin account for your LMS.\n');

  try {
    // Ensure tables exist and columns are added
    await adminModel.ensureTable();
    await adminModel.ensureActivityTable();
    await adminModel.ensureAuditTable();

    // Check if any super admin already exists
    // Wrap in try-catch in case 'role' column doesn't exist yet (older schema)
    const pool = require('../config/database');
    try {
      const [[existing]] = await pool.query(
        'SELECT COUNT(*) as cnt FROM admins WHERE role = "super_admin"'
      );
      
      if (existing.cnt > 0) {
        console.log('⚠️  A super admin account already exists!');
        const confirm = await question('Do you want to create another super admin? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
          console.log('Cancelled.');
          rl.close();
          process.exit(0);
        }
      }
    } catch (roleCheckError) {
      // If role column doesn't exist yet, it means no super admin exists
      // This is fine - we'll create the first one
      console.log('Note: Creating first super admin (role column being initialized)...');
    }

    // Get super admin details
    const username = await question('Username: ');
    const password = await question('Password: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email: ');
    const dob = await question('Date of Birth (YYYY-MM-DD, optional): ');

    if (!username || !password) {
      console.error('❌ Username and password are required!');
      rl.close();
      process.exit(1);
    }

    // Check if username already exists
    const existingUser = await adminModel.findByUsername(username);
    if (existingUser) {
      console.error('❌ Username already exists!');
      rl.close();
      process.exit(1);
    }

    // Insert super admin
    const pool = require('../config/database');
    
    // Check if role column exists before using it in INSERT
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'admins' 
       AND COLUMN_NAME IN ('role', 'status')`
    );
    
    const hasRoleColumn = cols.some(c => c.COLUMN_NAME === 'role');
    const hasStatusColumn = cols.some(c => c.COLUMN_NAME === 'status');
    
    let columns, values;
    
    if (hasRoleColumn && hasStatusColumn) {
      // New schema with role and status
      columns = ['username', 'firstName', 'lastName', 'email', 'password', 'dob', 'role', 'status'];
      values = [
        username,
        firstName || null,
        lastName || null,
        email || null,
        password,
        dob || null,
        'super_admin',
        'active'
      ];
    } else {
      // Older schema without role/status - just insert basic fields
      // The columns will be added by ensureTable() on next server start
      columns = ['username', 'firstName', 'lastName', 'email', 'password', 'dob'];
      values = [
        username,
        firstName || null,
        lastName || null,
        email || null,
        password,
        dob || null
      ];
      console.log('⚠️  Creating with basic schema. Role/status will be added on next server start.');
    }

    const placeholders = columns.map(() => '?').join(',');
    const sql = `INSERT INTO admins (${columns.join(',')}) VALUES (${placeholders})`;
    
    await pool.execute(sql, values);
    
    // If we created without role/status, update them now if columns exist
    if (!hasRoleColumn || !hasStatusColumn) {
      console.log('Updating role and status...');
      if (hasRoleColumn) {
        await pool.execute('UPDATE admins SET role = ? WHERE username = ?', ['super_admin', username]);
      }
      if (hasStatusColumn) {
        await pool.execute('UPDATE admins SET status = ? WHERE username = ?', ['active', username]);
      }
    }

    console.log('\n✅ Super Admin account created successfully!\n');
    console.log('Details:');
    console.log(`  Username: ${username}`);
    console.log(`  Name: ${firstName} ${lastName}`);
    console.log(`  Email: ${email}`);
    console.log(`  Role: Super Admin`);
    console.log(`  Status: Active`);
    console.log('\nYou can now login at: /admin/login');
    console.log('After login, you will be redirected to the super admin dashboard.\n');

    // Log the creation in audit logs
    await adminModel.insertAuditLog({
      actor_username: 'system',
      actor_role: 'system',
      action: 'CREATE_SUPER_ADMIN',
      target_type: 'admin',
      target_id: username,
      details: { firstName, lastName, email },
      ip: 'localhost'
    });

  } catch (err) {
    console.error('❌ Error creating super admin:', err.message || err);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createSuperAdmin();
