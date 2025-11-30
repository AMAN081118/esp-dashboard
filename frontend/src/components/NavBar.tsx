import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
//import { Button } from "@/components/ui/button";
import axios from "axios";

export default function NavBar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.post("/api/logout", {}, { withCredentials: true });
    setUser(null);
    navigate("/login");
  };

  const fallback = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <nav className="w-full px-6 py-4 bg-white shadow flex justify-between items-center">
      {/* Left nav items */}
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
        <Link to="/history" className="hover:text-blue-600">
          History
        </Link>
        {user?.role === "worker" && (
          <Link to="/worker-session" className="hover:text-blue-600">
            My Session
          </Link>
        )}
        {user?.role === "admin" && (
          <Link to="/active-sessions" className="hover:text-blue-600">
            Active Sessions
          </Link>
        )}
      </div>

      {/* Right user dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <Avatar>
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="capitalize">
            {user?.name} ({user?.role})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            View Profile
          </DropdownMenuItem>
          {user?.role === "admin" && (
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              Add Worker
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
