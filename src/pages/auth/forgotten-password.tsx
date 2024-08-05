/*************************************************************************/
/*  forgotten-password.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { AuthLayout, ForgottenPasswordForm } from '@webapps-common'

export default function ForgottenPassword() {
  return (
    <AuthLayout
      appTitle="Workspace Dashboard"
      headTitle="W4 Workspace Dashboard"
      title="Password recovery"
    >
      <ForgottenPasswordForm
        updatePasswordRedirectTo="/auth/update-password"
        loginPageHref="/auth/login"
        homePageHref="/home/"
      />
    </AuthLayout>
  )
}
