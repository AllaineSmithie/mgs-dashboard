/*************************************************************************/
/*  WebBuildCreate.tsx                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import * as pathLib from 'path'
import Button from '@webapps-common/UI/Button'
import SubmitButton from '@webapps-common/UI/SubmitButton'
import Form from '@webapps-common/UI/Form/Form'
import Modal from '@webapps-common/UI/Modal'
import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  Formik, FormikConfig, prepareDataForValidation,
} from 'formik'
import * as yup from 'yup'
import withSchema from 'src/utils/withSchema'
import StorageFormInput from '@components/Storage/StorageFormInput'

type WebBuildCreateProps = {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}
export default function WebBuildCreate({
  show,
  onClose,
  onSave = onClose,
}: WebBuildCreateProps) {
  const supabase = useSupabaseClient()

  // Set the form validation schema.
  const shape = {
    slug: yup.string().matches(/^[a-z0-9-]+$/, 'Must be a URL-compatible slug').required('Required'),
    name: yup.string().required('Required'),
    object_id: yup.string().required('Required'),
    object_name: yup.string().required('Required'),
    public: yup.boolean().required('Required'),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      public: false,
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const res = await withSchema(supabase, 'w4online')
      .rpc('web_build_create', {
        slug: preparedValues.slug,
        name: preparedValues.name,
        object_id: preparedValues.object_id,
        public: preparedValues.public,
      })
    if (res.error) {
      if (res.error.code === '23505') {
        // Duplicate key value error code
        toast.error(
          'Could not create web build: another build using the same file or the same name already exists',
        )
      } else {
        toast.error(`Could not create web build: ${res.error.message}`)
      }
      return
    }
    toast.success('Web build successfully created')
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
      {({
        handleSubmit,
        handleChange,
        values,
        touched,
        isSubmitting,
        errors,
        setFieldValue,
      }) => (
        <Modal
          show={show}
          onHide={isSubmitting ? undefined : onClose}
          backdrop="static"
        >
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title>Create a new web build</Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>

              <Form.Group className="mb-3" controlId="object_name">
                <Form.Label>File</Form.Label>
                <StorageFormInput
                  name="object_name"
                  value={values.object_name || ''}
                  isInvalid={touched.object_name && !!errors.object_name}
                  bucket={process.env.NEXT_PUBLIC_BUCKET_WEB_BUILDS_PACKED || ''}
                  setFieldValue={
                    (field, value, ...props) => {
                      // Automatically set the name if it is empty,
                      // or corresponding to the old suggestion.
                      if (field === 'object_name') {
                        const transformToName = (v : string) => (pathLib.parse(v as string).name)
                        const oldNameSuggestedVal = transformToName(values.object_name)
                        if (value && (!values.name || values.name === oldNameSuggestedVal)) {
                          const newNameSuggestedVal = transformToName(value as string)
                          setFieldValue('name', newNameSuggestedVal)

                          // Automatically set the slug if it is empty,
                          // or corresponding to the old suggestion.
                          const transformToSlug = (v : string) => (v.toLowerCase().replace(/[_|&;$%@"<>()+,./\\]/g, '-'))
                          if (!values.slug
                            || values.slug === transformToSlug(oldNameSuggestedVal)) {
                            setFieldValue('slug', transformToSlug(newNameSuggestedVal as string))
                          }
                        }
                      }

                      // Set the field as usual.
                      return setFieldValue(field, value, ...props)
                    }
                  }
                  nameForIdField="object_id"
                  allowedFileExtensions={['.zip']}
                  createBucketIfNotExisting
                />
                <Form.Feedback type="invalid">
                  {errors.object_name}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Input
                  name="name"
                  value={values.name}
                  onChange={(e) => {
                    // Automatically set the slug if it is empty,
                    // or corresponding to the old suggestion.
                    const transformToSlug = (v : string) => (v.toLowerCase().replace(/[_|&;$%@"<>()+,./\\ ]/g, '-'))
                    if (!values.slug
                        || values.slug === transformToSlug(e.target.defaultValue)) {
                      setFieldValue('slug', transformToSlug(e.target.value as string))
                    }
                    handleChange(e)
                  }}
                  isInvalid={touched.name && !!errors.name}
                />
                <Form.Feedback type="invalid">
                  {errors.name}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="slug">
                <Form.Label>URL slug</Form.Label>
                <Form.Input
                  name="slug"
                  value={values.slug}
                  onChange={handleChange}
                  isInvalid={touched.slug && !!errors.slug}
                />
                <Form.Feedback type="invalid">
                  {errors.slug}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="public">
                <Form.Checkbox
                  label="Public"
                  name="public"
                  value={values.public ? 'public' : undefined}
                  checked={values.public}
                  onChange={handleChange}
                  isInvalid={touched.public && !!errors.public}
                />
                <Form.Feedback type="invalid">
                  {errors.public}
                </Form.Feedback>
                {values.public && (
                <Form.Text className="text-warning-500">
                  Warning: public web builds are accessible to anyone having the link to it,
                  including unauthenticated users.
                </Form.Text>
                )}
              </Form.Group>

            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <SubmitButton variant="primary" isSubmitting={isSubmitting}>
                Save changes
              </SubmitButton>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}
