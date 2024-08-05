/*************************************************************************/
/*  Collapse.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import { useState, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import cn from '../utils/classNamesMerge'

type CollapseProps = {
  show: boolean;
  animation?: boolean;
} & PropsWithChildren

export default function Collapse({
  show,
  animation = true,
  children,
}: CollapseProps) {
  const [maxHeight, setMaxHeight] = useState('0px')
  function updateMaxHeight() {
    if (show) {
      if (!contentRef.current) return
      setMaxHeight(`${contentRef.current.scrollHeight}px`)
    } else {
      setMaxHeight('0px')
    }
  }
  const { ref: contentRef } = useResizeDetector({
    onResize: updateMaxHeight,
  })
  useEffect(() => {
    updateMaxHeight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  return (
    <div
      ref={contentRef}
      style={{ maxHeight }}
      className={cn('tw-overflow-hidden', {
        'tw-transition-[max-height] tw-duration-200 tw-ease-in-out': animation,
      })}
    >
      {children}
    </div>
  )
}
