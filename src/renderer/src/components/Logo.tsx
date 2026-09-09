import { cn } from "@/lib/utils";

/** The Pi glyph, drawn in currentColor. */
export function Glyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 800" className={cn("h-4 w-4", className)} aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M165.29 165.29H517.36V400H400V517.36H282.65V634.72H165.29ZM282.65 282.65V400H400V282.65Z" />
      <path fill="currentColor" d="M517.36 400H634.72V634.72H517.36Z" />
    </svg>
  );
}

/** The glyph on its dark tile, as used for the app icon. */
export function Mark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#09090b] text-white ring-1 ring-white/10", className)}>
      <Glyph className="h-[70%] w-[70%]" />
    </span>
  );
}
