import * as React from "react";
import { useParams } from "react-router-dom";
import StorePage from "./StorePage";
import SettleUp from "../components/transactions/SettleUp";
import AddItem from "../components/items/AddItem";
import TransactionHistory from "../components/transactions/TransactionHistory";
import { Box, Typography, Paper, Tabs, Tab, Divider } from "@mui/material";

export default function HousePage() {
  const { id } = useParams();
  const [tab, setTab] = React.useState(0);
  const [houseName, setHouseName] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (id) {
      // Fetch house name from API
      import("../services/api").then(({ default: api }) => {
        api
          .get(`/houses/${id}/`)
          .then((res) => {
            setHouseName(res.data.name || "");
            setError("");
          })
          .catch((e) => {
            setError(
              e.response?.data?.detail ||
                (e.response?.data && typeof e.response.data === "object"
                  ? Object.values(e.response.data).join(" ")
                  : "Failed to load house info.")
            );
            setHouseName("");
          });
      });
    }
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box
      width="100%"
      maxWidth={{ xs: "100%", md: "lg" }}
      mx="auto"
      mt={{ xs: 2, sm: 4 }}
      px={{ xs: 1, sm: 2, md: 4 }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        color="primary.main"
        mb={3}
        align="center"
        fontSize={{ xs: 22, sm: 28, md: 32 }}
      >
        {houseName ? `${houseName}` : "House"}
      </Typography>
      {error && (
        <Box mb={2}>
          <Typography
            color="error"
            align="center"
            fontSize={{ xs: 14, sm: 16 }}
          >
            {error}
          </Typography>
        </Box>
      )}
      <Paper elevation={2} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: { xs: 36, sm: 48 },
            "& .MuiTab-root": {
              fontSize: { xs: 13, sm: 15 },
              minHeight: { xs: 36, sm: 48 },
              px: { xs: 1, sm: 2 },
            },
          }}
        >
          <Tab label="Store" />
          <Tab label="Transaction History" />
          <Tab label="Add Item" />
          <Tab label="Settle Up" />
        </Tabs>
        <Divider />
        <Box p={{ xs: 1, sm: 2 }}>
          {tab === 0 && <StorePage houseId={id} />}
          {tab === 1 && <TransactionHistory houseId={id} />}
          {tab === 2 && <AddItem houseId={id} />}
          {tab === 3 && <SettleUp houseId={id} />}
        </Box>
      </Paper>
    </Box>
  );
}
