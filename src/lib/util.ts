import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export function errorString(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

export function useLoadingToast(isLoading: boolean, message: string) {
  const loadingToastId = useRef<string | null>(null)
  useEffect(() => {
    if (isLoading && loadingToastId.current === null) {
      loadingToastId.current = toast.loading(message)
    } else if (!isLoading && loadingToastId.current !== null) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = null
    }
  }, [isLoading, message])
}
