/**
 * Model-facing Personal Goals tools over the Host `ctx.personalGoals` service.
 *
 * The tools separate recording from deciding: a proposed goal or suggestion
 * becomes an open idea that the user reviews in the Goals page, while task
 * writes run only when the user asks for them. No tool completes, archives,
 * pauses, or deletes a goal — those transitions exist only on the user-facing
 * Remote surface.
 *
 * @module @deepseek-ai/dsh-tool-personal-goals
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Plugin name registered with the Loader. */
export declare const name = "tool-personal-goals";
/** Host services this plugin consumes. */
export declare const inject: string[];
/** Prompt-section and read bounds. */
export interface Config {
    /** Maximum goals listed in the system-prompt section; omission defaults to 5. */
    maxGoals?: number;
    /** Maximum characters of prompt-section text; omission defaults to 1200. */
    maxChars?: number;
}
/** Validated bounds for the prompt section. */
export declare const Config: z<Config>;
/**
 * Register the goal tools and the prompt section.
 * @param ctx - plugin context with the tool registry, prompt assembly, and service.
 * @param config - validated prompt bounds.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map