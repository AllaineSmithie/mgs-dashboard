/*************************************************************************/
/*  JSONPanel.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React from 'react'
import JSONEditor from './JSONEditor'
import { JSONManagerType } from './JSONSchemaManager'

type JSONPanelProps = {
  value: object;
  jsonSchemaManager: JSONManagerType;
}
export default function JSONPanel({ value, jsonSchemaManager } : JSONPanelProps) {
  return (
    <JSONEditor
      value={JSON.stringify(value, null, 2)}
      jsonSchemaManager={jsonSchemaManager}
      editorProps={{
        options: {
          readOnly: true,
          // Removes the "editor is read only" tooltip
          domReadOnly: true,
        },
      }}
    />
  )
}
