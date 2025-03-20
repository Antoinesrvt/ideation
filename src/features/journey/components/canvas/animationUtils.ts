import { useEffect, useState } from 'react';

/**
 * Custom hook for creating smooth transitions between values
 * @param target Target value to animate to
 * @param duration Duration of animation in ms
 * @returns Current animated value
 */
export function useAnimatedValue(target: number, duration = 500): number {
  const [current, setCurrent] = useState(target);
  
  useEffect(() => {
    let startTime: number | null = null;
    let startValue = current;
    const change = target - startValue;
    
    // Don't animate if the change is very small
    if (Math.abs(change) < 0.1) {
      setCurrent(target);
      return;
    }
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (elapsed < duration) {
        // Ease out cubic: https://easings.net/#easeOutCubic
        const t = 1 - Math.pow(1 - elapsed / duration, 3);
        setCurrent(startValue + change * t);
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };
    
    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  
  return current;
}

/**
 * Easing functions for animations
 */
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 10 * (2 * t - 1)) / 2 : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2,
};

/**
 * Transition types for different effects
 */
export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'none';

/**
 * Hook for managing state transitions with animations
 * @param initialState Initial state value
 * @param transitionType Type of transition effect
 * @param duration Duration of the transition in ms
 * @returns Array containing [current state, setState function, transition status]
 */
export function useAnimatedTransition<T>(
  initialState: T,
  transitionType: TransitionType = 'fade',
  duration = 300
): [T, (newState: T) => void, 'idle' | 'entering' | 'exiting'] {
  const [state, setState] = useState<T>(initialState);
  const [transitionState, setTransitionState] = useState<'idle' | 'entering' | 'exiting'>('idle');
  const [previousState, setPreviousState] = useState<T | null>(null);
  
  // State setter with transition
  const setStateWithTransition = (newState: T) => {
    if (JSON.stringify(newState) === JSON.stringify(state)) return;
    
    setPreviousState(state);
    setTransitionState('exiting');
    
    setTimeout(() => {
      setState(newState);
      setTransitionState('entering');
      
      setTimeout(() => {
        setTransitionState('idle');
      }, duration);
    }, duration);
  };
  
  return [state, setStateWithTransition, transitionState];
}

/**
 * Get CSS classes for transition effects
 * @param type Transition type
 * @param state Current transition state
 * @returns CSS classes for the transition
 */
export function getTransitionClasses(type: TransitionType, state: 'idle' | 'entering' | 'exiting'): string {
  const baseClasses = 'transition-all';
  const durationClass = 'duration-300';
  
  if (type === 'none' || state === 'idle') {
    return '';
  }
  
  const typeClasses: Record<TransitionType, { entering: string; exiting: string }> = {
    'fade': {
      entering: 'opacity-0 opacity-100',
      exiting: 'opacity-100 opacity-0',
    },
    'slide-left': {
      entering: 'transform translate-x-full translate-x-0',
      exiting: 'transform translate-x-0 -translate-x-full',
    },
    'slide-right': {
      entering: 'transform -translate-x-full translate-x-0',
      exiting: 'transform translate-x-0 translate-x-full',
    },
    'slide-up': {
      entering: 'transform translate-y-full translate-y-0',
      exiting: 'transform translate-y-0 -translate-y-full',
    },
    'slide-down': {
      entering: 'transform -translate-y-full translate-y-0',
      exiting: 'transform translate-y-0 translate-y-full',
    },
    'zoom': {
      entering: 'transform scale-90 scale-100 opacity-0 opacity-100',
      exiting: 'transform scale-100 scale-90 opacity-100 opacity-0',
    },
    'none': {
      entering: '',
      exiting: '',
    },
  };
  
  return `${baseClasses} ${durationClass} ${typeClasses[type][state]}`;
}

/**
 * Custom hook for creating simple animations
 * @param duration Duration of the animation
 * @param easing Easing function
 * @param autoStart Whether to start the animation automatically
 * @returns Animation controller object
 */
export function useAnimation(
  duration = 1000,
  easing: keyof typeof easings = 'easeOutCubic',
  autoStart = false
) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  
  const start = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setProgress(0);
  };
  
  useEffect(() => {
    if (!isPlaying) return;
    
    let startTime: number | null = null;
    let frameId: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (elapsed < duration) {
        const rawProgress = elapsed / duration;
        const easedProgress = easings[easing](rawProgress);
        setProgress(easedProgress);
        frameId = requestAnimationFrame(animate);
      } else {
        setProgress(1);
        setIsPlaying(false);
      }
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, duration, easing]);
  
  return {
    progress,
    isPlaying,
    start,
    pause,
    reset,
    value: (from: number, to: number) => from + (to - from) * progress,
  };
} 