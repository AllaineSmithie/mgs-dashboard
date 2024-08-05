/*************************************************************************/
/*  JSONPanel.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React from 'react'
import JSONEditor from './JSONEditor'

type JSONPanelProps = {
  value: object;
}
export default function JSONPanel({ value } : JSONPanelProps) {
  return (
    <JSONEditor
      value={JSON.stringify(value, null, 2)}
      editorProps={{
        options: {
          readOnly: true,
        },
      }}
    />
  )
}
