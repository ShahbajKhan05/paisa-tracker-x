
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-8 hidden items-center justify-between gap-4 border-t border-[#EAE7F3] py-5 text-xs text-[#878787] sm:flex">
      <div className="flex items-center gap-3">
        <Image
          src="/paisa-logo.webp"
          alt="Paisa Tracker X logo"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />

        <div>
          <p className="font-extrabold text-[#212121]">
            Paisa Tracker <span className="text-[#9B66FF]">X</span>
          </p>
          <p className="mt-1 text-[10px]">
            Track Smart. Spend Better.
          </p>
        </div>
      </div>

      <div className="text-right">
        <p>© {new Date().getFullYear()} Paisa Tracker X</p>
        <p className="mt-1">Your money, your control.</p>
      </div>
    </footer>
  );
}
