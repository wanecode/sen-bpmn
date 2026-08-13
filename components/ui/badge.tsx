import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-card px-2 py-1 text-[0.68rem] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
