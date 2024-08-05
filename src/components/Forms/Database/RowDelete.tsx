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
} from '../Common/ModalForm'

export type RowDeleted = {
  schema: string;
  table: string;
  row: {
    [key: string]: unknown;
  };
}
type RowDeleteProps = {
  deleted?: RowDeleted;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function RowDelete({ deleted, ...props }: RowDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => {
        let req = withSchema(supabase, deleted.schema)
          .from(deleted.table)
          .delete()
        Object.entries(deleted.row).forEach(([key, value]) => {
          req = req.eq(key, value)
        })
        Object.entries(deleted.row).forEach(([key]) => {
          req = req.order(key)
        })
        return (await req.limit(1)).error
      }}
      failureMessage="Could not delete row."
      successMessage="Row successfully deleted."
      {...props}
    >
      Are you sure you want to delete this row ?
    </DeleteConfirmationForm>
  )
}
