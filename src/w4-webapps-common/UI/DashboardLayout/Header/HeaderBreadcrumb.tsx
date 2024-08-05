/*************************************************************************/
/*  HeaderBreadcrumb.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { addBasePath } from 'next/dist/client/add-base-path'
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
          <span key={`${element.href}-${element.text}`} className="tw-text-foreground-secondary">
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
  const liClassName = 'tw-inline tw-text-foreground-secondary'

  if (active || !href) {
    return <li className={liClassName}><span>{children}</span></li>
  }

  return <li className={liClassName}><Link className="tw-no-underline tw-text-foreground-secondary" href={addBasePath(href)}>{children}</Link></li>
}
