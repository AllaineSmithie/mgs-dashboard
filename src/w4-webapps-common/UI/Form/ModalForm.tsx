/*************************************************************************/
/*  ModalForm.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, {
  FormHTMLAttributes, PropsWithChildren, ReactNode, useState,
} from 'react'
import { toast } from 'react-toastify'
import Button from '../Button'
import SubmitButton from '../SubmitButton'
import Form from './Form'
import Modal from '../Modal'
import type { ModalProps } from '../Modal'

type Error = { message: string }

export type ModalFormProps = {
  show : boolean;
  title?: string;
  confirmButtonText? : string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  modalProps?: ModalProps;
  additionalButtons?: ReactNode;
} & PropsWithChildren & FormHTMLAttributes<HTMLFormElement>

export function ModalForm({
  show,
  title,
  confirmButtonText,
  isSubmitting,
  onCancel,
  children,
  modalProps,
  additionalButtons,
  ...props
} : ModalFormProps) {
  return (
    <Modal show={show} onHide={onCancel} {...modalProps}>
      <Form
        {...props}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          {additionalButtons}
          <SubmitButton variant="primary" isSubmitting={isSubmitting}>
            {confirmButtonText}
          </SubmitButton>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export type ConfirmationFormProps = {
  execute: () => Promise<Error | Error[] | null | undefined | void>;
  failureMessage?: string;
  successMessage?: string | null;
  onFailure?: () => void;
  onSuccess?: () => void;
  onDone?: () => void;
} & Omit<ModalFormProps, 'onSubmit' | 'isSubmitting'>
export function ConfirmationForm({
  show,
  execute,
  title = 'Confirm',
  confirmButtonText = 'Save',
  onCancel = () => {},
  failureMessage = 'Error: could not execute action',
  successMessage = 'Success!',
  onFailure = () => {},
  onSuccess = () => {},
  onDone = () => {},
  children = 'Are you sure ?',
  modalProps,
}: ConfirmationFormProps) {
  const [submitting, setSubmitting] = useState<boolean>(false)
  return (
    <ModalForm
      show={show}
      title={title}
      confirmButtonText={confirmButtonText}
      onCancel={() => {
        onCancel()
        onDone()
      }}
      onSubmit={async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        const error = await execute()
        setSubmitting(false)
        const errors = (Array.isArray(error) ? error : [error]).filter((x) => (typeof x === 'object' && !Array.isArray(x) && x !== null)) as Error[]
        if (errors.length > 0) {
          errors.forEach((e) => {
            toast.error(`${failureMessage}. Error: ${e.message}`)
          })
          onFailure()
        } else {
          if (successMessage) {
            toast.success(successMessage)
          }
          onSuccess()
        }
        onDone()
      }}
      isSubmitting={submitting}
      modalProps={modalProps}
    >
      {children}
    </ModalForm>
  )
}

export type DeleteConfirmationFormProps = {
  show: boolean;
  execute: () => Promise<Error | Error[] | null | undefined | void>;
} & Partial<ConfirmationFormProps>
export function DeleteConfirmationForm({
  execute,
  title = 'Delete',
  successMessage = 'Successfully deleted',
  failureMessage = 'Could not delete',
  confirmButtonText = 'Delete',
  ...props
}: ConfirmationFormProps) {
  return (
    <ConfirmationForm
      execute={execute}
      title={title}
      successMessage={successMessage}
      failureMessage={failureMessage}
      confirmButtonText={confirmButtonText}
      {...props}
    />
  )
}
