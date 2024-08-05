/*************************************************************************/
/*  profile.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import SubmitButton from '@webapps-common/UI/SubmitButton'
import Form from '@webapps-common/UI/Form/Form'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import MainLayout from '@components/MainLayout'

export default function UserProfile() {
  const sessionContext = useSessionContext()
  const user = sessionContext.session?.user
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Settings' }],
        breadcrumbCurrentText: 'Profile',
      }}
    >
      <h3 className="tw-mb-4 tw-font-bold">Profile</h3>
      <div className="tw-flex tw-items-center tw-mb-4">
        <div className="tw-w-2/12">
          <h5>Email</h5>
        </div>
        <div>
          {user?.email}
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-mb-4">
        <div className="tw-w-2/12">
          <h5>Password</h5>
        </div>
        <div className="tw-w-8/12">
          <ChangePasswordForm />
        </div>
      </div>
    </MainLayout>
  )
}

function ChangePasswordForm() {
  const supabase = useSupabaseClient()

  // Set the form validation schema.
  const shape = {
    new_password: yup.string().required('Required').min(6, 'Passwords should be at least 6 characters'),
    new_password_confirm: yup.string().required('Required').oneOf([yup.ref('new_password')], 'Passwords must match'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {},
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    // Update password
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const res = await supabase.auth.updateUser({
      password: preparedValues.new_password,
    })
    if (res.error) {
      toast.error(`Could not update password: ${res.error.message}`)
      return
    }
    toast.success('Password successfully updated')
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
        errors,
        isSubmitting,
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="tw-mb-3" controlId="new_password">
            <Form.Input
              name="new_password"
              type="password"
              autoComplete="new-password"
              value={values.new_password}
              placeholder="New password"
              onChange={handleChange}
              isInvalid={touched.new_password && !!errors.new_password}
            />
            <Form.Feedback type="invalid">
              {errors.new_password}
            </Form.Feedback>
          </Form.Group>
          <Form.Group className="tw-mb-3" controlId="new_password_confirm">
            <Form.Input
              name="new_password_confirm"
              type="password"
              autoComplete="new-password"
              value={values.new_password_confirm}
              placeholder="Confirm new password"
              onChange={handleChange}
              isInvalid={touched.new_password_confirm && !!errors.new_password_confirm}
            />
            <Form.Feedback type="invalid">
              {errors.new_password_confirm}
            </Form.Feedback>
          </Form.Group>
          <div className="tw-flex tw-justify-end">
            <SubmitButton variant="primary" isSubmitting={isSubmitting}>
              Submit
            </SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}
