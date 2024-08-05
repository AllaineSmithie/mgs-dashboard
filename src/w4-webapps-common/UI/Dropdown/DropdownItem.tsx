/*************************************************************************/
/*  DropdownItem.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable import/no-cycle */
import cn from '../../utils/classNamesMerge'
import { useDropdownContext } from './Dropdown'

type ItemProps = {
  className?: string;
  active?: boolean;
  as?: React.ElementType;
  disabled?: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.KeyboardEvent<HTMLDivElement>
  ) => void;
  href?: string;
  eventKey?: string;
  closeOnClick?: boolean;
} & React.PropsWithChildren

export default function DropdownItem({
  children, onClick, href, eventKey, className, active, as: Component = 'div', disabled, closeOnClick = true, ...props
}:ItemProps) {
  const { onSelect, close } = useDropdownContext()
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (disabled) return
    if (onSelect) onSelect(eventKey)
    onClick?.(e)
    // Most of the time, when you click on a dropdown item, you want to close the dropdown
    // But in the Logs dropdown, we have an input field.
    // So we don't close  dropdown when it's selected
    if (closeOnClick) close(e)
  }
  const ElementType = href ? 'a' : Component
  return (
    <ElementType
      className={cn(
        'tw-cursor-pointer tw-block tw-no-underline tw-w-full tw-py-2 tw-px-4 hover:tw-bg-surface-200 tw-border-l-2 tw-border-transparent tw-align-baseline',
        className,
        active && ' dark:tw-bg-brand-600/50 dark:hover:tw-bg-brand-600/50 tw-border-l-2 tw-border-brand-600 dark:tw-border-brand-400',
        disabled && 'tw-cursor-not-allowed tw-opacity-50 hover:tw-bg-transparent dark:hover:tw-bg-transparent',
        href && 'tw-text-scale-800 dark:tw-text-scale-300',
      )}
      onClick={handleClick}
      // For accessibility
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') handleClick(e)
      }}
      href={href}
      {...props}
    >
      {children}
    </ElementType>
  )
}
