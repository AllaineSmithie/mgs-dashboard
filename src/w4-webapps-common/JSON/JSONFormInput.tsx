/*************************************************************************/
/*  JSONFormInput.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, { useEffect } from 'react'
import { OnChange } from '@monaco-editor/react'
import { FormikErrors } from 'formik'
import cn from '@webapps-common/utils/classNamesMerge'
import { useFormGroup } from '@webapps-common/UI/Form/FormGroup'
import { JSONSchemaID, JSONManagerType } from './JSONSchemaManager'
import JSONEditor from './JSONEditor'

type JSONFormInputProps = {
  name: string;
  defaultValue?: string;
  setFieldValue: (
    field: string,
    value: string,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<object>>;
  jsonSchemaId?: JSONSchemaID;
  isInvalid?: boolean;
  jsonSchemaManager: JSONManagerType;
}
export default function JSONFormInput({
  name,
  defaultValue,
  setFieldValue,
  isInvalid,
  jsonSchemaId,
  jsonSchemaManager,
  ...props
}: JSONFormInputProps) {
  const { setIsInvalid } = useFormGroup()

  useEffect(() => {
    if (isInvalid !== undefined) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  const handleChange: OnChange = (val) => {
    setFieldValue(name, val || '')
  }

  return (
    <JSONEditor
      className={cn(isInvalid && 'border-danger-500')}
      defaultValue={defaultValue}
      jsonSchemaId={jsonSchemaId}
      jsonSchemaManager={jsonSchemaManager}
      {...props}
      onChange={handleChange} // Make sure onChange is not in {...props}
    />
  )
}
