/*************************************************************************/
/*  UserBan.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import humanizeDuration from 'humanize-duration'
import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import Modal from '@webapps-common/UI/Modal'

export type UserBanned = {
  id: string;
  email?: string;
}
type UserBanProps = {
  show: boolean;
  banned?:UserBanned;
  onClose: () => void;
  onSave: () => void;
}
export default function UserBan({
  show,
  banned,
  onClose,
  onSave = onClose,
}: UserBanProps) {
  const supabase = useSupabaseClient()

  const easyAccessValues : { [key : string] : string } = {
    60: '1h',
    1440: '24h',
    2880: '48h',
    10080: '7 days',
    43200: '30 days',
    525600: '1 year',
    105120000: 'Forever', // 200 Years
  }

  if (!banned) {
    return null
  }

  // Set the form validation schema.
  const shape = {
    id: yup.string().required('Required'),
    mainValue: yup.number().required('Required').oneOf(
      Object.keys(easyAccessValues).map((v) => (parseInt(v, 10))).concat([-1]),
    ),
    customValue: yup.number().required('Required').positive('Ban duration must be positive'),
    customMultiplier: yup.number().required('Required').positive(),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      id: banned.id,
      mainValue: '60',
      customValue: '30',
      customMultiplier: '1',
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const banDuration = preparedValues.mainValue === -1
      ? preparedValues.customValue * preparedValues.customMultiplier
      : preparedValues.mainValue

    // Update a user.
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    const res = await supabaseAuthAdmin.updateUserById(preparedValues.id, {
      ban_duration: `${String(banDuration)}m`,
    })

    if (res.error) {
      toast.error(`Could not ban user: ${res.error?.message}`)
      return
    }
    toast.success(`User successfully banned for ${humanizeDuration(banDuration * 60 * 1000, {
      largest: 1,
      round: true,
      units: ['y', 'd', 'h', 'm'],
    })}`)
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
      {
        ({
          handleSubmit, handleChange, values, touched, isSubmitting, errors,
        }) => (
          <Modal show={show} onHide={isSubmitting ? undefined : onClose} backdrop="static">
            <Modal.Header closeButton>
              <Modal.Title>
                Ban user
                {' '}
                {banned.email || banned.id}
              </Modal.Title>
            </Modal.Header>
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="tw-mb-3" controlId="mainValue">
                  <Form.Label>Ban duration</Form.Label>
                  <Form.Select
                    name="mainValue"
                    value={values.mainValue}
                    isInvalid={touched.mainValue && !!errors.mainValue}
                    onChange={handleChange}
                    items={[...Object.keys(easyAccessValues).map((key: string) => ({
                      value: parseInt(key, 10),
                      name: easyAccessValues[key],
                    })), {
                      value: -1,
                      name: 'Custom...',
                    }]}
                    placeholder="Select ban duration"
                  />
                  <Form.Feedback type="invalid">
                    {errors.mainValue}
                  </Form.Feedback>
                </Form.Group>
                {values.mainValue as unknown === -1 && (
                  <div className="tw-flex tw-gap-2 tw-mt-3">
                    <div className="tw-w-3/5">
                      <Form.Group className="tw-mb-3" controlId="customValue">
                        <Form.Input
                          name="customValue"
                          type="number"
                          value={values.customValue}
                          isInvalid={touched.customValue && !!errors.customValue}
                          onChange={handleChange}
                        />
                        <Form.Feedback type="invalid">
                          {errors.customValue}
                        </Form.Feedback>
                      </Form.Group>
                    </div>
                    <div className="tw-w-2/5">
                      <Form.Group className="tw-mb-3" controlId="customMultiplier">
                        <Form.Select
                          name="customMultiplier"
                          value={values.customMultiplier}
                          isInvalid={touched.customMultiplier && !!errors.customMultiplier}
                          onChange={handleChange}
                          items={[
                            { value: 1, name: 'minutes' },
                            { value: 60, name: 'hours' },
                            { value: 1440, name: 'days' },
                            { value: 43200, name: 'months' },
                            { value: 525600, name: 'years' },
                          ]}
                          placeholder="Select multiplier"
                        />
                        <Form.Feedback type="invalid">
                          {errors.customMultiplier}
                        </Form.Feedback>
                      </Form.Group>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button variant="primary" type="submit">Ban user</Button>
              </Modal.Footer>
            </Form>

          </Modal>
        )
      }
    </Formik>
  )
}
