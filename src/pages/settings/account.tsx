/*************************************************************************/
/*  account.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import Form from '@webapps-common/UI/Form/Form'
import SubmitButton from '@webapps-common/UI/SubmitButton'
import MainLayout from '@components/MainLayout'
import {
  TwoFactorAuthenticationConfigForm,
} from '@webapps-common/UI/Auth/TwoFactorAuthenticationConfigForm'
import yn from 'yn'
import { useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'

export default function Account() {
  const sessionContext = useSessionContext()
  const envVars = useRuntimeEnvVars()

  const user = sessionContext.session?.user

  const enable2FA = yn(envVars?.env.RUNTIME_PUBLIC_ENABLE_OPT_IN_2FA)

  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Settings' }],
        breadcrumbCurrentText: 'Account',
      }}
    >
      <div className="flex flex-col">
        <div className="mb-5">
          <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
          <div className="flex">
            <h2 className="basis-1/6">Email</h2>
            {user?.email}
          </div>
        </div>
        <div className="my-5">
          <h3 className="mb-4 text-2xl font-semibold">Authentication</h3>
          <h4 className="mb-4 text-xl">Password</h4>
          <ChangePasswordSection />
        </div>
        {enable2FA
        && (
        <div className="my-5">
          <h4 className="mb-4 text-xl">Two-factor authentication</h4>
          <TwoFactorAuthenticationConfigForm />
        </div>
        )}
      </div>
    </MainLayout>
  )
}

function ChangePasswordSection() {
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
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="new_password">
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
          <Form.Group className="mb-3" controlId="new_password_confirm">
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
          <div className="flex gap-3">
            <SubmitButton variant="primary" isSubmitting={isSubmitting} disabled={!values.new_password}>
              Submit
            </SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}
