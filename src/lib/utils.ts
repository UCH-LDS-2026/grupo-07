import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Esta función es el "corazón" de shadcn para manejar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}