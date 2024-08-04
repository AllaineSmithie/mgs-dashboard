/*************************************************************************/
/*  BackupDelete.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import withSchema from '@services/withSchema'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { DeleteConfirmationForm, DeleteConfirmationFormProps } from '@webapps-common/UI/Form/ModalForm'

export type BackupDeleted = {
  id: string;
}
type BackupDeleteProps = {
  deleted?: BackupDeleted;
} & Omit<
DeleteConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function BackupDelete({ deleted, ...props }: BackupDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => (await withSchema(supabase, 'w4backup').rpc('backup_delete', {
        backup_id: deleted.id,
      })).error}
      failureMessage="Could not delete backup."
      successMessage="Backup successfully deleted."
      {...props}
    >
      {`Are you sure you want to delete backup "${deleted.id}" ?`}
    </DeleteConfirmationForm>
  )
}
