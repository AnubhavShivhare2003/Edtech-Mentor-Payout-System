import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { sessionService } from '../../services/sessionService';
import { payoutService } from '../../services/payoutService';
import { mentorService } from '../../services/mentorService';
import { chatService } from '../../services/chatService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download, Filter, MessageSquare, X } from 'lucide-react';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown,
  Receipt,
  BookOpen,
  Star,
  Award,
  GraduationCap,
  Bookmark,
  FileText,
} from 'lucide-react';

// Sample data for testing
const sampleSessions = [
  {
    _id: '1',
    studentName: 'John Smith',
    date: '2024-03-15',
    duration: 2,
    status: 'completed',
    rating: 4.5,
    isPaid: true
  },
  {
    _id: '2',
    studentName: 'Emma Wilson',
    date: '2024-03-14',
    duration: 1.5,
    status: 'completed',
    rating: 5,
    isPaid: false
  },
  {
    _id: '3',
    studentName: 'Michael Brown',
    date: '2024-03-13',
    duration: 2,
    status: 'completed',
    rating: 4.8,
    isPaid: true
  },
  {
    _id: '4',
    studentName: 'Sarah Davis',
    date: '2024-03-12',
    duration: 1,
    status: 'scheduled',
    rating: null,
    isPaid: false
  },
  {
    _id: '5',
    studentName: 'David Miller',
    date: '2024-03-11',
    duration: 2.5,
    status: 'completed',
    rating: 4.7,
    isPaid: false
  }
];

