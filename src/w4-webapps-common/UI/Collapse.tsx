/*************************************************************************/
/*  Collapse.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

export type CollapseProps = {
  show: boolean;
  animation?: boolean;
} & React.PropsWithChildren

export default function Collapse({
  show,
  animation = true,
  children,
}: CollapseProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateRows: show ? '1fr' : '0fr',
        transition: animation ? 'grid-template-rows 250ms ease' : 'none',
      }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
