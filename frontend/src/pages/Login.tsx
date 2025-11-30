import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/login",
        { username, password },
        { withCredentials: true },
      );
      if (res.data.success) {
        // Fetch user info after login
        const me = await axios.get("/api/me", { withCredentials: true });
        setUser(me.data);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">🔐 Login</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
