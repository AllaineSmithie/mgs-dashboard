/*************************************************************************/
/*  FileUpdate.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import * as pathLib from 'path'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import type { ModalProps } from '@webapps-common/UI/Modal'
import { ModalForm } from '../Common/ModalForm'

export type FileUpdated = {
  bucket: string;
  path: string;
  name: string;
}
type FileUpdateProps = {
  updated?: FileUpdated;
  show: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  modalProps?: ModalProps;
}
export default function FileUpdate({
  show,
  updated,
  onCancel,
  onSuccess = onCancel,
  modalProps,
}: FileUpdateProps) {
  const supabase = useSupabaseClient()

  if (!updated) {
    return null
  }

  // Set the form validation schema.
  const shape = {
    name: yup.string().required('Required').default(''),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    updated,
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const res = await supabase.storage
      .from(updated.bucket)
      .move(
        pathLib.join(updated.path, updated.name),
        pathLib.join(updated.path, preparedValues.name),
      )
    if (res.error) {
      toast.error(`Could not upload file: ${res.error.message}`)
      return
    }
    toast.success('File successfully uploaded')
    onSuccess()
    resetForm()
  }

  return (
    <Formik
      key={JSON.stringify(initialValues)} // Hack to force a rerender :/
      enableReinitialize
      validationSchema={schema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        values,
        touched,
        isSubmitting,
        errors,
      }) => (
        <ModalForm
          show={show}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          title={`Rename file: ${initialValues.name}`}
          confirmButtonText="Save"
          isSubmitting={isSubmitting}
          modalProps={({ backdrop: 'static', ...modalProps })}
        >
          <Form.Group className="tw-mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.FileInput
              name="file"
              value={values.name}
              onChange={handleChange}
              isInvalid={touched.name && !!errors.name}
            />
            <Form.Feedback type="invalid">
              {errors.name}
            </Form.Feedback>
          </Form.Group>
        </ModalForm>
      )}
    </Formik>
  )
}
