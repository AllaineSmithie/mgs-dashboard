import { useEffect, useRef } from 'react'

export default function useHasMounted() {
  const hasMounted = useRef(false)

  useEffect(() => {
    hasMounted.current = true
  }, [])

  return hasMounted.current
}
