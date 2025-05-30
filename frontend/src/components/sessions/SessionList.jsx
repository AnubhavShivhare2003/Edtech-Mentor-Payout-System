import { useState, useEffect } from 'react';
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
  TablePagination,
  TextField,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download as DownloadIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const SessionList = ({ sessions, onExport }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredSessions, setFilteredSessions] = useState(sessions);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    mentorName: '',
    sessionType: ''
  });

  useEffect(() => {
    let filtered = [...sessions];

    if (filters.startDate) {
      filtered = filtered.filter(session => 
        new Date(session.startTime) >= filters.startDate
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(session => 
        new Date(session.startTime) <= filters.endDate
      );
    }

    if (filters.mentorName) {
      filtered = filtered.filter(session =>
        session.mentorName.toLowerCase().includes(filters.mentorName.toLowerCase())
      );
    }

    if (filters.sessionType) {
      filtered = filtered.filter(session =>
        session.sessionType.toLowerCase().includes(filters.sessionType.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const calculateTotalAmount = () => {
    return filteredSessions.reduce((sum, session) => sum + session.calculatedAmount, 0);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Mentor Name"
              value={filters.mentorName}
              onChange={(e) => handleFilterChange('mentorName', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Session Type"
              value={filters.sessionType}
              onChange={(e) => handleFilterChange('sessionType', e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mentor</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Session Type</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell>Rate (₹/hr)</TableCell>
              <TableCell>Amount (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSessions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((session, index) => (
                <TableRow key={index}>
                  <TableCell>{session.mentorName}</TableCell>
                  <TableCell>
                    {format(new Date(session.startTime), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{session.sessionType}</TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>{session.hourlyRate}</TableCell>
                  <TableCell>{session.calculatedAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            <TableRow>
              <TableCell colSpan={5} align="right">
                <Typography variant="subtitle1">Total Amount:</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">
                  ₹{calculateTotalAmount().toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <TablePagination
          component="div"
          count={filteredSessions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Tooltip title="Export to CSV">
          <IconButton onClick={() => onExport(filteredSessions)}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default SessionList; 