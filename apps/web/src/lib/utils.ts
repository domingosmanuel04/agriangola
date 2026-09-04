import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function kz(n: number, unit?: string) {
  const v = new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(n);
  return unit ? `${v} Kz/${unit}` : `${v} Kz`;
}

export function qty(n: number, unit: string) {
  return `${new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 1 }).format(n)} ${unit}`;
}
