import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function TransactionHistory({ houseId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");

  useEffect(() => {
    if (houseId) {
      setLoading(true);
      api
        .get(`/transactions/?house=${houseId}`)
        .then((res) => setTransactions(res.data))
        .catch((e) => {
          setTransactions([]);
          // Optionally, you can show an error message here using a Snackbar or Alert
        })
        .finally(() => setLoading(false));
    }
  }, [houseId]);

  // Unique buyers and sellers for dropdowns
  const buyers = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.buyer_name))).sort(),
    [transactions]
  );
  const sellers = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.seller_name))).sort(),
    [transactions]
  );

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
        t.seller_name.toLowerCase().includes(search.toLowerCase()) ||
        t.item_name.toLowerCase().includes(search.toLowerCase());
      const matchesBuyer = !buyerFilter || t.buyer_name === buyerFilter;
      const matchesSeller = !sellerFilter || t.seller_name === sellerFilter;
      return matchesSearch && matchesBuyer && matchesSeller;
    });
  }, [transactions, search, buyerFilter, sellerFilter]);

  if (!houseId)
    return (
      <Typography color="text.secondary" align="center">
        Select a house to view transactions.
      </Typography>
    );
  if (loading)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={120}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, sm: 2 },
        bgcolor: "background.default",
        maxWidth: { xs: "100%", sm: 700 },
        mx: "auto",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        color="primary.main"
        mb={2}
        align="center"
        fontSize={{ xs: 18, sm: 22 }}
      >
        Transaction History
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="center"
        width="100%"
      >
        <TextField
          size="small"
          placeholder="Search by item, buyer, seller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: 120, sm: 180 },
            width: { xs: "100%", sm: "auto" },
          }}
        />
        <TextField
          select
          size="small"
          label="Buyer"
          value={buyerFilter}
          onChange={(e) => setBuyerFilter(e.target.value)}
          sx={{
            minWidth: { xs: 100, sm: 120 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <MenuItem value="">All Buyers</MenuItem>
          {buyers.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Seller"
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value)}
          sx={{
            minWidth: { xs: 100, sm: 120 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <MenuItem value="">All Sellers</MenuItem>
          {sellers.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {transactions.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nothing found here.
        </Alert>
      ) : filtered.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No transactions match your search/filter.
        </Alert>
      ) : (
        <List sx={{ width: "100%" }}>
          {filtered.map((t, idx) => (
            <React.Fragment key={t.id}>
              <ListItem alignItems="flex-start" sx={{ px: { xs: 0, sm: 0.5 } }}>
                <ListItemText
                  primary={
                    <span style={{ fontSize: 15 }}>
                      <b>{t.buyer_name?.split(" ")[0]}</b> bought{" "}
                      <b>{t.item_name}</b> from{" "}
                      <b>{t.seller_name?.split(" ")[0]}</b>
                    </span>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: 12, sm: 14 } }}
                    >
                      Qty: {t.quantity_taken} {t.unit} @ ₹{t.amount} <br />
                      <span style={{ fontSize: 11 }}>
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </Typography>
                  }
                />
              </ListItem>
              {idx !== filtered.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
}
