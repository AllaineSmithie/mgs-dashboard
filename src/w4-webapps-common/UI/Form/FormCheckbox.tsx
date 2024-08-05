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
    <div className={cn('tw-flex tw-gap-2 tw-items-center tw-py-1', className)}>
      <input
        type="checkbox"
        name={name}
        id={id || controlId}
        value={value}
        checked={checked}
        className={cn(
          'tw-h-5 tw-w-5 tw-rounded-md tw-bg-control tw-text-brand-600 focus:tw-ring-0 focus:tw-ring-transparent focus:tw-ring-offset-transparent',
          { 'tw-bg-brand-600': checked },
          { 'tw-ring-2 tw-ring-danger-500 tw-border-danger-500': isInvalid },
          { 'tw-cursor-not-allowed tw-opacity-50': disabled },
        )}
        disabled={disabled}
        {...props}
      />
      {label && (
        <label
          htmlFor={id || name}
          className={cn('tw-text-scale-800 dark:tw-text-scale-400', { 'tw-text-danger-500 dark:tw-text-danger-400 ': isInvalid })}
        >
          {label}
        </label>
      )}
    </div>
  )
}
