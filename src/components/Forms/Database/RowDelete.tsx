/*************************************************************************/
/*  RowDelete.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withSchema from 'src/utils/withSchema'
import {
  DeleteConfirmationForm,
  ConfirmationFormProps,
} from '@webapps-common/UI/Form/ModalForm'
import { PostgrestError } from '@supabase/supabase-js'

export type DeletedRow = {
  [key: string]: unknown;
}

export type DeletedRows = {
  schema: string;
  table: string;
  rows: DeletedRow[];
}
type RowDeleteProps = {
  rows: DeletedRows;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>

export default function RowDelete({ rows, ...props }: RowDeleteProps) {
  const supabase = useSupabaseClient()
  if (!rows) {
    return null
  }

  async function deleteRow(schema: string, table: string, deleted: DeletedRow) {
    let req = withSchema(supabase, schema)
      .from(table)
      .delete()
    Object.entries(deleted).forEach(([key, value]) => {
      if (value == null) {
        req = req.is(key, null)
      } else {
        req = req.eq(key, value)
      }
    })
    Object.entries(deleted).forEach(([key]) => {
      req = req.order(key)
    })
    return (await req.limit(1)).error
  }

  async function deleteRows() {
    const errors = (await Promise.all(rows.rows.map((r) => deleteRow(rows.schema, rows.table, r))))
      .filter((e) => (e !== null)) as PostgrestError[]
    return errors
  }

  return (
    <DeleteConfirmationForm
      // eslint-disable-next-line react/jsx-no-bind
      execute={deleteRows}
      failureMessage={rows.rows.length === 1 ? 'Could not delete row' : 'Could not delete rows.'}
      successMessage={rows.rows.length === 1 ? 'Row successfully deleted.' : `${rows.rows.length} rows successfully deleted.`}
      {...props}
    >
      {rows.rows.length === 1 ? 'Are you sure you want to delete this row ?' : `Are you sure you want to delete ${rows.rows.length} rows ?`}
    </DeleteConfirmationForm>
  )
}
