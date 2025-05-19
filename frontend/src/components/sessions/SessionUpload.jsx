import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import Papa from 'papaparse';

const SessionUpload = ({ onSubmit }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const sessions = results.data.map(row => ({
            mentorName: row.mentorName,
            startTime: new Date(row.startTime),
            sessionType: row.sessionType,
            duration: parseInt(row.duration, 10),
            hourlyRate: parseFloat(row.hourlyRate),
            calculatedAmount: (parseInt(row.duration, 10) / 60) * parseFloat(row.hourlyRate)
          }));

          // Validate sessions
          const invalidSession = sessions.find(
            session => !session.mentorName || !session.sessionType || isNaN(session.duration) || isNaN(session.hourlyRate)
          );

          if (invalidSession) {
            setError('Invalid data in CSV file. Please check the format.');
            return;
          }

          onSubmit(sessions);
        } catch (err) {
          setError('Error processing CSV file. Please check the format.');
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setError('Error reading CSV file: ' + error.message);
        setLoading(false);
      }
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Session Data (CSV)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center', py: 3 }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upload CSV'}
          </Button>
        </label>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        CSV Format: mentorName,startTime,sessionType,duration,hourlyRate
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Example: John Doe,2024-03-20T10:00:00,One-on-One,60,4000
      </Typography>
    </Paper>
  );
};

export default SessionUpload; 