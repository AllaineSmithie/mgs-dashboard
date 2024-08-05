/*************************************************************************/
/*  FileUpload.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import * as pathLib from 'path'
import Form from '@webapps-common/UI/Form/Form'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig } from 'formik'
import * as yup from 'yup'
import { isStorageError } from '@supabase/storage-js'
import type { ModalProps } from '@webapps-common/UI/Modal'
import { ModalForm } from '../Common/ModalForm'

export type FilesUploaded = {
  bucket: string;
  path: string;
}
type FileUploadProps = {
  uploaded?: FilesUploaded;
  createBucketIfNotExisting: boolean;
  show: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  modalProps?: ModalProps;
  allowedFileExtensions?: string[];
}
export default function FileUpload({
  show,
  uploaded,
  createBucketIfNotExisting = false,
  onCancel,
  onSuccess = onCancel,
  modalProps,
  allowedFileExtensions,
}: FileUploadProps) {
  const supabase = useSupabaseClient()

  const [fileList, setFileList] = useState<FileList | undefined>()

  if (!uploaded) {
    return null
  }

  // Set the form validation schema.
  const shape = {
    file: yup
      .string()
      .required('Required')
      .test({
        test: (el) => !allowedFileExtensions
          || allowedFileExtensions.includes(pathLib.extname(el)),
        message: 'Wrong extension',
      }),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => [e, ''])),
    {},
  )

  // Submit the form to the server.
  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    _,
    { resetForm },
  ) => {
    if (!fileList) {
      toast.error('An unexpected error occured')
      return
    }

    if (createBucketIfNotExisting) {
      // Check if the bucklet exists before uploading to it. If it does not, try to create it.
      const resGetBucket = await supabase.storage.getBucket(uploaded.bucket)
      if (resGetBucket.error && isStorageError(resGetBucket.error)) {
        const resCreate = await supabase.storage.createBucket(uploaded.bucket)
        if (resCreate.error) {
          toast.error(`Could not upload file. Error during bucket creation: ${resCreate.error.message}`)
          return
        }
      }
    }

    let errCount = 0
    const uploadFile = async (i: number) => {
      const file = fileList[i]
      const body = await file.arrayBuffer()
      const filePath = pathLib.join(uploaded.path, file.name)
      const res = await supabase.storage
        .from(uploaded.bucket)
        .upload(filePath, body)
      if (res.error) {
        toast.error(`Could not upload file: ${res.error.message}`)
        errCount += 1
      }
      return res
    }
    const promises = []
    for (let i = 0; i < fileList.length; i += 1) {
      promises.push(uploadFile(i))
    }
    await Promise.all(promises)

    if (errCount === 0) {
      toast.success('File(s) successfully uploaded')
    }
    if (errCount > 0 && errCount !== fileList.length) {
      toast.warning('Some files could not be uploaded')
    }
    onSuccess()
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
        handleSubmit, touched, isSubmitting, errors, setFieldValue,
      }) => (
        <ModalForm
          show={show}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          title="Upload a new file"
          confirmButtonText="Save"
          isSubmitting={isSubmitting}
          modalProps={({ backdrop: 'static', ...modalProps })}
        >
          <Form.Group className="tw-mb-3" controlId="file">
            <Form.Label>File(s)</Form.Label>
            <Form.FileInput
              name="file"
              multiple
              accept={
                allowedFileExtensions
                  ? allowedFileExtensions.join(',')
                  : undefined
              }
              onChange={(e) => {
                const inputElement = e.currentTarget as HTMLInputElement
                setFileList(
                  inputElement.files ? inputElement.files : undefined,
                )
                setFieldValue('file', e.currentTarget.value)
              }}
              isInvalid={touched.file && !!errors.file}
            />
            <Form.Feedback type="invalid">
              {errors.file}
            </Form.Feedback>
          </Form.Group>
        </ModalForm>
      )}
    </Formik>
  )
}
