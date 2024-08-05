/*************************************************************************/
/*  PaginationCounter.tsx                                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

export type PaginationCounterProps = {
  from: number;
  to: number;
  total: number;
}
export default function PaginationCounter({
  from,
  to,
  total,
}: PaginationCounterProps) {
  return (
    <span>
      Showing
      {' '}
      <span className="tw-font-semibold tw-text-foreground-emphasized">{from}</span>
      {' '}
      to
      {' '}
      <span className="tw-font-semibold tw-text-foreground-emphasized">{to}</span>
      {' '}
      of
      {' '}
      <span className="tw-font-semibold tw-text-foreground-emphasized">{total}</span>
      {' '}
      results
    </span>
  )
}
