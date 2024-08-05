/*************************************************************************/
/*  choose-password.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { AuthLayout, UpdatePasswordForm } from '@webapps-common'

export default function ChooseAPassword() {
  return (
    <AuthLayout
      appTitle="Workspace Dashboard"
      headTitle="W4 Workspace Dashboard"
      title="Please choose a password"
    >
      <UpdatePasswordForm
        showHomePageLink={false}
        loginPageHref="/auth/login"
        homePageHref="/home"
      />
    </AuthLayout>
  )
}
