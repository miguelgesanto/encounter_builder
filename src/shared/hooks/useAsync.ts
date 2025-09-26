import { useState, useEffect, useCallback } from 'react'

export interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: () => Promise<T>
  reset: () => void
}

/**
 * Hook for handling async operations with loading and error states
 */
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncReturn<T> => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null
  })

  const execute = useCallback(async (): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      setState({ data: null, loading: false, error: errorObj })
      throw errorObj
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // Error already handled in execute function
      })
    }
  }, [execute, immediate])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Hook for handling async operations that can be called manually
 */
export const useAsyncCallback = <T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
): [UseAsyncState<T>, (...args: Args) => Promise<T>] => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (...args: Args): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await asyncFunction(...args)
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      setState({ data: null, loading: false, error: errorObj })
      throw errorObj
    }
  }, [asyncFunction])

  return [state, execute]
}