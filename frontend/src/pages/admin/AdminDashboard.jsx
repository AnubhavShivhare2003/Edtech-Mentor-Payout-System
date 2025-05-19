import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Tooltip
} from '@mui/material';
import { MessageSquare, X, Users, Clock, DollarSign, Wallet, Calendar, Search, ChevronUp, ChevronDown, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import { payoutService } from '../../services/payoutService';
import { mentorService } from '../../services/mentorService';
import { chatService } from '../../services/chatService';
import { Link } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';

// Sample data for testing
// const sampleMentors = [
//   {
//     id: 1,
//     name: 'John Doe',
//     email: 'john@example.com',
//     totalSessions: 120,
//     earnings: 2400,
//     rating: 4.8,
//     status: 'active',
//   },
//   {
//     id: 2,
//     name: 'Jane Smith',
//     email: 'jane@example.com',
//     totalSessions: 85,
//     earnings: 1700,
//     rating: 4.9,
//     status: 'active',
//   },
//   {
//     id: 3,
//     name: 'Mike Johnson',
//     email: 'mike@example.com',
//     totalSessions: 95,
//     earnings: 1900,
//     rating: 4.7,
//     status: 'pending',
//   },
//   {
//     id: 4,
//     name: 'Sarah Williams',
//     email: 'sarah@example.com',
//     totalSessions: 150,
//     earnings: 3000,
//     rating: 4.9,
//     status: 'active',
//   },
//   {
//     id: 5,
//     name: 'David Brown',
//     email: 'david@example.com',
//     totalSessions: 70,
//     earnings: 1400,
//     rating: 4.6,
//     status: 'inactive',
//   }
// ];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const StatCard = ({ title, value, icon: Icon, trend, isCurrency = false }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-2">
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </h3>
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
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

const QuickActionCard = ({ title, icon: Icon, to, color = 'indigo' }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-md bg-${color}-50 border border-${color}-100 hover:bg-${color}-100 transition-colors duration-200`}
    >
      <Icon className={`w-5 h-5 text-${color}-600 mr-2`} />
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </Link>
  );

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth) || { user: null };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    pendingSessions: 0,
    totalPayouts: 0,
    pendingPayouts: 0
  });
  const [chatDialog, setChatDialog] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchMentors();
      fetchUnreadCounts();

      // Subscribe to new messages from mentors
      const unsubscribe = chatService.subscribeToMentorMessages((message) => {
        if (selectedMentor) {
          setMessages(prev => [...prev, {
            text: message.text,
            sender: 'mentor',
            recipient: 'admin',
            timestamp: new Date().toISOString()
          }]);
          fetchUnreadCounts();
        }
      });

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
        chatService.disconnect();
      };
    }
  }, [user, selectedMentor]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all mentors with retry logic
      let mentorsData;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          mentorsData = await mentorService.getAllMentors();
          if (mentorsData && Array.isArray(mentorsData)) {
            break;
          }
          throw new Error('Invalid mentor data received');
        } catch (err) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw err;
          }
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!mentorsData || !Array.isArray(mentorsData)) {
        throw new Error('Failed to fetch valid mentor data');
      }
      
      // Validate and transform mentor data
      const validatedMentors = mentorsData.map(mentor => ({
        _id: mentor._id || `temp-${Math.random()}`,
        name: mentor.name || 'Unknown',
        email: mentor.email || 'No email',
        totalSessions: Number(mentor.totalSessions) || 0,
        earnings: Number(mentor.earnings) || 0,
        rating: Number(mentor.rating) || 0,
        status: mentor.status || 'inactive',
        activeSessions: Number(mentor.activeSessions) || 0,
        totalEarnings: Number(mentor.totalEarnings) || 0,
        pendingPayouts: Number(mentor.pendingPayouts) || 0
      }));
      
      // Calculate stats from validated mentor data
      const totalMentors = validatedMentors.length;
      const pendingApprovals = validatedMentors.filter(m => m.status === 'pending').length;
      const activeSessions = validatedMentors.reduce((sum, m) => sum + (m.activeSessions || 0), 0);
      const totalSessions = validatedMentors.reduce((sum, m) => sum + (m.totalSessions || 0), 0);
      const totalPayouts = validatedMentors.reduce((sum, m) => sum + (m.totalEarnings || 0), 0);
      const pendingPayouts = validatedMentors.reduce((sum, m) => sum + (m.pendingPayouts || 0), 0);

      // Validate calculated stats
      const stats = {
        totalMentors: Number(totalMentors) || 0,
        pendingApprovals: Number(pendingApprovals) || 0,
        activeSessions: Number(activeSessions) || 0,
        totalSessions: Number(totalSessions) || 0,
        totalPayouts: Number(totalPayouts) || 0,
        pendingPayouts: Number(pendingPayouts) || 0
      };

      setStats(stats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to fetch dashboard data. Please refresh the page or try again later.');
      setStats({
        totalMentors: 0,
        pendingApprovals: 0,
        activeSessions: 0,
        totalSessions: 0,
        totalPayouts: 0,
        pendingPayouts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const mentorsData = await mentorService.getAllMentors();
      
      // Validate and transform mentor data
      const validatedMentors = mentorsData.map(mentor => ({
        _id: mentor._id,
        name: mentor.name || 'Unknown',
        email: mentor.email || 'No email',
        totalSessions: mentor.totalSessions || 0,
        earnings: mentor.earnings || 0,
        rating: mentor.rating || 0,
        status: mentor.status || 'inactive',
        activeSessions: mentor.activeSessions || 0,
        totalEarnings: mentor.totalEarnings || 0,
        pendingPayouts: mentor.pendingPayouts || 0
      }));

      setMentors(validatedMentors);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch mentors:', err);
      setError('Failed to fetch mentors. Please try again later.');
      setMentors([]); // Reset mentors to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const counts = await chatService.getAdminUnreadCount();
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  const handleMentorSelect = async (mentor) => {
    setSelectedMentor(mentor);
    try {
      const chatHistory = await chatService.getChatHistory(mentor._id);
      setMessages(chatHistory);
      // Mark messages as read
      const unreadMessageIds = chatHistory
        .filter(msg => !msg.read && msg.sender === 'mentor')
        .map(msg => msg._id);
      if (unreadMessageIds.length > 0) {
        await chatService.markAsRead(unreadMessageIds);
        fetchUnreadCounts();
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch chat history');
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedMentor) {
      try {
        const message = {
          text: newMessage,
          sender: 'admin',
          recipient: 'mentor',
          timestamp: new Date().toISOString()
        };
        
        await chatService.sendAdminMessage(selectedMentor._id, newMessage);
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } catch (err) {
        console.error('Failed to send message:', err);
        setError(err.message || 'Failed to send message. Please try again.');
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedMentors = [...mentors].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredMentors = sortedMentors.filter(
    mentor =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDateFilter = () => {
    // Implement date filter logic here
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
          Admin Dashboard
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
                Welcome back, {user?.name}!
              </h1>
              <div className="flex space-x-3">
                <QuickActionCard
                  title="Payouts"
                  icon={Wallet}
                  to={`/users/admin/${user._id}/payouts`}
                  color="green"
                />
                <QuickActionCard
                  title="Sessions"
                  icon={Calendar}
                  to={`/users/admin/${user._id}/sessions`}
                  color="blue"
                />
                <button
                  onClick={() => setChatDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Mentors
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
                <span>Chat with Mentors</span>
                <IconButton onClick={() => setChatDialog(false)}>
                  <X className="w-5 h-5" />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <div className="h-[600px] flex">
                  {/* Mentors List */}
                  <div className="w-1/4 border-r p-4">
                    <Typography variant="subtitle1" className="mb-4">
                      Select Mentor
                    </Typography>
                    <div className="space-y-2">
                      {mentors.map((mentor) => (
                        <div
                          key={mentor._id}
                          className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedMentor?._id === mentor._id ? 'bg-indigo-50' : ''
                          }`}
                          onClick={() => handleMentorSelect(mentor)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <Typography variant="body2" className="font-medium">
                                {mentor.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {mentor.email}
                              </Typography>
                            </div>
                            {unreadCounts[mentor._id] > 0 && (
                              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCounts[mentor._id]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col">
                    {selectedMentor ? (
                      <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.sender === 'admin'
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.sender === 'admin'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString()}
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
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a mentor to start chatting
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Sessions" 
                value={stats.totalSessions} 
                icon={Users} 
                trend={12} 
              />
              <StatCard 
                title="Pending Sessions" 
                value={stats.pendingSessions} 
                icon={Clock} 
                trend={-5} 
              />
              <StatCard 
                title="Total Payouts" 
                value={stats.totalPayouts} 
                icon={DollarSign} 
                trend={8} 
                isCurrency={true}
              />
              <StatCard 
                title="Pending Payouts" 
                value={stats.pendingPayouts} 
                icon={Wallet} 
                trend={-3} 
                isCurrency={true}
              />
            </div>

            {/* Mentors List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h2 className="text-lg font-medium text-gray-900">Mentors List</h2>
                    <p className="mt-2 text-sm text-gray-700">
                      A list of all mentors including their name, email, sessions, and earnings.
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Search mentors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Name', 'Email', 'Total Sessions', 'Earnings', 'Rating', 'Status'].map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                        >
                          <div className="flex items-center">
                            {header}
                            <span className="ml-2">
                              {sortConfig.key === header.toLowerCase().replace(' ', '') ? (
                                sortConfig.direction === 'asc' ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )
                              ) : null}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMentors.map((mentor) => (
                      <tr key={mentor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {mentor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mentor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mentor.totalSessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${mentor.earnings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mentor.rating}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              mentor.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : mentor.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {mentor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
