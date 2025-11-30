import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import axios from "axios";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    experience: user?.experience || "",
  });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  if (!user) return <div>Loading...</div>;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put("/api/me", form, { withCredentials: true });
      setUser({ ...user, ...form, age: Number(form.age) });
      setMsg("Profile updated!");
      setEdit(false);
    } catch {
      setMsg("Update failed.");
    }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/me/change-password", pwForm, {
        withCredentials: true,
      });
      setPwMsg("Password changed!");
      setPwForm({ oldPassword: "", newPassword: "" });
    } catch (err: any) {
      setPwMsg("Password change failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">👤 Profile</h2>
      <div className="space-y-2">
        <div>
          <strong>Name:</strong>{" "}
          {edit ? (
            <input
              className="border rounded px-2 py-1"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          ) : (
            user.name
          )}
        </div>
        <div>
          <strong>Username:</strong> {user.username}
        </div>
        <div>
          <strong>Role:</strong> {user.role}
        </div>
        <div>
          <strong>Age:</strong>{" "}
          {edit ? (
            <input
              className="border rounded px-2 py-1"
              type="number"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            />
          ) : (
            user.age
          )}
        </div>
        <div>
          <strong>Experience:</strong>{" "}
          {edit ? (
            <input
              className="border rounded px-2 py-1"
              value={form.experience}
              onChange={(e) =>
                setForm((f) => ({ ...f, experience: e.target.value }))
              }
            />
          ) : (
            user.experience
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {edit ? (
          <>
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={handleEdit}
            >
              Save
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => setEdit(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setEdit(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
      {msg && <div className="text-green-600 mt-2">{msg}</div>}

      <hr className="my-6" />

      <form onSubmit={handlePwChange} className="space-y-2">
        <h3 className="font-semibold">Change Password</h3>
        <input
          className="border rounded px-2 py-1 w-full"
          type="password"
          placeholder="Old Password"
          value={pwForm.oldPassword}
          onChange={(e) =>
            setPwForm((f) => ({ ...f, oldPassword: e.target.value }))
          }
          required
        />
        <input
          className="border rounded px-2 py-1 w-full"
          type="password"
          placeholder="New Password"
          value={pwForm.newPassword}
          onChange={(e) =>
            setPwForm((f) => ({ ...f, newPassword: e.target.value }))
          }
          required
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded w-full"
          type="submit"
        >
          Change Password
        </button>
        {pwMsg && <div className="text-green-600">{pwMsg}</div>}
      </form>
    </div>
  );
}
