/**
 * Options for prefetching links.
 */
export interface PrefetchOptions {
    active: boolean;
    event: string;
    delay: number;
    sameOrigin?: boolean;
}
/**
 * Styles for a transition animation.
 */
export interface TransitionStyles {
    [key: string]: string | number;
}
/**
 * An animation object for transitioning between two states.
 */
export interface TransitionAnimation {
    from: Record<string, string | number>;
    to: Record<string, string | number>;
}
/**
 * Options for transitioning between pages.
 */
export interface TransitionOptions {
    duration: number;
    delay: number;
    timeline: "sequential" | "parallel";
    easing: string;
    iterations: number | "infinite";
    out: TransitionAnimation;
    in: TransitionAnimation;
}
export interface SparefOptions {
    prefetch: PrefetchOptions;
    transition: TransitionOptions;
}
