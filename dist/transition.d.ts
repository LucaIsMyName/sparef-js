import { TransitionOptions, TransitionAnimation } from "./types";
/**
 * @description Set up
 * transition between pages.
 */
declare global {
    interface Document {
        startViewTransition?: (callback: () => void) => {
            finished: Promise<void>;
            updateCallbackDone: Promise<void>;
            ready: Promise<void>;
        };
    }
}
/**
 * @description Set up
 * transition between pages.
 */
export declare function setupTransition(container: Element, options: TransitionOptions, animateFunction?: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): void;
/**
 * @description Generate a CSS style
 * string from a  transition animation object.
 */
export declare function generateStyleString(animation: TransitionAnimation): {
    from: string;
    to: string;
};
