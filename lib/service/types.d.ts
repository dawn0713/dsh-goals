/**
 * Public contract of the cross-session Personal Goals domain.
 *
 * The domain stores user-level goals, their tasks, and model suggestions
 * (ideas) in a Host-wide storage domain, so they outlive any one Session.
 * Record types are inferred from the storage schemas in `domain.ts`; this
 * module adds the consumer-facing views, request values, and the changed
 * event clients listen to.
 *
 * @module @deepseek-ai/dsh-personal-goals
 */
import type { Branded } from '@deepseek-ai/dsh-brand';
import type { PersonalGoalRecord, PersonalIdeaRecord, PersonalMonitorCheck, PersonalTaskRecord } from './domain.ts';
/** Identifies one personal goal across updates. */
export type PersonalGoalId = Branded<'PersonalGoalId'>;
/** Identifies one task under a personal goal. */
export type PersonalTaskId = Branded<'PersonalTaskId'>;
/** Identifies one suggestion recorded by the agent or the user. */
export type PersonalIdeaId = Branded<'PersonalIdeaId'>;
/** Identifies one recorded monitor observation. */
export type PersonalMonitorCheckId = Branded<'PersonalMonitorCheckId'>;
/** Lifecycle phase of a personal goal; completion and archiving are user-only. */
export type PersonalGoalStatus = 'active' | 'paused' | 'blocked' | 'completed' | 'archived';
/** Work state of one task under a goal. */
export type PersonalTaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
/** Review state of one suggestion. */
export type PersonalIdeaStatus = 'open' | 'accepted' | 'dismissed';
/** Goal shape: an executable plan, or a monitor watching an external condition. */
export type PersonalGoalKind = 'plan' | 'monitor';
/** How a monitor decides whether its condition holds. */
export type PersonalMonitorMode = 'threshold' | 'fact';
/** Allowed monitor check cadence; the minimum interval is six hours. */
export type PersonalMonitorCadence = 'daily' | 'every_12h' | 'every_6h' | 'weekly';
/** Numeric comparison for a threshold monitor. */
export interface PersonalMonitorThreshold {
    /** Observed metric name, such as `round_trip_price`. */
    readonly metric: string;
    /** Comparison applied to the observed value. */
    readonly operator: '<' | '<=' | '>' | '>=';
    /** Target value. */
    readonly value: number;
    /** Optional unit, such as `CNY`. */
    readonly unit?: string | undefined;
}
/** Monitor configuration and last-observation state. */
export interface PersonalMonitorState {
    /** What is being watched, such as a route, artist, or product. */
    readonly subject: string;
    /** Natural-language condition evaluated after each check. */
    readonly condition: string;
    /** Threshold comparison or fact detection. */
    readonly mode: PersonalMonitorMode;
    /** Required for threshold monitors. */
    readonly threshold?: PersonalMonitorThreshold | undefined;
    /** Check cadence. */
    readonly cadence: PersonalMonitorCadence;
    /** Whether the monitor stops after the first match. */
    readonly once: boolean;
    /** ISO instant after which the monitor expires. */
    readonly expiresAt: string;
    /** User-provided sources to prefer during a check. */
    readonly preferredSources?: string[] | undefined;
    /** Last check instant. */
    readonly lastCheckAt?: string | undefined;
    /** Last check summary. */
    readonly lastSummary?: string | undefined;
    /** Last observed source. */
    readonly lastSource?: string | undefined;
    /** Last observed value. */
    readonly lastValue?: string | undefined;
    /** First (or latest) trigger instant. */
    readonly triggeredAt?: string | undefined;
    /** Last time the user was notified about a match. */
    readonly lastNotifiedAt?: string | undefined;
    /** Notifications before this instant are suppressed. */
    readonly cooldownUntil?: string | undefined;
    /** Consecutive check failures. */
    readonly errorStreak: number;
    /** Last failure warning instant. */
    readonly failureNotifiedAt?: string | undefined;
    /** Instant the monitor expired. */
    readonly expiredAt?: string | undefined;
}
export type { PersonalGoalRecord, PersonalIdeaRecord, PersonalMonitorCheck, PersonalTaskRecord } from './domain.ts';
/** Session evidence for a suggestion: which Session produced it. */
export interface PersonalGoalSource {
    /** Session that proposed the idea. */
    readonly sessionId: string;
    /** Message in that Session, when the producer knows it. */
    readonly messageId?: string;
}
/** One goal with its task list and open-suggestion count, as the page and tools read it. */
export interface PersonalGoalView extends PersonalGoalRecord {
    /** Tasks belonging to this goal, ordered by creation time. */
    readonly tasks: readonly PersonalTaskRecord[];
    /** Suggestions attached to this goal that still await review. */
    readonly openIdeaCount: number;
}
/** Bounded goal summary rendered into the system-prompt section. */
export interface PersonalPromptGoal {
    /** Goal identity. */
    readonly id: PersonalGoalId;
    /** Goal title. */
    readonly title: string;
    /** Current phase. */
    readonly status: PersonalGoalStatus;
    /** Tasks not yet done or cancelled. */
    readonly openTasks: number;
    /** Tasks in every state. */
    readonly totalTasks: number;
}
/** Explicit creation input; the create surface is user-only. */
export interface CreatePersonalGoalInput {
    /** Goal title. */
    readonly title: string;
    /** Free-text motivation or scope. */
    readonly detail?: string;
    /** The user's definition of done for this goal. */
    readonly doneCriteria?: string;
}
/** Partial goal mutation; `status` is how a user completes or archives a goal. */
export interface UpdatePersonalGoalInput {
    /** Replacement title. */
    readonly title?: string;
    /** Replacement detail. */
    readonly detail?: string;
    /** Replacement completion criteria. */
    readonly doneCriteria?: string;
    /** Target phase; transitions are validated. */
    readonly status?: PersonalGoalStatus;
}
/** Request envelope for one goal read. */
export interface GetPersonalGoalRequest {
    /** Goal to read. */
    readonly goalId: PersonalGoalId;
}
/** Request envelope for deleting one goal and everything it owns. */
export interface DeletePersonalGoalRequest {
    /** Goal to delete. */
    readonly goalId: PersonalGoalId;
}
/** Outcome of one goal deletion. */
export interface PersonalGoalDeleteResult {
    /** Goal identity the request named. */
    readonly goalId: PersonalGoalId;
    /** Whether the goal existed and was removed. */
    readonly deleted: boolean;
}
/** Request envelope for one goal mutation. */
export interface UpdatePersonalGoalRequest extends UpdatePersonalGoalInput {
    /** Goal to update. */
    readonly goalId: PersonalGoalId;
}
/** Task creation input. */
export interface CreatePersonalTaskInput {
    /** Goal that owns the task. */
    readonly goalId: PersonalGoalId;
    /** Task title. */
    readonly title: string;
    /** Parent task for a one-level milestone grouping. */
    readonly parentTaskId?: PersonalTaskId;
    /** Free-text notes. */
    readonly notes?: string;
    /** Optional ISO instant the task is due. */
    readonly dueAt?: string;
}
/** Request envelope for one task mutation. */
export interface UpdatePersonalTaskRequest {
    /** Task to update. */
    readonly taskId: PersonalTaskId;
    /** Replacement title. */
    readonly title?: string;
    /** Replacement notes. */
    readonly notes?: string;
    /** Target work state; transitions are validated. */
    readonly status?: PersonalTaskStatus;
    /** Replacement due instant. */
    readonly dueAt?: string;
}
/** Input for recording one suggestion. */
export interface ProposePersonalIdeaInput {
    /** Suggestion text. */
    readonly content: string;
    /** Existing goal the suggestion is about. */
    readonly goalId?: PersonalGoalId;
    /** Title for a goal the suggestion proposes; mutually exclusive with `goalId`. */
    readonly suggestedGoalTitle?: string;
    /** Session evidence for the suggestion. */
    readonly source: PersonalGoalSource;
}
/** Idea list filter. */
export interface ListPersonalIdeasInput {
    /** Return only ideas in this review state; omissions return every idea. */
    readonly status?: PersonalIdeaStatus;
}
/** Request envelope for one idea decision. */
export interface ResolvePersonalIdeaRequest {
    /** Idea to accept or dismiss. */
    readonly ideaId: PersonalIdeaId;
}
/** Acceptance target: an existing goal, or a new goal title. */
export interface AcceptPersonalIdeaInput {
    /** Idea being accepted. */
    readonly ideaId: PersonalIdeaId;
    /** Existing goal that should own the derived task. */
    readonly goalId?: PersonalGoalId;
    /** Title for a goal created by this acceptance. */
    readonly newGoalTitle?: string;
}
/** One initial step in a guided plan. */
export interface PersonalGoalPlanTaskInput {
    /** Step title, already phrased as an action. */
    readonly title: string;
    /** Optional guidance for the step. */
    readonly notes?: string;
    /** Optional ISO instant the step is due. */
    readonly dueAt?: string;
}
/** Guided-plan creation input used by the model tool after an explicit request. */
export interface CreatePersonalGoalPlanInput {
    /** Goal title. */
    readonly title: string;
    /** Free-text motivation or scope. */
    readonly detail?: string;
    /** The user's definition of done. */
    readonly doneCriteria?: string;
    /** Initial steps, written in execution order. */
    readonly tasks: readonly PersonalGoalPlanTaskInput[];
    /** Session that receives the weekly check-in; absence skips scheduling. */
    readonly checkInSessionId?: string;
}
/** Outcome of guided-plan creation. */
export interface PersonalGoalPlanResult {
    /** The created goal. */
    readonly goal: PersonalGoalRecord;
    /** Steps created with the goal, in input order. */
    readonly tasks: readonly PersonalTaskRecord[];
}
/** Creation input for one monitor goal. */
export interface CreatePersonalMonitorInput {
    /** What is watched, such as a route, artist, or product. */
    readonly subject: string;
    /** Natural-language condition evaluated after each check. */
    readonly condition: string;
    /** Threshold comparison or fact detection. */
    readonly mode: PersonalMonitorMode;
    /** Required when `mode` is threshold. */
    readonly threshold?: PersonalMonitorThreshold | undefined;
    /** Check cadence; default daily, minimum six hours. */
    readonly cadence: PersonalMonitorCadence;
    /** Whether the monitor stops after the first match. */
    readonly once: boolean;
    /** ISO instant after which the monitor expires. */
    readonly expiresAt: string;
    /** User-provided sources to prefer; any source is allowed. */
    readonly preferredSources?: string[] | undefined;
    /** Session that receives the check reminders; required so a monitor always has an observation channel. */
    readonly checkInSessionId: string;
}
/** One observation recorded by a monitor check. */
export interface RecordPersonalMonitorCheckInput {
    /** Monitor goal being checked. */
    readonly goalId: PersonalGoalId;
    /** Observation instant; omission uses the current time. */
    readonly checkedAt?: string;
    /** Short account of what was observed. */
    readonly summary: string;
    /** Whether the monitor condition holds. */
    readonly matched: boolean;
    /** Observed value, such as a price. */
    readonly value?: string;
    /** Source URL or name used for the observation. */
    readonly source?: string;
    /** Failure detail when the check could not complete. */
    readonly error?: string;
}
/** Outcome of one recorded check. */
export interface PersonalMonitorCheckResult {
    /** Monitor goal identity. */
    readonly goalId: PersonalGoalId;
    /** Stored observation. */
    readonly check: PersonalMonitorCheck;
    /** Whether this check crossed into a notification-worthy match. */
    readonly triggered: boolean;
    /** Whether this check expired the monitor. */
    readonly expired: boolean;
    /** Whether this failure streak reached the warning threshold. */
    readonly warn: boolean;
    /** Notification cooldown applied to this match. */
    readonly cooldownUntil?: string | undefined;
}
/** Request for one monitor's recent observations. */
export interface ListPersonalMonitorChecksInput {
    /** Monitor goal identity. */
    readonly goalId: PersonalGoalId;
    /** Maximum records; defaults to 20. */
    readonly limit?: number;
}
/** Request to resume a triggered monitor after the user chose to keep watching. */
export interface ResumePersonalMonitorRequest {
    /** Monitor goal identity. */
    readonly goalId: PersonalGoalId;
}
/** One task with its goal context, for cross-plugin queries. */
export interface PersonalTaskSummary {
    /** Goal that owns the task. */
    readonly goalId: PersonalGoalId;
    /** Owner goal title. */
    readonly goalTitle: string;
    /** Owner goal phase. */
    readonly goalStatus: PersonalGoalStatus;
    /** Task identity. */
    readonly taskId: PersonalTaskId;
    /** Task title. */
    readonly title: string;
    /** Current work state. */
    readonly status: PersonalTaskStatus;
    /** Optional ISO instant the task is due. */
    readonly dueAt?: string;
}
/** Read-only report of current goals and task state for other plugins. */
export interface PersonalGoalsOverview {
    /** Every goal with its tasks, most recently updated first. */
    readonly goals: readonly PersonalGoalView[];
    /** Steps still to do: pending, in progress, or blocked. */
    readonly openTasks: readonly PersonalTaskSummary[];
    /** Steps finished successfully. */
    readonly completedTasks: readonly PersonalTaskSummary[];
}
/** Outcome of accepting an idea: the resolved idea plus what it produced. */
export interface PersonalIdeaResolution {
    /** The idea after resolution. */
    readonly idea: PersonalIdeaRecord;
    /** Task derived from the idea, when acceptance produced one. */
    readonly task?: PersonalTaskRecord;
    /** Goal created by the acceptance, when the idea proposed one. */
    readonly goal?: PersonalGoalRecord;
}
declare module '@deepseek-ai/cordis' {
    interface Events {
        /** Durable personal-goal state changed; clients refetch the sidebar page.
         * @mode emit
         */
        'personalGoals/changed'(): void;
        /** One goal and its child records were removed; bound reminders must clean up.
         * @mode emit
         * @param goalId - identity of the deleted goal.
         */
        'personalGoals/deleted'(goalId: PersonalGoalId): void;
    }
}
//# sourceMappingURL=types.d.ts.map