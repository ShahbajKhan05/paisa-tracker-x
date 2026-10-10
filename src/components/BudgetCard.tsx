
type Props = {
  budget: number;
  spent: number;
  onEdit: () => void;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function BudgetCard({ budget, spent, onEdit }: Props) {
  const progress = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const exceeded = budget > 0 && spent > budget;

  return (
    <section className="rounded-3xl border border-[#F5E8A6] bg-gradient-to-r from-[#FFF9D8] to-[#FAF6DE] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE51F] text-2xl">
            ◎
          </span>
          <div>
            <h2 className="font-extrabold">Monthly budget</h2>
            <p className="mt-1 text-sm text-[#454D5E]">
              {money(Math.max(0, budget - spent))} remaining
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="rounded-xl bg-[#9B66FF] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#8750F0]"
        >
          Edit budget
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#DBDBDB]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              exceeded ? "bg-rose-500" : "bg-gradient-to-r from-[#FFE51F] to-[#FFC928]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="rounded-full bg-[#FFE51F]/70 px-3 py-1.5 text-xs font-extrabold">
          {Math.round(progress)}% used
        </span>
      </div>

      <div className="mt-3 flex justify-between gap-3 text-xs text-[#666666]">
        <span>{money(spent)} spent</span>
        <span>Budget {money(budget)}</span>
      </div>

      {exceeded && (
        <p className="mt-3 text-sm font-bold text-rose-600">
          Budget exceeded. Try reducing your expenses.
        </p>
      )}
    </section>
  );
}
