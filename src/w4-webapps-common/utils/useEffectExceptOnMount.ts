/*************************************************************************/
/*  useEffectExceptOnMount.ts                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  DependencyList, EffectCallback, useEffect, useRef,
} from 'react'

/**
 * Identical to React.useEffect, except that it never runs on mount. This is
 * the equivalent of the componentDidUpdate lifecycle function.
 *
 * @param {function:function} effect - A useEffect effect.
 * @param {array} [dependencies] - useEffect dependency list.
 */
export default function useEffectExceptOnMount(
  effect: EffectCallback,
  dependencies: DependencyList,
) {
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) {
      const unmount = effect()
      return () => unmount && unmount()
    }
    mounted.current = true
    return () => {}
  }, dependencies)

  // Reset on unmount for the next mount.
  useEffect(() => () => { mounted.current = false }, [])
}
