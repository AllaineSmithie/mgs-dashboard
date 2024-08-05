/*************************************************************************/
/*  FileDelete.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import * as pathLib from 'path'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { toast } from 'react-toastify'
import {
  DeleteConfirmationForm,
  ConfirmationFormProps,
} from '../Common/ModalForm'

export type FilesDeleted = {
  bucket: string;
  path: string;
  files: {
    name: string;
    isDir: boolean;
  }[];
}
type FilesDeletedProps = {
  deleted?: FilesDeleted;
} & Omit<
ConfirmationFormProps,
'execute' | 'failureMessage' | 'successMessage'
>
export default function FilesDelete({ deleted, ...props }: FilesDeletedProps) {
  const supabase = useSupabaseClient()
  if (!deleted) {
    return null
  }
  return (
    <DeleteConfirmationForm
      execute={async () => {
        // Delete files.
        const fileList = deleted.files
        const fileListFiltered = fileList.filter((el) => !el.isDir)
        if (fileList.length !== fileListFiltered.length) {
          toast.warning(
            'Folders cannot be deleted directly. Delete their content instead.',
          )
        }
        if (fileListFiltered.length === 0) {
          return undefined
        }

        const asStr = fileListFiltered.map((el) => pathLib.join(deleted.path, el.name))
        const res = await supabase.storage
          .from(deleted.bucket)
          .remove(asStr)
        return res.error
      }}
      failureMessage="Could not delete file(s)."
      successMessage={`${deleted.files.length} file(s) successfully deleted.`}
      {...props}
    >
      Are you sure you want to delete the following files:
      {' '}
      <ul>
        {deleted.files.map((el) => (
          <li key={el.name}>{el.name}</li>
        ))}
      </ul>
    </DeleteConfirmationForm>
  )
}
