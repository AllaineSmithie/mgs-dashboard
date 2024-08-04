/*************************************************************************/
/*  UserUnban.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import React from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import Modal from '@webapps-common/UI/Modal'

export type UserUnbanned = {
  id: string;
  unbanned?: string;
  email?: string;
}

type UserUnbanProps = {
  show: boolean;
  unbanned?: UserUnbanned;
  onClose: () => void;
  onSave: () => void;
}
export default function UserUnban({
  show,
  unbanned,
  onClose,
  onSave = onClose,
}: UserUnbanProps) {
  const supabase = useSupabaseClient()

  if (!unbanned) {
    return null
  }

  const userIDString = unbanned.email || unbanned.id

  const unbanUser = async (event: React.FormEvent) => {
    event.preventDefault()

    // Update a user.
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    const res = await supabaseAuthAdmin.updateUserById(unbanned.id, {
      ban_duration: 'none',
    })
    if (res.error) {
      toast.error(`Could not unban user: ${res.error?.message}`)
      return
    }
    toast.success('User successfully unbanned.')
    onSave()
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={unbanUser}>
        <Modal.Header closeButton>
          <Modal.Title>Unban</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to unban user:
          {' '}
          {userIDString}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Unban</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
