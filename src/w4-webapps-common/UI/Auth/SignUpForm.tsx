/*************************************************************************/
/*  SignUpForm.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'

import { useState } from 'react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import cn from '../../utils/classNamesMerge'
import Form from '../Form/Form'
import Alert from '../Alert'
import SubmitButton from '../SubmitButton'
import HomeAutoRedirect from '../../Auth/HomeAutoRedirect'

export type SignUpFormProps = {
  loginPageHref: string;
  homePageHref: string;
  termsOfServicePageHref: string;
  privacyPolicyPageHref: string;
  autoRedirectToHomeIfAlreadyLoggedIn?: boolean;
}
export function SignUpForm({
  loginPageHref,
  homePageHref,
  termsOfServicePageHref,
  privacyPolicyPageHref,
  autoRedirectToHomeIfAlreadyLoggedIn = true,
}: SignUpFormProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [successMessage, setSuccessMessage] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()

  // Set the form validation schema.
  const shape = {
    email: yup.string().email('Please enter a valid email address').required('Required'),
    password: yup.string().required('Required'),
    terms_of_services_accepted: yup.bool().oneOf([true], 'You must read and accept the terms of services to sign up.'),
    privacy_policy_accepted: yup.bool().oneOf([true], 'You must read and accept the privacy policy to sign up.'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      terms_of_services_accepted: false,
      privacy_policy_accepted: false,
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const res = await supabase.auth.signUp({
      email: preparedValues.email,
      password: preparedValues.password,
    })
    if (res.error) {
      setErrorMessage(res.error.message)
      setSuccessMessage('')
      return
    }
    setSuccessMessage('Success! An email will be sent to you shortly to confirm your sign-up.')
    setErrorMessage('')

    // Wait 5 seconds then redirect
    const timeout = (delay: number) => (new Promise((r) => { setTimeout(r, delay) }))
    await timeout(4000)
    await router.push(loginPageHref)
  }

  return (
    <HomeAutoRedirect
      autoRedirectToHomeIfAlreadyLoggedIn={autoRedirectToHomeIfAlreadyLoggedIn}
      homeHref={homePageHref}
    >
      <div className="mb:tw-grow tw-flex tw-flex-col">
        <div className="tw-grow">
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

                <Form.Group className="tw-mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Input
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={touched.password && !!errors.password}
                  />
                  <Form.Feedback type="invalid">
                    {errors.password}
                  </Form.Feedback>
                </Form.Group>

                <Form.Group className="tw-mb-3" controlId="terms_of_services_accepted">
                  <Form.Checkbox
                    label={
                      (
                        <>
                          {'I have read and accept the '}
                          <Link href={termsOfServicePageHref}>Terms of service</Link>
                        </>
                      )
                    }
                    name="terms_of_services_accepted"
                    value="terms_of_services_accepted"
                    checked={values.terms_of_services_accepted}
                    onChange={handleChange}
                    isInvalid={
                      touched.terms_of_services_accepted && !!errors.terms_of_services_accepted
                    }
                    className={cn(touched.terms_of_services_accepted && !!errors.terms_of_services_accepted ? 'is-invalid' : '', 'tw-text-scale-700 tw-text-sm')}
                  />
                  <Form.Feedback type="invalid">
                    {errors.terms_of_services_accepted}
                  </Form.Feedback>
                </Form.Group>

                <Form.Group className="tw-mb-3" controlId="privacy_policy_accepted">
                  <Form.Checkbox
                    label={
                      (
                        <>
                          {'I have read and accept the '}
                          <Link href={privacyPolicyPageHref}>Privacy policy</Link>
                        </>
                      )
                    }
                    name="privacy_policy_accepted"
                    value="privacy_policy_accepted"
                    checked={values.privacy_policy_accepted}
                    onChange={handleChange}
                    isInvalid={touched.privacy_policy_accepted && !!errors.privacy_policy_accepted}
                    className={cn(touched.privacy_policy_accepted && !!errors.privacy_policy_accepted ? 'is-invalid' : '', 'tw-text-scale-700 tw-text-sm')}
                  />
                  <Form.Feedback type="invalid">
                    {errors.privacy_policy_accepted}
                  </Form.Feedback>
                </Form.Group>

                <div className="tw-mb-3">
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    submittingText={successMessage ? 'Redirecting...' : 'Submitting...'}
                    className="tw-w-full tw-mt-6 tw-mb-3"
                  >
                    Sign up
                  </SubmitButton>
                </div>
                {errorMessage
                && (
                  <div className="tw-text-center tw-mb-3">
                    <Alert variant="danger">{errorMessage}</Alert>
                  </div>
                )}
                {successMessage
                && (
                  <div className="tw-text-center tw-mb-3">
                    <Alert variant="success">{successMessage}</Alert>
                  </div>
                )}
              </Form>
            )
          }
          </Formik>
        </div>
        {loginPageHref
        && (
          <div className="tw-text-center tw-flex-none">
            <Link href={loginPageHref}>
              <FontAwesomeIcon icon={faChevronLeft} className="tw-me-2" />
              Back to login page
            </Link>
          </div>
        )}
      </div>
    </HomeAutoRedirect>
  )
}
