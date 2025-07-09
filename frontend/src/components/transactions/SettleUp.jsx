import * as React from "react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
} from "@mui/material";

export default function SettleUp({ houseId }) {
  const [settlements, setSettlements] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState("");
  const [upiPrompt, setUpiPrompt] = React.useState(null); // { id, creditor, amount }
  const [upiId, setUpiId] = React.useState("");
  const [profileUpiId, setProfileUpiId] = React.useState("");
  const [subTab, setSubTab] = React.useState(0);
  const { user } = useAuth();
  // Responsive helpers
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width:600px)").matches;

  React.useEffect(() => {
    if (houseId) {
      setLoading(true);
      api
        .get(`/settlements/?house=${houseId}`)
        .then((res) => setSettlements(res.data))
        .catch((e) => {
          setSettlements([]);
          setMsg(
            e.response?.data?.detail ||
              (e.response?.data && typeof e.response.data === "object"
                ? Object.values(e.response.data).join(" ")
                : "Failed to load settlements.")
          );
        })
        .finally(() => setLoading(false));
    }
  }, [houseId]);

  // Fetch current user's profile UPI ID on mount
  React.useEffect(() => {
    api.get("/auth/profile/").then((res) => {
      setProfileUpiId(res.data.upi_id || "");
    });
  }, []);

  const handleSettle = (settlement) => {
    if (settlement.creditor.upi_id) {
      api
        .patch(`/settlements/${settlement.id}/`, { is_settled: true })
        .then(() => {
          setSettlements(
            settlements.map((s) =>
              s.id === settlement.id ? { ...s, is_settled: true } : s
            )
          );
          setMsg("Settlement marked as complete.");
          const upiUrl = `upi://pay?pa=${encodeURIComponent(
            settlement.creditor.upi_id
          )}&pn=${encodeURIComponent(settlement.creditor.user_name)}&am=${
            settlement.amount
          }&cu=INR`;
          window.location.href = upiUrl;
        })
        .catch(() => setMsg("Error settling up."));
    } else {
      setUpiPrompt(settlement);
      setUpiId("");
    }
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/settlements/${upiPrompt.id}/`, { is_settled: true });
      setSettlements(
        settlements.map((s) =>
          s.id === upiPrompt.id ? { ...s, is_settled: true } : s
        )
      );
      setMsg("Settlement marked as complete.");
    } catch (e) {
      setMsg("Error settling up.");
    }
    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=${encodeURIComponent(upiPrompt.creditor.user_name)}&am=${
      upiPrompt.amount
    }&cu=INR`;
    window.location.href = upiUrl;
    setUpiPrompt(null);
  };

  if (!houseId)
    return (
      <Typography color="text.secondary">
        Select a house to view settlements.
      </Typography>
    );
  if (loading)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={120}
        sx={{ width: "100%" }}
      >
        <CircularProgress />
      </Box>
    );

  const iOwe = settlements.filter(
    (s) => s.debtor.id === user.user_id && !s.is_settled
  );
  const owedToMe = settlements.filter(
    (s) => s.creditor.id === user.user_id && !s.is_settled
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        px: { xs: 1, sm: 2 },
      }}
    >
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        fontWeight={600}
        color="primary.main"
        mb={2}
        align={isMobile ? "center" : "left"}
      >
        Settle Up
      </Typography>
      {msg && (
        <Alert severity="success" sx={{ mb: 2, fontSize: { xs: 13, sm: 16 } }}>
          {msg}
        </Alert>
      )}

      <Paper
        elevation={1}
        sx={{
          mb: 3,
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: { xs: 1, sm: 2 },
        }}
      >
        <Tabs
          value={subTab}
          onChange={(_, v) => setSubTab(v)}
          indicatorColor="primary"
          textColor="primary"
          centered={!isMobile}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            minHeight: { xs: 36, sm: 48 },
            "& .MuiTab-root": {
              fontSize: { xs: 13, sm: 16 },
              minHeight: { xs: 36, sm: 48 },
              py: { xs: 0.5, sm: 1 },
            },
          }}
        >
          <Tab label="Amount you owe" />
          <Tab label="Amount owed to you" />
        </Tabs>
        <Divider />
        <Box p={{ xs: 1, sm: 2 }}>
          {subTab === 0 && (
            <>
              {iOwe.length === 0 ? (
                <Typography
                  color="text.secondary"
                  align="center"
                  fontSize={{ xs: 14, sm: 16 }}
                >
                  No pending settlements.
                </Typography>
              ) : (
                <Box display="flex" justifyContent="center">
                  <List sx={{ width: "100%", maxWidth: 420 }}>
                    {iOwe.map((s) => (
                      <ListItem
                        key={s.id}
                        disableGutters
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "row",
                          columnGap: { xs: "1rem", sm: "2rem" },
                          py: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              component="span"
                              fontSize={{ xs: 14, sm: 16 }}
                            >
                              You owe <b>{s.creditor.first_name}</b>: ₹
                              {s.amount}
                            </Typography>
                          }
                          sx={{ textAlign: { xs: "left", sm: "left" } }}
                        />
                        {s.is_settled ? (
                          <Box>
                            <Typography
                              color="success.main"
                              fontWeight={500}
                              fontSize={{ xs: 13, sm: 15 }}
                            >
                              [Settled]
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Button
                              variant="contained"
                              size={isMobile ? "small" : "medium"}
                              onClick={() => handleSettle(s)}
                              sx={{
                                fontSize: { xs: 13, sm: 15 },
                                px: { xs: 2, sm: 3 },
                              }}
                            >
                              Settle Up
                            </Button>
                          </Box>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
          {subTab === 1 && (
            <>
              {owedToMe.length === 0 ? (
                <Typography
                  color="text.secondary"
                  align="center"
                  fontSize={{ xs: 14, sm: 16 }}
                >
                  No one owes you.
                </Typography>
              ) : (
                <Box display="flex" justifyContent="center">
                  <List sx={{ width: "100%", maxWidth: 420 }}>
                    {owedToMe.map((s) => (
                      <ListItem
                        key={s.id}
                        disableGutters
                        sx={{
                          py: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              component="span"
                              fontSize={{ xs: 14, sm: 16 }}
                            >
                              <b>{s.debtor.first_name}</b> owes you: ₹{s.amount}
                              {s.is_settled && (
                                <Box component="span" ml={1} display="inline">
                                  <Typography
                                    component="span"
                                    color="success.main"
                                    fontWeight={500}
                                    fontSize={{ xs: 13, sm: 15 }}
                                  >
                                    [Settled]
                                  </Typography>
                                </Box>
                              )}
                            </Typography>
                          }
                          sx={{ textAlign: { xs: "center", sm: "left" } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* UPI Prompt Dialog */}
      <Dialog
        open={!!upiPrompt}
        onClose={() => setUpiPrompt(null)}
        fullWidth
        maxWidth={isMobile ? "xs" : "sm"}
      >
        <form onSubmit={handleUpiSubmit}>
          <DialogTitle sx={{ fontSize: { xs: 16, sm: 20 } }}>
            Settle Up with {upiPrompt?.creditor.user_name}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label={`Enter UPI ID of ${upiPrompt?.creditor.user_name}`}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                placeholder="example@upi"
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{ sx: { fontSize: { xs: 14, sm: 16 } } }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={{ xs: 12, sm: 13 }}
              >
                (No UPI ID found in their profile. Please enter it manually.)
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
            <Button
              type="submit"
              variant="contained"
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: { xs: 13, sm: 15 } }}
            >
              Pay ₹{upiPrompt?.amount}
            </Button>
            <Button
              onClick={() => setUpiPrompt(null)}
              color="secondary"
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: { xs: 13, sm: 15 } }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
