import * as React from "react";
import GoogleLoginButton from "../components/auth/GoogleLogin";
import { Box, Typography, Paper } from "@mui/material";

export default function LoginPage() {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f7f7f7"
      px={{ xs: 1, sm: 0 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 5 },
          minWidth: { xs: "unset", sm: 340 },
          width: { xs: "100%", sm: "auto" },
          maxWidth: 400,
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
          Sign up / Login to BacheSplit
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
          fontSize={{ xs: 14, sm: 16 }}
        >
          Manage your flat expenses with ease
        </Typography>
        <GoogleLoginButton />
      </Paper>
    </Box>
  );
}
