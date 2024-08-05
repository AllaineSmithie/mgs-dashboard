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
    <div className={cn('tw-flex tw-items-center tw-gap-2 tw-py-1', className)}>
      <div className={cn('tw-relative tw-inline-block tw-w-12 tw-h-6 tw-align-middle')}>
        <input
          type="checkbox"
          name={name}
          id={id || controlId}
          value={value}
          checked={checked}
          onChange={onChange}
          className="tw-opacity-0 tw-absolute tw-h-6 tw-w-12 tw-cursor-pointer tw-z-10"
          disabled={disabled}
          {...props}
        />
        {/* Background slider */}
        <span
          className={cn(
            'tw-block tw-w-12 tw-h-6 tw-rounded-full tw-border dark:tw-border-border',
            checked ? 'tw-bg-brand-600 dark:tw-border-brand-600' : 'tw-bg-scale-100 dark:tw-bg-scale-800 ',
            { ' tw-border-danger-500 dark:tw-border-danger-500': isInvalid },
            { 'tw-cursor-not-allowed': disabled },
          )}
        />
        <span
          className={cn(
            'tw-absolute tw-left-1 tw-top-1 tw-bg-scale-400 dark:tw-bg-scale-400 tw-rounded-full tw-h-4 tw-w-4 tw-transition',
            checked ? 'tw-transform tw-translate-x-6 tw-bg-scale-200' : '',
            { 'tw-cursor-not-allowed': disabled },
          )}
        />
      </div>
      {label && (
        <label
          htmlFor={id || name}
          className={cn('tw-text-scale-800 dark:tw-text-scale-400', { 'tw-text-danger-500 dark:tw-text-danger-400': isInvalid })}
        >
          {label}
        </label>
      )}
    </div>
  )
}
