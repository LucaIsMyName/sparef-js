interface PrefetchOptions {
    active: boolean;
    event: string;
    delay: number;
}
interface TransitionStyles {
    [key: string]: string | number;
}
interface TransitionAnimation {
    from: TransitionStyles;
    to: TransitionStyles;
}
interface TransitionOptions {
    duration: number;
    delay: number;
    timeline: 'sequential' | 'parallel';
    out: TransitionAnimation;
    in: TransitionAnimation;
}
interface HrefOptions {
    prefetch: PrefetchOptions;
    transition: TransitionOptions;
}
declare global {
    interface Document {
        startViewTransition?: (callback: () => void) => {
            finished: Promise<void>;
            updateCallbackDone: Promise<void>;
            ready: Promise<void>;
        };
    }
}
export default function href(selector: string, options?: Partial<HrefOptions>): void;
export default href;

//# sourceMappingURL=href.d.ts.map
