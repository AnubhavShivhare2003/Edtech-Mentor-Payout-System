import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SessionList from '../../components/sessions/SessionList';
import SessionEntry from '../../components/sessions/SessionEntry';
import PayoutCalculator from '../../components/payouts/PayoutCalculator';
import { sessionService } from '../../services/sessionService';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSessionEntry, setShowSessionEntry] = useState(false);
  const [showPayoutCalculator, setShowPayoutCalculator] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSubmit = async (sessionData) => {
    try {
      setLoading(true);
      setError(null);
      await sessionService.createSession(sessionData);
      setShowSessionEntry(false);
      setNotification({
        open: true,
        message: 'Session created successfully',
        severity: 'success'
      });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSession = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      await sessionService.approveSession(sessionId);
      setNotification({
        open: true,
        message: 'Session approved successfully',
        severity: 'success'
      });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve session');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSession = async (sessionId, rejectionReason) => {
    try {
      setLoading(true);
      setError(null);
      await sessionService.rejectSession(sessionId, rejectionReason);
      setNotification({
        open: true,
        message: 'Session rejected successfully',
        severity: 'success'
      });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject session');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayout = (mentorId) => {
    setSelectedMentorId(mentorId);
    setShowPayoutCalculator(true);
  };

  const handlePayoutGenerated = (receipt) => {
    setShowPayoutCalculator(false);
    setNotification({
      open: true,
      message: 'Payout receipt generated successfully',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Session Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowSessionEntry(true)}
          >
            Add Session
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <SessionList
          sessions={sessions}
          onApprove={handleApproveSession}
          onReject={handleRejectSession}
          onCalculatePayout={handleCalculatePayout}
        />

        <Dialog
          open={showSessionEntry}
          onClose={() => setShowSessionEntry(false)}
          maxWidth="md"
          fullWidth
        >
          <SessionEntry onSubmit={handleSessionSubmit} onCancel={() => setShowSessionEntry(false)} />
        </Dialog>

        <Dialog
          open={showPayoutCalculator}
          onClose={() => setShowPayoutCalculator(false)}
          maxWidth="md"
          fullWidth
        >
          <PayoutCalculator
            mentorId={selectedMentorId}
            onClose={handlePayoutGenerated}
          />
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default SessionManagement; 