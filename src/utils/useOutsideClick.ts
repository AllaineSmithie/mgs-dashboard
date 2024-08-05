'use client'

import { useEffect } from 'react'

const useOutsideClick = (
  className: string,
  callback: () => void,
) => {
  const handleOutsideClick = (ev: MouseEvent) => {
    const target = ev.target as Element
    if (target.closest(`.${className}`)) {
      return
    }
    callback()
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  })
}

export default useOutsideClick
