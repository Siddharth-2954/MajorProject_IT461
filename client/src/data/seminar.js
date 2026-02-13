export const seminars = [
  // first 10 original seminars
  {
    id: "s1",
    title: "Complete Financial Accounting Course",
    speaker: "Finance Trainer",
    youtubeId: "eyXKvOrDoqw",
    date: "2023-07-31",
    description:
      "Comprehensive tutorial on financial accounting covering basics to advanced topics.",
  },
  {
    id: "s2",
    title: "The Basics of Tax Accounting",
    speaker: "Aletta Boshoff",
    youtubeId: "oIQeztLXLsI",
    date: "2021-09-22",
    description: "Introduction to tax accounting fundamentals.",
  },
  {
    id: "s3",
    title: "Introduction to Taxation",
    speaker: "ICAN Online Tutors",
    youtubeId: "07thcVWkIkA",
    date: "2023-06-13",
    description:
      "Basic concepts of taxation explained in a beginner‑friendly style.",
  },
  {
    id: "s4",
    title: "Accounting Fundamentals Part 1",
    speaker: "CFI Course",
    youtubeId: "a4pv5Ci6_uw",
    date: "2025-04-07",
    description:
      "Foundational principles of accounting including key terms & financial statements.",
  },
  {
    id: "s5",
    title: "Learn 80% of Accounting in 20 Minutes",
    speaker: "Level Accountant Academy",
    youtubeId: "-csJa169Njw",
    date: "2025-04-09",
    description: "Quick conceptual overview of core accounting ideas.",
  },
  {
    id: "s6",
    title: "Governmental Accounting Basics Webinar",
    speaker: "Public Accounting Trainer",
    youtubeId: "CH5l1KpnoXI",
    date: "2021-01-29",
    description:
      "Webinar on foundational governmental accounting and reporting principles.",
  },
  {
    id: "s7",
    title: "Audit Reporting Explained",
    speaker: "Raymund Francis Escala, CPA",
    youtubeId: "bGzmqN3bda0",
    date: "2020-10-13",
    description: "Overview of audit reporting standards and techniques.",
  },
  {
    id: "s8",
    title: "Free Bookkeeping Course Part 1",
    speaker: "Bookkeeping Channel",
    youtubeId: "Fm9BECuNbkw",
    date: "2020-06-23",
    description:
      "Introduction to bookkeeping and double‑entry accounting principles.",
  },
  {
    id: "s9",
    title: "Excel for Finance & Accounting Tutorial",
    speaker: "Learnit Anytime",
    youtubeId: "hkybRW7Z3Yk",
    date: "2024-03-29",
    description:
      "Learn accounting and financial tools using Excel in this free tutorial.",
  },
  {
    id: "s10",
    title: "The Basics of Accounting: Refresher",
    speaker: "Accounting Educator",
    youtubeId: "RNYAw2DK5QU",
    date: "2024-06-16",
    description:
      "Refresher course on core accounting concepts and entries.",
  },

  // generated seminars s11 - s100
  ...Array.from({ length: 90 }, (_, index) => {
    const num = index + 11;
    return {
      id: `s${num}`,
      title: `Accounting Seminar ${num}`,
      speaker: `Expert Instructor ${((num - 1) % 5) + 1}`,
      youtubeId: "eyXKvOrDoqw", // placeholder, replace with actual YouTube IDs if available
      date: `2024-${String(((num - 1) % 12) + 1).padStart(2, "0")}-15`,
      description: `In-depth accounting seminar covering topic ${num}, designed for CA and finance students.`,
    };
  }),
];