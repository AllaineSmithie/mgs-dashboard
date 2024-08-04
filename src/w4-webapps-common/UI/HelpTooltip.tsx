/*************************************************************************/
/*  HelpTooltip.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cn from '@webapps-common/utils/classNamesMerge'
import { PropsWithChildren, useEffect, useState } from 'react'
import { Tooltip } from 'react-tooltip'

type TooltipProps = React.ComponentProps<typeof Tooltip>

type HelpTooltipProps = {
  tooltipContent: string;
  className?: string;
} & PropsWithChildren & TooltipProps

export default function HelpTooltip({
  tooltipContent, className, place = 'right', ...props
}: HelpTooltipProps) {
  const [uniqueTooltipId, setUniqueTooltipId] = useState('')
  useEffect(() => {
    setUniqueTooltipId(`tooltip-${crypto.randomUUID()}`)
  }, [])
  if (!tooltipContent || !uniqueTooltipId) return null
  return (
    <span>
      <FontAwesomeIcon
        icon={faQuestionCircle}
        className="ml-1 text-foreground-muted cursor-pointer"
        data-tooltip-id={uniqueTooltipId}
        data-tooltip-html={tooltipContent}
      />
      <Tooltip
        id={uniqueTooltipId}
        place={place}
        clickable
        className={cn('!bg-overlay !rounded-md !z-10 !max-w-[300px]', className)}
        {...props}
      />
    </span>
  )
}
