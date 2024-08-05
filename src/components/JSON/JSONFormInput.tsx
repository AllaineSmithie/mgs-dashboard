/*************************************************************************/
/*  JSONFormInput.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React from 'react'
import { OnChange } from '@monaco-editor/react'
import { FormikErrors } from 'formik'
import cn from '@webapps-common/utils/classNamesMerge'
import { JSONSchemaID } from '@components/Forms/JSONSchemaManager'
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
}
export default function JSONFormInput({
  name,
  defaultValue,
  setFieldValue,
  isInvalid,
  jsonSchemaId,
  ...props
}: JSONFormInputProps) {
  const handleChange: OnChange = (val) => {
    setFieldValue(name, val || '')
  }

  return (
    <JSONEditor
      className={cn(isInvalid && 'tw-border-danger-500')}
      defaultValue={defaultValue}
      jsonSchemaId={jsonSchemaId}
      {...props}
      onChange={handleChange} // Make sure onChange is not in {...props}
    />
  )
}
