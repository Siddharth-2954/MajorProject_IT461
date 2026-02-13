const sampleTitles = [
  'CA Foundation Induction Programme',
  'Charcha ka Vishay: CA Pariksha September 2025',
  'Join CA Foundation Induction Programme',
  'Exam Preparation Strategies',
  'Accounting Basics',
  'Taxation Fundamentals',
  'Auditing and Assurance',
  'Business Laws Overview',
  'Financial Reporting Insights',
  'Corporate and Other Laws',
  'Cost Accounting Techniques',
  'Information Technology and Strategic Management',
  'Ethics and Communication',
  'Advanced Financial Management',
  'Strategic Business Management',
  'Risk Management and Insurance',
  'Capital Markets and Investment Analysis',
  'International Taxation',
  'Company Secretarial Practices',
  'Professional Ethics and Cyber Laws',
];

const accountingVideo = {
  id: 'acct-yt-1',
  title: 'Accounting Basics - Full Tutorial',
  date: '2026-02-15',
  time: '10:00 AM - 11:00 AM',
  youtubeId: 'Ke90Tje7VS0',
  description: 'Accounting Basics tutorial video (YouTube).',
};

export const webinars = [
  accountingVideo,
  ...Array.from({ length: 100 }, (_, i) => ({
    id: String(i + 1),
    title: `${sampleTitles[i % sampleTitles.length]} – Session ${i + 1}`,
    date: `2025-${String(((i % 12) + 1)).padStart(2, '0')}-${String(((i % 28) + 1)).padStart(2, '0')}`,
    time: i % 2 === 0 ? '3:00 PM – 6:00 PM IST' : '10:00 AM – 1:30 PM IST',
    youtubeId: 'Ke90Tje7VS0',
    description: 'Dummy webinar data for listing purpose.',
  })),
];