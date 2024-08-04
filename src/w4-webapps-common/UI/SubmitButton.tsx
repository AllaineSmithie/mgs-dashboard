/*************************************************************************/
/*  SubmitButton.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Spinner from './Spinner'
import Button, { ButtonProps } from './Button'

type SubmitButtonProps = {
  isSubmitting?: boolean;
  submittingText? : string;
} & Omit<ButtonProps, 'type'>

export default function SubmitButton({
  isSubmitting,
  submittingText = '',
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  if (isSubmitting) {
    return (
      <Button
        type="submit"
        disabled
        {...props}
      >
        {submittingText ? (
          <div className="flex gap-2 items-center justify-center">
            <Spinner />
            {submittingText}
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
            <div className="invisible">{children}</div>
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      type="submit"
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  )
}
