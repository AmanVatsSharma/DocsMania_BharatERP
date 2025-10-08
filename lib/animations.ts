/**
 * Animation Utilities Library
 * Reusable animation configurations for Framer Motion
 * Enterprise-grade with accessibility and performance considerations
 */

import { Variants, Transition } from 'framer-motion';

// Check if user prefers reduced motion
export const prefersReducedMotion = 
  typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

// Base transitions
export const transitions = {
  // Fast interactions (buttons, hovers)
  fast: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  } as Transition,
  
  // Standard transitions (panels, menus)
  base: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
  } as Transition,
  
  // Smooth, slower (modals, sheets)
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1,
  } as Transition,
  
  // Linear timing (progress bars)
  linear: {
    type: 'tween',
    duration: 0.3,
    ease: 'linear',
  } as Transition,
  
  // Ease out (natural deceleration)
  easeOut: {
    type: 'tween',
    duration: 0.2,
    ease: [0.0, 0.0, 0.2, 1],
  } as Transition,
  
  // Ease in out (smooth both ways)
  easeInOut: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1],
  } as Transition,
};

// Slide animations
export const slideVariants = {
  fromLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  } as Variants,
  
  fromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  } as Variants,
  
  fromTop: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  } as Variants,
  
  fromBottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  } as Variants,
  
  // Subtle slide (for sheets)
  subtleFromLeft: {
    initial: { x: -40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  } as Variants,
  
  subtleFromRight: {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 40, opacity: 0 },
  } as Variants,
};

// Fade animations
export const fadeVariants = {
  in: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,
  
  inFast: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transitions.fast },
    exit: { opacity: 0, transition: transitions.fast },
  } as Variants,
  
  inSlow: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  } as Variants,
};

// Scale animations
export const scaleVariants = {
  in: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  } as Variants,
  
  inBounce: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 500, damping: 15 }
    },
    exit: { scale: 0.8, opacity: 0 },
  } as Variants,
  
  tap: {
    whileTap: { scale: 0.95 },
  } as Variants,
  
  hover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  } as Variants,
};

// Backdrop animations
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as Variants;

// Stagger animations for lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
} as Variants;

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: transitions.fast,
  },
} as Variants;

// Collapse/Expand animations
export const collapseVariants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    overflow: 'hidden',
    transition: transitions.easeOut,
  },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    overflow: 'visible',
    transition: transitions.easeOut,
  },
} as Variants;

// Notification/Toast animations
export const toastVariants = {
  fromRight: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 },
  } as Variants,
  
  fromTop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
  } as Variants,
};

// Shimmer/Loading animations
export const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
} as Variants;

// Pulse animation
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
} as Variants;

// Rotation animation
export const spinVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
} as Variants;

/**
 * Get animation config based on user preferences
 * Returns instant animations if user prefers reduced motion
 */
export function getAnimation(variants: Variants, animationKey: string = 'animate'): Variants {
  if (prefersReducedMotion) {
    // Return instant transition
    return {
      initial: variants[animationKey],
      animate: variants[animationKey],
      exit: variants[animationKey],
    };
  }
  return variants;
}

/**
 * Get transition config based on user preferences
 */
export function getTransition(transition: Transition): Transition {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return transition;
}

/**
 * Utility to create custom slide variants
 */
export function createSlideVariants(
  direction: 'left' | 'right' | 'top' | 'bottom',
  distance: number = 100
): Variants {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const sign = direction === 'left' || direction === 'top' ? -1 : 1;
  
  return {
    initial: { [axis]: sign * distance, opacity: 0 },
    animate: { [axis]: 0, opacity: 1 },
    exit: { [axis]: sign * distance, opacity: 0 },
  };
}

/**
 * Utility to create custom fade variants with delay
 */
export function createFadeVariants(delay: number = 0): Variants {
  return {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { ...transitions.base, delay }
    },
    exit: { opacity: 0 },
  };
}

/**
 * Page transition variants
 */
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth,
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: transitions.fast,
  },
} as Variants;

/**
 * Modal/Dialog variants with backdrop
 */
export const modalVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  content: {
    hidden: { 
      scale: 0.95, 
      opacity: 0,
      y: 20,
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: transitions.smooth,
    },
  },
} as { backdrop: Variants; content: Variants };

// Export default animation presets
export const animations = {
  slideFromLeft: { variants: slideVariants.fromLeft, transition: transitions.base },
  slideFromRight: { variants: slideVariants.fromRight, transition: transitions.base },
  slideFromTop: { variants: slideVariants.fromTop, transition: transitions.base },
  slideFromBottom: { variants: slideVariants.fromBottom, transition: transitions.base },
  fadeIn: { variants: fadeVariants.in, transition: transitions.base },
  scaleIn: { variants: scaleVariants.in, transition: transitions.base },
  modal: { variants: modalVariants.content, transition: transitions.smooth },
};

export default animations;