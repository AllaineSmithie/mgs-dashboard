/*************************************************************************/
/*  update-password.tsx                                                  */
/*************************************************************************/
/* Copyright MGS Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { AuthLayout, UpdatePasswordForm } from '@webapps-common'

export default function UpdatePassword() {
  return (
    <AuthLayout
      appTitle="Workspace Dashboard"
      headTitle="MGS Workspace Dashboard"
      title="Password update"
    >
      <UpdatePasswordForm
        loginPageHref="/auth/login"
        homePageHref="/home"
      />
    </AuthLayout>
  )
}
