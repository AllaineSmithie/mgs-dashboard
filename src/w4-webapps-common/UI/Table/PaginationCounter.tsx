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
    total <= 0 ? (
      <span>No results</span>
    ) : (
      <span>
        Showing
        {' '}
        <span className="font-semibold text-foreground-emphasized">{from}</span>
        {' '}
        to
        {' '}
        <span className="font-semibold text-foreground-emphasized">{to}</span>
        {' '}
        of
        {' '}
        <span className="font-semibold text-foreground-emphasized">{total}</span>
        {' '}
        results
      </span>
    )
  )
}
