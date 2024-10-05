import { TransitionOptions, TransitionAnimation } from "./types";
declare global {
    interface Document {
        startViewTransition?: (callback: () => void) => {
            finished: Promise<void>;
            updateCallbackDone: Promise<void>;
            ready: Promise<void>;
        };
    }
}
export declare function setupTransition(container: Element, options: TransitionOptions, animateFunction?: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): void;
export declare function generateStyleString(animation: TransitionAnimation): {
    from: string;
    to: string;
};
