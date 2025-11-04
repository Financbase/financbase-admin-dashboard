/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import * as React from "react"

type UseCounterReturn = {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  setCount: React.Dispatch<React.SetStateAction<number>>
}

function useCounter(initialValue?: number): UseCounterReturn {
  const [count, setCount] = React.useState(initialValue ?? 0)

  const increment = React.useCallback(() => {
    setCount((x) => x + 1)
  }, [])

  const decrement = React.useCallback(() => {
    setCount((x) => x - 1)
  }, [])

  const reset = React.useCallback(() => {
    setCount(initialValue ?? 0)
  }, [initialValue])

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
  }
}

export { useCounter }
