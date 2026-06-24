/* ============================================================
   CivicConnect AI — Data & AI Routing Engine
   ============================================================ */

// AI issue detection results based on category
const AI_ROUTING = {
  pothole: {
    label: 'Pothole / Road damage',
    dept: 'PWD – Roads & Infrastructure',
    eta: '2–4 working days',
    baseScore: 8.2,
    tip: 'High-traffic zone detected. Marked urgent for pre-monsoon repair schedule. PWD field team notified.',
    keywords: ['pothole', 'road', 'crack', 'damage', 'broken road', 'tarmac'],
    confidence: 96
  },
  streetlight: {
    label: 'Broken streetlight',
    dept: 'Municipal Electrical Dept',
    eta: '3–5 working days',
    baseScore: 6.4,
    tip: 'Night-safety risk flagged. Auto-routed to Ward Electrical Officer. A work order has been raised.',
    keywords: ['streetlight', 'light', 'dark', 'lamp', 'electricity', 'power'],
    confidence: 91
  },
  garbage: {
    label: 'Garbage accumulation',
    dept: 'Sanitation & Solid Waste Dept',
    eta: '1–2 working days',
    baseScore: 7.0,
    tip: 'Collection route gap identified. Sanitation supervisor notified for same-day pickup prioritisation.',
    keywords: ['garbage', 'trash', 'waste', 'dump', 'litter', 'filth'],
    confidence: 94
  },
  water: {
    label: 'Water leakage / pipe burst',
    dept: 'JWSSB – Water Supply Wing',
    eta: '1–3 working days',
    baseScore: 8.5,
    tip: 'Potential pipe fault detected. Emergency inspection team alerted. Shut-off valve check initiated.',
    keywords: ['water', 'leak', 'pipe', 'flood', 'drip', 'seepage'],
    confidence: 93
  },
  sewage: {
    label: 'Sewage overflow',
    dept: 'JWSSB – Sewage & Drainage Wing',
    eta: '4–24 hours',
    baseScore: 9.3,
    tip: 'Critical health hazard. Escalated to emergency response queue. Drainage team dispatched.',
    keywords: ['sewage', 'drain', 'sewer', 'overflow', 'stench', 'smell'],
    confidence: 95
  },
  tree: {
    label: 'Fallen tree / road obstruction',
    dept: 'Horticulture & Parks Dept',
    eta: '2–8 hours',
    baseScore: 8.8,
    tip: 'Road obstruction and safety risk detected. Emergency tree-removal crew alerted immediately.',
    keywords: ['tree', 'branch', 'fallen', 'obstruction', 'block', 'debris'],
    confidence: 92
  },
  dumping: {
    label: 'Illegal dumping',
    dept: 'Enforcement & Sanitation Dept',
    eta: '3–5 working days',
    baseScore: 5.8,
    tip: 'Hotspot cluster detected in this zone. Anti-littering enforcement team and sanitation crew notified.',
    keywords: ['dump', 'illegal', 'waste', 'construction', 'debris', 'material'],
    confidence: 88
  },
  other: {
    label: 'General civic issue',
    dept: 'Municipal Control Room',
    eta: '5–7 working days',
    baseScore: 4.0,
    tip: 'Routed to general grievance cell. A civic coordinator will contact you within 48 hours.',
    keywords: [],
    confidence: 75
  }
};

// Severity multipliers for priority scoring
const SEVERITY_MULT = {
  low: 0.6,
  medium: 0.85,
  high: 1.1,
  critical: 1.35
};

