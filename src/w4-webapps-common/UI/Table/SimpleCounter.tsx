/*************************************************************************/
/*  SimpleCounter.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

export type SimpleCounterCounter = {
  total: number;
}
export default function SimpleCounter({ total }: SimpleCounterCounter) {
  return (
    <span>
      Showing
      {' '}
      <span className="tw-font-semibold tw-text-foreground-emphasized">{total}</span>
      {' '}
      results
    </span>
  )
}
