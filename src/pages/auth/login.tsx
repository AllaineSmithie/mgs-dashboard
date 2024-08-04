/*************************************************************************/
/*  login.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { AuthLayout, LoginForm } from '@webapps-common'

export default function Login() {
  return (
    <AuthLayout
      appTitle="Workspace Dashboard"
      headTitle="W4 Workspace Dashboard"
      title="Login"
    >
      <LoginForm
        homePageHref="/home/"
        forgottedPasswordPageHref="/auth/forgotten-password"
      />
    </AuthLayout>
  )
}
