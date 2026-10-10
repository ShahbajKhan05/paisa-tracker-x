
"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigate(tab: Tab) {
    onNavigate(tab);
    setSidebarOpen(false);
  }

  return (
    <>
      {/* Desktop hover trigger */}
      <div
        className="fixed inset-y-0 left-0 z-40 hidden w-3 lg:block"
        onMouseEnter={() => setSidebarOpen(true)}
        aria-hidden="true"
      />

      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        aria-label="Desktop sidebar"
        className={`fixed inset-y-0 left-0 z-50 hidden w-[min(17rem,85vw)] flex-col border-r border-[#EAE7F3] bg-white p-4 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none sm:p-5 lg:flex ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <button
          onClick={() => navigate("home")}
          className="mb-7 flex min-w-0 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#9B66FF]"
          aria-label="Go to home"
        >
          <Image
            src="/paisa-logo.webp"
            alt="Paisa Tracker X logo"
            width={48}
            height={48}
            priority
            className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
          />

          <span className="min-w-0">
            <span className="block text-base font-extrabold tracking-tight sm:text-lg">
              Paisa Tracker <span className="text-[#9B66FF]">X</span>
            </span>
            <span className="block text-[10px] text-[#878787] sm:text-[11px]">
              Track Smart. Spend Better.
            </span>
          </span>
        </button>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#878787]">
          Workspace
        </p>

        {/* Navigation */}
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#9B66FF] sm:px-4 ${
                  active
                    ? "bg-[#EEE5FF] text-[#7538E8]"
                    : "text-[#454D5E] hover:bg-[#F8F6FF]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl ${
                    item.id === "add"
                      ? "bg-gradient-to-r from-[#9B66FF] to-[#1162F2] text-white"
                      : active
                        ? "bg-white"
                        : ""
                  }`}
                >
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1 text-left">
                  {item.id === "add" ? "Add Transaction" : item.label}
                </span>

                {active && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#9B66FF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#F0E8FF] to-[#E6F4FF] p-3 sm:rounded-3xl sm:p-4">
          <Image
            src="/paisa-logo.webp"
            alt=""
            width={44}
            height={44}
            className="mb-2 h-10 w-10 object-contain sm:mb-3 sm:h-11 sm:w-11"
          />

          <p className="text-sm font-extrabold leading-6 text-[#212121]">
            Better money habits, brighter future.
          </p>

          <p className="mt-2 text-xs leading-5 text-[#666666]">
            Small steps today can make a big difference tomorrow.
          </p>

          <div className="mt-3 text-xs font-bold text-[#7538E8] sm:mt-4">
            ♥ Paisa Tracker X
          </div>
        </div>
      </aside>

      {/* Desktop open/close handle */}
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        aria-expanded={sidebarOpen}
        className={`fixed top-1/2 z-[60] hidden h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-[#EAE7F3] bg-white text-lg font-bold text-[#7538E8] shadow-md outline-none transition-[left] duration-300 hover:bg-[#EEE5FF] focus-visible:ring-2 focus-visible:ring-[#9B66FF] motion-reduce:transition-none lg:flex ${
          sidebarOpen ? "left-[min(17rem,85vw)]" : "left-0"
        }`}
      >
        {sidebarOpen ? "‹" : "›"}
      </button>

      {/* Mobile top header */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-2 border-b border-[#EAE7F3] bg-white/95 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3 lg:hidden">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex min-w-0 items-center gap-2 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#9B66FF] sm:gap-3"
          aria-label="Go to home"
        >
          <Image
            src="/paisa-logo.webp"
            alt="Paisa Tracker X logo"
            width={40}
            height={40}
            priority
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
          />

          <span className="min-w-0">
            <span className="block text-sm font-extrabold tracking-tight sm:text-base">
              Paisa Tracker <span className="text-[#9B66FF]">X</span>
            </span>
            <span className="block text-[10px] text-[#878787]">
              Track Smart. Spend Better.
            </span>
          </span>
        </button>

        <span className="shrink-0 rounded-full bg-[#F0E8FF] px-2 py-1.5 text-[9px] font-bold text-[#7538E8] sm:px-3 sm:text-[10px]">
          Personal Finance
        </span>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EAE7F3] bg-white/95 px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)] backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {navItems.map((item) => {
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#9B66FF] sm:min-h-14 sm:gap-1 ${
                  active ? "text-[#7538E8]" : "text-[#878787]"
                }`}
              >
                <span
                  className={`flex h-7 w-9 items-center justify-center rounded-xl text-xl sm:h-8 ${
                    item.id === "add"
                      ? "bg-gradient-to-r from-[#9B66FF] to-[#1162F2] text-white shadow-md"
                      : active
                        ? "bg-[#EEE5FF]"
                        : ""
                  }`}
                >
                  {item.icon}
                </span>

                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
