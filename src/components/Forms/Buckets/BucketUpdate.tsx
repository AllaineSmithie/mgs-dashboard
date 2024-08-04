/*************************************************************************/
/*  BucketUpdate.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import type { ModalProps } from '@webapps-common/UI/Modal'
import { ModalForm } from '@webapps-common/UI/Form/ModalForm'

export type BucketUpdated = {
  name: string;
  public: boolean;
}
type BucketUpdateProps = {
  updated?: BucketUpdated;
  show: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  modalProps?: ModalProps;
}
export default function BucketUpdate({
  show,
  updated,
  onCancel,
  onSuccess = onCancel,
  modalProps,
}: BucketUpdateProps) {
  const supabase = useSupabaseClient()

  if (!updated) {
    return null
  }

  // Set the form validation schema.
  const shape = {
    name: yup.string().required('Required'),
    public: yup.bool().required('Required'),
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
    const res = await supabase.storage.updateBucket(preparedValues.name, {
      public: preparedValues.public,
    })
    if (res.error) {
      toast.error(`Could update bucket: ${res.error.message}`)
      return
    }
    toast.success(`Bucket ${preparedValues.name} successfully updated.`)

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
          title={`Edit bucket: ${initialValues.name}`}
          confirmButtonText="Save"
          isSubmitting={isSubmitting}
          modalProps={({ backdrop: 'static', ...modalProps })}
        >
          <input
            type="hidden"
            id="name"
            name="name"
            value={initialValues.name}
          />
          <Form.Group className="mb-3" controlId="public">
            <Form.Checkbox
              label="Public"
              name="public"
              value={values.public ? 'public' : undefined}
              checked={values.public}
              onChange={handleChange}
              isInvalid={touched.public && !!errors.public}
            />
            <Form.Feedback type="invalid">
              {errors.public}
            </Form.Feedback>
          </Form.Group>
        </ModalForm>
      )}
    </Formik>
  )
}
