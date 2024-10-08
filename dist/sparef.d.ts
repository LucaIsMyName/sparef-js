import { animate } from "./transition";
import { SparefOptions } from "./types";
/**
 *
 * @description Set up SPA transitions and prefetching.
 */
export declare function sparef(selector: string | string[], options?: Partial<SparefOptions>): void;
export { animate };
export default sparef;
