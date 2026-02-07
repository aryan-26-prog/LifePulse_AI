import { Routes, Route } from "react-router-dom";

/* Public pages */
import Home from "./pages/Home";
import RoleSelect from "./pages/RoleSelect";

/* Citizen flow pages */
import HealthCheckin from "./pages/citizen/HealthCheckin";
import Processing from "./pages/citizen/Processing";
import CityMap from "./pages/citizen/CityMap";
import AreaDetails from "./pages/citizen/AreaDetails";

/* Auth pages */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* NGO / Admin pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import NGODashboard from "./pages/ngo/NGODashboard";
import CampOperations from "./pages/ngo/CampOperations";
import CampMap from "./pages/ngo/CampMap";
import NGOManagement from "./pages/admin/NGOManagement";
import ReportAnalytics from "./pages/admin/ReportAnalytics";

import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";

import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Home />} />
      <Route path="/select-role" element={<RoleSelect />} />

      {/* ========== CITIZEN FLOW (NO AUTH) ========== */}
      <Route path="/citizen/checkin" element={<HealthCheckin />} />
      <Route path="/citizen/analyzing" element={<Processing />} />
      <Route path="/citizen/map" element={<CityMap />} />
      <Route path="/citizen/area/:areaName" element={<AreaDetails />} />

      {/* ========== AUTH ========== */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* ========== NGO (PROTECTED) ========== */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute>
            <NGODashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/camp/:campId"
        element={<CampOperations />}
      />
      <Route path="/ngo/camp-map" element={<CampMap />} />

      {/* ========== ADMIN (PROTECTED) ========== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      
      <Route path="/admin/ngos" element={<NGOManagement />} />
      <Route path="/admin/analytics" element={<ReportAnalytics />} />

      <Route path="/volunteer" element={<VolunteerDashboard />} />
      <Route path="/volunteer/profile" element={<VolunteerProfile />} />



      {/* Optional: 404 fallback later */}
    </Routes>
  );
}
