/**
 * Standalone Personal Goals bundle entry.
 *
 * One Loader row mounts both faces: the Host service owns the storage domain
 * and its Remote methods, and the tool plugin contributes the model tools and
 * the bounded prompt section.
 */
import PersonalGoalsService from './service/index.js'
import * as ToolPersonalGoals from './tool/index.js'

/** Plugin name registered with the Loader. */
export const name = 'dsh-personal-goals'

/** Host services required before either child plugin mounts. */
export const inject = ['storageDomain', 'schedule', 'tools', 'systemPrompt']

/**
 * Mount the service and the tools under one bundle row.
 * @param ctx - Host context.
 * @param config - `maxGoals` and `maxChars` for the prompt section.
 */
export function apply(ctx, config) {
  ctx.plugin(PersonalGoalsService)
  ctx.plugin(ToolPersonalGoals, config)
}