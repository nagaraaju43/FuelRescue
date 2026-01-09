import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NearbyPumps from "./pages/NearbyPumps";
import RequestFuel from "./pages/RequestFuel";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nearby-pumps" element={<NearbyPumps />} />
        <Route path="/request-fuel" element={<RequestFuel />} />



        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
              Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
