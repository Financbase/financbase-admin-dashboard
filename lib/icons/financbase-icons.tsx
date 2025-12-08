/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export const FinancbaseIcon: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        fill="currentColor"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};

// Icon Key Type Definitions
export type FinancbaseIconKey =
  | "activity"
  | "dashboard"
  | "reports"
  | "analytics"
  | "transactions"
  | "accounts"
  | "budget"
  | "investments"
  | "settings"
  | "profile"
  | "notifications"
  | "help";

export type FinancialIconKey =
  | "dollar-sign"
  | "trending-up"
  | "trending-down"
  | "pie-chart"
  | "bar-chart"
  | "line-chart"
  | "wallet"
  | "credit-card"
  | "banknote"
  | "receipt";

export type FinancialOperationIconKey =
  | "income"
  | "expense"
  | "transfer"
  | "payment"
  | "deposit"
  | "withdrawal"
  | "investment"
  | "dividend"
  | "interest"
  | "fee";

export type BusinessIconKey =
  | "building"
  | "briefcase"
  | "users"
  | "file-text"
  | "calendar"
  | "target"
  | "trending-up"
  | "award"
  | "megaphone"
  | "store";

export type AIIconKey =
  | "brain"
  | "sparkles"
  | "zap"
  | "wand"
  | "lightbulb"
  | "cpu"
  | "network"
  | "layers";

export type StatusIconKey =
  | "check-circle"
  | "x-circle"
  | "alert-circle"
  | "info"
  | "clock"
  | "loader"
  | "check"
  | "x";

export type ActionIconKey =
  | "plus"
  | "minus"
  | "edit"
  | "trash"
  | "save"
  | "cancel"
  | "search"
  | "filter"
  | "download"
  | "upload"
  | "refresh"
  | "arrow-right"
  | "arrow-left";

export type UIIconKey =
  | "menu"
  | "close"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "more-vertical"
  | "more-horizontal"
  | "eye"
  | "eye-off"
  | "lock"
  | "unlock";

export type TimeIconKey =
  | "clock"
  | "calendar"
  | "calendar-days"
  | "hourglass"
  | "timer"
  | "stopwatch";

export type SecurityIconKey =
  | "shield"
  | "shield-check"
  | "shield-alert"
  | "lock"
  | "key"
  | "fingerprint";

// Icon Mapping
const iconMap: Record<string, LucideIcon> = {
  // Financbase icons
  activity: LucideIcons.Activity,
  dashboard: LucideIcons.LayoutDashboard,
  reports: LucideIcons.FileText,
  analytics: LucideIcons.BarChart3,
  transactions: LucideIcons.ArrowLeftRight,
  accounts: LucideIcons.Wallet,
  budget: LucideIcons.PieChart,
  investments: LucideIcons.TrendingUp,
  settings: LucideIcons.Settings,
  profile: LucideIcons.User,
  notifications: LucideIcons.Bell,
  help: LucideIcons.HelpCircle,

  // Financial icons
  "dollar-sign": LucideIcons.DollarSign,
  "trending-up": LucideIcons.TrendingUp,
  "trending-down": LucideIcons.TrendingDown,
  "pie-chart": LucideIcons.PieChart,
  "bar-chart": LucideIcons.BarChart3,
  "line-chart": LucideIcons.LineChart,
  wallet: LucideIcons.Wallet,
  "credit-card": LucideIcons.CreditCard,
  banknote: LucideIcons.Banknote,
  receipt: LucideIcons.Receipt,

  // Business icons
  building: LucideIcons.Building2,
  briefcase: LucideIcons.Briefcase,
  users: LucideIcons.Users,
  "file-text": LucideIcons.FileText,
  calendar: LucideIcons.Calendar,
  target: LucideIcons.Target,
  award: LucideIcons.Award,
  megaphone: LucideIcons.Megaphone,
  store: LucideIcons.Store,

  // AI icons
  brain: LucideIcons.Brain,
  sparkles: LucideIcons.Sparkles,
  zap: LucideIcons.Zap,
  wand: LucideIcons.Wand2,
  lightbulb: LucideIcons.Lightbulb,
  cpu: LucideIcons.Cpu,
  network: LucideIcons.Network,
  layers: LucideIcons.Layers,

  // Status icons
  "check-circle": LucideIcons.CheckCircle,
  "x-circle": LucideIcons.XCircle,
  "alert-circle": LucideIcons.AlertCircle,
  info: LucideIcons.Info,
  clock: LucideIcons.Clock,
  loader: LucideIcons.Loader2,
  check: LucideIcons.Check,
  x: LucideIcons.X,

  // Action icons
  plus: LucideIcons.Plus,
  minus: LucideIcons.Minus,
  edit: LucideIcons.Edit,
  trash: LucideIcons.Trash2,
  save: LucideIcons.Save,
  cancel: LucideIcons.X,
  search: LucideIcons.Search,
  filter: LucideIcons.Filter,
  download: LucideIcons.Download,
  upload: LucideIcons.Upload,
  refresh: LucideIcons.RefreshCw,
  "arrow-right": LucideIcons.ArrowRight,
  "arrow-left": LucideIcons.ArrowLeft,

  // UI icons
  menu: LucideIcons.Menu,
  close: LucideIcons.X,
  "chevron-down": LucideIcons.ChevronDown,
  "chevron-up": LucideIcons.ChevronUp,
  "chevron-left": LucideIcons.ChevronLeft,
  "chevron-right": LucideIcons.ChevronRight,
  "more-vertical": LucideIcons.MoreVertical,
  "more-horizontal": LucideIcons.MoreHorizontal,
  eye: LucideIcons.Eye,
  "eye-off": LucideIcons.EyeOff,
  lock: LucideIcons.Lock,
  unlock: LucideIcons.Unlock,

  // Time icons
  "calendar-days": LucideIcons.CalendarDays,
  hourglass: LucideIcons.Hourglass,
  timer: LucideIcons.Timer,
  stopwatch: LucideIcons.Timer, // Stopwatch not available, using Timer instead

  // Security icons
  shield: LucideIcons.Shield,
  "shield-check": LucideIcons.ShieldCheck,
  "shield-alert": LucideIcons.ShieldAlert,
  key: LucideIcons.Key,
  fingerprint: LucideIcons.Fingerprint,
};

