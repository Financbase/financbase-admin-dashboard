/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks'
import { useLocalStorage } from '@/hooks'

interface DashboardSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

export function DashboardSearch({ 
  onSearch, 
  placeholder = "Search transactions, clients, or reports...",
  className = ""
}: DashboardSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [savedSearches, setSavedSearches] = useLocalStorage<string[]>('dashboard-searches', [])
  const debouncedSearch = useDebounce(searchQuery, 300)

  React.useEffect(() => {
    if (debouncedSearch && onSearch) {
      onSearch(debouncedSearch)
    }
  }, [debouncedSearch, onSearch])

  const handleSearch = () => {
    if (searchQuery.trim() && !savedSearches.includes(searchQuery.trim())) {
      setSavedSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)])
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  const useSavedSearch = (savedQuery: string) => {
    setSearchQuery(savedQuery)
    if (onSearch) {
      onSearch(savedQuery)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Recent Searches */}
      {savedSearches.length > 0 && !searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2">Recent searches</div>
            {savedSearches.slice(0, 3).map((savedQuery, index) => (
              <button
                key={index}
                onClick={() => useSavedSearch(savedQuery)}
                className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
              >
                {savedQuery}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
