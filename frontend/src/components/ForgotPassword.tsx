import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: "90%",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#800020",
  borderRadius: "8px",
  height: "44px",
  padding: "0 24px",
  fontSize: "14px",
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "0 2px 4px rgba(128, 0, 32, 0.2)",
  "&:hover": {
    backgroundColor: "#660019",
    boxShadow: "0 4px 8px rgba(128, 0, 32, 0.3)",
  },
  "&:disabled": {
    backgroundColor: "#e0e0e0",
    color: "#9e9e9e",
  },
}));

interface ForgotPasswordProps {
  onSignInClick: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSignInClick }) => {
  const { forgotPassword, state } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordReset = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      await forgotPassword(email);
      setMessage("Password reset link sent to your email!");
      setMessageType("success");
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Failed to send reset link. Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <StyledCard>
        <CardContent
          sx={{
            p: { xs: 3, sm: 4 },
            "&:last-child": { pb: { xs: 3, sm: 4 } },
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <img
                src="/KMFB.png"
                alt="Kenechukwu Microfinance Bank"
                style={{ height: "140px", width: "auto" }}
              />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "#333", mb: 1 }}
            >
              Forgot Password?
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Enter your email address and we'll send you a link to reset your
              password
            </Typography>
          </Box>

          {/* Alert Message */}
          {message && (
            <Alert severity={messageType} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bdbdbd",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#800020",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  fontSize: "14px",
                },
                "& .MuiInputBase-input": {
                  color: "#333",
                  fontSize: "14px",
                },
              }}
            />

            <StyledButton
              fullWidth
              variant="contained"
              onClick={handlePasswordReset}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Reset Link"
              )}
            </StyledButton>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "#666", fontSize: "14px" }}
              >
                Remember your password?{" "}
                <Typography
                  component="span"
                  sx={{
                    color: "#800020",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={onSignInClick}
                >
                  Back to Sign In
                </Typography>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default ForgotPassword;
