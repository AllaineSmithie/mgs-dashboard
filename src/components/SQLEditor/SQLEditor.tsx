/*************************************************************************/
/*  SQLEditor.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable react/jsx-no-bind */
import Editor, { BeforeMount, EditorProps, OnMount } from '@monaco-editor/react'
import { useRef } from 'react'
import { useTheme } from 'next-themes'

type SQLEditorProps = {
  className?: string;
  onChange: (value?: string) => void;
  executeQuery: () => void;
  value?: string;
  defaultValue?: string;
}

export default function SQLEditor({
  className,
  onChange,
  executeQuery,
  value,
  defaultValue,
}: SQLEditorProps) {
  const { resolvedTheme } = useTheme()

  const options: EditorProps['options'] = {
    tabSize: 2,
    fontSize: 13,
    minimap: { enabled: false },
    wordWrap: 'on',
  }

  const executeQueryRef = useRef(executeQuery)
  executeQueryRef.current = executeQuery

  const beforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#18171C' },
    })
  }

  const handleEditorOnMount: OnMount = async (editor, monaco) => {
    editor.addAction({
      id: 'run-query',
      label: 'Run Query',
      keybindings: [monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter],
      contextMenuGroupId: 'operation',
      contextMenuOrder: 0,
      run: () => {
        executeQueryRef.current()
      },
    })
  }

  return (
    <Editor
      className={className}
      beforeMount={beforeMount}
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
      onMount={handleEditorOnMount}
      onChange={onChange}
      defaultLanguage="pgsql"
      defaultValue={defaultValue}
      value={value}
      options={options}
    />
  )
}
