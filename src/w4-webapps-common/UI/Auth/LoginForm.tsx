/*************************************************************************/
/*  LoginForm.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'

import { useState } from 'react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import Link from 'next/link'
import { useRouter } from 'next/router'
import HomeAutoRedirect from '../../Auth/HomeAutoRedirect'
import Form from '../Form/Form'
import Button from '../Button'
import Alert from '../Alert'
import SubmitButton from '../SubmitButton'
// tabIndex in this file allows selecting the 'forgot my password' link last.
// We need it, so we disable the rule.
/* eslint-disable jsx-a11y/tabindex-no-positive */

export type LoginFormProps = {
  homePageHref: string;
  forgottedPasswordPageHref?: string;
  signUpPageHref?: string;
  autoRedirectToHomeIfAlreadyLoggedIn?: boolean;
}
export function LoginForm({
  homePageHref,
  forgottedPasswordPageHref,
  signUpPageHref,
  autoRedirectToHomeIfAlreadyLoggedIn = true,
}:LoginFormProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState<string>()

  // Set the form validation schema.
  const shape = {
    email: yup.string().email('Please enter a valid email address').required('Required'),
    password: yup.string().required('Required'),
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

    const res = await supabase.auth.signInWithPassword({
      email: preparedValues.email,
      password: preparedValues.password,
    })
    if (res.error) {
      setErrorMessage(res.error.message)
      return
    }
    await router.push(homePageHref)
    setErrorMessage('')
  }

  return (
    <HomeAutoRedirect
      autoRedirectToHomeIfAlreadyLoggedIn={autoRedirectToHomeIfAlreadyLoggedIn}
      homeHref={homePageHref}
    >
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
                  tabIndex={1}
                />
                <Form.Feedback type="invalid">
                  {errors.email}
                </Form.Feedback>
              </Form.Group>

              <Form.Group controlId="password">
                <div className="tw-flex">
                  <Form.Label className="tw-grow">Password</Form.Label>
                  {forgottedPasswordPageHref && (
                    <Link
                      className="tw-no-underline tw-whitespace-nowrap tw-block tw-text-sm tw-mb-2"
                      tabIndex={0}
                      href={forgottedPasswordPageHref}
                    >
                      Forgot your password ?
                    </Link>
                  )}
                </div>
                <Form.Input
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && !!errors.password}
                  tabIndex={1}
                />
                <Form.Feedback type="invalid">
                  {errors.password}
                </Form.Feedback>
              </Form.Group>

              <SubmitButton
                isSubmitting={isSubmitting}
                tabIndex={1}
                className="tw-w-full tw-mt-6 tw-mb-3"
              >
                Login
              </SubmitButton>

              {errorMessage
              && (
                <div className="tw-text-center tw-mb-3">
                  <Alert variant="danger">{errorMessage}</Alert>
                </div>
              )}
            </Form>

          )
        }
      </Formik>
      {signUpPageHref
        && (
          <>
            <div className="md:tw-grow tw-align-middle tw-flex tw-items-center">
              <div className="tw-grow tw-h-[2px] tw-border-0 tw-bg-scale-500" />
              <span className="tw-flex-none tw-mx-4 tw-text-scale-500">or</span>
              <div className="tw-grow tw-h-[2px] tw-border-0 tw-bg-scale-500" />
            </div>

            <Button
              variant="primary"
              className="tw-w-full tw-mt-3"
              onClick={(() => { router.push(signUpPageHref) })}
              tabIndex={1}
            >
              Sign up
            </Button>
          </>
        )}
    </HomeAutoRedirect>
  )
}
