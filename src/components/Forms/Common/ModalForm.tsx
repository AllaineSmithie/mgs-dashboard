/*************************************************************************/
/*  ModalForm.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import SubmitButton from '@webapps-common/UI/SubmitButton'
import Form from '@webapps-common/UI/Form/Form'
import React, {
  FormEventHandler, PropsWithChildren, useState,
} from 'react'
import { toast } from 'react-toastify'
import Modal from '@webapps-common/UI/Modal'
import type { ModalProps } from '@webapps-common/UI/Modal'

export type ModalFormProps = {
  show : boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  title?: string;
  confirmButtonText? : string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  modalProps?: ModalProps;
} & PropsWithChildren

export function ModalForm({
  show,
  onSubmit,
  title,
  confirmButtonText,
  isSubmitting,
  onCancel,
  children,
  modalProps,
} : ModalFormProps) {
  return (
    <Modal show={show} onHide={onCancel} {...modalProps}>
      <Form
        onSubmit={onSubmit}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <SubmitButton variant="primary" isSubmitting={isSubmitting}>
            {confirmButtonText}
          </SubmitButton>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export type ConfirmationFormProps = {
  execute: () => Promise<{ message: string } | null | undefined | void>;
  failureMessage?: string;
  successMessage?: string;
  onFailure?: () => void;
  onSuccess?: () => void;
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
  children = 'Are you sure ?',
  modalProps,
}: ConfirmationFormProps) {
  const [submitting, setSubmitting] = useState<boolean>(false)
  return (
    <ModalForm
      show={show}
      title={title}
      confirmButtonText={confirmButtonText}
      onCancel={onCancel}
      onSubmit={async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        const error = await execute()
        setSubmitting(false)
        if (error) {
          toast.error(`${failureMessage}. Error: ${error.message}`)
          onFailure()
        } else {
          toast.success(successMessage)
          onSuccess()
        }
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
  execute: () => Promise<{ message: string } | null | undefined | void>;
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
