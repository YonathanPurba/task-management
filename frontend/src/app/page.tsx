"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI, getAuthToken } from "@/lib/api";
import TaskModal from "@/components/TaskModal";
import ChatbotWidget from "@/components/ChatbotWidget";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  assignee_id: number | null;
  assignee?: { id: number; name: string };
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    } else {
      loadTasks();
    }
  }, [router]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAPI("/tasks");
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetchAPI(`/tasks/${id}`, { method: "DELETE" });
      loadTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      await fetchAPI(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...task, status: newStatus, assignee_id: task.assignee?.id }),
      });
      loadTasks();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading tasks...</p>
      </div>
    );
  }

  const columns = ["Todo", "In Progress", "Done"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Task Board</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
            >
              + Add Task
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Kanban Board */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {columns.map((colStatus) => (
            <div key={colStatus} className="flex flex-col rounded-xl bg-slate-100 p-4">
              <h2 className="mb-4 font-semibold text-slate-700">{colStatus}</h2>
              <div className="flex flex-1 flex-col gap-4">
                {tasks
                  .filter((task) => task.status === colStatus)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="group relative flex flex-col rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {task.assignee ? task.assignee.name : "Unassigned"}
                        </span>
                        {task.deadline && (
                          <span
                            className={`${
                              new Date(task.deadline) < new Date() && task.status !== "Done"
                                ? "text-red-500 font-medium"
                                : ""
                            }`}
                          >
                            {task.deadline}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {columns.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(task)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
        onSave={loadTasks}
      />
      <ChatbotWidget />
    </div>
  );
}
