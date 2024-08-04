/*************************************************************************/
/*  ProgressBar.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

type ProgressBarProps = {
  now: number;
  max: number;
}

export default function ProgressBar({ now, max }: ProgressBarProps) {
  const progressPercentage = Math.min(Math.max((now / max) * 100, 0), 100)

  return (
    <div className="relative w-full h-4 bg-surface-200 rounded-md overflow-hidden">
      <div
        style={{ width: `${progressPercentage}%` }}
        className="h-full bg-success-600 transition-all duration-200"
      >
        <span className="sr-only">
          {progressPercentage}
          % Complete
        </span>
      </div>
    </div>
  )
}
