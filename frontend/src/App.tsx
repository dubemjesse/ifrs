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
});

type AuthView = "signin" | "signup" | "forgot-password";

function AuthenticatedApp() {
  const { state, logout } = useAuth();
  const { user } = state;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
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
      <Box sx={{ p: 3 }}>
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
