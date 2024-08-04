/*************************************************************************/
/*  IdField.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import cn from '../utils/classNamesMerge'

type IdFieldProps = {
  idValue: string;
  className?: string;
}

type EventType = React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>

export default function IdField({ idValue, className }: IdFieldProps) {
  function copyIdValue(e: EventType) {
    if (!idValue) return
    e.stopPropagation()
    navigator.clipboard.writeText(idValue)
    toast.info('Copied the ID to the clipboard!')
  }
  let truncatedId = idValue.split('-')[0]
  if (truncatedId.length > 8) {
    truncatedId = truncatedId.slice(0, 8)
  }
  return (
    <div className={cn('inline-flex cursor-pointer font-mono text-sm', className)}>
      <div
        className="inline-flex rounded bg-surface-200/40 justify-between overflow-hidden group hover:bg-surface-200/75"
        onClick={copyIdValue}
        // For accessibility
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            copyIdValue(e)
          }
        }}
      >
        <div className="px-2 py-1">
          {truncatedId}
        </div>
        <div className="flex items-center justify-center px-2 bg-surface-200/40 group-hover:bg-surface-200">
          <FontAwesomeIcon icon={faCopy} />
        </div>
      </div>
    </div>
  )
}
