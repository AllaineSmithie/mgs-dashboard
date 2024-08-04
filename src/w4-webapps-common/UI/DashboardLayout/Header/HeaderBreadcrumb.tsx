/*************************************************************************/
/*  HeaderBreadcrumb.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Link from 'next/link'
import { PropsWithChildren } from 'react'

export type BreadcrumbHeaderProps = {
  breadcrumb? : {
    href? : string;
    text: string;
  }[];
  breadcrumbCurrentText: string;
}
export function BreadcrumbHeader({
  breadcrumb,
  breadcrumbCurrentText,
}: BreadcrumbHeaderProps) {
  return (
    <ol>
      {
        breadcrumb && breadcrumb.map((element) => (
          <span key={`${element.href}-${element.text}`} className="text-foreground-secondary">
            <BreadcrumbItem
              href={element.href}
            >
              {element.text}
            </BreadcrumbItem>
            {' / '}
          </span>
        ))
      }
      <BreadcrumbItem active>
        {breadcrumbCurrentText}
      </BreadcrumbItem>
    </ol>
  )
}

type BreadcrumbItemProps = {
  active?: boolean;
  href? : string;
} & PropsWithChildren
function BreadcrumbItem({
  active,
  href,
  children,
} : BreadcrumbItemProps) {
  const liClassName = 'inline text-foreground-secondary'

  if (active || !href) {
    return <li className={liClassName}><span>{children}</span></li>
  }

  return <li className={liClassName}><Link className="no-underline text-foreground-secondary" href={href}>{children}</Link></li>
}
