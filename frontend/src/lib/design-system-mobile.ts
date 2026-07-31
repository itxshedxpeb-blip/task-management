/**
 * Material Design 3 Mobile-First Design System
 * 
 * This design system is optimized for mobile devices with proper touch targets,
 * spacing, typography, and component patterns following Android Material Design 3.
 */

// ============================================================================
// SPACING SYSTEM (Mobile-First)
// ============================================================================
export const spacing = {
  xs: '4px',   // 0.25rem - Micro spacing
  sm: '8px',   // 0.5rem  - Small spacing
  md: '12px',  // 0.75rem - Medium spacing
  lg: '16px',  // 1rem    - Standard spacing
  xl: '20px',  // 1.25rem - Large spacing
  '2xl': '24px', // 1.5rem  - Extra large
  '3xl': '32px', // 2rem    - Section spacing
  '4xl': '48px', // 3rem    - Page margins
  '5xl': '64px', // 4rem    - Hero spacing
} as const;

// ============================================================================
// TYPOGRAPHY (Mobile-Optimized)
// ============================================================================
export const typography = {
  // Display
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    letterSpacing: '0px',
  },
  
  // Headline
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0px',
  },
  
  // Title
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.15px',
    fontWeight: 500,
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
    fontWeight: 500,
  },
  
  // Body
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.4px',
  },
  
  // Label
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
    fontWeight: 500,
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
    fontWeight: 500,
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
    fontWeight: 500,
  },
} as const;

// ============================================================================
// TOUCH TARGETS (Material Design Guidelines)
// ============================================================================
export const touchTargets = {
  minimum: '48px',  // Minimum touch target size
  comfortable: '56px', // Comfortable touch target
  large: '64px',   // Large touch target for important actions
} as const;

// ============================================================================
// BORDER RADIUS (Material Design 3)
// ============================================================================
export const borderRadius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  full: '9999px',
} as const;

// ============================================================================
// ELEVATION (Material Design 3)
// ============================================================================
export const elevation = {
  level0: '0px 0px 0px rgba(0,0,0,0)',
  level1: '0px 1px 2px rgba(0,0,0,0.12), 0px 0px 2px rgba(0,0,0,0.08)',
  level2: '0px 2px 4px rgba(0,0,0,0.12), 0px 0px 4px rgba(0,0,0,0.08)',
  level3: '0px 4px 8px rgba(0,0,0,0.14), 0px 0px 8px rgba(0,0,0,0.08)',
  level4: '0px 8px 16px rgba(0,0,0,0.16), 0px 0px 16px rgba(0,0,0,0.08)',
  level5: '0px 12px 24px rgba(0,0,0,0.18), 0px 0px 24px rgba(0,0,0,0.08)',
} as const;

// ============================================================================
// ANIMATION (Material Design 3)
// ============================================================================
export const animation = {
  duration: {
    fast: '150ms',
    standard: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },
  easing: {
    emphasized: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    standard: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerated: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  },
} as const;

// ============================================================================
// MOBILE-SPECIFIC PATTERNS
// ============================================================================

// Bottom navigation heights
export const bottomNav = {
  height: '56px',
  heightLarge: '80px',
  itemMaxWidth: '168px',
} as const;

// App bar heights
export const appBar = {
  height: '56px',
  heightLarge: '64px',
  heightCompact: '48px',
} as const;

// Card patterns
export const card = {
  padding: '16px',
  paddingLarge: '20px',
  borderRadius: '16px',
  elevation: 'level2',
} as const;

// List item patterns
export const listItem = {
  height: '56px',
  heightLarge: '72px',
  paddingX: '16px',
  iconSize: '24px',
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS (Mobile-First)
// ============================================================================
export const breakpoints = {
  xs: '320px',   // Small phones
  sm: '360px',   // Standard phones
  md: '375px',   // Large phones
  lg: '390px',   // Extra large phones
  xl: '412px',   // Max phones
  '2xl': '430px', // Ultra large phones
  tablet: '600px',   // Small tablets
  laptop: '768px',   // Large tablets
  desktop: '1024px', // Desktop
} as const;

// ============================================================================
// UTILITY CLASSES FOR MOBILE-FIRST DESIGN
// ============================================================================
export const mobileUtils = {
  // Prevent horizontal scroll
  noHorizontalScroll: 'overflow-x-hidden',
  
  // Safe area padding for notched devices
  safeAreaTop: 'pt-safe-area-top',
  safeAreaBottom: 'pb-safe-area-bottom',
  safeAreaLeft: 'pl-safe-area-left',
  safeAreaRight: 'pr-safe-area-right',
  
  // Touch-friendly
  touchTarget: 'min-h-[48px] min-w-[48px]',
  touchTargetLarge: 'min-h-[56px] min-w-[56px]',
  
  // Typography utilities
  textMobile: 'text-base leading-relaxed',
  textMobileSmall: 'text-sm leading-relaxed',
  
  // Spacing utilities
  sectionSpacing: 'py-4 px-4',
  pageSpacing: 'py-6 px-4',
  
  // Card utilities
  mobileCard: 'rounded-2xl p-4 shadow-md',
  mobileCardCompact: 'rounded-xl p-3 shadow-sm',
} as const;

// ============================================================================
// COMPONENT PATTERNS
// ============================================================================

// Mobile button variants
export const mobileButton = {
  base: 'min-h-[48px] px-4 rounded-xl font-medium transition-all duration-200',
  primary: 'bg-primary text-primary-foreground shadow-md active:scale-95',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm active:scale-95',
  outline: 'border-2 border-input bg-background active:scale-95',
  ghost: 'bg-transparent active:bg-accent/50',
  fab: 'w-14 h-14 rounded-full shadow-lg',
} as const;

// Mobile input variants
export const mobileInput = {
  base: 'min-h-[48px] px-4 rounded-xl border-2 transition-all duration-200',
  default: 'border-input bg-background',
  focused: 'border-primary ring-2 ring-primary/20',
  error: 'border-destructive ring-2 ring-destructive/20',
} as const;

// Mobile card variants
export const mobileCard = {
  base: 'rounded-2xl transition-all duration-200',
  elevated: 'bg-card shadow-md active:scale-[0.98]',
  filled: 'bg-secondary border-0',
  outlined: 'bg-card border-2 border-input',
} as const;

// ============================================================================
// ICON SIZES (Mobile-Optimized)
// ============================================================================
export const iconSizes = {
  xs: '16px',
  sm: '18px',
  md: '20px',
  lg: '24px',
  xl: '28px',
  '2xl': '32px',
} as const;

// ============================================================================
// COLOR SYSTEM EXTENSIONS (Mobile-Specific)
// ============================================================================
export const mobileColors = {
  // Status colors with proper contrast
  success: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    bgLight: 'bg-emerald-500/10',
  },
  warning: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    bgLight: 'bg-amber-500/10',
  },
  error: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    bgLight: 'bg-red-500/10',
  },
  info: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    bgLight: 'bg-blue-500/10',
  },
} as const;