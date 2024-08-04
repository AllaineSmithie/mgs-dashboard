/*************************************************************************/
/*  SelectedCounter.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { HTMLAttributes, ReactNode } from 'react'
import cn from '@webapps-common/utils/classNamesMerge'
import Button from '../Button'

export type SelectedCounterProps = {
  total: number;
  what?: [string, string];
  deselect?: () => void;
  contextualActions?: ReactNode;
} & HTMLAttributes<HTMLDivElement>
export default function SelectedCounter({
  total,
  what,
  deselect,
  className,
  contextualActions,
  ...props
}: SelectedCounterProps) {
  let singularAndPlural = what
  if (!singularAndPlural) {
    singularAndPlural = ['item', 'items']
  }
  const item = total > 1 ? singularAndPlural[1] : singularAndPlural[0]
  if (total <= 0) {
    return null
  }
  return (
    <div className="flex items-center gap-3">
      <div {...props} className={cn(className, 'flex gap-3 justify-center items-center')}>
        {deselect
          && (
          <Button
            variant="outline-secondary"
            className="p-1 w-6 h-6"
            onClick={() => {
              deselect()
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </Button>
          )}
        <span>
          <span className="font-semibold text-foreground-emphasized">{total}</span>
          {` ${item} selected`}
        </span>
      </div>
      <div className="border-e-2 self-stretch border-scale-700" />
      {contextualActions}
    </div>
  )
}
