/*************************************************************************/
/*  fontawesome-custom.d.ts                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

// types/fontawesome-custom.d.ts
import { IconPrefix as OriginalIconPrefix, IconName as OriginalIconName } from '@fortawesome/fontawesome-common-types'

declare module '@fortawesome/fontawesome-common-types' {
  export type IconPrefix = OriginalIconPrefix | 'fac'
  export type IconName = OriginalIconName | 'godot'
}
