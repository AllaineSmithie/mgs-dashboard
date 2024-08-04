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
} from '@webapps-common/UI/Form/ModalForm'

export type DeletedBuild = {
  id: string;
  name: string;
}
export type BuildDeleteProps = {
  builds: DeletedBuild[];
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function BuildDelete({ builds, ...props }: BuildDeleteProps) {
  const supabase = useSupabaseClient()
  if (!builds) {
    return null
  }

  async function deleteBuilds() {
    const { error } = await withSchema(supabase, 'w4online').from('gameserver_build').delete().in('name', builds.map((b) => b.name))
    return error
  }

  return (
    <DeleteConfirmationForm
      // eslint-disable-next-line react/jsx-no-bind
      execute={deleteBuilds}
      failureMessage={builds.length === 1 ? `Could not delete build: ${builds[0].name}` : 'Could not delete builds.'}
      successMessage={builds.length === 1 ? `Build ${builds[0].name} successfully deleted.` : 'Build successfully deleted.'}
      {...props}
    >
      {builds.length === 1 ? `Are you sure you want to delete build "${builds[0].name}" ?` : `Are you sure you want to delete ${builds.length} builds ?`}
    </DeleteConfirmationForm>
  )
}
