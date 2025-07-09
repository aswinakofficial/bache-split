import * as React from "react";
import api from "../../services/api";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

export default function AddItem({ houseId }) {
  const [name, setName] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [unit, setUnit] = React.useState("nos");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleAdd = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/items/", {
        house: houseId,
        name,
        total_quantity: qty,
        unit,
        total_price: price,
      });
      setSuccess("Item added successfully!");
      setName("");
      setQty("");
      setUnit("nos");
      setPrice("");
      // Optionally, you can trigger a reload or refetch items in parent
    } catch (e) {
      setError(
        e.response?.data?.detail ||
          (e.response?.data && typeof e.response.data === "object"
            ? Object.values(e.response.data).join(" ")
            : "Could not add item")
      );
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6" mb={2} fontWeight={600} color="primary.main">
        Add Item
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Item Name"
          size="small"
          required
        />
        <TextField
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          label="Quantity"
          size="small"
          type="number"
          required
        />
        <TextField
          select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          label="Unit"
          size="small"
          sx={{ minWidth: 90 }}
        >
          <MenuItem value="nos">Nos</MenuItem>
          <MenuItem value="gram">Gram</MenuItem>
          <MenuItem value="kg">Kg</MenuItem>
          <MenuItem value="liter">Liter</MenuItem>
          <MenuItem value="ml">ML</MenuItem>
        </TextField>
        <TextField
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          label="Total Price"
          size="small"
          type="number"
          required
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={loading || !name || !qty || !price}
        >
          Add Item
        </Button>
      </Stack>
      {error && (
        <Box color="error.main" mt={1}>
          {error}
        </Box>
      )}
      {success && (
        <Box color="success.main" mt={1}>
          {success}
        </Box>
      )}
    </Box>
  );
}
