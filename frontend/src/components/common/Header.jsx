import { useAuth } from "../../contexts/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            mb: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            fontWeight={700}
            sx={{ flexShrink: 0, fontSize: { xs: 20, sm: 24 } }}
          >
            BacheSplit
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2 }}
            sx={{ ml: { xs: 1, sm: 3 } }}
          >
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              color="inherit"
              fontWeight={500}
              sx={{ fontSize: { xs: 14, sm: 16 } }}
            >
              Home
            </Link>
            <Link
              component={RouterLink}
              to="/profile"
              underline="none"
              color="inherit"
              fontWeight={500}
              sx={{ fontSize: { xs: 14, sm: 16 } }}
            >
              Profile
            </Link>
          </Stack>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: {  sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mr: { xs: 1, sm: 2 },
              fontSize: { xs: 12, sm: 14 },
              display: { xs: "none", md: "block" },
            }}
          >
            {user?.email}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            sx={{
              ml: { xs: 0, sm: 1 },
              fontSize: { xs: 12, sm: 14 },
              px: { xs: 1, sm: 2 },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
