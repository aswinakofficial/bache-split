import * as React from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  LinearProgress,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";

function StorePage() {
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Fetch items for the current house (assume only one house context)
  React.useEffect(() => {
    // Fetch the user's house (assume only one house)
    api
      .get("/houses/")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const houseId = res.data[0].id;
          api
            .get(`/items/?house=${houseId}`)
            .then((ires) => setItems(ires.data))
            .catch((e) => {
              setItems([]);
              setSnackbar({
                open: true,
                msg:
                  e.response?.data?.detail ||
                  (e.response?.data && typeof e.response.data === "object"
                    ? Object.values(e.response.data).join(" ")
                    : "Failed to load items."),
                severity: "error",
              });
            });
        } else {
          setItems([]);
        }
      })
      .catch((e) => {
        setItems([]);
        setSnackbar({
          open: true,
          msg:
            e.response?.data?.detail ||
            (e.response?.data && typeof e.response.data === "object"
              ? Object.values(e.response.data).join(" ")
              : "Failed to load house info."),
          severity: "error",
        });
      });
  }, []);

  // Filtered items by search
  const filteredItems = React.useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  // Store page for a single house (no dropdown)
  return (
    <Box
      maxWidth={{ xs: "100%", md: "md" }}
      mx="auto"
      mt={{ xs: 1, sm: 3 }}
      px={{ xs: 0.5, sm: 2 }}
    >
      <Typography
        variant="h4"
        fontWeight={600}
        mb={3}
        color="primary.main"
        align="center"
        fontSize={{ xs: 24, sm: 32 }}
      >
        Store
      </Typography>
      <Box mb={2} width="100%">
        <TextField
          size="small"
          label="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
      </Box>
      <Grid
        container
        spacing={{ xs: 2, sm: 3 }}
        columns={12}
        justifyContent="center"
        alignItems="stretch"
      >
        {filteredItems.length === 0 && (
          <Grid sx={{ gridColumn: "span 12" }}>
            <Typography color="text.secondary" align="center">
              No items found.
            </Typography>
          </Grid>
        )}
        {filteredItems.map((item) => (
          <Grid
            key={item.id}
            sx={{
              gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" },
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            <Card
              variant="outlined"
              sx={{
                width: "100%",
                minWidth: 0,
                opacity: item.remaining_quantity <= 0 ? 0.5 : 1,
                filter:
                  item.remaining_quantity <= 0 ? "grayscale(0.5)" : "none",
                minHeight: { xs: 180, sm: 210 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1, sm: 2 },
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Seller name top right */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 12,
                    zIndex: 2,
                    color: "text.secondary",
                    fontSize: { xs: 11, sm: 13 },
                    fontStyle: "italic",
                    textAlign: "right",
                  }}
                >
                  by {item.added_by_name || "Unknown"}
                </Box>
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent="center"
                  alignItems={{ xs: "center", sm: "center" }}
                  mb={1}
                  gap={0.5}
                  width="100%"
                >
                  <Typography
                    variant="h6"
                    fontSize={{ xs: 16, sm: 20 }}
                    align="center"
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {item.remaining_quantity} {item.unit}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="primary.main"
                  fontWeight={500}
                  mb={1}
                  fontSize={{ xs: 14, sm: 16 }}
                  align="center"
                >
                  ₹{item.unit_price} per {item.unit}
                </Typography>
                {item.remaining_percentage !== undefined && (
                  <Box mt={1} width="100%">
                    <LinearProgress
                      variant="determinate"
                      value={item.remaining_percentage}
                      sx={{ height: 8, borderRadius: 5, background: "#f2f2f2" }}
                    />
                  </Box>
                )}
              </CardContent>
              <CardActions
                sx={{
                  p: { xs: 1, sm: 2 },
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <BuyItemButton item={item} setSnackbar={setSnackbar} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function BuyItemButton({ item, setSnackbar }) {
  const [qty, setQty] = React.useState("");
  const [unit, setUnit] = React.useState(item.unit); // default to item's base unit
  const [loading, setLoading] = React.useState(false);

  // Determine allowed units for selection
  let unitOptions = [item.unit];
  if (item.unit === "kg") unitOptions = ["kg", "g"];
  if (item.unit === "g") unitOptions = ["g", "kg"];
  if (item.unit === "l") unitOptions = ["l", "ml"];
  if (item.unit === "ml") unitOptions = ["ml", "l"];

  const handleBuy = async () => {
    setLoading(true);
    try {
      // Fetch the user's house (assume only one house)
      const houseRes = await api.get("/houses/");
      const houseId =
        houseRes.data && houseRes.data.length > 0 ? houseRes.data[0].id : null;
      if (!houseId) throw new Error("No house found");
      await api.post("/transactions/", {
        house: houseId,
        item: item.id,
        quantity_taken: qty,
        quantity_unit: unit,
      });
      setSnackbar({
        open: true,
        msg: "Purchase successful!",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        msg:
          e.response?.data?.detail ||
          (e.response?.data && typeof e.response.data === "object"
            ? Object.values(e.response.data).join(" ")
            : "Error"),
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <Box display="flex" alignItems="center" gap={1} width="100%">
      <TextField
        type="number"
        size="small"
        label="Qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        inputProps={{ min: 0.01, step: 0.01 }}
        sx={{ width: 80 }}
      />
      <FormControl size="small" sx={{ minWidth: 70 }}>
        <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {unitOptions.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={handleBuy}
        disabled={loading || !qty}
        sx={{ minWidth: 60 }}
      >
        Buy
      </Button>
    </Box>
  );
}

export default StorePage;
