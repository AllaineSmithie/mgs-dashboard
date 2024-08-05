/*************************************************************************/
/*  BuildUpdate.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import SubmitButton from '@webapps-common/UI/SubmitButton'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import withSchema from 'src/utils/withSchema'
import JSONFormInput from '@components/JSON/JSONFormInput'
import Modal from '@webapps-common/UI/Modal'

export type BuildUpdated = {
  id: string;
  name: string;
  object_name: string;
  props: string;
}
type BuildUpdateProps = {
  show: boolean;
  updated?: BuildUpdated;
  onClose: () => void;
  onSave: () => void;
}
export default function BuildUpdate({
  show,
  updated,
  onClose,
  onSave = onClose,
}: BuildUpdateProps) {
  const supabase = useSupabaseClient()

  if (!updated) {
    return null
  }

  // Set the form validation schema.
  const shape = {
    id: yup.string().required('Required'),
    name: yup.string().required('Required'),
    object_name: yup.string().required('Required'),
    props: yup
      .object()
      .json()
      .required('Required')
      .typeError('Not a valid JSON'),
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
    const row = {
      id: preparedValues.id,
      name: preparedValues.name,
      props: preparedValues.props,
    }
    const res = await withSchema(supabase, 'w4online')
      .from('gameserver_build')
      .upsert(row)
    if (res.error) {
      toast.error(`Could not update build: ${res.error.message}`)
      return
    }
    toast.success('Build successfully updated')
    onSave()
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
        setFieldValue,
      }) => (
        <Modal
          show={show}
          onHide={isSubmitting ? undefined : onClose}
          backdrop="static"
        >
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title>
              Update build
            </Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <input type="hidden" id="id" name="id" value={initialValues.id} />

              <Form.Group className="tw-mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
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

              <Form.Group className="tw-mb-3" controlId="props">
                <Form.Label>Properties</Form.Label>
                <JSONFormInput
                  name="props"
                  defaultValue={values.props}
                  isInvalid={touched.props && !!errors.props}
                  setFieldValue={setFieldValue}
                />
                <Form.Feedback type="invalid">
                  {errors.props}
                </Form.Feedback>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <SubmitButton variant="primary" isSubmitting={isSubmitting}>
                Save changes
              </SubmitButton>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}