// Financial Operation Icons
export const FinancialOperationIcons: Record<FinancialOperationIconKey, LucideIcon> = {
  income: LucideIcons.ArrowDownRight,
  expense: LucideIcons.ArrowUpRight,
  transfer: LucideIcons.ArrowLeftRight,
  payment: LucideIcons.CreditCard,
  deposit: LucideIcons.ArrowDown,
  withdrawal: LucideIcons.ArrowUp,
  investment: LucideIcons.TrendingUp,
  dividend: LucideIcons.CircleDollarSign,
  interest: LucideIcons.Percent,
  fee: LucideIcons.Coins,
};

// Category-based icon maps
const categoryIconMap: Record<string, Record<string, LucideIcon>> = {
  financial: {
    "dollar-sign": LucideIcons.DollarSign,
    "trending-up": LucideIcons.TrendingUp,
    "trending-down": LucideIcons.TrendingDown,
    "pie-chart": LucideIcons.PieChart,
    "bar-chart": LucideIcons.BarChart3,
    "line-chart": LucideIcons.LineChart,
    wallet: LucideIcons.Wallet,
    "credit-card": LucideIcons.CreditCard,
    banknote: LucideIcons.Banknote,
    receipt: LucideIcons.Receipt,
  },
  business: {
    building: LucideIcons.Building2,
    briefcase: LucideIcons.Briefcase,
    users: LucideIcons.Users,
    "file-text": LucideIcons.FileText,
    calendar: LucideIcons.Calendar,
    target: LucideIcons.Target,
    award: LucideIcons.Award,
    megaphone: LucideIcons.Megaphone,
    store: LucideIcons.Store,
  },
  ai: {
    brain: LucideIcons.Brain,
    sparkles: LucideIcons.Sparkles,
    zap: LucideIcons.Zap,
    wand: LucideIcons.Wand2,
    lightbulb: LucideIcons.Lightbulb,
    cpu: LucideIcons.Cpu,
    network: LucideIcons.Network,
    layers: LucideIcons.Layers,
  },
  status: {
    "check-circle": LucideIcons.CheckCircle,
    "x-circle": LucideIcons.XCircle,
    "alert-circle": LucideIcons.AlertCircle,
    info: LucideIcons.Info,
    clock: LucideIcons.Clock,
    loader: LucideIcons.Loader2,
    check: LucideIcons.Check,
    x: LucideIcons.X,
  },
  action: {
    plus: LucideIcons.Plus,
    minus: LucideIcons.Minus,
    edit: LucideIcons.Edit,
    trash: LucideIcons.Trash2,
    save: LucideIcons.Save,
    cancel: LucideIcons.X,
    search: LucideIcons.Search,
    filter: LucideIcons.Filter,
    download: LucideIcons.Download,
    upload: LucideIcons.Upload,
    refresh: LucideIcons.RefreshCw,
    "arrow-right": LucideIcons.ArrowRight,
    "arrow-left": LucideIcons.ArrowLeft,
  },
  ui: {
    menu: LucideIcons.Menu,
    close: LucideIcons.X,
    "chevron-down": LucideIcons.ChevronDown,
    "chevron-up": LucideIcons.ChevronUp,
    "chevron-left": LucideIcons.ChevronLeft,
    "chevron-right": LucideIcons.ChevronRight,
    "more-vertical": LucideIcons.MoreVertical,
    "more-horizontal": LucideIcons.MoreHorizontal,
    eye: LucideIcons.Eye,
    "eye-off": LucideIcons.EyeOff,
    lock: LucideIcons.Lock,
    unlock: LucideIcons.Unlock,
  },
  time: {
    clock: LucideIcons.Clock,
    calendar: LucideIcons.Calendar,
    "calendar-days": LucideIcons.CalendarDays,
    hourglass: LucideIcons.Hourglass,
    timer: LucideIcons.Timer,
    stopwatch: LucideIcons.Timer, // Stopwatch not available, using Timer instead
  },
  security: {
    shield: LucideIcons.Shield,
    "shield-check": LucideIcons.ShieldCheck,
    "shield-alert": LucideIcons.ShieldAlert,
    lock: LucideIcons.Lock,
    key: LucideIcons.Key,
    fingerprint: LucideIcons.Fingerprint,
  },
};

/**
 * Get a Financbase icon by name
 */
export function getFinancbaseIcon(name: FinancbaseIconKey): LucideIcon {
  const icon = iconMap[name];
  if (!icon) {
    console.warn(`Icon "${name}" not found, using Activity as fallback`);
    return LucideIcons.Activity;
  }
  return icon;
}

/**
 * Get an icon by category and key
 */
export function getIconByCategory(
  category: "financial" | "business" | "ai" | "status" | "action" | "ui" | "time" | "security",
  key: string
): LucideIcon {
  const categoryMap = categoryIconMap[category];
  if (!categoryMap) {
    console.warn(`Category "${category}" not found, using Activity as fallback`);
    return LucideIcons.Activity;
  }

  const icon = categoryMap[key];
  if (!icon) {
    console.warn(`Icon "${key}" not found in category "${category}", using Activity as fallback`);
    return LucideIcons.Activity;
  }
  return icon;
}

