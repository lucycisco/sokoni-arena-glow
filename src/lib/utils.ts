import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse images field that may be a JSON string or already an array */
export function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try { return JSON.parse(images); } catch { return []; }
  }
  return [];
}
