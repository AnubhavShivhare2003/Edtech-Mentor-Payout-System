import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { payoutService } from '../../services/payoutService';
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
import { Download, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

function MentorPayoutHistory() {
  const { user } = useSelector((state) => state.auth) || { user: null };
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await payoutService.getMentorPayouts(user._id);
        setPayouts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch payouts');
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchPayouts();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleDownloadReceipt = async (payoutId) => {
    try {
      const response = await payoutService.generateReceipt(payoutId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payout-receipt-${payoutId}.pdf`);
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
        <Alert severity="error">Please log in to view your payout history</Alert>
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
          Payout History
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View your earnings and download receipts
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout._id}>
                <TableCell>{payout.receiptId}</TableCell>
                <TableCell>
                  {format(new Date(payout.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ₹{payout.amount}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={payout.status.replace('_', ' ')}
                    color={getStatusColor(payout.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {payout.status === 'paid' && (
                    <Tooltip title="Download Receipt">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReceipt(payout._id)}
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

export default MentorPayoutHistory; 