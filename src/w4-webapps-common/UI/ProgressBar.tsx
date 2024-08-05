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
    <div className="tw-relative tw-w-full tw-h-4 tw-bg-surface-200 tw-rounded-md tw-overflow-hidden">
      <div
        style={{ width: `${progressPercentage}%` }}
        className="tw-h-full tw-bg-success-600 tw-transition-all tw-duration-200"
      >
        <span className="tw-sr-only">
          {progressPercentage}
          % Complete
        </span>
      </div>
    </div>
  )
}
