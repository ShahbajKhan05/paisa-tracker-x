
"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import type { Tab } from "@/components/Navbar";
import Footer from "@/components/Footer";
import SummaryCard from "@/components/SummaryCard";
import BudgetCard from "@/components/BudgetCard";
import SpendingChart from "@/components/SpendingChart";
import RecentTransactions from "@/components/RecentTransactions";
import AddTransactionModal from "@/components/AddTransactionModal";
import type { Transaction } from "@/components/AddTransactionModal";

const STORAGE_KEY = "paisa-tracker-x-transactions";
const BUDGET_KEY = "paisa-tracker-x-budget";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function todayString() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState(10000);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTransactions(
            parsed.filter(
              (item): item is Transaction =>
                item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                typeof item.amount === "number" &&
                Number.isFinite(item.amount) &&
                (item.type === "income" || item.type === "expense") &&
                typeof item.category === "string" &&
                typeof item.date === "string"
            )
          );
        }
      }

      const savedBudget = localStorage.getItem(BUDGET_KEY);
      if (savedBudget !== null && Number.isFinite(Number(savedBudget))) {
        setBudget(Math.max(0, Number(savedBudget)));
      }
    } catch {
      setMessage("Saved data load nahi ho paya.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      localStorage.setItem(BUDGET_KEY, String(budget));
    } catch {
      setMessage("Data save nahi hua. Browser storage check karo.");
    }
  }, [transactions, budget, loaded]);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const today = todayString();
  const currentMonth = today.slice(0, 7);

  const monthTransactions = useMemo(
    () => transactions.filter((item) => item.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const income = monthTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = monthTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = transactions.reduce(
    (sum, item) => sum + (item.type === "income" ? item.amount : -item.amount),
    0
  );

  const recentTransactions = [...transactions]
    .filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    )
    .slice(0, 5);

  const chartMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const key = monthKey(date);

    const total = transactions
      .filter((item) => item.type === "expense" && item.date.startsWith(key))
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      key,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      total,
    };
  });

  function navigate(tab: Tab) {
    if (tab === "add") {
      setEditing(null);
      setModalOpen(true);
      return;
    }
    setActiveTab(tab);
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function saveTransaction(item: Transaction) {
    setTransactions((old) => {
      const exists = old.some((tx) => tx.id === item.id);
      return exists
        ? old.map((tx) => (tx.id === item.id ? item : tx))
        : [item, ...old];
    });

    setModalOpen(false);
    setEditing(null);
    setMessage("Transaction saved successfully.");
    setActiveTab("home");
  }

  function editTransaction(item: Transaction) {
    setEditing(item);
    setModalOpen(true);
  }

  function deleteTransaction(id: string) {
    const item = transactions.find((tx) => tx.id === id);
    if (!item) return;

    if (window.confirm(`Delete "${item.title}"?`)) {
      setTransactions((old) => old.filter((tx) => tx.id !== id));
      setMessage("Transaction deleted.");
    }
  }

  function editBudget() {
    const input = window.prompt("Monthly budget amount (₹)", String(budget));
    if (input === null || input.trim() === "") return;

    const value = Number(input);
    if (!Number.isFinite(value) || value < 0) {
      window.alert("Valid budget amount enter karo.");
      return;
    }

    setBudget(value);
    setMessage("Monthly budget updated.");
  }

  function exportCSV() {
    const rows = [
      ["Description", "Amount", "Type", "Category", "Date"],
      ...transactions.map((item) => [
        item.title,
        String(item.amount),
        item.type,
        item.category,
        item.date,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `paisa-tracker-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!loaded) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F8F9FF]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#DBDBDB] border-t-[#9B66FF]" />
          <p className="font-bold text-[#454D5E]">Loading Paisa Tracker X...</p>
        </div>
      </main>
    );
  }

  const heading: Record<Tab, string> = {
    home: "Your money",
    budget: "Your budget",
    add: "Add transaction",
    reports: "Spending reports",
    settings: "Settings",
  };

  return (
    <div className="min-h-dvh bg-[#F8F9FF] text-[#212121]">
      <Navbar activeTab={activeTab} onNavigate={navigate} />

      <main className="min-h-dvh px-4 pb-24 pt-5 sm:px-6 sm:pb-8 lg:ml-60 lg:px-8 lg:pt-7">
        <div className="mx-auto w-full max-w-7xl">
          {/* Top header */}
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9B66FF]">
                {now
                  ? now.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : today}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {heading[activeTab]}
                {activeTab === "home" && " 👋"}
              </h1>
              <p className="mt-1 text-sm text-[#666666]">
                {now
                  ? now.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : ""}
                {" · "}
                {activeTab === "home"
                  ? "Track your income, expenses and stay in control."
                  : "Manage your money with confidence."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-[#EEE5FF] px-4 py-2 text-xs font-bold text-[#7538E8] sm:inline-flex">
                👑 Personal Finance
              </span>
              <button
                onClick={() => {
                  setActiveTab("home");
                  setMessage("");
                  const input = window.prompt("Search transactions by description");
                  if (input !== null) setSearch(input);
                }}
                aria-label="Search transactions"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#EAE7F3] bg-white text-xl hover:bg-[#EEE5FF]"
              >
                ⌕
              </button>
            </div>
          </header>

          {message && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <span>{message}</span>
              <button onClick={() => setMessage("")} aria-label="Dismiss">×</button>
            </div>
          )}

          {activeTab === "home" && (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SummaryCard
                  title="Total balance"
                  amount={money(balance)}
                  description="Income minus expenses"
                  icon="₹"
                  theme="purple"
                />
                <SummaryCard
                  title="Income this month"
                  amount={money(income)}
                  description="Money received"
                  icon="↑"
                  theme="blue"
                />
                <SummaryCard
                  title="Expenses this month"
                  amount={money(expenses)}
                  description="Money spent"
                  icon="↓"
                  theme="pink"
                />
              </section>

              <div className="mt-5">
                <BudgetCard
                  budget={budget}
                  spent={expenses}
                  onEdit={editBudget}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
                <div className="xl:col-span-3">
                  <SpendingChart months={chartMonths} total={expenses} />
                </div>
                <div className="xl:col-span-2">
                  <section className="h-full rounded-3xl border border-[#EAE7F3] bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-extrabold">Money snapshot</h2>
                    <p className="mt-1 text-xs text-[#878787]">This month at a glance</p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-[#E7F5FF] p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2EA1FF] text-xl text-white">↑</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#666666]">Income received</p>
                          <p className="mt-1 break-words font-extrabold">{money(income)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-[#F2EAFE] p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B66FF] text-xl text-white">↓</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#666666]">Expenses paid</p>
                          <p className="mt-1 break-words font-extrabold">{money(expenses)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-[#FFF8CF] p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE51F] text-xl">◎</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#666666]">Budget left</p>
                          <p className="mt-1 break-words font-extrabold">{money(Math.max(0, budget - expenses))}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={openAdd}
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#9B66FF] to-[#1162F2] px-4 py-3 text-sm font-extrabold text-white"
                    >
                      + Add a transaction
                    </button>
                  </section>
                </div>
              </div>

              <div className="mt-5">
                <RecentTransactions
                  transactions={recentTransactions}
                  onAdd={openAdd}
                  onEdit={editTransaction}
                  onDelete={deleteTransaction}
                />
              </div>
            </>
          )}

          {activeTab === "budget" && (
            <div className="space-y-5">
              <BudgetCard budget={budget} spent={expenses} onEdit={editBudget} />

              <section className="rounded-3xl border border-[#EAE7F3] bg-white p-5 sm:p-6">
                <h2 className="text-lg font-extrabold">Budget guide</h2>
                <p className="mt-2 text-sm leading-6 text-[#666666]">
                  Set a realistic monthly spending limit. Your budget progress
                  updates automatically when you add or delete an expense.
                </p>
                <button
                  onClick={editBudget}
                  className="mt-4 rounded-xl bg-[#9B66FF] px-5 py-3 text-sm font-bold text-white"
                >
                  Edit monthly budget
                </button>
              </section>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-5">
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard
                  title="Income this month"
                  amount={money(income)}
                  description="Total money received"
                  icon="↑"
                  theme="blue"
                />
                <SummaryCard
                  title="Expenses this month"
                  amount={money(expenses)}
                  description="Total money spent"
                  icon="↓"
                  theme="pink"
                />
              </section>

              <SpendingChart months={chartMonths} total={expenses} />

              <section className="rounded-3xl border border-[#EAE7F3] bg-white p-5 sm:p-6">
                <h2 className="font-extrabold">All transactions</h2>
                <p className="mt-1 text-xs text-[#878787]">
                  {transactions.length} records saved
                </p>
                <div className="mt-4">
                  <RecentTransactions
                    transactions={[...transactions].sort((a, b) => b.date.localeCompare(a.date))}
                    onAdd={openAdd}
                    onEdit={editTransaction}
                    onDelete={deleteTransaction}
                  />
                </div>
                <button
                  onClick={exportCSV}
                  className="mt-4 min-h-11 w-full rounded-xl border border-[#DBDBDB] font-bold hover:bg-[#F8F9FF]"
                >
                  ↓ Export transactions as CSV
                </button>
              </section>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-5">
              <section className="rounded-3xl border border-[#EAE7F3] bg-white p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3A6] text-3xl">🪙</span>
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Paisa Tracker <span className="text-[#9B66FF]">X</span>
                    </h2>
                    <p className="mt-1 text-sm text-[#878787]">Track Smart. Spend Better.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#EAE7F3] bg-white p-5">
                <h2 className="font-extrabold">Data & budget</h2>
                <p className="mt-2 text-sm leading-6 text-[#666666]">
                  Your transactions are stored locally in this browser. They
                  are not synced to a cloud account.
                </p>
                <button
                  onClick={exportCSV}
                  className="mt-4 min-h-11 w-full rounded-xl border border-[#DBDBDB] font-bold hover:bg-[#F8F9FF]"
                >
                  ↓ Export transactions
                </button>
                <button
                  onClick={editBudget}
                  className="mt-3 min-h-11 w-full rounded-xl bg-[#EEE5FF] font-bold text-[#7538E8]"
                >
                  Edit monthly budget
                </button>
              </section>
            </div>
          )}

          <Footer />
        </div>
      </main>

      <AddTransactionModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={saveTransaction}
      />
    </div>
  );
}
