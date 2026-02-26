const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const studentModel = require("../models/studentModel");

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

    // Normalize dob to MySQL DATE (YYYY-MM-DD).
    // - If the client sends a date-only string 'YYYY-MM-DD', keep it as-is (no TZ shift).
    // - Otherwise parse into a Date and use local components to avoid UTC offset shifting to previous day.
    function formatToMySQLDate(v) {
      if (v === null || v === undefined || v === "") return null;
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      const d = v instanceof Date ? v : new Date(v);
      if (isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    // ensure table exists
    await studentModel.ensureTable();

    // If email provided, reject duplicates
    if (email) {
      try {
        const cnt = await studentModel.countByEmail(email);
        if (cnt && cnt > 0) {
          return res
            .status(409)
            .json({ success: false, error: "User already exists" });
        }
      } catch (e) {
        console.error("email check error", e);
      }
    }

    const student = {
      registrationId: req.body.registrationId ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      email: email ?? null,
      mobile: mobile ?? null,
      confirmPassword: hashedConfirm ?? null,
      dob: formatToMySQLDate(dob),
      addressLine1: addressLine1 ?? null,
      addressLine2: addressLine2 ?? null,
      city: city ?? null,
      state: state ?? null,
      pincode: pincode ?? null,
      country: country ?? null,
      qualification: qualification ?? null,
      fieldOfStudy: fieldOfStudy ?? null,
      institution: institution ?? null,
      yearOfPassing: yearOfPassing ?? null,
      grade: grade ?? null,
      experience: experience ?? null,
      company: company ?? null,
    };

    const result = await studentModel.insertStudent(student);
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
    // accept `loginNumber` from the client as a synonym for registrationId
    const registrationId =
      req.body &&
      (req.body.registrationId || req.body.loginNumber || req.body.loginNum);

    if ((!email && !registrationId) || !password)
      return res
        .status(400)
        .json({
          success: false,
          error: "email/registrationId and password required",
        });

    

    // Try email-based auth first (if provided)
    if (email) {
      const user = await studentModel.findByEmail(email);
      if (user) {
        const hash = user.confirmPassword;
        if (hash) {
          try {
            let match = false;
            if (typeof hash === "string" && /^\$2[aby]\$/.test(hash)) {
              match = await bcrypt.compare(password, hash);
            } else {
              match = String(password) === String(hash);
            }
            if (match) {
              if (req.session)
                req.session.user = {
                  registrationId: user.registrationId,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                };
              return res.json({
                success: true,
                user: {
                  registrationId: user.registrationId,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
              });
            } else {
              console.warn(
                "students login: password mismatch for email",
                email,
              );
            }
          } catch (e) {
            console.error(
              "students login: bcrypt compare error",
              e && e.message ? e.message : e,
            );
          }
        } else {
          console.warn(
            "students login: no password hash stored for email",
            email,
          );
        }
      } else {
        console.warn("students login: no user found for email", email);
      }
      // fall through to registrationId checks rather than immediate 401
    }

    // Try registrationId-based auth if provided
    if (registrationId) {
      const user = await studentModel.findByRegistrationId(registrationId);
      if (user) {
        const hash = user.confirmPassword;
        if (hash) {
          try {
            let match = false;
            if (typeof hash === "string" && /^\$2[aby]\$/.test(hash)) {
              match = await bcrypt.compare(password, hash);
            } else {
              match = String(password) === String(hash);
            }
            if (match) {
              if (req.session)
                req.session.user = {
                  registrationId: user.registrationId,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                };
              return res.json({
                success: true,
                user: {
                  registrationId: user.registrationId,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
              });
            } else {
              console.warn(
                "students login: password mismatch for registrationId",
                registrationId,
              );
            }
          } catch (e) {
            console.error(
              "students login: bcrypt compare error",
              e && e.message ? e.message : e,
            );
          }
        } else {
          console.warn(
            "students login: no password hash stored for registrationId",
            registrationId,
          );
        }
      } else {
        console.warn(
          "students login: no user found for registrationId",
          registrationId,
        );
      }
    }

    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
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
    if (!req.session || !req.session.user)
      return res.status(401).json({ authenticated: false });
    // If session already contains full user info (e.g. fallback/test user), return it directly
    if (req.session.user.firstName || req.session.user.lastName) {
      return res.json({ authenticated: true, user: req.session.user });
    }
    const { registrationId, email } = req.session.user;
    let u = null;
    if (registrationId)
      u = await studentModel.findByRegistrationId(registrationId);
    else if (email) u = await studentModel.findByEmail(email);
    else return res.status(404).json({ authenticated: false });

    if (u)
      return res.json({
        authenticated: true,
        user: {
          registrationId: u.registrationId,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
        },
      });

    return res.status(404).json({ authenticated: false });
  } catch (err) {
    console.error("students me error:", err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

module.exports = { createStudent, login, me };
