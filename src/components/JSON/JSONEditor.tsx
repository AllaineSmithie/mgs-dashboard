/*************************************************************************/
/*  JSONEditor.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, { useId } from 'react'

import Editor, { BeforeMount, EditorProps, OnChange } from '@monaco-editor/react'
import cn from '@webapps-common/utils/classNamesMerge'
import { useTheme } from 'next-themes'
import JSONSchemaManager, { JSONSchemaID } from '../Forms/JSONSchemaManager'

type JSONEditorProps = {
  value?: string;
  defaultValue? : string;
  jsonSchemaId? : JSONSchemaID;
  className?: string;
  onChange?: OnChange;
  editorProps?: EditorProps;
}
export default function JSONEditor({
  value,
  defaultValue,
  jsonSchemaId,
  className,
  onChange,
  editorProps,
} : JSONEditorProps) {
  const { resolvedTheme } = useTheme()

  const handleEditorWillMount : BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: 'error',
      schemas: JSONSchemaManager.getMonacoSchemas(),
    })
  }

  const id = useId()

  return (
    <Editor
      wrapperProps={
        {
          className: cn('tw-rounded-md tw-border tw-border-border-secondary dark:tw-border-border tw-overflow-hidden', 'tw-min-h-[200px]', className),
        }
      }
      height="100%"
      theme={resolvedTheme === 'light' ? 'light' : 'vs-dark'}
      defaultLanguage="json"
      value={value}
      defaultValue={defaultValue}
      path={jsonSchemaId ? JSONSchemaManager.getMonacoModelPath(id, jsonSchemaId) : id}
      onChange={onChange}
      options={
        {
          lineNumbersMinChars: 2,
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
        }
      }
      beforeMount={handleEditorWillMount}
      {...editorProps}
    />
  )
}
