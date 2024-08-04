/*************************************************************************/
/*  TwoFactorAuthenticationConfigForm.tsx                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  ReactNode, useCallback, useEffect, useState,
} from 'react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import GlueRoundedGroup from '../GlueRoundedGroup'
import Button from '../Button'
import Form from '../Form/Form'
import { ConfirmationForm, ModalForm } from '../Form/ModalForm'
import Spinner from '../Spinner'

export type Totp = {
  qr_code: string;
  secret: string;
  uri: string;
}

export type Factor = {
  id: string;
  status: string;
  totp?: Totp;
}

export function TwoFactorAuthenticationConfigForm() {
  const supabase = useSupabaseClient()

  const [factor, setFactor] = useState<Factor>()

  const [showEnrollForm, setShowEnrollForm] = useState<boolean>(false)
  const [showVerifyForm, setShowVerifyForm] = useState<boolean>(false)
  const [showUnenrollForm, setShowUnenrollForm] = useState<boolean>(false)

  const updateEnrollStatus = useCallback(async () => {
    // List all existing factors.
    const resFactorList = await supabase.auth.mfa.listFactors()
    if (resFactorList.error) {
      toast.error(`Could not get list of existing MFA factors: ${resFactorList.error.message}`)
      return
    }

    // Find the first TOTP factor.
    const currentFactor = resFactorList.data.all.find((f) => (f.factor_type === 'totp'))

    // Free all others, if any.
    resFactorList.data.all.forEach((f) => {
      if (!currentFactor || f.id !== currentFactor.id) {
        supabase.auth.mfa.unenroll({ factorId: f.id })
      }
    })

    // Sets the currect factor's status.
    setFactor(currentFactor)
  }, [supabase.auth.mfa])

  useEffect(() => {
    updateEnrollStatus()
  }, [])

  const enroll = useCallback(async () => {
    // Retrieve the enroll QR code and URI.
    const resEnroll = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })
    if (resEnroll.error) {
      toast.error(`Could not enroll: ${resEnroll.error.message}`)
      return
    }
    setFactor(Object.assign(resEnroll.data, { status: 'unverified' }))
  }, [supabase.auth.mfa])

  // Map status to a better displayed "status" string.
  let status = 'Disabled'
  if (factor) {
    if (factor.status === 'unverified') {
      status = 'Unverified'
    } else if (factor.status === 'verified') {
      status = 'Enabled'
    } else {
      status = 'Unknown'
    }
  }

  return (
    <>
      <TotpSetupModalForm
        show={showEnrollForm}
        totp={factor?.totp}
        onCancel={() => {
          setShowUnenrollForm(true)
          updateEnrollStatus()
        }}
        onSuccess={async () => {
          setShowEnrollForm(false)
          setShowVerifyForm(true)
        }}
      />
      <TotpVerifyModalForm
        show={showVerifyForm}
        factor={factor}
        additionalButton={(
          <Button
            variant="secondary"
            onClick={() => {
              setShowVerifyForm(false)
              setShowEnrollForm(true)
            }}
          >
            Back
          </Button>
        )}
        onCancel={() => {
          setShowUnenrollForm(true)
          updateEnrollStatus()
        }}
        onSuccess={() => {
          setShowVerifyForm(false)
          updateEnrollStatus()
          toast.success('Two-factor authentication successfully enabled')
        }}
      />
      <TotpUnenrollFactorModalForm
        show={showUnenrollForm}
        factor={factor}
        onCancel={() => {
          setShowUnenrollForm(false)
        }}
        onFailure={() => {
          setShowUnenrollForm(false)
        }}
        onSuccess={() => {
          setShowEnrollForm(false)
          setShowVerifyForm(false)
          setShowUnenrollForm(false)
          updateEnrollStatus()
        }}
      />
      <div className="mb-3 flex gap-2">
        <span className="font-bold">Status:</span>
        {status}
      </div>
      <div className="mb-2">
        {!factor
          && (
            <Button
              onClick={
                () => {
                  enroll()
                  setShowEnrollForm(true)
                }
              }
            >
              Enable two-factor authentication
            </Button>
          )}
        {factor
          && (
            <Button
              className="me-3"
              variant={factor.status === 'unverified' ? 'secondary' : 'primary'}
              onClick={() => setShowUnenrollForm(true)}
            >
              Disable two-factor authentication
            </Button>
          )}
        {factor && factor.status === 'unverified'
          && (
            <Button
              onClick={() => setShowVerifyForm(true)}
            >
              Verify one-time password
            </Button>
          )}
      </div>
    </>
  )
}

type TotpSetupModalFormProps = {
  show: boolean;
  totp?: Totp;
  onCancel? : () => void;
  onSuccess? : () => void;
}
function TotpSetupModalForm({
  show,
  totp,
  onCancel,
  onSuccess,
}: TotpSetupModalFormProps) {
  const [manualMode, setManualMode] = useState<boolean>(false)

  return (
    <ConfirmationForm
      show={show}
      execute={async () => (null)}
      successMessage={null}
      confirmButtonText="Continue"
      title="Enable two-factor authentication"
      onCancel={() => {
        if (onCancel) {
          onCancel()
        }
      }}
      onSuccess={() => {
        if (onSuccess) {
          onSuccess()
        }
      }}
    >
      {totp ? (
        <>
          <GlueRoundedGroup>
            <Button
            // active={!manualMode}
              disabled={!manualMode}
              onClick={() => { setManualMode(false) }}
              className="w-1/2"
            >
              QR code / link
            </Button>
            <Button
            // active={manualMode}
              disabled={manualMode}
              onClick={() => { setManualMode(true) }}
              className="w-1/2"
            >
              Manual
            </Button>
          </GlueRoundedGroup>
          {manualMode
            ? (
              <TotpManual
                secret={totp.secret}
                uri={totp.uri}
              />
            ) : (
              <TotpQRCode
                qr_code={totp.qr_code}
                uri={totp.uri}
              />
            )}
        </>
      ) : (
        <div className="flex justify-center my-5">
          <Spinner large />
        </div>
      )}
    </ConfirmationForm>
  )
}

type TotpQRCodeProps = {
  qr_code: string;
  uri: string;
}
function TotpQRCode({
  qr_code,
  uri,
} : TotpQRCodeProps) {
  return (
    <>
      <div className="my-3">
        <h6>Scan this QR with your favorite OTP app:</h6>
      </div>
      <div className="my-3 bg-white bg-clip-content flex justify-center">
        <Image width={200} height={200} src={qr_code} alt="OTP QR code" />
      </div>
      <div className="my-3 text-center">
        {'or use '}
        <Link href={uri as string}>this link</Link>
        {' on your phone'}
      </div>
    </>
  )
}

type TotpManualProps = {
  secret: string;
  uri?: string;
}
function TotpManual({
  secret,
  uri,
} : TotpManualProps) {
  const renderTotpProperties = (propName: string, value?: string, units?: string) => {
    if (value) {
      return (
        <div>
          <div>
            <b>
              {propName}
              {': '}
            </b>
            {value}
            { units && ` ${units}` }
          </div>
        </div>
      )
    }
    return ''
  }

  // Extract TOTP parameters from URI.
  let totpAlgorithm
  let totpDigits
  let totpPeriod
  if (uri) {
    const urlSearchParams = new URL(uri)
    totpAlgorithm = urlSearchParams.searchParams.get('algorithm') || undefined
    totpDigits = urlSearchParams.searchParams.get('digits') || undefined
    totpPeriod = urlSearchParams.searchParams.get('period') || undefined
  }

  return (
    <>
      <div className="my-3">
        <h6 className="text-lg">Enter those properties in your favorite OTP app:</h6>
      </div>
      {renderTotpProperties('Secret', secret)}
      {renderTotpProperties('Algorithm', totpAlgorithm)}
      {renderTotpProperties('Digits', totpDigits)}
      {renderTotpProperties('Period', totpPeriod, 'seconds')}
    </>
  )
}

type TotpVerifyModalFormProps = {
  show: boolean;
  factor?: Factor;
  additionalButton?: ReactNode;
  onCancel? : () => void;
  onSuccess? : () => void;
}
function TotpVerifyModalForm({
  show,
  factor,
  additionalButton,
  onCancel,
  onSuccess,
} : TotpVerifyModalFormProps) {
  const supabase = useSupabaseClient()

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
  const onSubmit = useCallback<FormikConfig<typeof initialValues>['onSubmit']>(async (values, { resetForm, setErrors }) => {
    if (!factor) {
      toast.error('Factor not provided.')
      return
    }
    const preparedValues = schema.cast(prepareDataForValidation(values))

    const res = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: preparedValues.code,
    })
    if (res.error) {
      toast.error(res.error.message)
      return
    }

    if (res.error) {
      setErrors({
        code: 'Invalid TOTP code',
      })
      return
    }

    resetForm()
    if (onSuccess) {
      onSuccess()
    }
  }, [factor, onSuccess, schema, supabase.auth.mfa])

  return (
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
          resetForm,
          values,
          touched,
          errors,
          isSubmitting,
        }) => (
          <ModalForm
            show={show}
            onSubmit={handleSubmit}
            onCancel={() => {
              if (onCancel) {
                onCancel()
              }
              resetForm()
            }}
            title="Verify two-factor authentication"
            confirmButtonText="Submit"
            additionalButtons={additionalButton}
            isSubmitting={isSubmitting}
          >
            <Form.Group className="mb-3" controlId="code">
              <Form.Label className="mb-2">Please enter the code provided by your OTP application</Form.Label>
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
          </ModalForm>
        )
      }
    </Formik>
  )
}

type TotpUnenrollFactorModalFormProps = {
  show: boolean;
  factor?: Factor;
  message?: string;
  onCancel? : () => void;
  onFailure? : () => void;
  onSuccess? : () => void;
}
function TotpUnenrollFactorModalForm({
  show,
  factor,
  message = 'Are you sure you want to disable two-factor authentication ? The QR code setup and its associated secret will be invalidated.',
  onCancel,
  onFailure,
  onSuccess,
} : TotpUnenrollFactorModalFormProps) {
  const supabase = useSupabaseClient()

  const unenrollTotpFactor = async () => {
    if (!factor) {
      return { message: 'Could not disable TOTP: no TOTP factor found.' }
    }

    const res = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    if (res.error) {
      return { message: `Could not disable TOTP: ${res.error.message}` }
    }
    return undefined
  }

  return (
    <ConfirmationForm
      show={show}
      execute={unenrollTotpFactor}
      successMessage="Two-factor authentication succesfully disabled"
      confirmButtonText="Yes"
      onCancel={onCancel}
      onFailure={onFailure}
      onSuccess={onSuccess}
    >
      {message}
    </ConfirmationForm>
  )
}
