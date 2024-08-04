/*************************************************************************/
/*  FormCheckbox.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'

type CheckboxProps = {
  label?: ReactNode;
  isInvalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>

export default function FormCheckbox({
  label,
  isInvalid,
  className,
  checked,
  value,
  disabled,
  id,
  name,
  ...props
}: CheckboxProps) {
  const { setIsInvalid, controlId } = useFormGroup()

  useEffect(() => {
    if (isInvalid !== undefined) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  return (
    <div className={cn('flex gap-2 items-center py-1', className)}>
      <input
        type="checkbox"
        name={name}
        id={id || controlId}
        value={value}
        checked={checked}
        className={cn(
          'h-5 w-5 rounded-md bg-control text-brand-600 focus:ring-0 focus:ring-transparent focus:ring-offset-transparent',
          { 'bg-brand-600': checked },
          { 'ring-2 ring-danger-500 border-danger-500': isInvalid },
          { 'cursor-not-allowed opacity-50': disabled },
        )}
        disabled={disabled}
        {...props}
      />
      {label && (
        <label
          htmlFor={id || name}
          className={cn('text-scale-800 dark:text-scale-400', { 'text-danger-500 dark:text-danger-400 ': isInvalid })}
        >
          {label}
        </label>
      )}
    </div>
  )
}
