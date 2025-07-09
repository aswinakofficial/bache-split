import * as React from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import ShareHouseLinkButton from "./ShareHouseLinkButton";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Divider,
} from "@mui/material";

export default function HouseList() {
  const [houses, setHouses] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    api
      .get("/houses/")
      .then((res) => setHouses(res.data))
      .catch((e) => {
        // Optionally, show a user-friendly message, but avoid console errors
        setHouses([]);
        // Optionally, you can set an error state here for UI
      });
  }, []);

  if (houses.length === 0)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={120}
      >
        <Typography color="text.secondary">No houses joined yet.</Typography>
      </Box>
    );

  return (
    <Box maxWidth={400} mx="auto" mt={2}>
      <Typography
        variant="h6"
        mb={2}
        fontWeight={700}
        color="primary.main"
        align="center"
      >
        Your Houses
      </Typography>
      <List
        disablePadding
        sx={{ bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}
      >
        {houses.map((h, idx) => (
          <React.Fragment key={h.id}>
            <ListItem
              disablePadding
              secondaryAction={
                <ShareHouseLinkButton houseId={h.id} houseName={h.name} />
              }
              sx={{
                "&:not(:last-child)": { borderBottom: "1px solid #f0f0f0" },
                px: 1,
              }}
            >
              <ListItemButton
                onClick={() => navigate(`/house/${h.id}`)}
                sx={{ borderRadius: 1, py: 1.2, px: 2 }}
              >
                <ListItemText
                  primary={
                    <Typography fontWeight={500} color="text.primary">
                      {h.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
