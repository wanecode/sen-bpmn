import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={cn("size-7", className)} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="25" height="25" rx="2.5" stroke="currentColor" />
      <circle cx="7" cy="14" r="2" fill="currentColor" />
      <circle cx="21" cy="8" r="2" fill="currentColor" />
      <circle cx="21" cy="20" r="2" fill="currentColor" />
      <path d="M9 14h5m0 0v-6h5m-5 6v6h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
