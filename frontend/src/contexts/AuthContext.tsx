import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  role: "admin" | "worker";
  name: string;
  age: number;
  experience: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    axios.post("/api/logout", {}, { withCredentials: true }).finally(() => {
      setUser(null);
    });
  };

  useEffect(() => {
    axios
      .get("/api/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
