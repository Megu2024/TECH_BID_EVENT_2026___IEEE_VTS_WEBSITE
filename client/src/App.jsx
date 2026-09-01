import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import Team from "./pages/Team";
import OnlineGame from "./pages/OnlineGame";
import AdminDashboard from "./pages/AdminDashboard";
import EventInfo from "./pages/EventInfo";
import Leaderboard from "./pages/Leaderboard";
import ProjectorView from "./pages/ProjectorView";
import JoinTeam from "./pages/JoinTeam";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join-team" element={<JoinTeam />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/event-info" element={<EventInfo />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/projector" element={<ProjectorView />} />

          {/* Protected Participant Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ParticipantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:gameId/round/:roundId"
            element={
              <ProtectedRoute>
                <OnlineGame />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;