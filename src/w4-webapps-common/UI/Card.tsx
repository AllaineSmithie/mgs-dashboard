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
    <div className={cn('tw-border tw-bg-surface-100 tw-border-border tw-rounded-md tw-overflow-hidden', className)}>
      { children }
    </div>
  )
}

type HeaderProps = {
  className?: string;
} & PropsWithChildren

function Header({ children, className }: HeaderProps) {
  return (
    <div className={cn('tw-px-4 tw-py-2 tw-border-b tw-bg-surface-200/50 tw-border-border tw-font-medium', className)}>
      { children }
    </div>
  )
}

type TitleProps = {
  className?: string;
} & PropsWithChildren

function Title({ children, className }: TitleProps) {
  return (
    <h1 className={cn('tw-text-2xl tw-font-medium', className)}>
      { children }
    </h1>
  )
}

type BodyProps = {
  className?: string;
} & PropsWithChildren

function Body({ children, className }: BodyProps) {
  return (
    <div className={cn('tw-p-4', className)}>
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
