/*************************************************************************/
/*  classNamesMerge.ts                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export default function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
