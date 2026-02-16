const pool = require("../config/database");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

async function createStudent(req, res) {
  console.log("createStudent called");
  const {
    firstName,
    lastName,
    email,
    mobile,
    dob,
    confirmPassword,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    qualification,
    fieldOfStudy,
    institution,
    yearOfPassing,
    grade,
    experience,
    company,
  } = req.body || {};

  // Log received data for debugging (avoid logging sensitive info in production)
  try {
    console.log("Received student data: email=", email);
  } catch (e) {
    console.log("Received student data (non-serializable)");
  }

  // Accept partial data — missing fields are allowed and will be stored as NULL

  try {
    let hashedConfirm = null;

    if (confirmPassword) {
      // use bcrypt to hash confirmPassword
      hashedConfirm = await bcrypt.hash(confirmPassword, 10);
    }

    // ensure table exists with the requested fields
    const createSql = `
      CREATE TABLE IF NOT EXISTS students (
        registrationId VARCHAR(100),
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        email VARCHAR(255),
        mobile VARCHAR(50),
        confirmPassword VARCHAR(255),
        dob DATE,
        addressLine1 VARCHAR(255),
        addressLine2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(50),
        country VARCHAR(100),
        qualification VARCHAR(255),
        fieldOfStudy VARCHAR(255),
        institution VARCHAR(255),
        yearOfPassing INT,
        grade VARCHAR(50),
        experience VARCHAR(255),
        company VARCHAR(255)
      );
    `;
    await pool.query(createSql);

    // If email provided, reject duplicates
    if (email) {
      try {
        const escapedEmail = mysql.escape(email);
        const [rows] = await pool.query(
          `SELECT COUNT(*) AS cnt FROM students WHERE email = ${escapedEmail}`,
        );
        const cnt = rows && rows[0] && (rows[0].cnt ?? rows[0]["COUNT(*)"]);
        if (cnt && cnt > 0) {
          return res
            .status(409)
            .json({ success: false, error: "User already exists" });
        }
      } catch (e) {
        // ignore duplicate-check errors and continue to attempt insert
        console.error("email check error", e);
      }
    }

    const columns = [
      "registrationId",
      "firstName",
      "lastName",
      "email",
      "mobile",
      "confirmPassword",
      "dob",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "country",
      "qualification",
      "fieldOfStudy",
      "institution",
      "yearOfPassing",
      "grade",
      "experience",
      "company",
    ];

    const rawVals = [
      req.body.registrationId ?? null,
      firstName ?? null,
      lastName ?? null,
      email ?? null,
      mobile ?? null,
      hashedConfirm ?? null,
      dob ?? null,
      addressLine1 ?? null,
      addressLine2 ?? null,
      city ?? null,
      state ?? null,
      pincode ?? null,
      country ?? null,
      qualification ?? null,
      fieldOfStudy ?? null,
      institution ?? null,
      yearOfPassing ?? null,
      grade ?? null,
      experience ?? null,
      company ?? null,
    ];


    // Escape each value using mysql.escape (produces 'NULL' for null)
    const escaped = rawVals.map((v) => mysql.escape(v));
    const insertSql = `INSERT INTO students (${columns.join(",")}) VALUES (${escaped.join(",")})`;
    const [result] = await pool.query(insertSql);

    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(
      "createStudent error:",
      err && err.message ? err.message : err,
    );
    if (err && err.stack) console.error(err.stack);
    if (err && err.sql) console.error("SQL:", err.sql);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, error: "email and password required" });

    const escapedEmail = mysql.escape(email);
    const [rows] = await pool.query(
      `SELECT registrationId, email, confirmPassword FROM students WHERE email = ${escapedEmail} LIMIT 1`,
    );
    if (!rows || rows.length === 0)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const user = rows[0];
    const hash = user.confirmPassword;
    if (!hash)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const match = await bcrypt.compare(password, hash);
    if (!match)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    // store minimal info in session
    if (req.session) {
      req.session.user = { registrationId: user.registrationId, email: user.email };
    }

    return res.json({
      success: true,
      user: { registrationId: user.registrationId, email: user.email },
    });
  } catch (err) {
    console.error(
      "students login error:",
      err && err.message ? err.message : err,
    );
    if (err && err.stack) console.error(err.stack);
    if (err && err.sql) console.error("SQL:", err.sql);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function me(req, res) {
  try {
    if (!req.session || !req.session.user) return res.status(401).json({ authenticated: false });
    const { registrationId, email } = req.session.user;
    let rows;
    if (registrationId) {
      [rows] = await pool.execute('SELECT registrationId, firstName, lastName, email FROM students WHERE registrationId = ? LIMIT 1', [registrationId]);
    } else if (email) {
      [rows] = await pool.execute('SELECT registrationId, firstName, lastName, email FROM students WHERE email = ? LIMIT 1', [email]);
    } else {
      return res.status(404).json({ authenticated: false });
    }

    if (rows && rows.length > 0) {
      const u = rows[0];
      return res.json({ authenticated: true, user: { registrationId: u.registrationId, email: u.email, firstName: u.firstName, lastName: u.lastName } });
    }

    return res.status(404).json({ authenticated: false });
  } catch (err) {
    console.error('students me error:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

module.exports = { createStudent, login, me };