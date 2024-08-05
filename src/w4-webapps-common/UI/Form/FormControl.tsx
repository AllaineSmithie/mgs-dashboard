/*************************************************************************/
/*  FormControl.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { InputHTMLAttributes, TextareaHTMLAttributes, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'

// Extract the common code between FormInput and FormTextarea into a hook to avoid duplication
type UseFormControl = {
  isInvalid?: boolean;
  isValid?: boolean;
  disabled?: boolean;
}
function useFormControl({ isInvalid, isValid, disabled }:UseFormControl) {
  const { setIsInvalid } = useFormGroup()

  useEffect(() => {
    if (isInvalid !== undefined) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  const baseClassNames = 'tw-block tw-h-full tw-w-full tw-rounded-md tw-border tw-py-2 tw-px-3 tw-text-foreground-secondary tw-shadow-sm tw-ring-inset tw-border-border placeholder:tw-text-foreground-muted focus:tw-ring-2 focus:tw-ring-inset focus:tw-border-brand-600 focus:tw-ring-brand-600 tw-bg-control'

  let classNames = baseClassNames
  if (isInvalid) {
    classNames = cn(classNames, 'tw-ring-danger-500 dark:tw-ring-danger-400 focus:tw-ring focus:tw-border-danger-500 dark:focus:tw-border-danger-400 focus:tw-ring-danger-500/20 focus:dark:tw-ring-danger-500/40 focus:tw-ring-offset-1 focus:tw-ring-offset-danger-400')
  }
  if (isValid) {
    classNames = cn(classNames, 'tw-ring-success-500 dark:tw-ring-success-600 focus:tw-ring focus:tw-border-success-500 dark:focus:tw-border-success-400 focus:tw-ring-success-500/20 focus:dark:tw-ring-success-500/40 focus:tw-ring-offset-1 focus:tw-ring-offset-success-400')
  }
  if (disabled) {
    classNames = cn(classNames, 'tw-bg-scale-100 tw-text-foreground-muted tw-cursor-not-allowed dark:tw-bg-scale-700')
  }

  return { classNames }
}

type ControlProps = {
  isInvalid?: boolean;
  isValid?: boolean;
}

export type InputProps = {
  type?: 'text' | 'password' | 'email' | 'number';
} & ControlProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function FormInput({
  id, type, className, disabled, isInvalid, isValid, ...props
}: InputProps) {
  const { controlId } = useFormGroup()
  const { classNames } = useFormControl({ isInvalid, isValid, disabled })
  return (
    <div className="tw-relative tw-w-full">
      <input
        id={id || controlId}
        type={type}
        className={cn(classNames, className)}
        disabled={disabled}
        {...props}
      />
      {isInvalid && type !== 'number' && (
        <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-2 tw-flex tw-items-center">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="tw-text-danger-500"
          />
        </div>
      )}
      {isValid && type !== 'number' && (
        <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-2 tw-flex tw-items-center">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="tw-text-success-500"
          />
        </div>
      )}
    </div>
  )
}

export type TextareaProps = ControlProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function FormTextarea({
  id, className, isInvalid, disabled, ...props
}: TextareaProps) {
  const { controlId } = useFormGroup()
  const { classNames } = useFormControl({ isInvalid, disabled })
  return (
    <div className="tw-relative tw-w-full">
      <textarea
        id={id || controlId}
        className={cn(classNames, className, disabled && 'tw-resize-none')}
        disabled={disabled}
        {...props}
      />
    </div>
  )
}
