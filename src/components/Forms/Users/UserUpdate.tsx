/*************************************************************************/
/*  UserUpdate.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import {
  useSessionContext,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import Modal from '@webapps-common/UI/Modal'

export type UserUpdated = {
  id: string;
  email?: string;
  role?: string;
  email_confirmed_at?: string;
}
type UserUpdateProps = {
  show: boolean;
  updated?: UserUpdated;
  onClose: () => void;
  onSave: () => void;
}
export default function UserUpdate({
  show,
  updated,
  onClose,
  onSave = onClose,
}: UserUpdateProps) {
  const supabase = useSupabaseClient()
  const sessionContext = useSessionContext()

  if (!updated) {
    return null
  }

  const userIDString = updated.email || updated.id

  // Set the form validation schema.
  const shape = {
    id: yup.string().required('Required').default(''),
    email: yup.string().email().required('Required').default(''),
    password: yup.string(),
    email_confirm: yup.boolean(),
    service_role: yup.boolean().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      id: updated.id,
      email: updated.email,
      email_confirm: false,
      service_role: updated.role === 'service_role',
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))

    // Update a user.
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    const res = await supabaseAuthAdmin.updateUserById(preparedValues.id, {
      password: preparedValues.password ? preparedValues.password : undefined,
      email_confirm: preparedValues.email_confirm ? true : undefined,
      role: preparedValues.service_role ? 'service_role' : 'authenticated',
    } as object)

    if (res.error) {
      toast.error(`Could not update user: ${res.error?.message}`)
      return
    }
    toast.success(`User ${userIDString} successfully updated`)
    onSave()
    resetForm()
  }

  const adminToggleDisabled = sessionContext.session?.user.id === updated.id

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
              {`Update user ${userIDString}`}
            </Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <input type="hidden" id="id" name="id" value={values.id} />
              <input
                type="hidden"
                id="email"
                name="email"
                value={values.email}
              />

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
              {!updated?.email_confirmed_at && (
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
                  <Form.Text>
                    Warning: Manually confirming the email address of an account
                    cannot be undone.
                  </Form.Text>
                </Form.Group>
              )}
              <Form.Group className="tw-mb-3" controlId="service_role">
                <Form.Checkbox
                  label="Admin"
                  name="service_role"
                  value="service_role"
                  checked={values.service_role}
                  onChange={handleChange}
                  isInvalid={touched.service_role && !!errors.service_role}
                  disabled={adminToggleDisabled}
                />
                <Form.Feedback type="invalid">
                  {errors.service_role}
                </Form.Feedback>
                {!adminToggleDisabled && (
                  <Form.Text>
                    Warning: A user with the admin role can access this
                    dashboard and thus has control over configurations, servers,
                    user accounts, etc. Assign this role carefully, only to
                    trusted individuals.
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
