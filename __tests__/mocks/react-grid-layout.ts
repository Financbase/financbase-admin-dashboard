/**
 * Mock for react-grid-layout package
 * Used in tests when the package is not installed
 */
import React from 'react'

export const Responsive = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'responsive-grid', ...props }, children)

export const WidthProvider = (component: any) => component

export const Layout = {} as any

export default {
  Responsive,
  WidthProvider,
  Layout,
}

