/*************************************************************************/
/*  FormFileInput.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { useFormGroup } from './FormGroup'

type FileInputProps = {
  name: string;
  value?: string;
  multiple?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  className?: string;
  accept?: string;
} & React.InputHTMLAttributes<HTMLInputElement>

export default function FormFileInput({
  name,
  id,
  value,
  multiple,
  onChange,
  isInvalid,
  className,
  accept,
  ...props
}: FileInputProps) {
  const [fileNames, setFileNames] = useState('Select files')

  const { setIsInvalid, controlId } = useFormGroup()
  // Set the context's isInvalid when the Control's prop changes
  useEffect(() => {
    if (isInvalid) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return
    onChange(event) // Call the passed onChange handler
    const fileCount = event.target.files.length
    setFileNames(fileCount === 1 ? event.target.files[0].name : `${fileCount} files selected`)
  }

  return (
    <div className="tw-relative tw-flex tw-items-center">
      <input
        className={`tw-absolute tw-w-0 tw-h-0 tw-opacity-0 tw-overflow-hidden ${className}`}
        name={name}
        value={value}
        type="file"
        onChange={handleChange}
        accept={accept}
        id={id || controlId}
        multiple={multiple}
        {...props}
      />
      <div className="tw-flex tw-bg-control tw-w-full tw-rounded-md tw-border tw-border-border">
        <label
          htmlFor={name}
          className="tw-flex tw-items-center tw-justify-center tw-bg-scale-300/30 hover:tw-bg-scale-300/60 dark:tw-bg-scale-600/40 dark:hover:tw-bg-scale-600/60  tw-py-2 tw-px-3 tw-cursor-pointer tw-border-r tw-border-border"
        >
          Select
        </label>
        <div className="tw-py-2 tw-px-3 tw-cursor-default tw-text-foreground-muted w-full">
          {fileNames}
        </div>
      </div>
      {isInvalid && (
        <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-2 tw-flex tw-items-center">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className=" tw-text-danger-500"
          />
        </div>
      )}
    </div>
  )
}
