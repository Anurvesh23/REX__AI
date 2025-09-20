// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to merge Tailwind CSS classes.
 * It intelligently handles conflicting classes.
 * @param inputs - A list of class names or conditional class objects.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts text content from a File object in the browser.
 * This works reliably for plain text files (.txt).
 * For .pdf or .docx, server-side extraction is required for full accuracy.
 * @param file The file object from an input element.
 * @returns A Promise that resolves with the text content of the file.
 */
export const extractTextFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error("Failed to read file as text."));
      }
    };

    reader.onerror = (error) => {
      reject(new Error(`Error reading file: ${error.toString()}`));
    };

    reader.readAsText(file);
  });
};