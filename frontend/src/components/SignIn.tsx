import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '90%',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#800020',
  borderRadius: '8px',
  height: '44px',
  padding: '0 24px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: '0 2px 4px rgba(128, 0, 32, 0.2)',
  '&:hover': {
    backgroundColor: '#660019',
    boxShadow: '0 4px 8px rgba(128, 0, 32, 0.3)',
  },
  '&:disabled': {
    backgroundColor: '#e0e0e0',
    color: '#9e9e9e',
  },
}));

interface SignInProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignUpClick, onForgotPasswordClick }) => {
  const { login, state } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      await login(formData.email, formData.password);
      setMessage('Sign in successful!');
      setMessageType('success');
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Invalid credentials. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <StyledCard>
          <CardContent sx={{ 
            p: { xs: 3, sm: 4 },
            '&:last-child': { pb: { xs: 3, sm: 4 } }
          }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img 
                src="/KMFB.png" 
                alt="Kenechukwu Microfinance Bank" 
                style={{ height: '140px', width: 'auto' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Enter your credentials to continue
            </Typography>
          </Box>

          {/* Alert Message */}
          {message && (
            <Alert severity={messageType} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address / Username"
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#800020',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontSize: '14px',
                },
                '& .MuiInputBase-input': {
                  color: '#333',
                  fontSize: '14px',
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#673ab7',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontSize: '14px',
                },
                '& .MuiInputBase-input': {
                  color: '#333',
                  fontSize: '14px',
                },
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: '#bdbdbd',
                      '&.Mui-checked': {
                        color: '#800020',
                      },
                    }}
                  />
                }
                label="Keep me logged in"
                sx={{
                  color: '#666',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '14px',
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#800020',
                  cursor: 'pointer',
                  fontSize: '14px',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={onForgotPasswordClick}
              >
                Forgot Password?
              </Typography>
            </Box>
            
            <StyledButton
              fullWidth
              variant="contained"
              onClick={handleSignIn}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </StyledButton>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
                Don't have an account?{' '}
                <Typography
                  component="span"
                  sx={{
                    color: '#800020',
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={onSignUpClick}
                >
                  Sign up
                </Typography>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default SignIn;