import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddWorker from "./pages/AddWorker";
import WorkerSession from "./pages/WorkerSession";
import ActiveSessions from "./pages/ActiveSessions";
import History from "./pages/History";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null; // or a loading spinner
  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/admin", element: <AddWorker /> },
  { path: "/profile", element: <Profile /> },
  { path: "/worker-session", element: <WorkerSession /> },
  { path: "/active-sessions", element: <ActiveSessions /> },
  { path: "/history", element: <History /> },
];

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute>{element}</ProtectedRoute>}
        />
      ))}
    </Routes>
  );
};

export default App;
