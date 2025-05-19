import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Plus, Edit2, Trash2, X } from 'lucide-react';

const AdminSessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    mentorName: '',
    studentName: '',
    date: '',
    duration: 1,
    subject: '',
    amount: 0,
    status: 'scheduled'
  });
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Simulate API call with dummy data
    const fetchSessions = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dummySessions = [
          {
            _id: "sess001",
            sessionType: "live",
            startTime: new Date("2024-03-15T10:00:00Z"),
            endTime: new Date("2024-03-15T11:00:00Z"),
            duration: 60,
            baseRate: 1000,
            adjustedRate: 1000,
            status: "approved",
            notes: "Regular mentoring session completed successfully",
            attachments: [
              {
                filename: "session-notes.pdf",
                path: "uploads/sessions/session-notes-001.pdf",
                uploadedAt: new Date("2024-03-15T11:05:00Z")
              }
            ],
            payoutDetails: {
              basePayout: 1000,
              taxes: 100,
              platformFee: 50,
              finalPayout: 850
            }
          },
          {
            _id: "sess002",
            sessionType: "evaluation",
            startTime: new Date("2024-03-15T14:00:00Z"),
            endTime: new Date("2024-03-15T14:45:00Z"),
            duration: 45,
            baseRate: 1000,
            adjustedRate: 1000,
            status: "pending",
            notes: "Awaiting evaluation approval",
            attachments: [],
            payoutDetails: {
              basePayout: 750,
              taxes: 75,
              platformFee: 37.5,
              finalPayout: 637.5
            }
          },
          {
            _id: "sess003",
            sessionType: "recording_review",
            startTime: new Date("2024-03-16T09:00:00Z"),
            endTime: new Date("2024-03-16T10:30:00Z"),
            duration: 90,
            baseRate: 1000,
            adjustedRate: 1200,
            status: "approved",
            notes: "Extended review session with bonus rate",
            attachments: [
              {
                filename: "recording.mp4",
                path: "uploads/sessions/recording-003.mp4",
                uploadedAt: new Date("2024-03-16T10:35:00Z")
              }
            ],
            payoutDetails: {
              basePayout: 1800,
              taxes: 180,
              platformFee: 90,
              finalPayout: 1530
            }
          }
        ];

        setSessions(dummySessions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session history:', error);
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchSessions();
    }
  }, [user]);

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = 
      session.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(session => session.status === 'completed').length;
  const totalRevenue = sessions
    .filter(session => session.status === 'completed')
    .reduce((sum, session) => sum + session.amount, 0);
  const averageRating = sessions
    .filter(session => session.rating)
    .reduce((sum, session) => sum + session.rating, 0) / 
    sessions.filter(session => session.rating).length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateSession = () => {
    setEditingSession(null);
    setFormData({
      mentorName: '',
      studentName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      duration: 1,
      subject: '',
      amount: 0,
      status: 'scheduled'
    });
    setIsModalOpen(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setFormData({
      mentorName: session.mentorName,
      studentName: session.studentName,
      date: format(new Date(session.date), 'yyyy-MM-dd'),
      duration: session.duration,
      subject: session.subject,
      amount: session.amount,
      status: session.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        // TODO: Implement API call to delete session
        setSessions(sessions.filter(session => session._id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        // TODO: Implement API call to update session
        setSessions(sessions.map(session => 
          session._id === editingSession._id 
            ? { ...session, ...formData, date: new Date(formData.date) }
            : session
        ));
      } else {
        // TODO: Implement API call to create session
        const newSession = {
          _id: Math.max(...sessions.map(s => s._id)) + 1,
          ...formData,
          date: new Date(formData.date),
          rating: null,
          isPaid: false
        };
        setSessions([...sessions, newSession]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const payoutSummary = {
    totalReceipts: 1,
    totalPayout: 2380,
    totalSessions: 2,
    totalDuration: 150,
    totalPlatformFee: 140,
    totalTaxes: 280
  };

  const sessionStats = {
    stats: [
      {
        _id: "approved",
        count: 2,
        totalDuration: 150,
        totalPayout: 2380
      },
      {
        _id: "pending",
        count: 1,
        totalDuration: 45,
        totalPayout: 637.5
      }
    ]
  };

  const mentorProfile = {
    _id: "mentor123",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "mentor",
    hourlyRate: 1000,
    taxInfo: {
      pan: "ABCDE1234F",
      gst: "12ABCDE1234F1Z5"
    },
    bankDetails: {
      accountNumber: "1234567890",
      ifsc: "ABCD0123456",
      bankName: "HDFC Bank"
    },
    status: "active",
    createdAt: new Date("2024-03-01T10:00:00Z"),
    updatedAt: new Date("2024-03-15T10:00:00Z")
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              to={`/users/admin/${user._id}/dashboard`}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Session History</h1>
          </div>
          <button
            onClick={handleCreateSession}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Session
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{totalSessions}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{completedSessions}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Average Rating</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{averageRating.toFixed(1)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by mentor, student, or subject..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        {filteredSessions.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No sessions found</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.mentorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(session.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.duration} minute{session.duration !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.rating ? session.rating.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${session.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditSession(session)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSession ? 'Edit Session' : 'Create New Session'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mentor Name</label>
                <input
                  type="text"
                  value={formData.mentorName}
                  onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingSession ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessionHistory; 