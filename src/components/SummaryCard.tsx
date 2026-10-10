
type Props = {
  title: string;
  amount: string;
  description: string;
  icon: string;
  theme: "purple" | "blue" | "pink";
};

const themes = {
  purple: {
    card: "border-transparent bg-gradient-to-br from-[#9B66FF] to-[#7138E8] text-white",
    icon: "bg-white/20",
    description: "text-white/80",
    decoration: "bg-white/10",
  },
  blue: {
    card: "border-[#D5E9FF] bg-gradient-to-br from-white to-[#E5F3FF]",
    icon: "bg-[#2EA1FF] text-white",
    description: "text-[#666666]",
    decoration: "bg-[#2EA1FF]/10",
  },
  pink: {
    card: "border-[#E9D8FF] bg-gradient-to-br from-white to-[#F3E8FF]",
    icon: "bg-[#9B66FF] text-white",
    description: "text-[#666666]",
    decoration: "bg-[#9B66FF]/10",
  },
};

export default function SummaryCard({
  title,
  amount,
  description,
  icon,
  theme,
}: Props) {
  const style = themes[theme];

  return (
    <article className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${style.card}`}>
      <div className="relative z-10 flex items-center justify-between gap-3">
        <p className={`text-sm font-bold ${theme === "purple" ? "text-white/90" : "text-[#454D5E]"}`}>
          {title}
        </p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl ${style.icon}`}>
          {icon}
        </span>
      </div>
      <p className="relative z-10 mt-5 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
        {amount}
      </p>
      <p className={`relative z-10 mt-2 text-xs ${style.description}`}>
        {description}
      </p>
      <div className={`absolute -bottom-10 -right-5 h-28 w-28 rounded-full ${style.decoration}`} />
    </article>
  );
}
