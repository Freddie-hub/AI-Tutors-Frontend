import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names conditionally and merges Tailwind classes.
 * Use this instead of manually writing long concatenations.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
