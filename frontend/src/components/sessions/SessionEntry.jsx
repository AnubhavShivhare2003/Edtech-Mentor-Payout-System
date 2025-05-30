import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SESSION_TYPES = [
  'One-on-One',
  'Group Session',
  'Workshop',
  'Consultation'
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

const SessionEntry = ({ onSubmit }) => {
  const [sessions, setSessions] = useState([{
    mentorName: '',
    startTime: new Date(),
    sessionType: '',
    duration: 60,
    hourlyRate: 4000,
    calculatedAmount: 0
  }]);

  const [error, setError] = useState('');

  const calculateAmount = (duration, hourlyRate) => {
    return (duration / 60) * hourlyRate;
  };

  const handleAddSession = () => {
    setSessions([...sessions, {
      mentorName: '',
      startTime: new Date(),
      sessionType: '',
      duration: 60,
      hourlyRate: 4000,
      calculatedAmount: 0
    }]);
  };

  const handleRemoveSession = (index) => {
    const newSessions = sessions.filter((_, i) => i !== index);
    setSessions(newSessions);
  };

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...sessions];
    newSessions[index] = {
      ...newSessions[index],
      [field]: value,
      calculatedAmount: field === 'duration' || field === 'hourlyRate'
        ? calculateAmount(
            field === 'duration' ? value : newSessions[index].duration,
            field === 'hourlyRate' ? value : newSessions[index].hourlyRate
          )
        : newSessions[index].calculatedAmount
    };
    setSessions(newSessions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate sessions
    const invalidSession = sessions.find(
      session => !session.mentorName || !session.sessionType
    );

    if (invalidSession) {
      setError('Please fill in all required fields for each session');
      return;
    }

    onSubmit(sessions);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Session Data
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {sessions.map((session, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mentor Name"
                  value={session.mentorName}
                  onChange={(e) => handleSessionChange(index, 'mentorName', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Session Date & Time"
                    value={session.startTime}
                    onChange={(newValue) => handleSessionChange(index, 'startTime', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Session Type</InputLabel>
                  <Select
                    value={session.sessionType}
                    label="Session Type"
                    onChange={(e) => handleSessionChange(index, 'sessionType', e.target.value)}
                  >
                    {SESSION_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={session.duration}
                    label="Duration"
                    onChange={(e) => handleSessionChange(index, 'duration', e.target.value)}
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate (₹)"
                  type="number"
                  value={session.hourlyRate}
                  onChange={(e) => handleSessionChange(index, 'hourlyRate', Number(e.target.value))}
                  InputProps={{
                    startAdornment: '₹'
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Calculated Amount"
                  value={`₹${session.calculatedAmount.toFixed(2)}`}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>

              {sessions.length > 1 && (
                <Grid item xs={12}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveSession(index)}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          </Box>
        ))}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSession}
          >
            Add Another Session
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Save Sessions
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SessionEntry; 