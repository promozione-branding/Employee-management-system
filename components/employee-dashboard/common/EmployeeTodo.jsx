
"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createTodoService,
  editTodoService,
  deleteTodoService,
  getTodoService,
} from "@/service/employee-dashboard/todo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ListTodo,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
  X,
  Check,
} from "lucide-react";

import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const EmployeeTodo = ({ employeeId }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [adding, setAdding] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchTodos = useCallback(async () => {
    if (!employeeId) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await getTodoService(employeeId);

      if (res.success) {
        setTodos(res.data?.[0]?.todos || []);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      toast.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (event) => {
    event?.preventDefault();

    const description = newTodo.trim();

    if (!description) {
      toast.error("Todo cannot be empty");
      return;
    }

    if (!employeeId) {
      toast.error("Employee information is unavailable");
      return;
    }

    try {
      setAdding(true);

      const res = await createTodoService({
        employeeId,
        todos: { description },
      });

      if (res.success) {
        toast.success("Todo added");
        setNewTodo("");
        await fetchTodos();
      } else {
        toast.error(res.message || "Failed to add todo");
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error("Failed to add todo");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateTodo = async (id, payload) => {
    try {
      setProcessingId(id);

      const res = await editTodoService(id, payload);

      if (res.success) {
        toast.success("Todo updated");
        setEditingId(null);
        setEditingText("");
        await fetchTodos();
      } else {
        toast.error(res.message || "Failed to update todo");
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
      toast.error("Failed to update todo");
    } finally {
      setProcessingId(null);
      setSavingEdit(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setProcessingId(id);

      const res = await deleteTodoService(id);

      if (res.success) {
        toast.success("Todo deleted");
        await fetchTodos();
      } else {
        toast.error(res.message || "Failed to delete todo");
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete todo");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveEdit = async (id) => {
    const description = editingText.trim();

    if (!description) {
      toast.error("Todo cannot be empty");
      return;
    }

    setSavingEdit(true);

    await handleUpdateTodo(id, { description });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const completedCount = todos.filter(
    (todo) => todo.status === "COMPLETED"
  ).length;

  if (loading) {
    return (
      <div className="flex h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <Skeleton
            width={44}
            height={44}
            borderRadius={12}
            baseColor="#F0F3F8"
            highlightColor="#FAFBFD"
          />

          <div className="flex-1">
            <Skeleton
              width={130}
              height={16}
              baseColor="#F0F3F8"
              highlightColor="#FAFBFD"
            />

            <Skeleton
              width={100}
              height={11}
              className="mt-1"
              baseColor="#F0F3F8"
              highlightColor="#FAFBFD"
            />
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Skeleton
            height={40}
            className="flex-1"
            borderRadius={9}
          />
          <Skeleton width={70} height={40} borderRadius={9} />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              height={52}
              borderRadius={12}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] sm:p-5">
      {/* Header */}
      <div className="mb-5 flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white">
          <ListTodo size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
            My Todo List
          </h2>

          <p className="mt-0.5 text-xs text-[#8A92A6]">
            Keep your tasks on track
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {completedCount}/{todos.length}
        </span>
      </div>

      {/* Add todo */}
      <form
        onSubmit={handleAddTodo}
        className="mb-4 flex shrink-0 gap-2"
      >
        <Input
          aria-label="New todo description"
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
          maxLength={300}
          className="h-10 min-w-0 flex-1 rounded-lg border-[#E3E7F0] bg-[#FAFBFD] text-sm focus-visible:ring-[#0A2E66]"
        />

        <Button
          type="submit"
          disabled={adding || !newTodo.trim()}
          className="h-10 shrink-0 gap-1.5 rounded-lg bg-[#0A2E66] px-3 text-xs font-semibold text-white hover:bg-[#123D7D]"
        >
          <Plus size={15} />
          Add
        </Button>
      </form>

      {/* Task list */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
        {todos.length === 0 ? (
          <div className="flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
              <ListTodo size={21} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No tasks yet
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#929BAD]">
              Add your first task using the field above.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {todos.map((todo) => {
              const isCompleted = todo.status === "COMPLETED";
              const isEditing = editingId === todo._id;
              const isProcessing = processingId === todo._id;

              return (
                <li
                  key={todo._id}
                  className={`group min-w-0 rounded-xl border p-3 transition-all duration-200 ${
                    isCompleted
                      ? "border-[#E9EDF4] bg-[#FAFBFD]"
                      : "border-[#E9EDF4] bg-white hover:border-[#D5DEEF] hover:shadow-sm"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    {/* Complete task */}
                    <button
                      type="button"
                      disabled={isProcessing || isEditing}
                      aria-label={
                        isCompleted
                          ? "Mark task as pending"
                          : "Mark task as completed"
                      }
                      onClick={() =>
                        handleUpdateTodo(todo._id, {
                          status: isCompleted
                            ? "PENDING"
                            : "COMPLETED",
                        })
                      }
                      className="mt-0.5 shrink-0 rounded-full text-[#A5ADBD] transition hover:text-[#0A2E66] disabled:opacity-50"
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          size={19}
                          className="text-emerald-600"
                        />
                      ) : (
                        <Circle size={19} />
                      )}
                    </button>

                    {/* Description or editor */}
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex min-w-0 flex-col gap-2">
                          <Input
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleSaveEdit(todo._id);
                              }

                              if (event.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                            maxLength={300}
                            autoFocus
                            aria-label="Edit todo description"
                            className="h-9 min-w-0 rounded-lg border-[#E3E7F0] text-sm focus-visible:ring-[#0A2E66]"
                          />

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={savingEdit || !editingText.trim()}
                              onClick={() => handleSaveEdit(todo._id)}
                              className="h-7 rounded-md bg-[#0A2E66] px-2.5 text-xs hover:bg-[#123D7D]"
                            >
                              <Check size={13} className="mr-1" />
                              Save
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={savingEdit}
                              onClick={handleCancelEdit}
                              className="h-7 rounded-md border-[#E3E7F0] px-2.5 text-xs"
                            >
                              <X size={13} className="mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p
                            className={`break-words text-sm leading-5 ${
                              isCompleted
                                ? "text-[#929BAD] line-through"
                                : "font-medium text-[#26344D]"
                            }`}
                          >
                            {todo.description}
                          </p>

                          <span
                            className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-[#C56816]"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Pending"}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Task actions */}
                    {!isEditing && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={isProcessing}
                          aria-label="Edit todo"
                          title="Edit task"
                          onClick={() => {
                            setEditingId(todo._id);
                            setEditingText(todo.description);
                          }}
                          className="rounded-lg p-1.5 text-[#8A92A6] transition hover:bg-[#F0F3F8] hover:text-[#0A2E66] disabled:opacity-50"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          aria-label="Delete todo"
                          title="Delete task"
                          onClick={() => handleDeleteTodo(todo._id)}
                          className="rounded-lg p-1.5 text-[#A5ADBD] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-[#EDF0F5] pt-3">
        <span className="text-[11px] font-medium text-[#929BAD]">
          Task progress
        </span>

        <span className="text-[11px] font-semibold text-[#0A2E66]">
          {todos.length
            ? `${Math.round((completedCount / todos.length) * 100)}% completed`
            : "No tasks"}
        </span>
      </div>
    </div>
  );
};

export default EmployeeTodo;
