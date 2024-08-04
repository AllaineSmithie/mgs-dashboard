/*************************************************************************/
/*  GlueRoundedGroup.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, { Children, cloneElement, isValidElement } from 'react'
import type { ReactElement } from 'react'
import cn from '../utils/classNamesMerge'

type GlueRoundedGroupProps = {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>

export default function GlueRoundedGroup({ children, className, ...props }: GlueRoundedGroupProps) {
  const childrenArray = Children.toArray(children)
  const childrenWithProps = childrenArray.map((child, index) => {
    if (!isValidElement(child)) return child
    if (childrenArray.length === 1) return child
    const isFirst = index === 0
    const isLast = index === childrenArray.length - 1
    const isMiddle = !isFirst && !isLast
    const modifiedClassNames = cn(
      child.props.className,
      isFirst && 'rounded-r-none border-r-0',
      isLast && 'rounded-l-none border-l-0',
      isMiddle && 'rounded-none',
    )
    return cloneElement(child as ReactElement, { className: modifiedClassNames })
  })

  return (
    <div className={cn('flex', className)} {...props}>
      {childrenWithProps}
    </div>
  )
}
