import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { sessionService } from '../../services/sessionService';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Download, Calendar, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

function MentorSessionHistory() {
  const { user } = useSelector((state) => state.auth) || { user: null };
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await sessionService.getMentorSessions(user._id);
        setSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch sessions');
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchSessions();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDownloadReceipt = async (sessionId) => {
    try {
      const response = await sessionService.downloadSessionReceipt(sessionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `session-receipt-${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error">Please log in to view your session history</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-8">
        <Typography variant="h4" className="mb-2">
          Session History
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage your teaching sessions
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell>{session.student.name}</TableCell>
                <TableCell>
                  {format(new Date(session.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {session.duration} minutes
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ₹{session.amount}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={session.status}
                    color={getStatusColor(session.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {session.status === 'completed' && (
                    <Tooltip title="Download Receipt">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReceipt(session._id)}
                      >
                        <Download className="w-4 h-4" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default MentorSessionHistory; 