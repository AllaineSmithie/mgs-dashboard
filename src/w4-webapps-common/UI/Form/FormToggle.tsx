/*************************************************************************/
/*  FormToggle.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'

type ToggleProps = {
  label?: ReactNode;
  isInvalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>

export default function FormToggle({
  label,
  name,
  className,
  checked,
  isInvalid,
  onChange,
  value,
  id,
  disabled,
  ...props
}: ToggleProps) {
  const { setIsInvalid, controlId } = useFormGroup()

  useEffect(() => {
    if (isInvalid !== undefined) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  return (
    <div className={cn('flex items-center gap-2 py-1', className)}>
      <div className={cn('relative inline-block w-12 h-6 align-middle')}>
        <input
          type="checkbox"
          name={name}
          id={id || controlId}
          value={value}
          checked={checked}
          onChange={onChange}
          className="opacity-0 absolute h-6 w-12 cursor-pointer z-10"
          disabled={disabled}
          {...props}
        />
        {/* Background slider */}
        <span
          className={cn(
            'block w-12 h-6 rounded-full border dark:border-border',
            checked ? 'bg-brand-600 dark:border-brand-600' : 'bg-scale-100 dark:bg-scale-800 ',
            { ' border-danger-500 dark:border-danger-500': isInvalid },
            { 'cursor-not-allowed': disabled },
          )}
        />
        <span
          className={cn(
            'absolute left-1 top-1 bg-scale-400 dark:bg-scale-400 rounded-full h-4 w-4 transition',
            checked ? 'transform translate-x-6 bg-scale-200' : '',
            { 'cursor-not-allowed': disabled },
          )}
        />
      </div>
      {label && (
        <label
          htmlFor={id || name}
          className={cn('text-scale-800 dark:text-scale-400', { 'text-danger-500 dark:text-danger-400': isInvalid })}
        >
          {label}
        </label>
      )}
    </div>
  )
}
