import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
// https://www.npmjs.com/package/tailwind-merge/v/0.8.1#extendtailwindmerge
const twMerge = extendTailwindMerge({
  prefix: 'tw-',
})

export default function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
