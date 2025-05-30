import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';

import PasswordInput from '../components/PasswordInput';

import {
  register,
  clearError,
  setError,
  setLoading
} from '../redux/slices/authSlice';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentor',
    hourlyRate: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError()); // Cleanup on unmount
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User data:', user); // Debug log
      const path = user.role === 'admin' 
        ? `/users/admin/${user._id}/dashboard` 
        : `/users/mentors/${user._id}/dashboard`;
      console.log('Redirecting to:', path); // Debug log
      navigate(path);
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'mentor' && (!formData.hourlyRate || formData.hourlyRate <= 0)) {
      errors.hourlyRate = 'Please enter a valid hourly rate';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      dispatch(setError('Passwords do not match'));
      return;
    }

    // Validate hourly rate
    const hourlyRate = parseFloat(formData.hourlyRate);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      dispatch(setError('Please enter a valid hourly rate'));
      return;
    }

    dispatch(setLoading(true));
    
    try {
      const response = await dispatch(register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        hourlyRate: hourlyRate
      })).unwrap();
      
      console.log('Registration response:', response); // Debug log
      
      if (response.user) {
        const path = response.user.role === 'admin' 
          ? `/users/admin/${response.user._id}/dashboard` 
          : `/users/mentors/${response.user._id}/dashboard`;
        console.log('Redirecting to:', path); // Debug log
        navigate(path);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Register
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
            <PasswordInput
              margin="normal"
              required
              name="password"
              label="Password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
            />
            <PasswordInput
              margin="normal"
              required
              name="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Hourly Rate ($)"
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              error={!!formErrors.hourlyRate}
              helperText={formErrors.hourlyRate}
              disabled={loading}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Typography align="center">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Login here
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register; 