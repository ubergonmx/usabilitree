import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
  }).format(new Date(date));
}

// used in server
export function absoluteUrl(path: string) {
  return new URL(path, env.NEXT_PUBLIC_APP_URL).href;
}

/** Fisher-Yates shuffle — returns a new shuffled array */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sanitizeTreeTestLink(name: string): string {
  return name
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
