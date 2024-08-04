/*************************************************************************/
/*  TwoFactorAuthenticationVerifyForm.tsx                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'

import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'

import HomeAutoRedirect from '@webapps-common/Auth/HomeAutoRedirect'
import { useCallback, useEffect, useState } from 'react'
import { Factor } from '@supabase/gotrue-js'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Alert from '../Alert'
import Form from '../Form/Form'
import SubmitButton from '../SubmitButton'

// tabIndex in this file allows selecting the 'forgot my password' link last.
// We need it, so we disable the rule.
/* eslint-disable jsx-a11y/tabindex-no-positive */

export type TwoFactorAuthenticationVerifyFormProps = {
  homePageHref: string;
  loginPageHref?: string;
  autoRedirectToHomeIfAlreadyLoggedIn?: boolean;
}
export function TwoFactorAuthenticationVerifyForm({
  homePageHref,
  loginPageHref,
  autoRedirectToHomeIfAlreadyLoggedIn = true,
}:TwoFactorAuthenticationVerifyFormProps) {
  const [factor, setFactor] = useState<Factor>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const supabase = useSupabaseClient()
  const router = useRouter()

  const updateEnrollStatus = useCallback(async () => {
    // List all existing factors.
    const resFactorList = await supabase.auth.mfa.listFactors()
    if (resFactorList.error) {
      setErrorMessage(`Could not get list of existing MFA factors: ${resFactorList.error.message}`)
      return
    }

    // Find the first TOTP factor.
    const currentFactor = resFactorList.data.all.find((f) => (f.factor_type === 'totp'))

    // Sets the currect factor's status.
    if (currentFactor) {
      setFactor(currentFactor)
    } else {
      setErrorMessage('Could not find a MFA factor.')
    }
  }, [supabase.auth.mfa])

  useEffect(() => {
    updateEnrollStatus()
  }, [updateEnrollStatus])

  // Set the form validation schema.
  const shape = {
    code: yup.string().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {},
  )

  // Submit the form to the server.
  const onSubmit = useCallback<FormikConfig<typeof initialValues>['onSubmit']>(async (values, { setErrors }) => {
    if (!factor) {
      setErrorMessage('No MFA factor set up.')
      return
    }
    const preparedValues = schema.cast(prepareDataForValidation(values))

    const res = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: preparedValues.code,
    })
    if (res.error) {
      setErrors({
        code: res.error.message,
      })
      return
    }

    router.push(homePageHref)
  }, [factor, schema, supabase.auth.mfa, homePageHref, router])

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
            errors,
            isSubmitting,
          }) => (
            <Form
              onSubmit={handleSubmit}
              className="mt-3"
            >
              <Form.Group className="mb-3" controlId="code">
                <Form.Label className="mb-2">Please enter the code provided by your OTP application:</Form.Label>
                <Form.Input
                  name="code"
                  value={values.code}
                  onChange={handleChange}
                  isInvalid={touched.code && !!errors.code}
                />
                <Form.Feedback type="invalid">
                  {errors.code}
                </Form.Feedback>
              </Form.Group>

              <SubmitButton
                isSubmitting={isSubmitting}
                className="w-full mb-3"
              >
                Submit
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
