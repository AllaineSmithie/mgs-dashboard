/*************************************************************************/
/*  GraphDefs.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

export default function GraphDefs() {
  return (
    <svg width={0} height={0} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pattern-starting-servers" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(0)">
          <line x1="0" y="0" x2="0" y2="20" stroke="#4F98CA" strokeWidth="10" />
        </pattern>
        <pattern id="pattern-stopping-servers" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(0)">
          <line x1="0" y="0" x2="0" y2="20" stroke="#9999BB" strokeWidth="10" />
        </pattern>
      </defs>
    </svg>
  )
}
