import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Stack,
} from "@mui/material";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [upiId, setUpiId] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Fetch latest profile info (including upi_id) on mount
  React.useEffect(() => {
    api.get("/auth/profile/").then((res) => {
      setUpiId(res.data.upi_id || "");
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      await api.patch("/auth/profile/", { upi_id: upiId });
      setMsg("UPI ID updated!");
      refreshUser && refreshUser();
    } catch {
      setError("Failed to update UPI ID.");
    }
    setLoading(false);
  };

  return (
    <Box
      maxWidth={{ xs: "100%", sm: 500 }}
      mx="auto"
      mt={{ xs: 3, sm: 5 }}
      px={{ xs: 1, sm: 0 }}
      width="100%"
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h5"
          fontWeight={600}
          color="primary.main"
          mb={2}
          fontSize={{ xs: 20, sm: 24 }}
        >
          Profile Settings
        </Typography>
        <Typography variant="body1" mb={2} fontSize={{ xs: 14, sm: 16 }}>
          Email: <b>{user?.email}</b>
        </Typography>
        <Typography variant="body2" mb={2} fontSize={{ xs: 13, sm: 15 }}>
          <b>Saved UPI ID:</b>{" "}
          {upiId ? upiId : <span style={{ color: "#888" }}>Not set</span>}
        </Typography>
        <form onSubmit={handleSave}>
          <Box display="flex" justifyContent="center" width="100%">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              mb={2}
              width={{ xs: "100%", sm: "auto" }}
            >
              <TextField
                label="Update UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                size="small"
                required
                sx={{ width: { xs: "100%", sm: 220 } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !upiId}
                sx={{ width: { xs: "100%", sm: "auto" }, minWidth: 80 }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </form>
        {msg && (
          <Alert
            severity="success"
            sx={{ mt: 2, fontSize: { xs: 13, sm: 15 } }}
          >
            {msg}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2, fontSize: { xs: 13, sm: 15 } }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
