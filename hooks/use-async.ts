"use client"

import { useState, useEffect, useCallback } from 'react'

export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(() => {
    setStatus('pending')
    setData(null)
    setError(null)

    return asyncFunction()
      .then((response) => {
        setData(response)
        setStatus('success')
        return response
      })
      .catch((error) => {
        setError(error)
        setStatus('error')
        throw error
      })
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, data, error, isLoading: status === 'pending' }
}
