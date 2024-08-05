/*************************************************************************/
/*  BucketCreate.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import Form from '@webapps-common/UI/Form/Form'
import type { ModalProps } from '@webapps-common/UI/Modal'
import { ModalForm } from '../Common/ModalForm'

type BucketCreateProps = {
  show: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  modalProps?: ModalProps;
}
export default function BucketCreate({
  show,
  onCancel,
  onSuccess = onCancel,
  modalProps,
}: BucketCreateProps) {
  const supabase = useSupabaseClient()

  // Set the form validation schema.
  const shape = {
    name: yup.string().required('Required'),
    public: yup.bool().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      public: false,
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const res = await supabase.storage.createBucket(preparedValues.name, {
      public: preparedValues.public,
    })
    if (res.error) {
      toast.error(`Could not create bucket: ${res.error.message}`)
      return
    }
    toast.success(`Bucket ${preparedValues.name} successfully created.`)

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
      {
        ({
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
            title="Create a new bucket"
            confirmButtonText="Create"
            isSubmitting={isSubmitting}
            modalProps={({ backdrop: 'static', ...modalProps })}
          >
            <Form.Group className="tw-mb-3" controlId="name">
              <Form.Label>Bucket name</Form.Label>
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
            <Form.Group className="tw-mb-3" controlId="public">
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
        )
      }
    </Formik>
  )
}
