export interface PrefetchOptions {
    active: boolean;
    event: string;
    delay: number;
}
export interface TransitionStyles {
    [key: string]: string | number;
}
export interface TransitionAnimation {
    from: TransitionStyles;
    to: TransitionStyles;
}
export interface TransitionOptions {
    duration: number;
    delay: number;
    timeline: 'sequential' | 'parallel';
    easing: string;
    iterations: number | 'infinite';
    out: TransitionAnimation;
    in: TransitionAnimation;
}
export interface SparefOptions {
    prefetch: PrefetchOptions;
    transition: TransitionOptions;
}
