import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rgbToHex(rgb: string) {
    // Extract the numbers from the RGB string
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length !== 3) {
        throw new Error('Invalid RGB format');
    }

    // Convert each value to a hex string and pad with zero if necessary
    const hexValues = rgbValues.map(value => {
        const hex = parseInt(value).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    });

    // Join the hex values and return the full hex color string
    return `#${hexValues.join('')}`;
}
