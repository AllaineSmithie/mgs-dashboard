/*************************************************************************/
/*  UserDelete.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import {
  DeleteConfirmationForm,
  ConfirmationFormProps,
} from '../Common/ModalForm'

export type UserDeleted = {
  id: string;
  email?: string;
}
type UserDeleteProps = {
  deleted?: UserDeleted;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function UserDelete({ deleted, ...props }: UserDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  const userIDString = deleted.email || deleted.id
  return (
    <DeleteConfirmationForm
      execute={async () => {
        const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
        return (await supabaseAuthAdmin.deleteUser(deleted.id)).error
      }}
      failureMessage={`Could not delete user: ${userIDString}`}
      successMessage={`User ${userIDString} successfully deleted.`}
      {...props}
    >
      {`Are you sure you want to delete user "${userIDString}" ?`}
    </DeleteConfirmationForm>
  )
}
