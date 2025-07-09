import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function JoinHousePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinMsg, setJoinMsg] = useState("");

  useEffect(() => {
    api
      .get(`/houses/join/${token}/`)
      .then((res) => {
        setHouse(res.data.house_name || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Invalid or expired join link.");
        setLoading(false);
      });
  }, [token]);

  const handleJoin = async () => {
    setJoinMsg("");
    try {
      await api.post("/houses/join/accept/", { token });
      setJoinMsg("Successfully joined house!");
      setTimeout(() => navigate("/"), 1500);
    } catch (e) {
      setJoinMsg(e.response?.data?.detail || "Error joining house");
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={{ xs: 180, sm: 200 }}
        px={{ xs: 2, sm: 0 }}
      >
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={{ xs: 180, sm: 200 }}
        px={{ xs: 2, sm: 0 }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!user) {
    // Redirect to login, then back to this page
    navigate(`/login?next=/join/${token}`);
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={{ xs: "60vh", sm: "60vh" }}
      px={{ xs: 1, sm: 0 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          maxWidth: { xs: 340, sm: 400 },
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary.main"
          mb={2}
          fontSize={{ xs: 20, sm: 24 }}
        >
          Join House
        </Typography>
        <Typography variant="body1" mb={2} fontSize={{ xs: 15, sm: 16 }}>
          House: <b>{house}</b>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleJoin}
          fullWidth
          sx={{ mb: 2, fontSize: { xs: 14, sm: 16 }, py: { xs: 1, sm: 1.5 } }}
        >
          Join
        </Button>
        {joinMsg && (
          <Alert
            severity={joinMsg.includes("Success") ? "success" : "error"}
            sx={{ mt: 2, fontSize: { xs: 13, sm: 15 } }}
          >
            {joinMsg}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
