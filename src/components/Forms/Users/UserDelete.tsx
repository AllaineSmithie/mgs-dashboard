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
} from '@webapps-common/UI/Form/ModalForm'
import { AuthError } from '@supabase/supabase-js'

export type DeletedUser = {
  id: string;
  email?: string;
}
type UserDeleteProps = {
  users: DeletedUser[];
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function UserDelete({ users, ...props }: UserDeleteProps) {
  const supabase = useSupabaseClient()
  if (!users) {
    return null
  }

  async function deleteUser(user: DeletedUser) {
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    return (await supabaseAuthAdmin.deleteUser(user.id)).error
  }

  async function deleteUsers() {
    const errors = (await Promise.all(users.map((l) => deleteUser(l))))
      .filter((e) => (e !== null)) as AuthError[]
    return errors
  }

  const userIDString = users.length === 1 ? users[0].email || users[0].id : ''
  return (
    <DeleteConfirmationForm
      // eslint-disable-next-line react/jsx-no-bind
      execute={deleteUsers}
      failureMessage={users.length === 1 ? `Could not delete user: ${userIDString}` : 'Could not delete users.'}
      successMessage={users.length === 1 ? `User ${userIDString} successfully deleted.` : 'Users successfully deleted.'}
      {...props}
    >
      {users.length === 1 ? `Are you sure you want to delete user "${userIDString}" ?` : `Are you sure you want to delete ${users.length} users ?`}
    </DeleteConfirmationForm>
  )
}
