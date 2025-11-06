/**
 * Type declarations for react-grid-layout
 * Note: Install the package with: npm install react-grid-layout @types/react-grid-layout
 */

declare module 'react-grid-layout' {
  import { Component, CSSProperties } from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
  }

  export interface ResponsiveLayout {
    lg?: Layout[];
    md?: Layout[];
    sm?: Layout[];
    xs?: Layout[];
    xxs?: Layout[];
  }

  export interface GridLayoutProps {
    className?: string;
    style?: CSSProperties;
    width?: number;
    autoSize?: boolean;
    cols?: number;
    draggableCancel?: string;
    draggableHandle?: string;
    verticalCompact?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
    layout?: Layout[];
    margin?: [number, number];
    containerPadding?: [number, number];
    rowHeight?: number;
    maxRows?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    isBounded?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    onLayoutChange?: (layout: Layout[]) => void;
    onDragStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDrag?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDragStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResizeStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResize?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResizeStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    children?: React.ReactNode;
  }

  export interface ResponsiveProps extends GridLayoutProps {
    layouts?: ResponsiveLayout;
    breakpoints?: { [key: string]: number };
    cols?: { [key: string]: number };
    onBreakpointChange?: (newBreakpoint: string, cols: number) => void;
    onLayoutChange?: (layout: Layout[], layouts: ResponsiveLayout) => void;
    onWidthChange?: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;
  }

  export class Responsive extends Component<ResponsiveProps> {}
  export class GridLayout extends Component<GridLayoutProps> {}

  export function WidthProvider<P extends object>(component: ComponentType<P>): ComponentType<P & { measureBeforeMount?: boolean; }>;
  
  export type { Layout, ResponsiveLayout };
}

