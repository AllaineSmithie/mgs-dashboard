/*************************************************************************/
/*  ForgottenPasswordForm.tsx                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'

import { addBasePath } from 'next/dist/client/add-base-path'
import { useState } from 'react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import HomeAutoRedirect from '../../Auth/HomeAutoRedirect'
import Form from '../Form/Form'
import Alert from '../Alert'
import SubmitButton from '../SubmitButton'

export type ForgottenPasswordFormProps = {
  updatePasswordRedirectTo: string;
  loginPageHref?: string;
  homePageHref: string;
  autoRedirectToHomeIfAlreadyLoggedIn?: boolean;
}
export function ForgottenPasswordForm({
  updatePasswordRedirectTo,
  loginPageHref,
  homePageHref,
  autoRedirectToHomeIfAlreadyLoggedIn = true,
} : ForgottenPasswordFormProps) {
  const supabase = useSupabaseClient()

  const [errorMessage, setErrorMessage] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()

  // Set the form validation schema.
  const shape = {
    email: yup.string().email('Please enter a valid email address').required('Required'),
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

    const host = window.location.origin
    const res = await supabase.auth.resetPasswordForEmail(preparedValues.email, {
      redirectTo: host + addBasePath(updatePasswordRedirectTo),
    })
    if (res.error) {
      setSuccessMessage('')
      setErrorMessage(res.error.message)
      return
    }
    setSuccessMessage('Request sucessfully sent. If the email is registered with us, you should receive an email shortly.')
    setErrorMessage('')
  }

  return (
    <HomeAutoRedirect
      autoRedirectToHomeIfAlreadyLoggedIn={autoRedirectToHomeIfAlreadyLoggedIn}
      homeHref={homePageHref}
    >
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
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Input
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    isInvalid={touched.email && !!errors.email}
                  />
                  <Form.Feedback type="invalid">
                    {errors.email}
                  </Form.Feedback>
                </Form.Group>

                {successMessage
                  ? (
                    <div className="text-center mb-3 mt-6">
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
        {loginPageHref
      && (
        <div className="text-center flex-none">
          <Link href={loginPageHref}>
            <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
            Back to login page
          </Link>
        </div>
      )}
      </div>
    </HomeAutoRedirect>
  )
}
