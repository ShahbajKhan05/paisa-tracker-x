
"use client";

import { useEffect, useState } from "react";

type MonthData = {
  key: string;
  label: string;
  total: number;
};

type Props = {
  months: MonthData[];
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
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const max = Math.max(1, ...months.map((month) => month.total));

  return (
    <section className="rounded-3xl border border-[#EAE7F3] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-extrabold">Live date & time</h2>

          <p className="mt-1 text-xs text-[#878787]">
            {now
              ? now.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Loading date..."}
          </p>
        </div>

        <span className="flex items-center gap-2 rounded-full bg-[#EEE5FF] px-3 py-2 text-xs font-bold text-[#7538E8]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#9B66FF]" />
          LIVE
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#F0E8FF] to-[#E5F3FF] p-5">
        <p className="text-xs font-semibold text-[#666666]">
          Current local time
        </p>

        <time className="mt-2 block text-3xl font-extrabold tracking-tight text-[#212121] tabular-nums sm:text-4xl">
          {now
            ? now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "--:--:--"}
        </time>

        <p className="mt-2 text-xs text-[#666666]">
          Based on your device's local time
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-extrabold">Spending overview</h3>
        <p className="mt-1 text-xs text-[#878787]">
          Expenses over the last 6 months
        </p>

        <p className="mt-4 text-2xl font-extrabold">{money(total)}</p>

        <div className="mt-5 flex h-40 items-end gap-3 sm:h-48 sm:gap-5">
          {months.map((month, index) => {
            const height =
              month.total > 0
                ? Math.max(8, (month.total / max) * 100)
                : 4;

            return (
              <div
                key={month.key}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    title={`${month.label}: ${money(month.total)}`}
                    className={`w-full max-w-10 rounded-t-xl ${
                      index === months.length - 1
                        ? "bg-gradient-to-t from-[#9B66FF] to-[#2EA1FF]"
                        : "bg-gradient-to-t from-[#E2D4FF] to-[#E5F3FF]"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span
                  className={`text-xs ${
                    index === months.length - 1
                      ? "font-extrabold text-[#7538E8]"
                      : "text-[#878787]"
                  }`}
                >
                  {month.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
