type TransitionTone = "dark" | "yellow";

interface SectionTransitionProps {
  from?: TransitionTone;
  to?: TransitionTone;
  label?: string;
  labelOnly?: boolean;
}

const toneColor: Record<TransitionTone, string> = {
  dark: "#050505",
  yellow: "#fcee09",
};

export function SectionTransition({
  from = "dark",
  to = "yellow",
  label = "// MODULE loading...",
  labelOnly = false,
}: SectionTransitionProps) {
  const topColor = toneColor[from];
  const bottomColor = toneColor[to];

  if (labelOnly) {
    return (
      <div
        aria-hidden="true"
        className="relative shrink-0 overflow-hidden bg-[#fcee09]"
        style={{ height: "86px" }}
      >
        <div
          className="absolute left-0 top-0 px-6 py-4 font-mono text-[11px] font-black uppercase tracking-[0.24em]"
          style={{
            backgroundColor: "#00e5ff",
            color: "#050505",
            minWidth: "min(520px, 70vw)",
          }}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="relative shrink-0 overflow-hidden"
      style={{
        backgroundColor: bottomColor,
        height: "clamp(160px, 18vh, 220px)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{
          backgroundColor: topColor,
          height: "58%",
          zIndex: 1,
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-[112px]"
        style={{
          backgroundColor: topColor,
          clipPath:
            "polygon(0 0, 100% 0, 100% 42%, 94% 42%, 94% 76%, 88% 76%, 88% 52%, 74% 52%, 74% 88%, 63% 88%, 63% 60%, 52% 60%, 52% 100%, 38% 100%, 38% 66%, 30% 66%, 30% 88%, 18% 88%, 18% 54%, 9% 54%, 9% 74%, 0 74%)",
          zIndex: 12,
        }}
      />

      <div
        className="absolute inset-x-0 top-[34%] h-[76px]"
        style={{
          backgroundColor: topColor,
          clipPath:
            "polygon(0 0, 9% 0, 9% 22%, 16% 22%, 16% 0, 31% 0, 31% 38%, 38% 38%, 38% 0, 55% 0, 55% 24%, 62% 24%, 62% 0, 78% 0, 78% 32%, 86% 32%, 86% 0, 100% 0, 100% 54%, 92% 54%, 92% 86%, 84% 86%, 84% 58%, 69% 58%, 69% 100%, 53% 100%, 53% 70%, 42% 70%, 42% 100%, 24% 100%, 24% 64%, 12% 64%, 12% 100%, 0 100%)",
          zIndex: 13,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          backgroundColor: bottomColor,
          height: "52%",
          zIndex: 2,
        }}
      />

      <div
        className="absolute left-0 right-0 top-[42%] h-[18px]"
        style={{
          background:
            "repeating-linear-gradient(90deg, #050505 0 38px, transparent 38px 58px), linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5), transparent)",
          zIndex: 20,
        }}
      />

      <div
        className="absolute left-[7%] top-[28%] h-8 w-28 border-[3px] border-black"
        style={{ backgroundColor: bottomColor, zIndex: 22 }}
      />
      <div
        className="absolute right-[13%] top-[54%] h-10 w-36 border-[3px] border-black"
        style={{ backgroundColor: topColor, zIndex: 22 }}
      />
      <div
        className="absolute left-[56%] top-[18%] h-5 w-20 border-[3px] border-[#00e5ff]"
        style={{ backgroundColor: bottomColor, zIndex: 22 }}
      />

      <div
        className="absolute inset-y-0 left-[12%] w-[220px] opacity-65"
        style={{
          backgroundImage: "radial-gradient(circle, #00e5ff 1.5px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          zIndex: 24,
        }}
      />
      <div
        className="absolute bottom-8 right-[8%] h-20 w-[280px] opacity-55"
        style={{
          backgroundImage: "radial-gradient(circle, #00e5ff 1.4px, transparent 1.4px)",
          backgroundSize: "12px 12px",
          zIndex: 24,
        }}
      />

      <div
        className="absolute left-6 top-1/2 -translate-y-1/2 border-[3px] border-black px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.24em] shadow-[6px_6px_0_#000]"
        style={{
          backgroundColor: "#00e5ff",
          color: "#050505",
          zIndex: 30,
        }}
      >
        {label}
      </div>

      <div className="absolute inset-x-0 top-1/2 h-[3px] bg-black" style={{ zIndex: 25 }} />
    </div>
  );
}
