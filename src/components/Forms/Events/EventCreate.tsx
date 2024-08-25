/*************************************************************************/
/*  EventCreate.tsx                                                    */
/*************************************************************************/
/* Copyright Deadline Entertainment Gbr                                  */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
// import { toast } from 'react-toastify'
import {
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { Formik, FormikConfig } from 'formik'
import * as yup from 'yup'
// import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import Modal from '@webapps-common/UI/Modal'

type EventCreateProps = {
  show: boolean;
  onClose: () => void;
  // onSave: () => void;
}
export default function EventCreate({
  show,
  onClose,
  // onSave = onClose,
}: EventCreateProps) {
  // const supabase = useSupabaseClient()

  // Set the form validation schema.
  const shape = {
    email: yup.string().email().required('Required'),
    password: yup.string(),
    email_confirm: yup.boolean().required('Required'),
    service_role: yup.boolean().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      email_confirm: false,
      service_role: false,
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    // const preparedValues = schema.cast(prepareDataForValidation(values))

    // To Do ->
    // Create an Event.
    // const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    // const res = await supabaseAuthAdmin.createUser({
    //  email: preparedValues.email,
    //  password: preparedValues.password,
    //  email_confirm: preparedValues.email_confirm ? true : undefined,
    //  role: preparedValues.service_role ? 'service_role' : 'authenticated',
    // } as object)

    // if (res.error) {
    //  toast.error(`Could not create user: ${res.error?.message}`)
    return
    // }
    // toast.success('User successfully created')
    // onSave()
    // resetForm()
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
        // touched,
        isSubmitting,
        // errors,
      }) => (
        <Modal
          show={show}
          onHide={isSubmitting ? undefined : onClose}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Create a new event
            </Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="tw-mb-3" controlId="email">
                <Form.Label>Event name</Form.Label>
                <Form.Input
                  name="event-name"
                  value={values.namme}
                  onChange={handleChange}
                  placeholder="Enter event name"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Save changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}
