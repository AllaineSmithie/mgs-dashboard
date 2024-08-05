/*************************************************************************/
/*  BuildDelete.tsx                                                      */
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

export type BuildDeleted = {
  id: string;
  name: string;
}
type BuildDeleteProps = {
  deleted?: BuildDeleted;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function BuildDelete({ deleted, ...props }: BuildDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => (await withSchema(supabase, 'w4online').from('gameserver_build').delete().eq('name', deleted.name)).error}
      failureMessage={`Could not delete build: ${deleted.name}`}
      successMessage={`${deleted.name} successfully deleted.`}
      {...props}
    >
      {`Are you sure you want to delete build "${deleted.name}" ?`}
    </DeleteConfirmationForm>
  )
}
