/*************************************************************************/
/*  UserInvite.tsx                                                       */
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

type UserInviteProps = {
  redirectTo?: string;
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}
export default function UserInvite({
  redirectTo,
  show,
  onClose,
  onSave = onClose,
}: UserInviteProps) {
  const supabase = useSupabaseClient()

  // Set the form validation schema.
  const shape = {
    email: yup.string().email().required('Required'),
    service_role: yup.boolean().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      service_role: false,
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))

    // Create a user.
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)

    const res = await supabaseAuthAdmin.inviteUserByEmail(preparedValues.email, {
      redirectTo,
    })

    if (res.error) {
      toast.error(`Could not invite user: ${res.error?.message}`)
      return
    }

    const userId = res.data?.user?.id
    if (!userId) {
      toast.error('Could not set user as admin. User not found')
      return
    }

    if (preparedValues.service_role) {
      const res2 = await supabaseAuthAdmin.updateUserById(userId, {
        role: preparedValues.service_role ? 'service_role' : 'authenticated',
      } as object)

      if (res2.error) {
        toast.error(`Could not set user as admin: ${res2.error?.message}`)
        return
      }
    }

    toast.success('Invite successfully sent')
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
              Invite user
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
                <Form.Text>
                  Warning: A user with the admin role can access this dashboard
                  and thus has control over configurations, servers, user
                  accounts, etc. Assign this role carefully, only to trusted
                  individuals.
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Invite
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}
