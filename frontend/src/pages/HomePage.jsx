import * as React from "react";
import CreateHouse from "../components/houses/CreateHouse";
import HouseList from "../components/houses/HouseList";
import { Box, Typography, Paper, Divider } from "@mui/material";

export default function HomePage() {
  return (
    <Box
      maxWidth={{ xs: "100%", sm: 500 }}
      mx="auto"
      mt={{ xs: 2, sm: 4 }}
      px={{ xs: 1, sm: 2 }}
      width="100%"
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 4 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary.main"
          gutterBottom
          fontSize={{ xs: 22, sm: 28 }}
        >
          Welcome to BacheSplit
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          mb={2}
          fontSize={{ xs: 14, sm: 18 }}
        >
          Effortlessly split expenses and manage your flat with friends.
        </Typography>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <CreateHouse />
      </Paper>
      <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 } }}>
        <HouseList />
      </Paper>
    </Box>
  );
}
