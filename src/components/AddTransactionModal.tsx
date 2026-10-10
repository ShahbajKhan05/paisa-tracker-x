
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

export type TxType = "income" | "expense";
export type Category =
  | "Food" | "Transport" | "Shopping" | "Bills" | "Education"
  | "Health" | "Salary" | "Freelance" | "Entertainment" | "Other";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TxType;
  category: Category;
  date: string;
};

type Props = {
  open: boolean;
  initial: Transaction | null;
  onClose: () => void;
  onSave: (item: Transaction) => void;
};

const categories: Category[] = [
  "Food", "Transport", "Shopping", "Bills", "Education",
  "Health", "Salary", "Freelance", "Entertainment", "Other",
];

const icons: Record<Category, string> = {
  Food: "🍔",
  Transport: "🚕",
  Shopping: "🛍️",
  Bills: "🧾",
  Education: "📚",
  Health: "💊",
  Salary: "💼",
  Freelance: "💻",
  Entertainment: "🎬",
  Other: "📌",
};

function todayString() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function AddTransactionModal({
  open,
  initial,
  onClose,
  onSave,
}: Props) {
  const [type, setType] = useState<TxType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(todayString());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? "expense");
    setTitle(initial?.title ?? "");
    setAmount(initial ? String(initial.amount) : "");
    setCategory(initial?.category ?? "Food");
    setDate(initial?.date ?? todayString());
    setError("");
  }, [open, initial]);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = Number(amount);

    if (!title.trim()) {
      setError("Description enter karo.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Amount zero se zyada hona chahiye.");
      return;
    }
    if (!date || date > todayString()) {
      setError("Valid date select karo.");
      return;
    }

    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      amount: value,
      type,
      category,
      date,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#212121]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold">
              {initial ? "Edit transaction" : "Add transaction"}
            </h2>
            <p className="mt-1 text-xs text-[#878787]">Enter your money details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F8] text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F4F8] p-1">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory("Food");
              }}
              className={`rounded-xl py-3 text-sm font-bold ${
                type === "expense" ? "bg-[#9B66FF] text-white" : "text-[#666666]"
              }`}
            >
              ↓ Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("Salary");
              }}
              className={`rounded-xl py-3 text-sm font-bold ${
                type === "income" ? "bg-[#1162F2] text-white" : "text-[#666666]"
              }`}
            >
              ↑ Income
            </button>
          </div>

          <div>
            <label htmlFor="tx-amount" className="mb-1.5 block text-xs font-bold text-[#454D5E]">
              Amount (₹)
            </label>
            <input
              id="tx-amount"
              type="number"
              min="0.01"
              max="9999999999"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="min-h-12 w-full rounded-xl border border-[#DBDBDB] px-4 text-lg font-bold outline-none focus:border-[#9B66FF]"
            />
          </div>

          <div>
            <label htmlFor="tx-title" className="mb-1.5 block text-xs font-bold text-[#454D5E]">
              Description
            </label>
            <input
              id="tx-title"
              required
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Lunch, Salary, Rent"
              className="min-h-11 w-full rounded-xl border border-[#DBDBDB] px-3 outline-none focus:border-[#9B66FF]"
            />
          </div>

          <div>
            <label htmlFor="tx-category" className="mb-1.5 block text-xs font-bold text-[#454D5E]">
              Category
            </label>
            <select
              id="tx-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="min-h-11 w-full rounded-xl border border-[#DBDBDB] bg-white px-3 outline-none focus:border-[#9B66FF]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {icons[item]} {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-date" className="mb-1.5 block text-xs font-bold text-[#454D5E]">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              required
              max={todayString()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-[#DBDBDB] bg-white px-3 outline-none focus:border-[#9B66FF]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#9B66FF] to-[#1162F2] font-extrabold text-white"
          >
            {initial ? "Save changes" : "Save transaction"}
          </button>
        </form>
      </section>
    </div>
  );
}
