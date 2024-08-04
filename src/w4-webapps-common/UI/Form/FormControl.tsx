/*************************************************************************/
/*  FormControl.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, {
  InputHTMLAttributes, TextareaHTMLAttributes, useEffect, forwardRef,
} from 'react'
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

  const baseClassNames = 'block h-full w-full rounded-md border py-2 px-3 text-foreground-secondary shadow-sm ring-inset border-border placeholder:text-foreground-muted focus:ring-2 focus:ring-inset focus:border-brand-600 focus:ring-brand-600 bg-control'

  let classNames = baseClassNames
  if (isInvalid) {
    classNames = cn(classNames, 'ring-danger-500 dark:ring-danger-400 focus:ring focus:border-danger-500 dark:focus:border-danger-400 focus:ring-danger-500/20 focus:dark:ring-danger-500/40 focus:ring-offset-1 focus:ring-offset-danger-400')
  }
  if (isValid) {
    classNames = cn(classNames, 'ring-success-500 dark:ring-success-600 focus:ring focus:border-success-500 dark:focus:border-success-400 focus:ring-success-500/20 focus:dark:ring-success-500/40 focus:ring-offset-1 focus:ring-offset-success-400')
  }
  if (disabled) {
    classNames = cn(classNames, 'bg-scale-100 text-foreground-muted cursor-not-allowed dark:bg-scale-700')
  }

  return { classNames }
}

type ControlProps = {
  isInvalid?: boolean;
  isValid?: boolean;
}

export type InputProps = {
  onEnter?: () => void;
  type?: 'text' | 'password' | 'email' | 'number';
} & ControlProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

// eslint-disable-next-line react/display-name
const FormInput = forwardRef<HTMLInputElement, InputProps>(({
  id, type, className, disabled, isInvalid, isValid, onEnter, ...props
}, ref) => {
  const { controlId } = useFormGroup()
  const { classNames } = useFormControl({ isInvalid, isValid, disabled })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter()
    }
  }

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id || controlId}
        type={type}
        className={cn(classNames, className)}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {isInvalid && type !== 'number' && (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-danger-500"
          />
        </div>
      )}
      {isValid && type !== 'number' && (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-success-500"
          />
        </div>
      )}
    </div>
  )
})

export { FormInput }

export type TextareaProps = ControlProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function FormTextarea({
  id, className, isInvalid, disabled, ...props
}: TextareaProps) {
  const { controlId } = useFormGroup()
  const { classNames } = useFormControl({ isInvalid, disabled })
  return (
    <div className="relative w-full">
      <textarea
        id={id || controlId}
        className={cn(classNames, className, disabled && 'resize-none')}
        disabled={disabled}
        {...props}
      />
    </div>
  )
}
