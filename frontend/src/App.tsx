import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";

const theme = createTheme({
  palette: {
    primary: {
      main: "#673ab7",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    h4: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (max-width:600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
  },
});

type AuthView = "signin" | "signup" | "forgot-password";

function AuthenticatedApp() {
  const { state, logout } = useAuth();
  const { user } = state;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0
    }}>
      <AppBar position="static" sx={{ width: '100%' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IFRS Portal - Welcome, {user?.firstName} {user?.lastName}!
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ 
        flex: 1,
        width: '100%',
        p: 3,
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the IFRS Portal! You are now logged in.
        </Typography>
      </Box>
    </Box>
  );
}

function UnauthenticatedApp() {
  const [currentView, setCurrentView] = useState<AuthView>("signin");

  return (
    <>
      {currentView === "signin" && (
        <SignIn
          onSignUpClick={() => setCurrentView("signup")}
          onForgotPasswordClick={() => setCurrentView("forgot-password")}
        />
      )}
      {currentView === "signup" && (
        <SignUp onSignInClick={() => setCurrentView("signin")} />
      )}
      {currentView === "forgot-password" && (
        <ForgotPassword onSignInClick={() => setCurrentView("signin")} />
      )}
    </>
  );
}

function AppContent() {
  const { state } = useAuth();

  if (state.isAuthenticated) {
    return <AuthenticatedApp />;
  }

  return <UnauthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
