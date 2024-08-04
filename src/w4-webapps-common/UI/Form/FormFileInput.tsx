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
    <div className="relative flex items-center">
      <input
        className={`absolute w-0 h-0 opacity-0 overflow-hidden ${className}`}
        name={name}
        value={value}
        type="file"
        onChange={handleChange}
        accept={accept}
        id={id || controlId}
        multiple={multiple}
        {...props}
      />
      <div className="flex bg-control w-full rounded-md border border-border">
        <label
          htmlFor={name}
          className="flex items-center justify-center bg-scale-300/30 hover:bg-scale-300/60 dark:bg-scale-600/40 dark:hover:bg-scale-600/60  py-2 px-3 cursor-pointer border-r border-border"
        >
          Select
        </label>
        <div className="py-2 px-3 cursor-default text-foreground-muted w-full">
          {fileNames}
        </div>
      </div>
      {isInvalid && (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className=" text-danger-500"
          />
        </div>
      )}
    </div>
  )
}
