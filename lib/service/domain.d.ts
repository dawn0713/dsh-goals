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
import type { PersonalGoalId as PersonalGoalIdType, PersonalIdeaId as PersonalIdeaIdType, PersonalMonitorCheckId as PersonalMonitorCheckIdType, PersonalTaskId as PersonalTaskIdType } from './types.ts';
/**
 * Brand one stored goal identity.
 * @param value - stored string.
 * @returns the same value carrying the goal brand.
 */
export declare function PersonalGoalId(value: string): PersonalGoalIdType;
/**
 * Brand one stored task identity.
 * @param value - stored string.
 * @returns the same value carrying the task brand.
 */
export declare function PersonalTaskId(value: string): PersonalTaskIdType;
/**
 * Brand one stored idea identity.
 * @param value - stored string.
 * @returns the same value carrying the idea brand.
 */
export declare function PersonalIdeaId(value: string): PersonalIdeaIdType;
/**
 * Brand one stored monitor-check identity.
 * @param value - stored string.
 * @returns the same value carrying the check brand.
 */
export declare function PersonalMonitorCheckId(value: string): PersonalMonitorCheckIdType;
/**
 * Whether a stored string is a valid ISO 8601 instant.
 * @param value - candidate timestamp.
 * @returns true when the value parses as an ISO instant.
 */
