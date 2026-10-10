
type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

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
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  return (
    <section className="rounded-3xl border border-[#EAE7F3] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold">Recent transactions</h2>
          <p className="mt-1 text-xs text-[#878787]">Your latest money activity</p>
        </div>
        <button
          onClick={onAdd}
          className="rounded-xl bg-[#EEE5FF] px-3 py-2 text-xs font-extrabold text-[#7538E8]"
        >
          + Add new
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DBDBDB] p-7 text-center">
          <span className="text-3xl">💸</span>
          <p className="mt-3 font-bold">No transactions yet</p>
          <p className="mt-1 text-xs text-[#878787]">Add your first income or expense.</p>
          <button
            onClick={onAdd}
            className="mt-4 rounded-xl bg-[#9B66FF] px-4 py-3 text-sm font-bold text-white"
          >
            Add transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F1F7]">
          {transactions.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F0E8FF] text-lg">
                {icons[item.category] ?? "📌"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{item.title}</p>
                <p className="mt-1 text-xs text-[#878787]">
                  {item.category} · {dateLabel(item.date)}
                </p>
              </div>

              <div className="text-right">
                <p className={`whitespace-nowrap text-xs font-extrabold sm:text-sm ${
                  item.type === "income" ? "text-emerald-600" : "text-rose-500"
                }`}>
                  {item.type === "income" ? "+" : "−"}{money(item.amount)}
                </p>
                <p className="mt-1 text-[10px] text-[#878787]">
                  {item.type === "income" ? "Income" : "Expense"}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666666] hover:bg-[#EEE5FF] hover:text-[#7538E8]"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  aria-label={`Delete ${item.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#878787] hover:bg-rose-50 hover:text-rose-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
