/*************************************************************************/
/*  utils.ts                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

// Iterate up the DOM tree to calculate DropdownToggle's total z-index
const getCumulativeZIndex = (element: HTMLDivElement) => {
  let totalZIndex = 0
  let currentElement = element

  // Iterate up the DOM tree
  while (currentElement && currentElement !== document.body) {
    const style = window.getComputedStyle(currentElement)
    const zIndex = parseInt(style.zIndex, 10)

    // Only consider the element if it is positioned and has a z-index other than 'auto'
    if (style.position !== 'static' && !Number.isNaN(zIndex)) {
      totalZIndex += zIndex
    }

    currentElement = currentElement.parentElement as HTMLDivElement // Move up the tree
  }

  return totalZIndex
}

export default getCumulativeZIndex
