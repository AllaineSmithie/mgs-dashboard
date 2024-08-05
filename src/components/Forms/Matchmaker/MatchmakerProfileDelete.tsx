/*************************************************************************/
/*  MatchmakerProfileDelete.tsx                                          */
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

export type MatchmakerProfileDeleted = {
  id: string;
  name: string;
}
type MatchmakerProfileDeleteProps = {
  deleted?: MatchmakerProfileDeleted;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function MatchmakerProfileDelete({
  deleted,
  ...props
}: MatchmakerProfileDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => (await withSchema(supabase, 'w4online')
        .from('matchmaker_profile')
        .delete()
        .eq('id', deleted.id)).error}
      failureMessage={`Could not delete matchmaking profile: ${deleted.name}`}
      successMessage={`Matchmaking profile ${deleted.name} successfully deleted.`}
      {...props}
    >
      {`Are you sure you want to delete matchmaking profile "${deleted.name}" ?`}
    </DeleteConfirmationForm>
  )
}
