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

export function useUnmount(func: () => void) {
  const funcRef = React.useRef(func)

  funcRef.current = func

  React.useEffect(
    () => () => {
      funcRef.current()
    },
    []
  )
}
