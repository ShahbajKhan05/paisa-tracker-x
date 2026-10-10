
"use client";

import type { Transaction } from "@/components/AddTransactionModal";

type Props = {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string) => void;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function dateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Invalid date";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function validAmount(value: number) {
  return Number.isFinite(value) && value >= 0;
}

const icons: Record<string, string> = {
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

export default function RecentTransactions({
  transactions,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );

  function handleDelete(item: Transaction) {
    const confirmed = window.confirm(
      `Delete "${item.title}" (${money(item.amount)})?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      onDelete(item.id);
    }
  }

  return (
    <section
      aria-labelledby="recent-transactions-heading"
      className="min-w-0 rounded-3xl border border-[#EAE7F3] bg-white p-4 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="recent-transactions-heading"
            className="text-base font-extrabold text-[#252238] sm:text-lg"
          >
            Recent transactions
          </h2>

          <p className="mt-1 text-xs text-[#878787] sm:text-sm">
            Your latest money activity
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#EEE5FF] px-3 py-2 text-xs font-extrabold text-[#7538E8] transition hover:bg-[#E4D5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B66FF] sm:text-sm"
        >
          <span aria-hidden="true" className="text-base">
            +
          </span>
          Add new
        </button>
      </div>

      {/* Empty state */}
      {sortedTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DBDBDB] px-4 py-8 text-center sm:px-6 sm:py-10">
          <span aria-hidden="true" className="text-4xl">
            💸
          </span>

          <h3 className="mt-3 text-sm font-extrabold text-[#252238] sm:text-base">
            No transactions yet
          </h3>

          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#878787] sm:text-sm">
            Start tracking your money by adding your first income or expense.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-5 min-h-11 rounded-xl bg-gradient-to-r from-[#9B66FF] to-[#1162F2] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B66FF]"
          >
            + Add transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F1F7]">
          {sortedTransactions.map((item) => {
            const isIncome = item.type === "income";
            const amountIsValid = validAmount(item.amount);

            return (
              <article
                key={item.id}
                className="flex min-w-0 items-center gap-2.5 py-3.5 sm:gap-3.5 sm:py-4"
              >
                {/* Category icon */}
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg sm:h-12 sm:w-12 sm:text-xl ${
                    isIncome ? "bg-[#E7F8EF]" : "bg-[#F0E8FF]"
                  }`}
                >
                  {icons[item.category] ?? "📌"}
                </span>

                {/* Transaction details */}
                <div className="min-w-0 flex-1">
                  <p
                    title={item.title}
                    className="truncate text-xs font-extrabold text-[#252238] sm:text-sm"
                  >
                    {item.title || "Untitled transaction"}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-[#878787] sm:text-xs">
                    {item.category || "Other"}
                    <span aria-hidden="true"> · </span>
                    {dateLabel(item.date)}
                  </p>

                  <span
                    className={`mt-1.5 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {isIncome ? "Income" : "Expense"}
                  </span>
                </div>

                {/* Amount and actions */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p
                    className={`whitespace-nowrap text-[11px] font-extrabold sm:text-sm ${
                      isIncome ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {amountIsValid ? money(item.amount) : "₹—"}
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.title || "transaction"}`}
                      title="Edit transaction"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-base text-[#666666] transition hover:bg-[#EEE5FF] hover:text-[#7538E8] focus-visible:outline-2 focus-visible:outline-[#9B66FF]"
                    >
                      <span aria-hidden="true">✎</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${item.title || "transaction"}`}
                      title="Delete transaction"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-[#878787] transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {sortedTransactions.length > 0 && (
        <div className="mt-3 border-t border-[#F0F1F7] pt-3">
          <p className="text-[11px] text-[#878787] sm:text-xs">
            Showing{" "}
            <span className="font-bold text-[#454D5E]">
              {sortedTransactions.length}
            </span>{" "}
            {sortedTransactions.length === 1
              ? "transaction"
              : "transactions"}
          </p>
        </div>
      )}
    </section>
  );
}
