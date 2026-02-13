// src/data/scheduleData.js

const scheduleData = [
  // 2026-02-15 (3 lectures)
  { key: 1, date: '2026-02-15', subject: 'Accounting', topic: 'Financial Statements', speaker: 'Alice Smith', name: 'Alice Smith', timing: '10:00 AM - 11:00 AM' },
  { key: 2, date: '2026-02-15', subject: 'Economics', topic: 'Macro Fundamentals', speaker: 'Ellen Park', name: 'Ellen Park', timing: '12:30 PM - 01:30 PM' },
  { key: 3, date: '2026-02-15', subject: 'Quantitative Techniques', topic: 'Time Value of Money', speaker: 'Frank Miller', name: 'Frank Miller', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-16
  { key: 4, date: '2026-02-16', subject: 'Taxation', topic: 'Income Tax Basics', speaker: 'Bob Johnson', name: 'Bob Johnson', timing: '10:00 AM - 11:00 AM' },
  { key: 5, date: '2026-02-16', subject: 'Business Law', topic: 'Contract Essentials', speaker: 'Grace Lee', name: 'Grace Lee', timing: '12:30 PM - 01:30 PM' },
  { key: 6, date: '2026-02-16', subject: 'Costing', topic: 'Marginal Costing', speaker: 'Henry Zhao', name: 'Henry Zhao', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-17
  { key: 7, date: '2026-02-17', subject: 'Audit', topic: 'Audit Planning', speaker: 'Charlie Lee', name: 'Charlie Lee', timing: '10:00 AM - 11:00 AM' },
  { key: 8, date: '2026-02-17', subject: 'Taxation', topic: 'TDS Fundamentals', speaker: 'Irene Khan', name: 'Irene Khan', timing: '12:30 PM - 01:30 PM' },
  { key: 9, date: '2026-02-17', subject: 'Finance', topic: 'Working Capital Management', speaker: 'Jack Turner', name: 'Jack Turner', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-18
  { key: 10, date: '2026-02-18', subject: 'Finance', topic: 'Capital Budgeting', speaker: 'Dana White', name: 'Dana White', timing: '10:00 AM - 11:00 AM' },
  { key: 11, date: '2026-02-18', subject: 'Accounting', topic: 'Ledger Reconciliation', speaker: 'Karan Mehta', name: 'Karan Mehta', timing: '12:30 PM - 01:30 PM' },
  { key: 12, date: '2026-02-18', subject: 'Economics', topic: 'Demand & Supply', speaker: 'Lina Gomez', name: 'Lina Gomez', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-19
  { key: 13, date: '2026-02-19', subject: 'Accounting', topic: 'Journal Entries', speaker: 'Alice Smith', name: 'Alice Smith', timing: '10:00 AM - 11:00 AM' },
  { key: 14, date: '2026-02-19', subject: 'Audit', topic: 'Sampling Techniques', speaker: 'Manish Gupta', name: 'Manish Gupta', timing: '12:30 PM - 01:30 PM' },
  { key: 15, date: '2026-02-19', subject: 'Quantitative Techniques', topic: 'Regression Basics', speaker: 'Nora Patel', name: 'Nora Patel', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-20
  { key: 16, date: '2026-02-20', subject: 'Taxation', topic: 'GST Fundamentals', speaker: 'Bob Johnson', name: 'Bob Johnson', timing: '10:00 AM - 11:00 AM' },
  { key: 17, date: '2026-02-20', subject: 'Business Law', topic: 'Company Law Intro', speaker: 'Olivia Brown', name: 'Olivia Brown', timing: '12:30 PM - 01:30 PM' },
  { key: 18, date: '2026-02-20', subject: 'Finance', topic: 'Portfolio Basics', speaker: 'Paul Singh', name: 'Paul Singh', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-21
  { key: 19, date: '2026-02-21', subject: 'Audit', topic: 'Internal Controls', speaker: 'Charlie Lee', name: 'Charlie Lee', timing: '10:00 AM - 11:00 AM' },
  { key: 20, date: '2026-02-21', subject: 'Accounting', topic: 'Trial Balance Prep', speaker: 'Rita Sharma', name: 'Rita Sharma', timing: '12:30 PM - 01:30 PM' },
  { key: 21, date: '2026-02-21', subject: 'Economics', topic: 'Inflation & Policy', speaker: 'Sameer Rao', name: 'Sameer Rao', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-22
  { key: 22, date: '2026-02-22', subject: 'Finance', topic: 'Investment Analysis', speaker: 'Dana White', name: 'Dana White', timing: '10:00 AM - 11:00 AM' },
  { key: 23, date: '2026-02-22', subject: 'Taxation', topic: 'Filing Basics', speaker: 'Umar Qureshi', name: 'Umar Qureshi', timing: '12:30 PM - 01:30 PM' },
  { key: 24, date: '2026-02-22', subject: 'Audit', topic: 'Audit Report Writing', speaker: 'Vikram Desai', name: 'Vikram Desai', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-23
  { key: 25, date: '2026-02-23', subject: 'Accounting', topic: 'Trial Balance', speaker: 'Alice Smith', name: 'Alice Smith', timing: '10:00 AM - 11:00 AM' },
  { key: 26, date: '2026-02-23', subject: 'Quantitative Techniques', topic: 'Probability Basics', speaker: 'Wendy Lo', name: 'Wendy Lo', timing: '12:30 PM - 01:30 PM' },
  { key: 27, date: '2026-02-23', subject: 'Business Law', topic: 'Negotiable Instruments', speaker: 'Xavier Cruz', name: 'Xavier Cruz', timing: '05:00 PM - 06:00 PM' },

  // 2026-02-24
  { key: 28, date: '2026-02-24', subject: 'Taxation', topic: 'Tax Planning', speaker: 'Bob Johnson', name: 'Bob Johnson', timing: '10:00 AM - 11:00 AM' },
  { key: 29, date: '2026-02-24', subject: 'Finance', topic: 'Derivatives Intro', speaker: 'Yasmin Ali', name: 'Yasmin Ali', timing: '12:30 PM - 01:30 PM' },
  { key: 30, date: '2026-02-24', subject: 'Accounting', topic: 'Bank Reconciliation', speaker: 'Zain Khan', name: 'Zain Khan', timing: '05:00 PM - 06:00 PM' },
];

export default scheduleData;