function MentorDashboard() {
  const { user } = useSelector((state) => state.auth) || { user: null };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalEarnings: 0,
    pendingPayouts: 0
  });

  const [recentSessions, setRecentSessions] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [chatDialog, setChatDialog] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchChatHistory();
      fetchUnreadCount();

      // Initialize socket connection
      const socket = chatService.initialize();
      if (!socket) {
        console.error('Failed to initialize socket connection');
        return;
      }

      // Subscribe to new messages from admin
      const unsubscribe = chatService.subscribeToAdminMessages((message) => {
        console.log('Received message from admin:', message);
        setMessages(prev => [...prev, {
          text: message.text,
          sender: 'admin',
          recipient: 'mentor',
          timestamp: new Date().toISOString()
        }]);
        fetchUnreadCount();
      });

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
        chatService.disconnect();
      };
    }
  }, [user]);

  const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

      // Fetch mentor data
      const mentorData = await mentorService.getMentorById(user._id);
      setMentor(mentorData);

      // Fetch mentor stats
      const mentorStats = await mentorService.getMentorStats(user._id);
      setStats({
        totalSessions: mentorStats.totalSessions || 0,
        completedSessions: mentorStats.completedSessions || 0,
        totalEarnings: mentorStats.totalEarnings || 0,
        pendingPayouts: mentorStats.pendingPayouts || 0
      });

      // Fetch recent sessions
      const sessionsData = await mentorService.getMentorSessions(user._id, { limit: 5 });
      setRecentSessions(sessionsData);
      setSessions(sessionsData);
      setFilteredSessions(sessionsData);

      // Fetch payouts
      const payoutsData = await mentorService.getMentorPayouts(user._id);
      setPayouts(payoutsData);
      setFilteredPayouts(payoutsData);

    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

  const fetchChatHistory = async () => {
    try {
      const chatHistory = await chatService.getChatHistory(user._id);
      setMessages(chatHistory);
      // Mark messages as read
      const unreadMessageIds = chatHistory
        .filter(msg => !msg.read && msg.sender === 'admin')
        .map(msg => msg._id);
      if (unreadMessageIds.length > 0) {
        await chatService.markAsRead(unreadMessageIds);
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await chatService.getMentorUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const message = {
          text: newMessage,
          sender: 'mentor',
          recipient: 'admin',
          timestamp: new Date().toISOString()
        };
        
        await chatService.sendMentorMessage(newMessage);
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } catch (err) {
        setError(err.message || 'Failed to send message');
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`ml-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
              >
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className="bg-indigo-100 p-3 rounded-full">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </div>
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateFilter = () => {
    if (!startDate && !endDate) {
      setFilteredSessions(sessions);
      setFilteredPayouts(payouts);
      return;
    }

    const filterData = (data) => {
      return data.filter(item => {
        const itemDate = new Date(item.date);
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        return true;
      });
    };

    setFilteredSessions(filterData(sessions));
    setFilteredPayouts(filterData(payouts));
  };

  const handleDownloadReceipt = async (receiptId) => {
    try {
      const response = await payoutService.generateReceipt(receiptId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download receipt');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mentor Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user.name || 'Mentor'}!
          </h1>
          <div className="flex space-x-3">
            <Link
              to={`/users/mentors/${user._id}/payouts`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Receipt className="w-4 h-4 mr-2" />
              View Payout History
            </Link>
            <Link
              to={`/users/mentors/${user._id}/sessions`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Sessions
            </Link>
                <button
                  onClick={() => setChatDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Admin
                </button>
          </div>
        </div>

            {/* Chat Dialog */}
            <Dialog
              open={chatDialog}
              onClose={() => setChatDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle className="flex justify-between items-center">
                <div className="flex items-center">
                  <span>Chat with Admin</span>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <IconButton onClick={() => setChatDialog(false)}>
                  <X className="w-5 h-5" />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <div className="h-[600px] flex flex-col">
                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.sender === 'mentor'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === 'mentor'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Sessions" value={stats.totalSessions} icon={Users} trend={12} />
              <StatCard title="Total Earnings" value={`₹${stats.totalEarnings}`} icon={DollarSign} trend={8} />
              <StatCard title="Completed Sessions" value={stats.completedSessions} icon={BookOpen} trend={5} />
              <StatCard title="Pending Payouts" value={`₹${stats.pendingPayouts}`} icon={Clock} />
            </div>

            {/* Date Filter */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              },
                              '& fieldset': {
                                borderColor: 'rgba(99, 102, 241, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(99, 102, 241, 0.4)',
                              },
                            },
                          }
                        }
                      }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              },
                              '& fieldset': {
                                borderColor: 'rgba(99, 102, 241, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(99, 102, 241, 0.4)',
                              },
                            },
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <Button
                  variant="outlined"
                  startIcon={<Filter className="w-4 h-4" />}
                  onClick={handleDateFilter}
                  size="small"
                  sx={{ 
                    py: 0.5,
                    px: 2,
                    fontSize: '0.875rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    color: 'rgb(99, 102, 241)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                    }
                  }}
                >
                  Apply Filter
                </Button>
              </div>
        </div>

            {/* Tabs for Sessions and Payouts */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Sessions" />
                <Tab label="Payouts" />
              </Tabs>
            </Box>

            {/* Sessions Tab Content */}
            {activeTab === 0 && (
              <div className="mt-4 bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSessions.map((session) => (
                        <tr key={session._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.duration} hours</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{session.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payouts Tab Content */}
            {activeTab === 1 && (
              <div className="mt-4 bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayouts.map((payout) => (
                        <tr key={payout._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payout.receiptId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payout.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payout.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Tooltip title="Download Receipt">
                              <IconButton
                                onClick={() => handleDownloadReceipt(payout._id)}
                                disabled={payout.status !== 'paid'}
                              >
                                <Download className="w-5 h-5" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

        {/* Recent Sessions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
          <div className="mt-4 bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(recentSessions) && recentSessions.length > 0 ? (
                    recentSessions.map((session) => (
                      <tr key={session._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.duration}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{session.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-500" colSpan="5">
                        No sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Credentials Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Credentials</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {mentor?.credentials.map((credential) => (
                  <div key={credential.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      {credential.type === 'Education' && <GraduationCap className="h-6 w-6 text-indigo-600" />}
                      {credential.type === 'Certification' && <Award className="h-6 w-6 text-indigo-600" />}
                      {credential.type === 'Experience' && <Bookmark className="h-6 w-6 text-indigo-600" />}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{credential.title}</h4>
                      <p className="text-sm text-gray-500">{credential.institution}</p>
                      <p className="text-sm text-gray-500">{credential.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Students Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Students</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {mentor?.recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="text-sm font-medium text-gray-900">{student.progress}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Last Session</div>
                        <div className="text-sm font-medium text-gray-900">{student.lastSession}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </Box>
    </Container>
  );
}

export default MentorDashboard;
