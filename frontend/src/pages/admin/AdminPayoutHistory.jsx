import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AdminPayoutHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payouts/receipts');
      const data = await response.json();
      setReceipts(data.receipts);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!selectedMentor || !startDate || !endDate) return;

    try {
      const response = await fetch('/api/payouts/receipts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mentorId: selectedMentor,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (response.ok) {
        setGenerateDialog(false);
        fetchReceipts();
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  };

  const handleViewReceipt = async (receipt) => {
    setSelectedReceipt(receipt);
    setViewDialog(true);

    try {
      const response = await fetch(`/api/payouts/receipts/${receipt._id}/audit`);
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleDownloadReceipt = async (receiptId) => {
    try {
      const response = await fetch(`/api/payouts/receipts/${receiptId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Payout History</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setGenerateDialog(true)}
        >
          Generate New Receipt
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt Number</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt._id}>
                  <TableCell>{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.mentor.name}</TableCell>
                  <TableCell>
                    {new Date(receipt.startDate).toLocaleDateString()} -{' '}
                    {new Date(receipt.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${receipt.payoutDetails.totalAmount}</TableCell>
                  <TableCell>{receipt.status}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewReceipt(receipt)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton onClick={() => handleDownloadReceipt(receipt._id)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send to Mentor">
                      <IconButton>
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Receipt Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)}>
        <DialogTitle>Generate New Receipt</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Mentor ID"
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              fullWidth
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateReceipt} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Receipt Information</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Receipt Number: {selectedReceipt.receiptNumber}</Typography>
                <Typography>Mentor: {selectedReceipt.mentor.name}</Typography>
                <Typography>
                  Date Range: {new Date(selectedReceipt.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedReceipt.endDate).toLocaleDateString()}
                </Typography>
                <Typography>Status: {selectedReceipt.status}</Typography>
              </Box>

              <Typography variant="h6" sx={{ mt: 3 }}>Payout Details</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Subtotal: ${selectedReceipt.payoutDetails.subtotal}</Typography>
                <Typography>Platform Fee: ${selectedReceipt.payoutDetails.platformFee}</Typography>
                <Typography>Tax Amount: ${selectedReceipt.payoutDetails.taxAmount}</Typography>
                <Typography variant="h6">
                  Total Amount: ${selectedReceipt.payoutDetails.totalAmount}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mt: 3 }}>Audit Log</Typography>
              <Box sx={{ mt: 2 }}>
                {auditLogs.map((log, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {new Date(log.timestamp).toLocaleString()} - {log.action} by{' '}
                      {log.performedBy.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.details}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPayoutHistory; 