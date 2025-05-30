import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { payoutService } from '../../services/payoutService';

const PayoutCalculator = ({ mentorId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    includePlatformFee: true,
    includeGST: true,
    includeTDS: true,
    manualOverride: false
  });
  const [manualAmount, setManualAmount] = useState('');
  const [deductions, setDeductions] = useState([]);
  const [newDeduction, setNewDeduction] = useState({ name: '', amount: '' });
  const [payoutDetails, setPayoutDetails] = useState(null);

  const handleOptionChange = (option) => (event) => {
    setOptions(prev => ({
      ...prev,
      [option]: event.target.checked
    }));
  };

  const handleManualAmountChange = (event) => {
    setManualAmount(event.target.value);
  };

  const handleDeductionChange = (field) => (event) => {
    setNewDeduction(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const addDeduction = () => {
    if (newDeduction.name && newDeduction.amount) {
      setDeductions(prev => [...prev, newDeduction]);
      setNewDeduction({ name: '', amount: '' });
    }
  };

  const removeDeduction = (index) => {
    setDeductions(prev => prev.filter((_, i) => i !== index));
  };

  const calculatePayout = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = {
        mentorId,
        options,
        manualAmount: options.manualOverride ? parseFloat(manualAmount) : undefined,
        deductions: deductions.map(d => ({
          name: d.name,
          amount: parseFloat(d.amount)
        }))
      };

      const result = await payoutService.calculatePayout(data);
      setPayoutDetails(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate payout');
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = {
        mentorId,
        options,
        manualAmount: options.manualOverride ? parseFloat(manualAmount) : undefined,
        deductions: deductions.map(d => ({
          name: d.name,
          amount: parseFloat(d.amount)
        })),
        notes: 'Generated from payout calculator'
      };

      const result = await payoutService.generateReceipt(data);
      onClose(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payout Calculator
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includePlatformFee}
                  onChange={handleOptionChange('includePlatformFee')}
                />
              }
              label="Include Platform Fee"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includeGST}
                  onChange={handleOptionChange('includeGST')}
                />
              }
              label="Include GST"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includeTDS}
                  onChange={handleOptionChange('includeTDS')}
                />
              }
              label="Include TDS"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.manualOverride}
                  onChange={handleOptionChange('manualOverride')}
                />
              }
              label="Manual Override"
            />
          </Grid>

          {options.manualOverride && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manual Amount"
                type="number"
                value={manualAmount}
                onChange={handleManualAmountChange}
                InputProps={{
                  startAdornment: '₹'
                }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Custom Deductions
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={newDeduction.name}
                    onChange={handleDeductionChange('name')}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={newDeduction.amount}
                    onChange={handleDeductionChange('amount')}
                    InputProps={{
                      startAdornment: '₹'
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={addDeduction}
                    disabled={!newDeduction.name || !newDeduction.amount}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {deductions.map((deduction, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <Typography>{deduction.name}</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography>₹{deduction.amount}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      color="error"
                      onClick={() => removeDeduction(index)}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {payoutDetails && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Payout Summary
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography>Base Amount: ₹{payoutDetails.baseAmount}</Typography>
                {payoutDetails.platformFee && (
                  <Typography>Platform Fee: ₹{payoutDetails.platformFee}</Typography>
                )}
                {payoutDetails.gst && (
                  <Typography>GST: ₹{payoutDetails.gst}</Typography>
                )}
                {payoutDetails.tds && (
                  <Typography>TDS: ₹{payoutDetails.tds}</Typography>
                )}
                {payoutDetails.deductions?.map((deduction, index) => (
                  <Typography key={index}>
                    {deduction.name}: ₹{deduction.amount}
                  </Typography>
                ))}
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Final Amount: ₹{payoutDetails.finalAmount}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={calculatePayout}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Calculate'}
              </Button>
              {payoutDetails && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={generateReceipt}
                  disabled={loading}
                >
                  Generate Receipt
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PayoutCalculator; 