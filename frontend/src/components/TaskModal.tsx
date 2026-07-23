"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";

type User = {
  id: number;
  username: string;
  name: string;
};

type Task = {
  id?: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  assignee_id: number | null;
};

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: Task | null;
  onSave: () => void;
};

export default function TaskModal({ isOpen, onClose, taskToEdit, onSave }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Todo");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setStatus(taskToEdit.status);
        setDeadline(taskToEdit.deadline ? taskToEdit.deadline.split("T")[0] : "");
        setAssigneeId(taskToEdit.assignee_id || "");
      } else {
        setTitle("");
        setDescription("");
        setStatus("Todo");
        setDeadline("");
        setAssigneeId("");
      }
    }
  }, [isOpen, taskToEdit]);

  const loadUsers = async () => {
    try {
      const data = await fetchAPI("/users");
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      title,
      description,
      status,
      deadline: deadline || null,
      assignee_id: assigneeId ? Number(assigneeId) : null,
    };

    try {
      if (taskToEdit && taskToEdit.id) {
        await fetchAPI(`/tasks/${taskToEdit.id}`, {
          method: "PUT",
          body: JSON.stringify(taskData),
        });
      } else {
        await fetchAPI("/tasks", {
          method: "POST",
          body: JSON.stringify(taskData),
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
      alert("Error saving task");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {taskToEdit ? "Edit Task" : "Add New Task"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
