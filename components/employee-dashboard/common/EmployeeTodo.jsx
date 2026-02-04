"use client";

import { useEffect, useState } from "react";
import {
  createTodoService,
  editTodoService,
  deleteTodoService,
  getTodoService,
} from "@/service/employee-dashboard/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, CheckCircle, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const EmployeeTodo = ({ employeeId }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  /* ───────────────── FETCH TODOS ───────────────── */
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await getTodoService(employeeId);
      if (res.success) {
        setTodos(res.data?.[0]?.todos || []);
      }
    } catch (err) {
      toast.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── CREATE TODO ───────────────── */
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return toast.error("Todo cannot be empty");

    try {
      const res = await createTodoService({
        employeeId,
        todos: {
          description: newTodo,
        },
      });
      if (res.success) {
        toast.success("Todo added");
        setNewTodo("");
        fetchTodos();
      }
    } catch {
      toast.error("Failed to add todo");
    }
  };

  /* ───────────────── UPDATE TODO ───────────────── */
  const handleUpdateTodo = async (id, payload) => {
    try {
      const res = await editTodoService(id, payload);
      if (res.success) {
        toast.success("Todo updated");
        setEditingId(null);
        fetchTodos();
      }
    } catch {
      toast.error("Failed to update todo");
    }
  };

  /* ───────────────── DELETE TODO ───────────────── */
  const handleDeleteTodo = async (id) => {
    try {
      const res = await deleteTodoService(id);
      if (res.success) {
        toast.success("Todo deleted");
        fetchTodos();
      }
    } catch {
      toast.error("Failed to delete todo");
    }
  };

  useEffect(() => {
    if (employeeId) fetchTodos();
  }, [employeeId]);

  if (loading) return <p className="text-sm text-gray-500">Loading todos...</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <h2 className="text-lg font-semibold mb-4">My Todo List</h2>

      {/* Add Todo */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <Button onClick={handleAddTodo}>Add</Button>
      </div>

      {/* Todo List */}
      {todos.length === 0 ? (
        <p className="text-sm text-gray-500">No todos yet</p>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              {/* Left */}
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() =>
                    handleUpdateTodo(todo._id, {
                      status:
                        todo.status === "COMPLETED" ? "PENDING" : "COMPLETED",
                    })
                  }
                >
                  <CheckCircle
                    className={`w-5 h-5 ${
                      todo.status === "COMPLETED"
                        ? "text-green-600"
                        : "text-gray-300"
                    }`}
                  />
                </button>

                {editingId === todo._id ? (
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() =>
                      handleUpdateTodo(todo._id, {
                        description: editingText,
                      })
                    }
                    autoFocus
                  />
                ) : (
                  <p
                    className={`text-sm ${
                      todo.status === "COMPLETED"
                        ? "line-through text-gray-400"
                        : ""
                    }`}
                  >
                    {todo.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Pencil
                  className="w-4 h-4 cursor-pointer text-blue-600"
                  onClick={() => {
                    setEditingId(todo._id);
                    setEditingText(todo.description);
                  }}
                />
                <Trash2
                  className="w-4 h-4 cursor-pointer text-red-600"
                  onClick={() => handleDeleteTodo(todo._id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeTodo;
