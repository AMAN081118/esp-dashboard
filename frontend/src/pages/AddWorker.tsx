import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface Worker {
  id: number;
  username: string;
  name: string;
  age: number;
  experience: string;
}

export default function AddWorker() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    age: "",
    experience: "",
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    experience: "",
  });

  const fetchWorkers = async () => {
    try {
      const res = await axios.get("/api/users", { withCredentials: true });
      setWorkers(res.data);
    } catch (err) {
      console.error("Failed to fetch workers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/register", form, { withCredentials: true });
      setForm({
        username: "",
        password: "",
        name: "",
        age: "",
        experience: "",
      });
      fetchWorkers();
    } catch (err) {
      alert("Error: User might already exist or server error.");
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditId(worker.id);
    setEditForm({
      name: worker.name,
      age: String(worker.age),
      experience: worker.experience,
    });
  };

  const handleEditSave = async (id: number) => {
    try {
      await axios.put(`/api/users/${id}`, editForm, { withCredentials: true });
      setEditId(null);
      fetchWorkers();
    } catch {
      alert("Failed to update worker.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;
    try {
      await axios.delete(`/api/users/${id}`, { withCredentials: true });
      fetchWorkers();
    } catch {
      alert("Failed to delete worker.");
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  if (user?.role !== "admin") {
    return <div className="p-6 text-red-600">Access Denied: Admins only</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">➕ Add New Worker</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {["username", "password", "name", "age", "experience"].map(
              (field) => (
                <div key={field}>
                  <Label htmlFor={field} className="capitalize mb-2">
                    {field}
                  </Label>
                  <Input
                    id={field}
                    type={field === "password" ? "password" : "text"}
                    value={form[field as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    required
                  />
                </div>
              ),
            )}
            <div className="col-span-2">
              <Button type="submit" className="w-full">
                Add Worker
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-2">👥 Registered Workers</h3>
        <Card>
          <CardContent className="p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">Username</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Experience</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id} className="border-t border-muted">
                    <td className="py-1">{w.username}</td>
                    <td>
                      {editId === w.id ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      ) : (
                        w.name
                      )}
                    </td>
                    <td>
                      {editId === w.id ? (
                        <Input
                          value={editForm.age}
                          type="number"
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, age: e.target.value }))
                          }
                        />
                      ) : (
                        w.age
                      )}
                    </td>
                    <td>
                      {editId === w.id ? (
                        <Input
                          value={editForm.experience}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              experience: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        w.experience
                      )}
                    </td>
                    <td className="flex gap-2 justify-center">
                      {editId === w.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(w.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(w)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(w.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
