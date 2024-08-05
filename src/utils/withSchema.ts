import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestClient } from '@supabase/postgrest-js'

export default function withSchema<Database, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database>(
  supabase : SupabaseClient<Database, SchemaName>,
  schema : string,
) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const castedAsAny = supabase as any
  const supabaseUrl = stripTrailingSlash(castedAsAny.supabaseUrl)
  return new PostgrestClient(`${supabaseUrl}/rest/v1`, {
    headers: castedAsAny.headers,
    schema,
    fetch: castedAsAny.fetch,
  })
}

// Copied from supabase-js/helpers
function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}
