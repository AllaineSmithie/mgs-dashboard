/*************************************************************************/
/*  BucketDelete.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { DeleteConfirmationForm, DeleteConfirmationFormProps } from '@webapps-common/UI/Form/ModalForm'

export type BucketDeleted = {
  name: string;
}
type BucketDeleteProps = {
  deleted?: BucketDeleted;
} & Omit<
DeleteConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function BucketDelete({ deleted, ...props }: BucketDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => {
        const { error } = await supabase.storage.emptyBucket(deleted.name)
        if (error) {
          return error
        }
        return (await supabase.storage.deleteBucket(deleted.name)).error
      }}
      failureMessage={`Could not delete bucket: ${deleted.name}`}
      successMessage={`${deleted.name} successfully deleted.`}
      {...props}
    >
      {`Are you sure you want to delete bucket "${deleted.name}" ?`}
    </DeleteConfirmationForm>
  )
}
