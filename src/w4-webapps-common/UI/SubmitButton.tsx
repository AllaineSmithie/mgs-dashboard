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
          <div className="tw-flex tw-gap-2 tw-items-center tw-justify-center">
            <Spinner />
            {submittingText}
          </div>
        ) : (
          <>
            <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
              <Spinner />
            </div>
            <div className="tw-invisible">{children}</div>
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      type="submit"
      {...props}
    >
      {children}
    </Button>
  )
}
