import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Box,
  Typography,
} from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";

const theme = createTheme({
  palette: {
    primary: {
      main: "#800020",
    },
    secondary: {
      main: "#800020",
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
  const { logout, state } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Dashboard onLogout={handleLogout} user={state.user} />
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
