import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';

const theme = createTheme({
  palette: {
    primary: {
      main: '#673ab7',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

type AuthView = 'signin' | 'signup' | 'forgot-password';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [currentView, setCurrentView] = useState<AuthView>('signin');

  const handleSignIn = async (credentials: { email: string; password: string; rememberMe: boolean }) => {
    // Simulate authentication - replace with actual API call
    if (credentials.email === 'admin' && credentials.password === 'password') {
      setIsAuthenticated(true);
      setUser({ username: credentials.email });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleSignUp = async (userData: { username: string; email: string; password: string; confirmPassword: string }) => {
    // Simulate user registration - replace with actual API call
    console.log('Sign up data:', userData);
    setIsAuthenticated(true);
    setUser({ username: userData.username });
  };

  const handlePasswordReset = async (email: string) => {
    // Simulate password reset - replace with actual API call
    console.log('Password reset for:', email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('signin');
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {currentView === 'signin' && (
          <SignIn
            onSignUpClick={() => setCurrentView('signup')}
            onForgotPasswordClick={() => setCurrentView('forgot-password')}
            onSignIn={handleSignIn}
          />
        )}
        {currentView === 'signup' && (
          <SignUp
            onSignInClick={() => setCurrentView('signin')}
            onSignUp={handleSignUp}
          />
        )}
        {currentView === 'forgot-password' && (
          <ForgotPassword
            onSignInClick={() => setCurrentView('signin')}
            onPasswordReset={handlePasswordReset}
          />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              IFRS Portal - Welcome, {user?.username}!
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1">
            Welcome to the IFRS Portal! You are now logged in.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
