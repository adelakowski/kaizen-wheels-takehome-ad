import { cn } from "@/lib/classnames";

export interface KaizenLogoProps {
  /** Affects wordmark color only; the mark is always the green mountain-peak icon */
  variant?: "light" | "dark";
  showWordmark?: boolean;
  className?: string;
  size?: number;
}

export function KaizenLogo({
  variant = "light",
  showWordmark = true,
  className,
  size = 32,
}: KaizenLogoProps) {
  const isLight = variant === "light";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/kaizen-mark.png"
        alt=""
        width={size}
        height={size}
        className="shrink-0"
        aria-hidden="true"
      />
      {showWordmark && (
        <span
          className={cn(
            "text-xl font-semibold tracking-tight",
            isLight ? "text-foreground" : "text-white",
          )}
        >
          Kaizen
          <span
            className={cn(
              "font-normal",
              isLight ? "text-muted-foreground" : "text-white/70",
            )}
          >
            {" "}
            Wheels
          </span>
        </span>
      )}
    </span>
  );
}