// Sample complaint data (pre-seeded)
const SAMPLE_COMPLAINTS = [
  {
    id: 'CC-2024-001',
    title: 'Large pothole near bus stand junction',
    category: 'pothole',
    area: 'MG Road, Ward 3',
    description: 'A very large pothole has formed near the main bus stand junction. It is causing vehicles to swerve dangerously and has already caused one accident.',
    phone: '',
    date: '2024-06-20',
    status: 'resolved',
    dept: 'PWD – Roads & Infrastructure',
    eta: 'Completed in 2 days',
    priorityScore: 9.0,
    priorityLabel: 'High',
    aiConfidence: 96,
    similar: 2,
    timeline: [
      { event: 'Complaint submitted', time: 'Jun 20, 9:14 AM', done: true },
      { event: 'AI classified and routed to PWD', time: 'Jun 20, 9:14 AM', done: true },
      { event: 'Field team inspected site', time: 'Jun 20, 2:30 PM', done: true },
      { event: 'Repair work completed', time: 'Jun 22, 11:00 AM', done: true },
      { event: 'Complaint closed', time: 'Jun 22, 11:30 AM', done: true }
    ]
  },
  {
    id: 'CC-2024-002',
    title: 'Streetlight out for 3 weeks',
    category: 'streetlight',
    area: 'Nehru Nagar, Ward 7',
    description: 'The streetlight at the corner of Nehru Nagar Lane 4 has been non-functional for nearly 3 weeks. The area is very dark at night and women residents feel unsafe.',
    phone: '',
    date: '2024-06-18',
    status: 'progress',
    dept: 'Municipal Electrical Dept',
    eta: 'Expected Jun 26',
    priorityScore: 7.0,
    priorityLabel: 'Medium',
    aiConfidence: 91,
    similar: 1,
    timeline: [
      { event: 'Complaint submitted', time: 'Jun 18, 6:45 PM', done: true },
      { event: 'AI classified and routed', time: 'Jun 18, 6:45 PM', done: true },
      { event: 'Work order raised', time: 'Jun 19, 10:00 AM', done: true },
      { event: 'Electrician assigned', time: 'Jun 21, 9:00 AM', done: true },
      { event: 'Repair scheduled', time: 'Jun 26, estimated', done: false }
    ]
  },
  {
    id: 'CC-2024-003',
    title: 'Overflowing garbage near market',
    category: 'garbage',
    area: 'Station Road, Ward 2',
    description: 'The garbage bins near the vegetable market on Station Road have been overflowing for 4 days. Stray animals are scattering waste all over the road.',
    phone: '',
    date: '2024-06-22',
    status: 'pending',
    dept: 'Sanitation & Solid Waste Dept',
    eta: 'Expected Jun 25',
    priorityScore: 7.7,
    priorityLabel: 'High',
    aiConfidence: 94,
    similar: 3,
    timeline: [
      { event: 'Complaint submitted', time: 'Jun 22, 8:30 AM', done: true },
      { event: 'AI classified and routed', time: 'Jun 22, 8:30 AM', done: true },
      { event: 'Sanitation supervisor notified', time: 'Jun 22, 9:00 AM', done: true },
      { event: 'Collection team dispatched', time: 'Jun 25, scheduled', done: false }
    ]
  },
  {
    id: 'CC-2024-004',
    title: 'Water pipeline leaking on footpath',
    category: 'water',
    area: 'Civil Lines, Ward 5',
    description: 'A water supply pipe is leaking heavily onto the footpath near Civil Lines. Large puddle forming, creating a mosquito breeding ground and slippery surface.',
    phone: '',
    date: '2024-06-23',
    status: 'progress',
    dept: 'JWSSB – Water Supply Wing',
    eta: 'Expected Jun 27',
    priorityScore: 9.3,
    priorityLabel: 'High',
    aiConfidence: 93,
    similar: 2,
    timeline: [
      { event: 'Complaint submitted', time: 'Jun 23, 11:20 AM', done: true },
      { event: 'AI flagged as urgent — pipe fault risk', time: 'Jun 23, 11:20 AM', done: true },
      { event: 'Emergency inspection team alerted', time: 'Jun 23, 11:25 AM', done: true },
      { event: 'On-site inspection completed', time: 'Jun 24, 9:00 AM', done: true },
      { event: 'Repair work underway', time: 'Jun 27, estimated', done: false }
    ]
  },
  {
    id: 'CC-2024-005',
    title: 'Sewage manhole overflowing',
    category: 'sewage',
    area: 'Rajiv Nagar, Ward 9',
    description: 'A sewage manhole on the main road in Rajiv Nagar is overflowing. Raw sewage is flowing onto the road. Very bad smell. Health emergency.',
    phone: '',
    date: '2024-06-24',
    status: 'progress',
    dept: 'JWSSB – Sewage & Drainage Wing',
    eta: 'Expected same day',
    priorityScore: 9.8,
    priorityLabel: 'Critical',
    aiConfidence: 95,
    similar: 0,
    timeline: [
      { event: 'Complaint submitted', time: 'Jun 24, 7:10 AM', done: true },
      { event: 'AI escalated to emergency queue', time: 'Jun 24, 7:10 AM', done: true },
      { event: 'Drainage emergency team dispatched', time: 'Jun 24, 7:30 AM', done: true },
      { event: 'On-site resolution', time: 'Jun 24, in progress', done: false }
    ]
  }
];

// Detect issue from image filename or description (simple keyword match)
function detectIssueFromText(desc, filename) {
  const combined = ((desc || '') + ' ' + (filename || '')).toLowerCase();
  for (const [key, val] of Object.entries(AI_ROUTING)) {
    if (key === 'other') continue;
    if (val.keywords.some(kw => combined.includes(kw))) return key;
  }
  return 'other';
}

// Generate priority score
function calcPriority(baseScore, severityKey) {
  const mult = SEVERITY_MULT[severityKey] || 1;
  const raw = baseScore * mult + (Math.random() * 0.4 - 0.2);
  return Math.min(10, Math.max(1, parseFloat(raw.toFixed(1))));
}

// Get priority label from score
function getPriorityLabel(score) {
  if (score >= 9.0) return 'Critical';
  if (score >= 7.5) return 'High';
  if (score >= 5.0) return 'Medium';
  return 'Low';
}

// Load complaints from localStorage (merge with sample data)
function loadComplaints() {
  try {
    const saved = JSON.parse(localStorage.getItem('cc_complaints') || '[]');
    return [...saved, ...SAMPLE_COMPLAINTS];
  } catch {
    return SAMPLE_COMPLAINTS;
  }
}

// Save new complaint to localStorage
function saveComplaint(complaint) {
  try {
    const saved = JSON.parse(localStorage.getItem('cc_complaints') || '[]');
    saved.unshift(complaint);
    localStorage.setItem('cc_complaints', JSON.stringify(saved));
  } catch {
    // localStorage unavailable
  }
}

// Generate unique complaint ID
function genId() {
  const year = new Date().getFullYear();
  const num = Math.floor(100 + Math.random() * 900);
  return `CC-${year}-${num}`;
}

// Format date for display
function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
