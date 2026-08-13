import {
  Baby,
  BedDouble,
  Files,
  Microscope,
  Pill,
  ShieldCheck,
  Siren,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Baby,
  BedDouble,
  Files,
  Microscope,
  Pill,
  ShieldCheck,
  Siren,
  Stethoscope,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Files;
  return <Icon className={className} aria-hidden="true" />;
}
