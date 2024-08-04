/*************************************************************************/
/*  godot-icon.ts                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-common-types'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import pathData from './path-data.json'

const godotIcon: IconDefinition = {
  prefix: 'fac' as IconPrefix,
  iconName: 'godot' as IconName,
  icon: [
    16, // width
    16, // height
    [], // ligatures
    '', // unicode
    pathData.godot.join(' '),
  ],
}

// This workaround is necessary according to FontAwesome's docs:
// https://docs.fontawesome.com/web/use-with/react/add-icons
// (see the "Typescript and custom icons" section)
// @ts-ignore
const faGodot : IconProp = ['fac', 'godot']

export {
  godotIcon, // used in _app.tsx to add the icon to the library
  faGodot, // import it in a file to use it like so: <FontAwesomeIcon icon={faGodot} />
}
