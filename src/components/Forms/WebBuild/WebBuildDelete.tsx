/*************************************************************************/
/*  WebBuildDelete.tsx                                                   */
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
import { PostgrestError } from '@supabase/supabase-js'

export type DeletedWebBuild = {
  name: string;
  slug: string;
}
export type WebBuildDeleteProps = {
  webBuilds: DeletedWebBuild[];
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function WebBuildDelete({ webBuilds, ...props }: WebBuildDeleteProps) {
  const supabase = useSupabaseClient()
  if (!webBuilds) {
    return null
  }

  async function deleteBuild(webBuild: DeletedWebBuild) {
    const { error } = await withSchema(supabase, 'w4online').rpc('web_build_delete', {
      slug: webBuild.slug,
    })
    return error
  }
  async function deleteBuilds() {
    const errors = (await Promise.all(webBuilds.map((wb) => deleteBuild(wb))))
      .filter((e) => (e !== null)) as PostgrestError[]
    return errors
  }

  return (
    <DeleteConfirmationForm
      // eslint-disable-next-line react/jsx-no-bind
      execute={deleteBuilds}
      failureMessage={webBuilds.length === 1 ? `Could not delete web build: ${webBuilds[0].name}` : 'Could not delete web builds.'}
      successMessage={webBuilds.length === 1 ? `Web build ${webBuilds[0].name} successfully deleted.` : 'Web build successfully deleted.'}
      {...props}
    >
      {webBuilds.length === 1 ? `Are you sure you want to delete web build "${webBuilds[0].name}" ?` : `Are you sure you want to delete ${webBuilds.length} web builds ?`}
    </DeleteConfirmationForm>
  )
}
