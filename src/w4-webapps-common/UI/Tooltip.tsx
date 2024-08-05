/*************************************************************************/
/*  Tooltip.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  useState, useRef, useEffect,
} from 'react'
import type { PropsWithChildren } from 'react'
import cn from '../utils/classNamesMerge'
import Portal from './Portal'

type TooltipProps = {
  disabled?: boolean;
  content: string;
  align?: 'right';
} & PropsWithChildren

export default function Tooltip({
  disabled = false,
  align,
  content,
  children,
}:TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const childRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (childRef.current && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const childRect = childRef.current.getBoundingClientRect()
      let position = {
        top: childRect.bottom + 8, // 8px for a little space between element and tooltip
        left: childRect.left + childRect.width / 2, // - tooltipRect.width / 2,
      }
      if (align === 'right') {
        // Align tooltip to the right edge of the parent element
        position = {
          top: childRect.bottom + 8, // 8px for a little space between element and tooltip
          left: childRect.left - childRect.width - tooltipRect.width / 2 - 4,
        }
      }
      setTooltipPosition(position)
    }
  }, [isVisible, align])

  return (
    <div className="tw-relative tw-inline-block" ref={tooltipRef}>
      <div
        className="tw-cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        ref={childRef}
      >
        {children}
      </div>
      {!disabled && isVisible && (
        <Portal>
          <div
            className="tw-absolute tw-z-10 tw-p-2 tw-bg-overlay tw-text-foreground-secondary tw-rounded tw-shadow tw-text-center tw-w-40"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {content}
            {/* Tooltip arrow */}
            <span
              className={cn(
                'tw-absolute tw-bottom-full tw-border-transparent tw-border-b-overlay dark:tw-border-b-overlay tw-border-r-solid tw-border-[6px] tw-left-1/2 tw-transform tw--translate-x-1/2',
                align === 'right' && 'tw-left-auto tw-right-0 tw--translate-x-1/2',
              )}
            />
          </div>
        </Portal>
      )}
    </div>
  )
}
