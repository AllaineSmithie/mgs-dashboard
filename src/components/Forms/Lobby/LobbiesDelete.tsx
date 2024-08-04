/*************************************************************************/
/*  LobbiesDelete.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import withSchema from '@services/withSchema'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { PostgrestError } from '@supabase/supabase-js'
import { ConfirmationFormProps, DeleteConfirmationForm } from '@webapps-common/UI/Form/ModalForm'

export type DeletedLobby = {
  id: string;
}
export type LobbyDeleteProps = {
  lobbies: DeletedLobby[];
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function LobbyDelete({ lobbies, ...props }: LobbyDeleteProps) {
  const supabase = useSupabaseClient()
  if (!lobbies) {
    return null
  }

  async function deleteLobby(lobby: DeletedLobby) {
    const { error } = await withSchema(supabase, 'w4online').rpc('lobby_delete', { lobby_id: lobby.id })
    return error
  }

  async function deleteLobbies() {
    const errors = (await Promise.all(lobbies.map((l) => deleteLobby(l))))
      .filter((e) => (e !== null)) as PostgrestError[]
    return errors
  }

  return (
    <DeleteConfirmationForm
      // eslint-disable-next-line react/jsx-no-bind
      execute={deleteLobbies}
      failureMessage={lobbies.length === 1 ? `Could not delete lobby: ${lobbies[0].id}` : 'Could not delete lobbies.'}
      successMessage={lobbies.length === 1 ? `${lobbies[0].id} successfully deleted.` : 'Lobbies successfully deleted.'}
      {...props}
    >
      {lobbies.length === 1 ? `Are you sure you want to delete lobby "${lobbies[0].id}" ?` : `Are you sure you want to delete ${lobbies.length} lobbies ?`}
    </DeleteConfirmationForm>
  )
}
