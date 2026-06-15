import { isOnline } from "@/lib/online-status";
import { cn } from "@/lib/utils";

export function OnlineDot({
  lastActiveAt,
  className,
}: {
  lastActiveAt: Date | string | null | undefined;
  className?: string;
}) {
  const online = isOnline(lastActiveAt ? new Date(lastActiveAt) : null);
  return (
    <span
      title={online ? "Online" : "Offline"}
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        online
          ? "bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)]"
          : "bg-[var(--border-subtle)]",
        className
      )}
    />
  );
}
