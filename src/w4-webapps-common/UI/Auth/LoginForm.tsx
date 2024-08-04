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
                <div className="flex">
                  <Form.Label className="grow">Password</Form.Label>
                  {forgottedPasswordPageHref && (
                    <Link
                      className="no-underline whitespace-nowrap block text-sm mb-2"
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
                className="w-full mt-6 mb-3"
              >
                Login
              </SubmitButton>

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
      {signUpPageHref
        && (
          <>
            <div className="md:grow align-middle flex items-center">
              <div className="grow h-[2px] border-0 bg-scale-500" />
              <span className="flex-none mx-4 text-scale-500">or</span>
              <div className="grow h-[2px] border-0 bg-scale-500" />
            </div>

            <Button
              variant="primary"
              className="w-full mt-3"
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
