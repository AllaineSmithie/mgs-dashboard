/*************************************************************************/
/*  Card.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import cn from '../utils/classNamesMerge'

type CardProps = {
  className?: string;
} & PropsWithChildren

function CardMain({ children, className }: CardProps) {
  return (
    <div className={cn('border bg-surface-100 border-border rounded-md overflow-hidden', className)}>
      { children }
    </div>
  )
}

type HeaderProps = {
  className?: string;
} & PropsWithChildren

function Header({ children, className }: HeaderProps) {
  return (
    <div className={cn('px-4 py-2 border-b bg-surface-200/50 border-border font-medium', className)}>
      { children }
    </div>
  )
}

type TitleProps = {
  className?: string;
} & PropsWithChildren

function Title({ children, className }: TitleProps) {
  return (
    <h1 className={cn('text-2xl font-medium', className)}>
      { children }
    </h1>
  )
}

type BodyProps = {
  className?: string;
} & PropsWithChildren

function Body({ children, className }: BodyProps) {
  return (
    <div className={cn('p-4', className)}>
      { children }
    </div>
  )
}

const Card = Object.assign(CardMain, {
  Header,
  Title,
  Body,
})
export default Card
