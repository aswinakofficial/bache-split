import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Debug environment variables
console.log("Environment variables:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("Using Google Client ID:", googleClientId);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
);
