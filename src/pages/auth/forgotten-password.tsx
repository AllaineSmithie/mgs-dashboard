/*************************************************************************/
/*  forgotten-password.tsx                                               */
/*************************************************************************/
/* Copyright MGS Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { AuthLayout, ForgottenPasswordForm } from '@webapps-common'

export default function ForgottenPassword() {
  return (
    <AuthLayout
      appTitle="Workspace Dashboard"
      headTitle="MGS Workspace Dashboard"
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
