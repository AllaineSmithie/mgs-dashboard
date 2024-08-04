/*************************************************************************/
/*  UpdatePasswordForm.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'

import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Form from '../Form/Form'
import Alert from '../Alert'
import SubmitButton from '../SubmitButton'

export type UpdatePasswordFormProps = {
  loginPageHref: string;
  homePageHref: string;
  showHomePageLink?: boolean;
}
export function UpdatePasswordForm({
  loginPageHref,
  homePageHref,
  showHomePageLink = true,
}: UpdatePasswordFormProps) {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [errorMessage, setErrorMessage] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()

  // Auto redirect if not logged in.
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push(loginPageHref)
      }
    })
  })

  // Set the form validation schema.
  const shape = {
    newPassword: yup.string().min(6, 'Password should be at least 6 characters').required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {},
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))

    const res = await supabase.auth.updateUser({
      password: preparedValues.newPassword,
    })
    if (res.error) {
      setSuccessMessage('')
      setErrorMessage(res.error.message)
      return
    }
    setSuccessMessage('Password successfully updated. You should be redirected in a few seconds...')
    setErrorMessage('')

    // Wait 5 seconds then redirect
    const timeout = (delay: number) => (new Promise((r) => { setTimeout(r, delay) }))
    await timeout(4000)
    router.push(homePageHref)
  }

  return (
    <div className="grow flex flex-col">
      <div className="md:grow">
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
              <Form
                onSubmit={handleSubmit}
              >
                <Form.Group controlId="newPassword">
                  <Form.Label>New password</Form.Label>
                  <Form.Input
                    name="newPassword"
                    type="password"
                    value={values.newPassword}
                    onChange={handleChange}
                    isInvalid={touched.newPassword && !!errors.newPassword}
                  />
                  <Form.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Feedback>
                </Form.Group>
                {successMessage
                  ? (
                    <div className="text-center mb-3">
                      <Alert variant="success">{successMessage}</Alert>
                    </div>
                  )
                  : (
                    <SubmitButton
                      isSubmitting={isSubmitting}
                      className="w-full mt-6 mb-3"
                    >
                      Send recovery instruction
                    </SubmitButton>
                  )}
                {errorMessage
                && (
                  <div className="text-center mb-3">
                    <Alert variant="danger">{errorMessage}</Alert>
                  </div>
                )}
              </Form>
            )
          }
        </Formik>
      </div>
      {
        showHomePageLink
        && (
        <div className="text-center">
          <Link href={homePageHref}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to home page
          </Link>
        </div>
        )
      }
    </div>
  )
}
