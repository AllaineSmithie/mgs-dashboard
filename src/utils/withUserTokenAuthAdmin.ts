/*************************************************************************/
/*  withUserTokenAuthAdmin.ts                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { SupabaseClient, GoTrueAdminApi } from '@supabase/supabase-js'

export default async function withUserTokenAuthAdmin<Database, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database>(
  supabase : SupabaseClient<Database, SchemaName>,
) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const adminGoTrueClientAsAny = Object.create(supabase.auth.admin) as any
  adminGoTrueClientAsAny.headers = { ...adminGoTrueClientAsAny.headers }
  adminGoTrueClientAsAny.headers.Authorization = `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
  return adminGoTrueClientAsAny as GoTrueAdminApi
}
