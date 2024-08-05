/*************************************************************************/
/*  FleetDelete.tsx                                                      */
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

export type FleetDeleted = {
  name: string;
}
type FleetDeleteProps = {
  deleted?: FleetDeleted;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function FleetDelete({ deleted, ...props }: FleetDeleteProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => (await withSchema(supabase, 'w4online').rpc('fleet_delete', {
        name: deleted.name,
      })).error}
      failureMessage={`Could not delete fleet: ${deleted.name}`}
      successMessage={`Fleet ${deleted.name} successfully deleted.`}
      {...props}
    >
      {`Are you sure you want to delete fleet "${deleted.name}" ?`}
    </DeleteConfirmationForm>
  )
}
