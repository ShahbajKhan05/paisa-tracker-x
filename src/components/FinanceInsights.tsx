
"use client";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

type MonthData = {
  label: string;
  income: number;
  expenses: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CategorySpendingChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const totals = transactions
    .filter((item) => item.type === "expense")
    .reduce<Record<string, number>>((result, item) => {
      const category = item.category.trim() || "Other";
      result[category] = (result[category] || 0) + item.amount;
      return result;
    }, {});

  const categories = Object.entries(totals).sort(
    (a, b) => b[1] - a[1]
  );

  const max = Math.max(...categories.map((item) => item[1]), 1);
  const total = categories.reduce((sum, item) => sum + item[1], 0);

  return (
    <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-extrabold">Spending by category</h2>
          <p className="mt-1 text-xs text-[#878787]">
            Expenses for the current month
          </p>
        </div>
        <span className="rounded-full bg-[#EEE5FF] px-3 py-1.5 text-xs font-bold text-[#7538E8]">
          {categories.length} categories
        </span>
      </div>

      <p className="mt-4 text-xl font-extrabold">{money(total)}</p>

      {categories.length === 0 ? (
        <div className="mt-4 rounded-xl bg-[#F8F9FF] p-5 text-center text-sm text-[#777777]">
          No expenses recorded this month yet.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {categories.map(([category, amount]) => (
            <div key={category}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-semibold">{category}</span>
                <span className="shrink-0 font-bold">{money(amount)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#F0EDF7]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9B66FF] to-[#2EA1FF]"
                  style={{ width: `${(amount / max) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-[#878787]">
                {total > 0 ? ((amount / total) * 100).toFixed(1) : "0"}% of
                spending
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function MonthlyComparison({
  months,
}: {
  months: MonthData[];
}) {
  const current = months[months.length - 1];
  const previous = months[months.length - 2];

  if (!current || !previous) return null;

  function change(currentValue: number, previousValue: number) {
    if (previousValue === 0) {
      return currentValue === 0 ? "No change" : "New activity";
    }

    const percent =
      ((currentValue - previousValue) / previousValue) * 100;

    return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
  }

  function changeColor(currentValue: number, previousValue: number) {
    if (currentValue === previousValue) return "text-[#666666]";
    return currentValue > previousValue
      ? "text-[#D9485F]"
      : "text-emerald-600";
  }

  const max = Math.max(
    ...months.flatMap((month) => [month.income, month.expenses]),
    1
  );

  return (
    <section className="rounded-2xl border border-[#EAE7F3] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div>
        <h2 className="font-extrabold">Monthly comparison</h2>
        <p className="mt-1 text-xs text-[#878787]">
          This month versus last month
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[#E7F5FF] p-3">
          <p className="text-xs text-[#555555]">Income change</p>
          <p className="mt-1 text-lg font-extrabold">
            {change(current.income, previous.income)}
          </p>
          <p className="mt-1 text-xs text-[#666666]">
            {money(previous.income)} → {money(current.income)}
          </p>
        </div>

        <div className="rounded-xl bg-[#F2EAFE] p-3">
          <p className="text-xs text-[#555555]">Expense change</p>
          <p
            className={`mt-1 text-lg font-extrabold ${changeColor(
              current.expenses,
              previous.expenses
            )}`}
          >
            {change(current.expenses, previous.expenses)}
          </p>
          <p className="mt-1 text-xs text-[#666666]">
            {money(previous.expenses)} → {money(current.expenses)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {months.map((month) => (
          <div key={month.label}>
            <p className="mb-2 text-sm font-bold">{month.label}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-[#666666]">Income</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0EDF7]">
                  <div
                    className="h-full rounded-full bg-[#2EA1FF]"
                    style={{ width: `${(month.income / max) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right text-xs font-semibold">
                  {money(month.income)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-[#666666]">Expenses</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0EDF7]">
                  <div
                    className="h-full rounded-full bg-[#9B66FF]"
                    style={{ width: `${(month.expenses / max) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right text-xs font-semibold">
                  {money(month.expenses)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
