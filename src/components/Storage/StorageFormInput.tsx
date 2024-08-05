/*************************************************************************/
/*  StorageFormInput.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import * as pathLib from 'path'
import { FormikErrors } from 'formik'
import React, { useState } from 'react'
import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import Modal from '@webapps-common/UI/Modal'
import cn from '@webapps-common/utils/classNamesMerge'
import StorageExplorer from './StorageExplorer'

type StorageFormInputProps = {
  name: string;
  value: string;
  bucket: string;
  setFieldValue: (
    field: string,
    value: unknown,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<unknown>>;
  nameForIdField: string;
  allowedFileExtensions?: string[];
  isInvalid?: boolean;
  isValid?: boolean;
  createBucketIfNotExisting?: boolean;
}
export default function StorageFormInput({
  name,
  value = '',
  bucket,
  setFieldValue,
  nameForIdField,
  allowedFileExtensions,
  isInvalid,
  isValid,
  createBucketIfNotExisting = false,
}: StorageFormInputProps) {
  const [showStorageExplorer, setShowStorageExplorer] = useState<boolean>(false)
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>(undefined)
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(undefined)

  const dirName = pathLib.dirname(value)
  const defaultPath = dirName === '.' ? '' : dirName

  return (
    <>
      <Modal show={showStorageExplorer} size="wide" className="dont-deselect-files" backdrop="static" onHide={() => { setShowStorageExplorer(false) }}>
        <Modal.Header closeButton>
          <Modal.Title>Select a file</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StorageExplorer
            bucket={bucket}
            onSelectionChanged={(folderPath, selection) => {
              if (selection.length === 1 && selection[0].id !== null) {
                setSelectedFilePath(pathLib.join(folderPath, selection[0].name))
                setSelectedFileId(selection[0].id)
              } else {
                setSelectedFilePath(undefined)
                setSelectedFileId(undefined)
              }
            }}
            defaultPath={defaultPath}
            allowedFileExtensions={allowedFileExtensions}
            createBucketIfNotExisting={createBucketIfNotExisting}
            doNotDeselectClassName="dont-deselect-files"
          />
        </Modal.Body>
        <Modal.Footer>
          <span style={
            {
              marginRight: 'auto',
            }
          }
          >
            {allowedFileExtensions && `Allowed extensions: ${allowedFileExtensions.join(', ')}`}
          </span>

          <Button variant="secondary" onClick={() => { setShowStorageExplorer(false) }}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowStorageExplorer(false)
              setFieldValue(name, selectedFilePath)
              setFieldValue(nameForIdField, selectedFileId)
            }}
            disabled={!selectedFilePath}
          >
            Select
          </Button>
        </Modal.Footer>
      </Modal>
      <div
        className={cn('tw-flex tw-w-full', isInvalid && 'is-invalid', isValid && 'is-valid')}
      >
        <Form.Input
          aria-label="File selector"
          value={value}
          isInvalid={isInvalid}
          isValid={isValid}
          disabled
          placeholder="Select a file"
          className="tw-rounded-r-none tw-w-full tw-flex-1"
        />
        <Button
          onClick={() => {
            setShowStorageExplorer(true)
          }}
          className="tw-rounded-l-none"
        >
          Select
        </Button>
      </div>
    </>
  )
}
