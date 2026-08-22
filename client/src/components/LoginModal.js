import React, { useState } from "react";
import { Dialog, DialogContent, CircularProgress, Typography, TextField, Button, Box, Divider, IconButton, InputAdornment } from "@mui/material";
import { authenticate, signin } from "../helper/Auth";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';

export default function LoginModal({ open, onClose, onSuccess }) {
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
  });
  const [showPass, setShowPass] = useState(false);

  const { email, password, error, loading } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      setValues({ ...values, error: "Please enter both email and password." });
      return;
    }
    setValues({ ...values, error: false, loading: true });
    signin({ email, password })
      .then((data) => {
        if (!data) {
          setValues({ ...values, error: "Network error.", loading: false });
          return;
        }
        if (data.success === false) {
          setValues({ ...values, error: data.error.message || data.error, loading: false });
        } else {
          authenticate(data.data, () => {
            toast.success("Welcome back!");
            setValues({ ...values, loading: false });
            if (onSuccess) onSuccess();
          });
        }
      })
      .catch((err) => setValues({ ...values, error: "An unexpected error occurred.", loading: false }));
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/google",
        {
          method: "POST",
          body: JSON.stringify({ token: credentialResponse.credential }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        toast.error(data.error || "Authentication failed");
        return;
      }
      authenticate(data.data, () => {
        toast.success("Welcome back!");
        if (onSuccess) onSuccess();
      });
    } catch {
      toast.error("Authentication error occurred!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 4, position: 'relative' }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">Welcome back 👋</Typography>
          <Typography variant="body2" color="textSecondary">Sign in to access your exams and results.</Typography>
        </Box>

        {error && (
          <Box mb={2} p={1} bgcolor="error.main" color="error.contrastText" borderRadius={1} textAlign="center">
            {error}
          </Box>
        )}

        <form onSubmit={onSubmit} noValidate>
          <Box mb={2}>
            <TextField
              label="Email address"
              variant="outlined"
              fullWidth
              value={email}
              onChange={handleChange("email")}
              type="email"
              error={!!error}
            />
          </Box>
          <Box mb={3}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type={showPass ? "text" : "password"}
              value={password}
              onChange={handleChange("password")}
              error={!!error}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass(!showPass)}
                      edge="end"
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in →"}
          </Button>
        </form>

        <Box my={3}>
          <Divider>
            <Typography variant="caption" color="textSecondary">OR CONTINUE WITH</Typography>
          </Divider>
        </Box>

        <Box display="flex" justifyContent="center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
            width="100%"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
