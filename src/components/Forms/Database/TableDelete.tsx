/*************************************************************************/
/*  TableDelete.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { DeleteConfirmationForm } from '@webapps-common/UI/Form/ModalForm'
import usePGMetaClient from 'src/hooks/usePGMetaClient'

type TableDeleteProps = {
  tableName: string;
  show: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TableDelete({
  tableName, show, onCancel, onSuccess,
}: TableDeleteProps) {
  const { tables } = usePGMetaClient()

  async function deleteTable() {
    const { error } = await tables.delete(tableName)
    if (error) return { message: error }
    return null
  }

  if (!show) return null
  return (
    <DeleteConfirmationForm
      show={show}
      // eslint-disable-next-line react/jsx-no-bind
      execute={deleteTable}
      failureMessage={`Could not delete table: ${tableName}`}
      successMessage={`${tableName} successfully deleted.`}
      onCancel={onCancel}
      onSuccess={onSuccess}
    >
      {`Are you sure you want to delete table "${tableName}" ?`}
    </DeleteConfirmationForm>
  )
}
