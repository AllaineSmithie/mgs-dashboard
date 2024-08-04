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
import { JSONSchemaID, JSONManagerType } from './JSONSchemaManager'

type JSONEditorProps = {
  value?: string;
  defaultValue? : string;
  jsonSchemaId? : JSONSchemaID;
  className?: string;
  onChange?: OnChange;
  editorProps?: EditorProps;
  jsonSchemaManager: JSONManagerType;
}

export default function JSONEditor({
  value,
  defaultValue,
  jsonSchemaId,
  className,
  onChange,
  editorProps,
  jsonSchemaManager,
} : JSONEditorProps) {
  const { resolvedTheme } = useTheme()

  const handleEditorWillMount : BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: 'error',
      schemas: jsonSchemaManager.getMonacoSchemas(),
    })
  }

  const id = useId()

  return (
    <Editor
      wrapperProps={
        {
          className: cn('rounded-md border border-border-secondary dark:border-border overflow-hidden', 'min-h-[200px]', className),
        }
      }
      height="100%"
      theme={resolvedTheme === 'light' ? 'light' : 'vs-dark'}
      defaultLanguage="json"
      value={value}
      defaultValue={defaultValue}
      path={jsonSchemaId ? jsonSchemaManager.getMonacoModelPath(id, jsonSchemaId) : id}
      onChange={onChange}
      options={
        {
          lineNumbersMinChars: 2,
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          // Hide "zoomed out" overview on the right side of the editor.
          overviewRulerLanes: 0,
        }
      }
      beforeMount={handleEditorWillMount}
      {...editorProps}
    />
  )
}
