import * as React from "react";
import api from "../../services/api";
import { Box, TextField, Button, Stack } from "@mui/material";

export default function CreateHouse() {
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/houses/", { name, description: desc });
      window.location.reload();
    } catch (e) {
      setError("Could not create house");
    }
    setLoading(false);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="House Name"
          size="small"
          required
        />
        <TextField
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          label="Description"
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={loading || !name}
        >
          Create House
        </Button>
      </Stack>
      {error && (
        <Box color="error.main" mt={1}>
          {error}
        </Box>
      )}
    </Box>
  );
}
