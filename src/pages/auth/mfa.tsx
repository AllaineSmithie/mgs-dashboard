/*************************************************************************/
/*  mfa.tsx                                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { AuthLayout } from '@webapps-common'
import { TwoFactorAuthenticationVerifyForm } from '@webapps-common/UI/Auth/TwoFactorAuthenticationVerifyForm'

export default function MFA() {
  return (
    <AuthLayout
      appTitle="Workspace Dashboard"
      headTitle="W4 Workspace Dashboard"
      title="Multi-factor authentication"
    >
      <TwoFactorAuthenticationVerifyForm
        homePageHref="/home/"
        loginPageHref="/auth/login"
      />
    </AuthLayout>
  )
}
