
"use client";

type DayData = {
  key: string;
  label: string;
  total: number;
};

type Props = {
  months: DayData[];
  total: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SpendingChart({ months, total }: Props) {
  const max = Math.max(
    1,
    ...months.map((day) =>
      Number.isFinite(day.total) ? Math.max(0, day.total) : 0
    )
  );

  return (
    <section className="min-w-0 rounded-3xl border border-[#EAE7F3] bg-white p-4 shadow-sm sm:p-6">
      {/* Heading */}
      <div>
        <h2 className="text-base font-extrabold text-[#252238] sm:text-lg">
          Spending overview
        </h2>

        <p className="mt-1 text-xs text-[#878787] sm:text-sm">
          Daily expenses over the last 7 days
        </p>
      </div>

      {/* Total expenses */}
      <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#F0E8FF] to-[#E5F3FF] p-4 sm:p-5">
        <p className="text-xs font-semibold text-[#666666]">
          Total expenses · Last 7 days
        </p>

        <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-[#212121] sm:text-3xl">
          {money(total)}
        </p>

        <p className="mt-2 text-xs text-[#666666]">
          Your spending during the last seven days
        </p>
      </div>

      {/* Daily chart */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-[#252238]">
            Daily expenses
          </h3>

          <span className="shrink-0 rounded-full bg-[#EEE5FF] px-3 py-1.5 text-[10px] font-bold text-[#7538E8] sm:text-xs">
            Last 7 days
          </span>
        </div>

        {months.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-[#DBDBDB] px-4 text-center">
            <div>
              <span aria-hidden="true" className="text-3xl">
                📊
              </span>

              <p className="mt-2 text-sm font-bold text-[#454D5E]">
                No spending data yet
              </p>

              <p className="mt-1 text-xs text-[#878787]">
                Add an expense to see your daily chart.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              role="img"
              aria-label={`Daily expense chart for the last seven days. Total expenses: ${money(total)}.`}
              className="flex h-40 items-end gap-2 sm:h-48 sm:gap-5"
            >
              {months.map((day, index) => {
                const amount = Number.isFinite(day.total)
                  ? Math.max(0, day.total)
                  : 0;

                const height =
                  amount > 0 ? Math.max(8, (amount / max) * 100) : 4;

                const isToday = index === months.length - 1;

                return (
                  <div
                    key={day.key}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        title={`${day.label}: ${money(amount)}`}
                        className={`w-full max-w-10 rounded-t-xl transition-all duration-300 ${
                          isToday
                            ? "bg-gradient-to-t from-[#9B66FF] to-[#2EA1FF]"
                            : "bg-gradient-to-t from-[#E2D4FF] to-[#E5F3FF]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span
                      className={`max-w-full truncate text-[10px] sm:text-xs ${
                        isToday
                          ? "font-extrabold text-[#7538E8]"
                          : "text-[#878787]"
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#9B66FF] to-[#2EA1FF]" />
                <span className="text-xs text-[#878787]">Today</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#E2D4FF] to-[#E5F3FF]" />
                <span className="text-xs text-[#878787]">Previous days</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
