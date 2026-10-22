/**
 * Durable Personal Goals storage: branded identities, record schemas, and the
 * Host-wide domain declaration.
 *
 * The three tables live in one version-1 domain. Records are validated on
 * every read and write; a malformed stored record rejects opening the domain
 * instead of being silently repaired.
 *
 * @module @deepseek-ai/dsh-personal-goals
 */
import { z } from 'zod';
import { brandString } from '@deepseek-ai/dsh-brand';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
/**
 * Brand one stored goal identity.
 * @param value - stored string.
 * @returns the same value carrying the goal brand.
 */
export function PersonalGoalId(value) {
    return brandString(value);
}
/**
 * Brand one stored task identity.
 * @param value - stored string.
 * @returns the same value carrying the task brand.
 */
export function PersonalTaskId(value) {
    return brandString(value);
}
/**
 * Brand one stored idea identity.
 * @param value - stored string.
 * @returns the same value carrying the idea brand.
 */
export function PersonalIdeaId(value) {
    return brandString(value);
}
/**
 * Brand one stored monitor-check identity.
 * @param value - stored string.
 * @returns the same value carrying the check brand.
 */
export function PersonalMonitorCheckId(value) {
    return brandString(value);
}
const instantSchema = z.iso.datetime();
/**
 * Whether a stored string is a valid ISO 8601 instant.
 * @param value - candidate timestamp.
 * @returns true when the value parses as an ISO instant.
 */
export function isInstant(value) {
    return instantSchema.safeParse(value).success;
}
const goalIdSchema = z.string().min(1).transform(value => PersonalGoalId(value));
const taskIdSchema = z.string().min(1).transform(value => PersonalTaskId(value));
const ideaIdSchema = z.string().min(1).transform(value => PersonalIdeaId(value));
const checkIdSchema = z.string().min(1).transform(value => PersonalMonitorCheckId(value));
const thresholdSchema = z.object({
    metric: z.string().min(1),
    operator: z.enum(['<', '<=', '>', '>=']),
    value: z.number(),
    unit: z.string().min(1).optional(),
}).strict();
const monitorSchema = z.object({
    subject: z.string().min(1),
    condition: z.string().min(1),
    mode: z.enum(['threshold', 'fact']),
    threshold: thresholdSchema.optional(),
    cadence: z.enum(['daily', 'every_12h', 'every_6h', 'weekly']),
    once: z.boolean(),
    expiresAt: instantSchema,
    preferredSources: z.array(z.string().min(1)).optional(),
    lastCheckAt: instantSchema.optional(),
    lastSummary: z.string().min(1).optional(),
    lastSource: z.string().min(1).optional(),
    lastValue: z.string().min(1).optional(),
    triggeredAt: instantSchema.optional(),
    lastNotifiedAt: instantSchema.optional(),
    cooldownUntil: instantSchema.optional(),
    errorStreak: z.number().int().min(0).default(0),
    failureNotifiedAt: instantSchema.optional(),
    expiredAt: instantSchema.optional(),
}).strict();
/** One stored goal. */
export const personalGoalSchema = z.object({
    id: goalIdSchema,
    title: z.string().min(1),
    detail: z.string().min(1).optional(),
    doneCriteria: z.string().min(1).optional(),
    status: z.enum(['active', 'paused', 'blocked', 'completed', 'archived']),
    kind: z.enum(['plan', 'monitor']).default('plan'),
    monitor: monitorSchema.optional(),
    createdAt: instantSchema,
    updatedAt: instantSchema,
    completedAt: instantSchema.optional(),
    checkInSessionId: z.string().min(1).optional(),
    checkInScheduleId: z.string().min(1).optional(),
}).strict();
/** One stored task. */
export const personalTaskSchema = z.object({
    id: taskIdSchema,
    goalId: goalIdSchema,
    parentTaskId: taskIdSchema.optional(),
    title: z.string().min(1),
    notes: z.string().min(1).optional(),
    status: z.enum(['pending', 'in_progress', 'blocked', 'done', 'cancelled']),
    dueAt: z.string().min(1).optional(),
    createdAt: instantSchema,
    updatedAt: instantSchema,
}).strict();
/** One stored suggestion. */
export const personalIdeaSchema = z.object({
    id: ideaIdSchema,
    content: z.string().min(1),
    goalId: goalIdSchema.optional(),
    suggestedGoalTitle: z.string().min(1).optional(),
    status: z.enum(['open', 'accepted', 'dismissed']),
    source: z.object({
        sessionId: z.string().min(1),
        messageId: z.string().min(1).optional(),
    }).strict(),
    createdAt: instantSchema,
    resolvedAt: instantSchema.optional(),
}).strict();
/** One stored monitor observation. */
export const personalMonitorCheckSchema = z.object({
    id: checkIdSchema,
    goalId: goalIdSchema,
    checkedAt: instantSchema,
    summary: z.string().min(1),
    source: z.string().min(1).optional(),
    value: z.string().min(1).optional(),
    matched: z.boolean(),
    error: z.string().min(1).optional(),
}).strict();
/**
 * Authoritative Personal Goals storage. The unit name follows the storage
 * backend's `UNIT_NAME_RE` (lowercase letters, digits, and underscores), which
 * is why the public feature name is hyphenated but the domain is not.
 */
export const personalGoalsDomain = defineDomain({
    name: 'personal_goals', version: 1,
    tables: {
        goals: domainTable(personalGoalSchema),
        tasks: domainTable(personalTaskSchema),
        ideas: domainTable(personalIdeaSchema),
        checks: domainTable(personalMonitorCheckSchema),
    },
});
//# sourceMappingURL=domain.js.map