
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";

export type TxType = "income" | "expense";

export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Education"
  | "Health"
  | "Salary"
  | "Freelance"
  | "Entertainment"
  | "Other";

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

const expenseCategories: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Other",
];

const incomeCategories: Category[] = [
  "Salary",
  "Freelance",
  "Other",
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
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function createTransactionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  const [saving, setSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const categories =
    type === "expense" ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setType(initial?.type ?? "expense");
    setTitle(initial?.title ?? "");
    setAmount(initial ? String(initial.amount) : "");
    setCategory(
      initial?.category ??
        (initial?.type === "income" ? "Salary" : "Food")
    );
    setDate(initial?.date ?? todayString());
    setError("");
    setSaving(false);

    const focusTimer = window.setTimeout(() => {
      titleRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
      previousFocusRef.current?.focus();
    };
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }

      if (event.key === "Tab") {
        const dialog = document.getElementById("transaction-dialog");
        if (!dialog) return;

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving, onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  function handleTypeChange(nextType: TxType) {
    setType(nextType);
    setCategory(nextType === "income" ? "Salary" : "Food");
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const cleanTitle = title.trim();
    const value = Number(amount);
    const today = todayString();

    if (!cleanTitle) {
      setError("Description enter karo.");
      titleRef.current?.focus();
      return;
    }

    if (cleanTitle.length > 80) {
      setError("Description 80 characters se chhoti honi chahiye.");
      return;
    }

    if (
      amount.trim() === "" ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > 9999999999
    ) {
      setError("₹0 se zyada aur valid amount enter karo.");
      return;
    }

    if (!validDate(date) || date > today) {
      setError("Aaj ki ya usse pehle ki valid date select karo.");
      return;
    }

    if (!categories.includes(category)) {
      setError("Selected transaction type ke liye valid category chuno.");
      return;
    }

    const transaction: Transaction = {
      id: initial?.id ?? createTransactionId(),
      title: cleanTitle,
      amount: Math.round(value * 100) / 100,
      type,
      category,
      date,
    };

    try {
      setSaving(true);
      setError("");
      onSave(transaction);
    } catch {
      setSaving(false);
      setError("Transaction save nahi hua. Dobara try karo.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-hidden bg-[#212121]/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <section
        id="transaction-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-dialog-title"
        aria-describedby="transaction-dialog-description"
        className="flex max-h-[92dvh] w-full min-w-0 flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[min(90dvh,760px)] sm:max-w-md sm:rounded-3xl"
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#F0EDF7] px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2
              id="transaction-dialog-title"
              className="text-lg font-extrabold sm:text-xl"
            >
              {initial ? "Edit transaction" : "Add transaction"}
            </h2>

            <p
              id="transaction-dialog-description"
              className="mt-1 text-xs text-[#878787] sm:text-sm"
            >
              Enter your money details.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F8] text-xl transition hover:bg-[#EEE5FF] focus-visible:outline-2 focus-visible:outline-[#9B66FF] disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Scrollable form area */}
        <form
          onSubmit={submit}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
        >
          {/* Transaction type */}
          <div
            className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F4F8] p-1"
            aria-label="Transaction type"
          >
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              aria-pressed={type === "expense"}
              className={`min-h-11 rounded-xl px-2 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-[#9B66FF] ${
                type === "expense"
                  ? "bg-[#9B66FF] text-white shadow-sm"
                  : "text-[#666666] hover:bg-white"
              }`}
            >
              ↓ Expense
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              aria-pressed={type === "income"}
              className={`min-h-11 rounded-xl px-2 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-[#1162F2] ${
                type === "income"
                  ? "bg-[#1162F2] text-white shadow-sm"
                  : "text-[#666666] hover:bg-white"
              }`}
            >
              ↑ Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="tx-amount"
              className="mb-1.5 block text-xs font-bold text-[#454D5E]"
            >
              Amount (₹)
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9B66FF]">
                ₹
              </span>

              <input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="9999999999"
                step="0.01"
                required
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
                placeholder="0.00"
                className="min-h-12 w-full rounded-xl border border-[#DBDBDB] bg-white pl-10 pr-3 text-lg font-bold outline-none transition focus:border-[#9B66FF] focus:ring-2 focus:ring-[#9B66FF]/15"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="tx-title"
                className="text-xs font-bold text-[#454D5E]"
              >
                Description
              </label>
              <span className="text-[10px] text-[#878787]">
                {title.length}/80
              </span>
            </div>

            <input
              ref={titleRef}
              id="tx-title"
              required
              maxLength={80}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              placeholder="e.g. Lunch, Salary, Rent"
              autoComplete="off"
              className="min-h-11 w-full rounded-xl border border-[#DBDBDB] px-3 text-sm outline-none transition focus:border-[#9B66FF] focus:ring-2 focus:ring-[#9B66FF]/15"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="tx-category"
              className="mb-1.5 block text-xs font-bold text-[#454D5E]"
            >
              Category
            </label>

            <select
              id="tx-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as Category);
                setError("");
              }}
              className="min-h-11 w-full rounded-xl border border-[#DBDBDB] bg-white px-3 text-sm outline-none transition focus:border-[#9B66FF] focus:ring-2 focus:ring-[#9B66FF]/15"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {icons[item]} {item}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="tx-date"
              className="mb-1.5 block text-xs font-bold text-[#454D5E]"
            >
              Date
            </label>

            <input
              id="tx-date"
              type="date"
              required
              max={todayString()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setError("");
              }}
              className="min-h-11 w-full min-w-0 rounded-xl border border-[#DBDBDB] bg-white px-3 text-sm outline-none transition focus:border-[#9B66FF] focus:ring-2 focus:ring-[#9B66FF]/15"
            />
          </div>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#9B66FF] to-[#1162F2] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B66FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : initial
                ? "Save changes"
                : "Save transaction"}
          </button>
        </form>
      </section>
    </div>
  );
}
