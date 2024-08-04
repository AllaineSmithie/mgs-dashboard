/*************************************************************************/
/*  BackupCreate.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import withSchema from '@services/withSchema'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { ConfirmationForm, ConfirmationFormProps } from '@webapps-common/UI/Form/ModalForm'

export type BucketDeleted = {
  name: string;
}
type BackupCreateProps = Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function BackupCreate({ ...props }: BackupCreateProps) {
  const supabase = useSupabaseClient()
  return (
    <ConfirmationForm
      execute={async () => (await withSchema(supabase, 'w4backup').rpc('backup_create')).error}
      failureMessage="Could not schedule a new backup."
      successMessage="Backup successfully scheduled."
      confirmButtonText="Execute"
      {...props}
    >
      Are you sure you want to schedule a new backup ?
    </ConfirmationForm>
  )
}
