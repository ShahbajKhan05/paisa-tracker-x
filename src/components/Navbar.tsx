
"use client";

import Image from "next/image";

export type Tab = "home" | "budget" | "add" | "reports" | "settings";

type Props = {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
};

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "budget", label: "Budget", icon: "▤" },
  { id: "add", label: "Add", icon: "+" },
  { id: "reports", label: "Reports", icon: "▥" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function Navbar({ activeTab, onNavigate }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-[#EAE7F3] bg-white p-5 lg:flex lg:flex-col">
        <button
          onClick={() => onNavigate("home")}
          className="mb-10 flex items-center gap-3 text-left"
          aria-label="Go to home"
        >
          <Image
            src="/paisa-logo.webp"
            alt="Paisa Tracker X logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 shrink-0 object-contain"
          />

          <span>
            <span className="block text-lg font-extrabold tracking-tight">
              Paisa Tracker <span className="text-[#9B66FF]">X</span>
            </span>
            <span className="block text-[11px] text-[#878787]">
              Track Smart. Spend Better.
            </span>
          </span>
        </button>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#878787]">
          Workspace
        </p>

        <nav className="space-y-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-bold transition ${
                  active
                    ? "bg-[#EEE5FF] text-[#7538E8]"
                    : "text-[#454D5E] hover:bg-[#F8F6FF]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xl ${
                    item.id === "add"
                      ? "bg-gradient-to-r from-[#9B66FF] to-[#1162F2] text-white"
                      : active
                        ? "bg-white"
                        : ""
                  }`}
                >
                  {item.icon}
                </span>

                {item.id === "add" ? "Add Transaction" : item.label}

                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#9B66FF]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto overflow-hidden rounded-3xl bg-gradient-to-br from-[#F0E8FF] to-[#E6F4FF] p-4">
          <div className="mb-3">
            <Image
              src="/paisa-logo.webp"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>

          <p className="font-extrabold leading-6 text-[#212121]">
            Better money habits, brighter future.
          </p>

          <p className="mt-2 text-xs leading-5 text-[#666666]">
            Small steps today can make a big difference tomorrow.
          </p>

          <div className="mt-4 text-xs font-bold text-[#7538E8]">
            ♥ Paisa Tracker X
          </div>
        </div>
      </aside>

      {/* Mobile top brand header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#EAE7F3] bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 text-left"
          aria-label="Go to home"
        >
          <Image
            src="/paisa-logo.webp"
            alt="Paisa Tracker X logo"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />

          <span>
            <span className="block text-base font-extrabold tracking-tight">
              Paisa Tracker <span className="text-[#9B66FF]">X</span>
            </span>
            <span className="block text-[10px] text-[#878787]">
              Track Smart. Spend Better.
            </span>
          </span>
        </button>

        <span className="rounded-full bg-[#F0E8FF] px-3 py-2 text-[10px] font-bold text-[#7538E8]">
          Personal Finance
        </span>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EAE7F3] bg-white/95 px-1 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {navItems.map((item) => {
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${
                  active ? "text-[#7538E8]" : "text-[#878787]"
                }`}
              >
                <span
                  className={`flex h-8 w-9 items-center justify-center rounded-xl text-xl ${
                    item.id === "add"
                      ? "bg-gradient-to-r from-[#9B66FF] to-[#1162F2] text-white shadow-md"
                      : active
                        ? "bg-[#EEE5FF]"
                        : ""
                  }`}
                >
                  {item.icon}
                </span>

                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
