/*************************************************************************/
/*  UserCreate.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import {
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import Modal from '@webapps-common/UI/Modal'

type UserCreateProps = {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}
export default function UserCreate({
  show,
  onClose,
  onSave = onClose,
}: UserCreateProps) {
  const supabase = useSupabaseClient()

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
    const preparedValues = schema.cast(prepareDataForValidation(values))

    // Create a user.
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    const res = await supabaseAuthAdmin.createUser({
      email: preparedValues.email,
      password: preparedValues.password,
      email_confirm: preparedValues.email_confirm ? true : undefined,
      role: preparedValues.service_role ? 'service_role' : 'authenticated',
    } as object)

    if (res.error) {
      toast.error(`Could not create user: ${res.error?.message}`)
      return
    }
    toast.success('User successfully created')
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
      }) => (
        <Modal
          show={show}
          onHide={isSubmitting ? undefined : onClose}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Create a new user
            </Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="tw-mb-3" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  isInvalid={touched.email && !!errors.email}
                  placeholder="Enter email"
                />
                <Form.Feedback type="invalid">
                  {errors.email}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="tw-mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Input
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && !!errors.password}
                  placeholder="Password"
                />
                <Form.Feedback type="invalid">
                  {errors.password}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="tw-mb-3" controlId="email_confirm">
                <Form.Checkbox
                  label="Confirm email address"
                  name="email_confirm"
                  value="email_confirm"
                  checked={values.email_confirm}
                  onChange={handleChange}
                  isInvalid={touched.email_confirm && !!errors.email_confirm}
                />
                <Form.Feedback type="invalid">
                  {errors.email_confirm}
                </Form.Feedback>
                { values.email_confirm
                && (
                <Form.Text>
                  Warning: Manually confirming the email address of an account
                  cannot be undone.
                </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="tw-mb-3" controlId="service_role">
                <Form.Checkbox
                  label="Admin"
                  name="service_role"
                  value="service_role"
                  checked={values.service_role}
                  onChange={handleChange}
                  isInvalid={touched.service_role && !!errors.service_role}
                />
                <Form.Feedback type="invalid">
                  {errors.service_role}
                </Form.Feedback>
                { values.service_role
                && (
                <Form.Text>
                  Warning: A user with the admin role can access this dashboard
                  and thus has control over configurations, servers, user
                  accounts, etc. Assign this role carefully, only to trusted
                  individuals.
                </Form.Text>
                )}
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
