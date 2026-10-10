

"use client";



import { useEffect, useMemo, useRef, useState } from "react";

import Navbar from "@/components/Navbar";

import type { Tab } from "@/components/Navbar";

import Footer from "@/components/Footer";

import SummaryCard from "@/components/SummaryCard";

import BudgetCard from "@/components/BudgetCard";

import SpendingChart from "@/components/SpendingChart";

import RecentTransactions from "@/components/RecentTransactions";

import AddTransactionModal from "@/components/AddTransactionModal";

import type { Transaction } from "@/components/AddTransactionModal";

import {

  CategorySpendingChart,

  MonthlyComparison,

} from "@/components/FinanceInsights";



const STORAGE_KEY = "paisa-tracker-x-transactions";

const BUDGET_KEY = "paisa-tracker-x-budget";

const BACKUP_VERSION = 1;



function money(value: number) {

  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,

  }).format(value);

}



function todayString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}



function monthKey(date: Date) {

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

}



function isValidTransaction(item: unknown): item is Transaction {

  if (!item || typeof item !== "object") return false;



  const value = item as Record<string, unknown>;



  return (

    typeof value.id === "string" &&

    typeof value.title === "string" &&

    typeof value.amount === "number" &&

    Number.isFinite(value.amount) &&

    value.amount >= 0 &&

    (value.type === "income" || value.type === "expense") &&

    typeof value.category === "string" &&

    typeof value.date === "string" &&

    /^\d{4}-\d{2}-\d{2}$/.test(value.date)

  );

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

  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {

    try {

      const saved = localStorage.getItem(STORAGE_KEY);



      if (saved) {

        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {

          setTransactions(parsed.filter(isValidTransaction));

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



  const today = now ? todayString(now) : "";

  const currentMonth = today ? today.slice(0, 7) : "";



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

    (sum, item) =>

      sum + (item.type === "income" ? item.amount : -item.amount),

    0

  );



  const budgetPercent = budget > 0 ? (expenses / budget) * 100 : 0;

  const budgetWarning =

    budget > 0 && budgetPercent >= 100

      ? "Budget exceeded! Review your spending."

      : budget > 0 && budgetPercent >= 80

        ? "You have used 80% or more of your monthly budget."

        : "";



  const recentTransactions = [...transactions]

    .filter((item) =>

      item.title.toLowerCase().includes(search.trim().toLowerCase())

    )

    .sort(

      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)

    )

    .slice(0, 5);



  const chartMonths = useMemo(() => {
    if (!now) return [];

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );
      const key = monthKey(date);
      const monthItems = transactions.filter((item) => item.date.startsWith(key));
      const monthIncome = monthItems
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);
      const monthExpenses = monthItems
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        key,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        total: monthExpenses,
        income: monthIncome,
        expenses: monthExpenses,
      };
    });
  }, [now, transactions]);

  const chartDays = useMemo(() => {
    if (!now) return [];

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (6 - index)
      );
      const key = todayString(date);
      const total = transactions
        .filter((item) => item.type === "expense" && item.date === key)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        key,
        label: date.toLocaleDateString("en-IN", { weekday: "short" }),
        total,
      };
    });
  }, [now, transactions]);

  const dailyExpenses = chartDays.reduce((sum, day) => sum + day.total, 0);

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



  function downloadFile(content: string, filename: string, type: string) {

    const url = URL.createObjectURL(new Blob([content], { type }));

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);

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



    downloadFile(

      "\uFEFF" + csv,

      `paisa-tracker-${today}.csv`,

      "text/csv;charset=utf-8;"

    );

    setMessage("CSV export ready.");

  }



  function backupData() {

    const backup = {

      app: "Paisa Tracker X",

      version: BACKUP_VERSION,

      exportedAt: new Date().toISOString(),

      budget,

      transactions,

    };



    downloadFile(

      JSON.stringify(backup, null, 2),

      `paisa-tracker-backup-${today}.json`,

      "application/json"

    );

    setMessage("Backup downloaded successfully.");

  }



  async function restoreData(file?: File) {

    if (!file) return;



    try {

      const text = await file.text();

      const parsed: unknown = JSON.parse(text);



      if (!parsed || typeof parsed !== "object") {

        throw new Error("Invalid backup file.");

      }



      const backup = parsed as Record<string, unknown>;



      if (

        backup.app !== "Paisa Tracker X" ||

        backup.version !== BACKUP_VERSION ||

        !Array.isArray(backup.transactions) ||

        typeof backup.budget !== "number" ||

        !Number.isFinite(backup.budget) ||

        backup.budget < 0 ||

        !backup.transactions.every(isValidTransaction)

      ) {

        throw new Error("Backup format is not supported or is invalid.");

      }



      const confirmed = window.confirm(

        "Restore this backup? Current transactions and budget will be replaced."

      );



      if (!confirmed) return;



      setTransactions(backup.transactions);

      setBudget(backup.budget);

      setMessage("Backup restored successfully.");

      setActiveTab("home");

    } catch (error) {

      setMessage(

        error instanceof Error

          ? `Restore failed: ${error.message}`

          : "Restore failed. Check your backup file."

      );

    } finally {

      if (fileInputRef.current) fileInputRef.current.value = "";

    }

  }



  if (!loaded) {

    return (

      <main className="flex h-dvh items-center justify-center bg-[#F8F9FF]">

        <div className="text-center">

          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-[#DBDBDB] border-t-[#9B66FF]" />

          <p className="text-sm font-bold text-[#454D5E]">

            Loading Paisa Tracker X...

          </p>

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

    <div className="flex h-dvh flex-col overflow-hidden bg-[#F8F9FF] text-[#212121] lg:flex-row">

      <Navbar activeTab={activeTab} onNavigate={navigate} />



      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-20 pt-3 sm:px-5 sm:pb-5 sm:pt-4 lg:px-6 lg:pb-5 lg:pt-5">

        <div className="mx-auto w-full max-w-7xl">

          <header className="mb-3 flex items-center justify-between gap-3 sm:mb-4">

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B66FF] sm:text-xs">

                {now

                  ? now.toLocaleDateString("en-IN", {

                      weekday: "short",

                      day: "numeric",

                      month: "short",

                      year: "numeric",

                    })

                  : today}

              </p>



              <h1 className="mt-0.5 text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">

                {heading[activeTab]}

                {activeTab === "home" && " 👋"}

              </h1>



              <p className="mt-0.5 text-xs text-[#666666] sm:text-sm">

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



            <button

              onClick={() => {

                setActiveTab("home");

                const input = window.prompt(

                  "Search transactions by description"

                );

                if (input !== null) setSearch(input);

              }}

              aria-label="Search transactions"

              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EAE7F3] bg-white text-xl hover:bg-[#EEE5FF]"

            >

              ⌕

            </button>

          </header>



          {message && (

            <div

              role="status"

              className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:text-sm"

            >

              <span className="break-words">{message}</span>

              <button

                onClick={() => setMessage("")}

                aria-label="Dismiss"

                className="shrink-0 text-lg"

              >

                ×

              </button>

            </div>

          )}



          {activeTab === "home" && (

            <div className="space-y-3 sm:space-y-4">

              <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

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



              {budgetWarning && (

                <section

                  role="alert"

                  className={`rounded-xl border p-3 text-sm font-semibold ${

                    budgetPercent >= 100

                      ? "border-rose-200 bg-rose-50 text-rose-700"

                      : "border-amber-200 bg-amber-50 text-amber-800"

                  }`}

                >

                  <p>{budgetWarning}</p>

                  <p className="mt-1 text-xs font-medium">

                    {money(expenses)} spent out of {money(budget)} (

                    {budgetPercent.toFixed(1)}%).

                  </p>

                </section>

              )}



              <BudgetCard

                budget={budget}

                spent={expenses}

                onEdit={editBudget}

              />



              <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-5">

                <div className="min-w-0 xl:col-span-3">

                  <SpendingChart months={chartDays} total={dailyExpenses} />

                </div>



                <div className="min-w-0 xl:col-span-2">

                  <section className="h-full rounded-2xl border border-[#EAE7F3] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">

                    <h2 className="text-sm font-extrabold sm:text-base">

                      Money snapshot

                    </h2>

                    <p className="mt-1 text-xs text-[#878787]">

                      This month at a glance

                    </p>



                    <div className="mt-3 space-y-2">

                      <div className="rounded-xl bg-[#E7F5FF] p-3">

                        <p className="text-xs text-[#666666]">

                          Income received

                        </p>

                        <p className="mt-1 break-words text-sm font-extrabold">

                          {money(income)}

                        </p>

                      </div>



                      <div className="rounded-xl bg-[#F2EAFE] p-3">

                        <p className="text-xs text-[#666666]">Expenses paid</p>

                        <p className="mt-1 break-words text-sm font-extrabold">

                          {money(expenses)}

                        </p>

                      </div>



                      <div className="rounded-xl bg-[#FFF8CF] p-3">

                        <p className="text-xs text-[#666666]">Budget left</p>

                        <p className="mt-1 break-words text-sm font-extrabold">

                          {money(Math.max(0, budget - expenses))}

                        </p>

                      </div>

                    </div>



                    <button

                      onClick={openAdd}

                      className="mt-3 min-h-10 w-full rounded-xl bg-gradient-to-r from-[#9B66FF] to-[#1162F2] px-3 py-2.5 text-sm font-extrabold text-white hover:opacity-90"

                    >

                      + Add a transaction

                    </button>

                  </section>

                </div>

              </div>



              <CategorySpendingChart transactions={monthTransactions} />



              <RecentTransactions

                transactions={recentTransactions}

                onAdd={openAdd}

                onEdit={editTransaction}

                onDelete={deleteTransaction}

              />

            </div>

          )}



          {activeTab === "budget" && (

            <div className="space-y-3 sm:space-y-4">

              {budgetWarning && (

                <div

                  role="alert"

                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800"

                >

                  {budgetWarning}

                </div>

              )}



              <BudgetCard

                budget={budget}

                spent={expenses}

                onEdit={editBudget}

              />



              <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 sm:rounded-3xl sm:p-5">

                <h2 className="font-extrabold">Budget guide</h2>

                <p className="mt-2 text-sm leading-6 text-[#666666]">

                  Your monthly spending limit is compared against expenses

                  recorded in the current month. Alerts appear at 80% and 100%.

                </p>

                <button

                  onClick={editBudget}

                  className="mt-3 min-h-10 rounded-xl bg-[#9B66FF] px-4 py-2.5 text-sm font-bold text-white"

                >

                  Edit monthly budget

                </button>

              </section>



              <CategorySpendingChart transactions={monthTransactions} />

            </div>

          )}



          {activeTab === "reports" && (

            <div className="space-y-3 sm:space-y-4">

              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

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



              <SpendingChart months={chartDays} total={dailyExpenses} />



              <CategorySpendingChart transactions={monthTransactions} />



              <MonthlyComparison

                months={chartMonths.map((month) => ({

                  label: month.label,

                  income: month.income,

                  expenses: month.expenses,

                }))}

              />



              <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 sm:rounded-3xl sm:p-5">

                <h2 className="font-extrabold">All transactions</h2>

                <p className="mt-1 text-xs text-[#878787]">

                  {transactions.length} records saved

                </p>



                <div className="mt-3">

                  <RecentTransactions

                    transactions={[...transactions].sort((a, b) =>

                      b.date.localeCompare(a.date)

                    )}

                    onAdd={openAdd}

                    onEdit={editTransaction}

                    onDelete={deleteTransaction}

                  />

                </div>



                <button

                  onClick={exportCSV}

                  className="mt-3 min-h-11 w-full rounded-xl border border-[#DBDBDB] text-sm font-bold hover:bg-[#F8F9FF]"

                >

                  ↓ Export transactions as CSV

                </button>

              </section>

            </div>

          )}



          {activeTab === "settings" && (

            <div className="space-y-3 sm:space-y-4">

              <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 sm:rounded-3xl sm:p-5">

                <div className="flex items-center gap-3">

                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3A6] text-2xl">

                    🪙

                  </span>

                  <div>

                    <h2 className="font-extrabold">

                      Paisa Tracker{" "}

                      <span className="text-[#9B66FF]">X</span>

                    </h2>

                    <p className="mt-1 text-sm text-[#878787]">

                      Track Smart. Spend Better.

                    </p>

                  </div>

                </div>

              </section>



              <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 sm:rounded-3xl sm:p-5">

                <h2 className="font-extrabold">Backup & restore</h2>

                <p className="mt-2 text-sm leading-6 text-[#666666]">

                  Download a JSON backup containing your transactions and

                  monthly budget. Restore a backup to replace the data currently

                  saved in this browser.

                </p>



                <button

                  onClick={backupData}

                  className="mt-4 min-h-11 w-full rounded-xl bg-gradient-to-r from-[#9B66FF] to-[#1162F2] px-4 py-3 text-sm font-bold text-white hover:opacity-90"

                >

                  ↓ Download JSON backup

                </button>



                <input

                  ref={fileInputRef}

                  type="file"

                  accept=".json,application/json"

                  className="sr-only"

                  aria-label="Choose a Paisa Tracker X backup file"

                  onChange={(event) => {

                    void restoreData(event.target.files?.[0]);

                  }}

                />



                <button

                  onClick={() => fileInputRef.current?.click()}

                  className="mt-3 min-h-11 w-full rounded-xl border border-[#DBDBDB] px-4 py-3 text-sm font-bold hover:bg-[#F8F9FF]"

                >

                  ↑ Restore from JSON backup

                </button>



                <p className="mt-3 text-xs leading-5 text-[#777777]">

                  Restoring replaces the existing transactions and budget.

                  Always download a backup before restoring another file.

                </p>

              </section>



              <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 sm:rounded-3xl sm:p-5">

                <h2 className="font-extrabold">Data & budget</h2>

                <p className="mt-2 text-sm leading-6 text-[#666666]">

                  Your data is stored in this browser only. JSON backup helps

                  you move it manually to another browser or device.

                </p>



                <button

                  onClick={exportCSV}

                  className="mt-3 min-h-11 w-full rounded-xl border border-[#DBDBDB] text-sm font-bold hover:bg-[#F8F9FF]"

                >

                  ↓ Export transactions as CSV

                </button>



                <button

                  onClick={editBudget}

                  className="mt-3 min-h-11 w-full rounded-xl bg-[#EEE5FF] text-sm font-bold text-[#7538E8]"

                >

                  Edit monthly budget

                </button>

              </section>

            </div>

          )}



          <div className="mt-4">

            <Footer />

          </div>

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
