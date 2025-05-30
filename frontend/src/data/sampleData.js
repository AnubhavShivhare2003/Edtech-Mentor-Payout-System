// Sample mentor data
export const mentorData = {
  _id: "682b2b6e4e183c0ff4a78cfc",
  email: "mohit@gmail.com",
  name: "Mohit",
  role: "mentor",
  hourlyRate: 1000,
  status: "active",
  createdAt: "2025-05-19T13:00:30.498+00:00",
  updatedAt: "2025-05-19T13:00:30.498+00:00"
};

// Sample sessions data
export const sessionsData = [
  {
    _id: "session_001",
    mentorId: "682b2b6e4e183c0ff4a78cfc",
    studentId: "student_001",
    studentName: "Rahul Sharma",
    startTime: "2025-05-20T10:00:00.000+00:00",
    endTime: "2025-05-20T11:30:00.000+00:00",
    duration: 90, // in minutes
    status: "completed",
    amount: 1500, // (90/60) * 1000
    paymentStatus: "paid",
    subject: "Mathematics",
    topic: "Calculus",
    rating: 4.5,
    feedback: "Great session, very helpful explanations"
  },
  {
    _id: "session_002",
    mentorId: "682b2b6e4e183c0ff4a78cfc",
    studentId: "student_002",
    studentName: "Priya Patel",
    startTime: "2025-05-21T14:00:00.000+00:00",
    endTime: "2025-05-21T15:00:00.000+00:00",
    duration: 60,
    status: "completed",
    amount: 1000,
    paymentStatus: "pending",
    subject: "Physics",
    topic: "Mechanics",
    rating: 5,
    feedback: "Excellent teaching methodology"
  },
  {
    _id: "session_003",
    mentorId: "682b2b6e4e183c0ff4a78cfc",
    studentId: "student_003",
    studentName: "Amit Kumar",
    startTime: "2025-05-22T16:00:00.000+00:00",
    endTime: "2025-05-22T17:30:00.000+00:00",
    duration: 90,
    status: "scheduled",
    amount: 0,
    paymentStatus: "pending",
    subject: "Chemistry",
    topic: "Organic Chemistry"
  },
  {
    _id: "session_004",
    mentorId: "682b2b6e4e183c0ff4a78cfc",
    studentId: "student_001",
    studentName: "Rahul Sharma",
    startTime: "2025-05-19T09:00:00.000+00:00",
    endTime: "2025-05-19T10:00:00.000+00:00",
    duration: 60,
    status: "completed",
    amount: 1000,
    paymentStatus: "paid",
    subject: "Mathematics",
    topic: "Algebra",
    rating: 4,
    feedback: "Good session, helped clear doubts"
  }
];

// Sample payouts data
export const payoutsData = [
  {
    _id: "payout_001",
    mentorId: "682b2b6e4e183c0ff4a78cfc",
    amount: 2500,
    status: "completed",
    paymentMethod: "bank_transfer",
    bankDetails: {
      accountNumber: "XXXX1234",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234"
    },
    sessions: ["session_001", "session_004"],
    createdAt: "2025-05-21T00:00:00.000+00:00",
    completedAt: "2025-05-21T02:00:00.000+00:00",
    transactionId: "TXN123456789"
  },
  {
    _id: "payout_002",
    mentorId: "682b2b6e4e183c0ff4a78cfc",
    amount: 1000,
    status: "pending",
    paymentMethod: "bank_transfer",
    bankDetails: {
      accountNumber: "XXXX1234",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234"
    },
    sessions: ["session_002"],
    createdAt: "2025-05-22T00:00:00.000+00:00",
    expectedCompletionDate: "2025-05-23T00:00:00.000+00:00"
  }
];

// Sample mentor stats
export const mentorStats = {
  totalSessions: 4,
  completedSessions: 3,
  scheduledSessions: 1,
  totalEarnings: 3500,
  pendingPayouts: 1000,
  completedPayouts: 2500,
  averageRating: 4.5,
  totalStudents: 3,
  activeSessions: 1
}; 