import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import HousePage from "./pages/HousePage";
import StorePage from "./pages/StorePage";
import ProfilePage from "./pages/ProfilePage";
import JoinHousePage from "./pages/JoinHousePage";
import PrivateRoute from "./components/auth/PrivateRoute";
import Header from "./components/common/Header";

import "./App.css";

function AppRoutes() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <>
      <Header />
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/house/:id" element={<HousePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/join/:token" element={<JoinHousePage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