export declare function isInstant(value: string): boolean;
/** One stored goal. */
export declare const personalGoalSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<PersonalGoalIdType, string>>;
    title: z.ZodString;
    detail: z.ZodOptional<z.ZodString>;
    doneCriteria: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        active: "active";
        paused: "paused";
        blocked: "blocked";
        completed: "completed";
        archived: "archived";
    }>;
    kind: z.ZodDefault<z.ZodEnum<{
        plan: "plan";
        monitor: "monitor";
    }>>;
    monitor: z.ZodOptional<z.ZodObject<{
        subject: z.ZodString;
        condition: z.ZodString;
        mode: z.ZodEnum<{
            threshold: "threshold";
            fact: "fact";
        }>;
        threshold: z.ZodOptional<z.ZodObject<{
            metric: z.ZodString;
            operator: z.ZodEnum<{
                "<": "<";
                "<=": "<=";
                ">": ">";
                ">=": ">=";
            }>;
            value: z.ZodNumber;
            unit: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        cadence: z.ZodEnum<{
            daily: "daily";
            every_12h: "every_12h";
            every_6h: "every_6h";
            weekly: "weekly";
        }>;
        once: z.ZodBoolean;
        expiresAt: z.ZodISODateTime;
        preferredSources: z.ZodOptional<z.ZodArray<z.ZodString>>;
        lastCheckAt: z.ZodOptional<z.ZodISODateTime>;
        lastSummary: z.ZodOptional<z.ZodString>;
        lastSource: z.ZodOptional<z.ZodString>;
        lastValue: z.ZodOptional<z.ZodString>;
        triggeredAt: z.ZodOptional<z.ZodISODateTime>;
        lastNotifiedAt: z.ZodOptional<z.ZodISODateTime>;
        cooldownUntil: z.ZodOptional<z.ZodISODateTime>;
        errorStreak: z.ZodDefault<z.ZodNumber>;
        failureNotifiedAt: z.ZodOptional<z.ZodISODateTime>;
        expiredAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>>;
    createdAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
    completedAt: z.ZodOptional<z.ZodISODateTime>;
    checkInSessionId: z.ZodOptional<z.ZodString>;
    checkInScheduleId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** One stored task. */
export declare const personalTaskSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<PersonalTaskIdType, string>>;
    goalId: z.ZodPipe<z.ZodString, z.ZodTransform<PersonalGoalIdType, string>>;
    parentTaskId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<PersonalTaskIdType, string>>>;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        blocked: "blocked";
        pending: "pending";
        in_progress: "in_progress";
        done: "done";
        cancelled: "cancelled";
    }>;
    dueAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
/** One stored suggestion. */
export declare const personalIdeaSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<PersonalIdeaIdType, string>>;
    content: z.ZodString;
    goalId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<PersonalGoalIdType, string>>>;
    suggestedGoalTitle: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        open: "open";
        accepted: "accepted";
        dismissed: "dismissed";
    }>;
    source: z.ZodObject<{
        sessionId: z.ZodString;
        messageId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    createdAt: z.ZodISODateTime;
    resolvedAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
/** Stored goal value. */
export type PersonalGoalRecord = z.infer<typeof personalGoalSchema>;
/** Stored task value. */
export type PersonalTaskRecord = z.infer<typeof personalTaskSchema>;
/** Stored idea value. */
export type PersonalIdeaRecord = z.infer<typeof personalIdeaSchema>;
/** One stored monitor observation. */
export declare const personalMonitorCheckSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<PersonalMonitorCheckIdType, string>>;
    goalId: z.ZodPipe<z.ZodString, z.ZodTransform<PersonalGoalIdType, string>>;
    checkedAt: z.ZodISODateTime;
    summary: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    matched: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** Stored monitor-check value. */
export type PersonalMonitorCheck = z.infer<typeof personalMonitorCheckSchema>;
/**
 * Authoritative Personal Goals storage. The unit name follows the storage
 * backend's `UNIT_NAME_RE` (lowercase letters, digits, and underscores), which
 * is why the public feature name is hyphenated but the domain is not.
 */
export declare const personalGoalsDomain: {
    name: string;
    version: number;
    tables: {
        goals: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<PersonalGoalIdType, {
            id: PersonalGoalIdType;
            title: string;
            status: "active" | "paused" | "blocked" | "completed" | "archived";
            kind: "plan" | "monitor";
            createdAt: string;
            updatedAt: string;
            detail?: string | undefined;
            doneCriteria?: string | undefined;
            monitor?: {
                subject: string;
                condition: string;
                mode: "threshold" | "fact";
                cadence: "daily" | "every_12h" | "every_6h" | "weekly";
                once: boolean;
                expiresAt: string;
                errorStreak: number;
                threshold?: {
                    metric: string;
                    operator: "<" | "<=" | ">" | ">=";
                    value: number;
                    unit?: string | undefined;
                } | undefined;
                preferredSources?: string[] | undefined;
                lastCheckAt?: string | undefined;
                lastSummary?: string | undefined;
                lastSource?: string | undefined;
                lastValue?: string | undefined;
                triggeredAt?: string | undefined;
                lastNotifiedAt?: string | undefined;
                cooldownUntil?: string | undefined;
                failureNotifiedAt?: string | undefined;
                expiredAt?: string | undefined;
            } | undefined;
            completedAt?: string | undefined;
            checkInSessionId?: string | undefined;
            checkInScheduleId?: string | undefined;
        }>;
        tasks: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<PersonalTaskIdType, {
            id: PersonalTaskIdType;
            goalId: PersonalGoalIdType;
            title: string;
            status: "blocked" | "pending" | "in_progress" | "done" | "cancelled";
            createdAt: string;
            updatedAt: string;
            parentTaskId?: PersonalTaskIdType | undefined;
            notes?: string | undefined;
            dueAt?: string | undefined;
        }>;
        ideas: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<PersonalIdeaIdType, {
            id: PersonalIdeaIdType;
            content: string;
            status: "open" | "accepted" | "dismissed";
            source: {
                sessionId: string;
                messageId?: string | undefined;
            };
            createdAt: string;
            goalId?: PersonalGoalIdType | undefined;
            suggestedGoalTitle?: string | undefined;
            resolvedAt?: string | undefined;
        }>;
        checks: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<PersonalMonitorCheckIdType, {
            id: PersonalMonitorCheckIdType;
            goalId: PersonalGoalIdType;
            checkedAt: string;
            summary: string;
            matched: boolean;
            source?: string | undefined;
            value?: string | undefined;
            error?: string | undefined;
        }>;
    };
};
//# sourceMappingURL=domain.d.ts.map