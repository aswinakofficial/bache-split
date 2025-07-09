import { useState } from "react";
import api from "../../services/api";
import {
  Button,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function ShareHouseLinkButton({ houseId, houseName }) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post(`/houses/${houseId}/generate_join_token/`);
      const token = res.data.token;
      const url = `${window.location.origin}/join/${token}`;
      setLink(url);
      if (navigator.share) {
        navigator.share({
          title: `Join my house: ${houseName}`,
          text: `Join my house on BacheSplit!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setSnackbar({
          open: true,
          msg: "Link copied to clipboard!",
          severity: "success",
        });
      }
    } catch (e) {
      setError("Could not generate link");
      setSnackbar({
        open: true,
        msg: "Could not generate link",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Tooltip title="Share House Link">
        <span>
          <IconButton
            color="primary"
            size="small"
            onClick={handleGenerate}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? <CircularProgress size={20} /> : <ShareIcon />}
          </IconButton>
        </span>
      </Tooltip>
      {link && !navigator.share && (
        <Tooltip title="Copy link">
          <IconButton
            color="secondary"
            size="small"
            onClick={async () => {
              await navigator.clipboard.writeText(link);
              setSnackbar({
                open: true,
                msg: "Link copied to clipboard!",
                severity: "success",
              });
            }}
            sx={{ ml: 1 }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {link && !navigator.share && (
        <MuiLink
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ ml: 1, fontSize: 13 }}
        >
          Open Link
        </MuiLink>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
