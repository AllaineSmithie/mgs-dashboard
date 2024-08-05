/*************************************************************************/
/*  FolderCreate.tsx                                                     */
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
import { isStorageError } from '@supabase/storage-js'
import type { ModalProps } from '@webapps-common/UI/Modal'
import { ModalForm } from '../Common/ModalForm'

export type FolderCreated = {
  bucket: string;
  path: string;
  name: string;
}
type FolderCreateProps = {
  created?: FolderCreated;
  createBucketIfNotExisting?: boolean;
  show: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  modalProps?: ModalProps;
}
export default function FolderCreate({
  show,
  created,
  createBucketIfNotExisting = false,
  onCancel,
  onSuccess = onCancel,
  modalProps,
}: FolderCreateProps) {
  const supabase = useSupabaseClient()

  if (!created) {
    return null
  }

  // Set the form validation schema.
  const shape = {
    name: yup.string().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    created,
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const placeholderName = '.emptyFolderPlaceholder'

    if (createBucketIfNotExisting) {
      // Check if the bucklet exists before uploading to it. If it does not, try to create it.
      const resGetBucket = await supabase.storage.getBucket(created.bucket)
      if (resGetBucket.error && isStorageError(resGetBucket.error)) {
        const resCreate = await supabase.storage.createBucket(created.bucket)
        if (resCreate.error) {
          toast.error(`Could not create folder. Error during bucket creation: ${resCreate.error.message}`)
          return
        }
      }
    }

    const res = await supabase.storage
      .from(created.bucket)
      .upload(
        pathLib.join(created.path || '', preparedValues.name, placeholderName),
        '',
      )
    if (res.error) {
      toast.error(`Could not create folder: ${res.error.message}`)
      return
    }
    toast.success(`Folder ${preparedValues.name} successfully created.`)
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
          title="Create a new folde"
          confirmButtonText="Create"
          isSubmitting={isSubmitting}
          modalProps={({ backdrop: 'static', ...modalProps })}
        >
          <Form.Group className="tw-mb-3" controlId="name">
            <Form.Label>Folder name</Form.Label>
            <Form.Input
              name="name"
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
