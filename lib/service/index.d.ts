/**
 * Host-wide, cross-session Personal Goals service.
 *
 * Goals, tasks, and suggestions are durable user-level state, so the service
 * stores them in a storage domain instead of any Session log. The service
 * offers a Typert Remote surface for the Web sidebar page and plain methods
 * for the model tools; every mutation is serialized and emits
 * `personalGoals/changed` after durability.
 *
 * @module @deepseek-ai/dsh-personal-goals
 */
import { Context, Service } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { type PersonalIdeaRecord, type PersonalMonitorCheck, type PersonalTaskRecord } from './domain.ts';
import type { AcceptPersonalIdeaInput, CreatePersonalGoalInput, CreatePersonalGoalPlanInput, CreatePersonalMonitorInput, CreatePersonalTaskInput, DeletePersonalGoalRequest, GetPersonalGoalRequest, ListPersonalIdeasInput, ListPersonalMonitorChecksInput, PersonalGoalDeleteResult, PersonalGoalPlanResult, PersonalGoalView, PersonalGoalsOverview, PersonalIdeaResolution, PersonalMonitorCheckResult, PersonalPromptGoal, ProposePersonalIdeaInput, RecordPersonalMonitorCheckInput, ResolvePersonalIdeaRequest, ResumePersonalMonitorRequest, UpdatePersonalGoalRequest, UpdatePersonalTaskRequest } from './types.ts';
export type * from './types.ts';
export { PersonalGoalId, PersonalIdeaId, PersonalMonitorCheckId, PersonalTaskId, personalGoalsDomain, } from './domain.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Durable cross-session Personal Goals management. */
        personalGoals: PersonalGoalsService;
    }
}
/** Stable failure codes the tools and the page map to actionable copy. */
export type PersonalGoalsErrorCode = 'invalid_input' | 'goal_not_found' | 'task_not_found' | 'idea_not_found' | 'invalid_transition' | 'invalid_parent' | 'idea_not_open' | 'idea_needs_target' | 'not_a_monitor' | 'not_a_plan' | 'monitor_not_active' | 'unavailable';
/** A rejected Personal Goals operation; `code` is stable for callers. */
export declare class PersonalGoalsError extends Error {
    readonly code: PersonalGoalsErrorCode;
    /**
     * @param code - stable failure code.
     * @param message - actionable description.
     */
    constructor(code: PersonalGoalsErrorCode, message: string);
}
/** Deployment bounds for monitors. */
export interface Config {
    /** Notification cooldown after a threshold match, in hours; omission defaults to 24. */
    monitorCooldownHours?: number;
    /** Retained observations per monitor; omission defaults to 200. */
    maxChecksPerMonitor?: number;
    /** Active monitors allowed at once; omission defaults to 5. */
    maxActiveMonitors?: number;
}
/** Validated monitor bounds. */
export declare const Config: z<Config>;
/** Cross-session Personal Goals service; every mutation is durable before it is visible. */
export declare class PersonalGoalsService extends TypertRemoteService {
    static inject: string[];
    static Config: z<Config>;
    private readonly ready;
    private readonly initialized;
    private readonly monitorCooldownHours;
    private readonly maxChecksPerMonitor;
    private readonly maxActiveMonitors;
    private domain;
    private chain;
    private stopping;
    /**
     * @param ctx - Host context providing the storage-domain facility.
     * @param config - monitor bounds; omissions use deployment defaults.
     */
    constructor(ctx: Context, config?: Config);
    /** Wait until the storage domain is open and readable. */
    [Service.init](): Promise<void>;
    /**
     * List every goal with its tasks, most recently updated first.
     * @returns the current goals.
     */
    list(): Promise<PersonalGoalView[]>;
    /**
     * Delete one goal together with its tasks and linked suggestions.
     *
     * Deletion is user-only: it is exposed on the Remote surface and has no model
     * tool. Suggestions and tasks are removed before the goal, so a failed
     * cascade leaves a retryable goal rather than orphaned child records.
     * @param request - goal identity.
     * @returns whether the goal existed and was removed.
     */
    delete(request: DeletePersonalGoalRequest): Promise<PersonalGoalDeleteResult>;
    /**
     * Read a flat report of current goals, open steps, and completed steps.
     *
     * This is the cross-plugin query seam: another Host plugin injects
     * `personalGoals` and calls `overview()` without projecting storage itself.
     * `openTasks` covers pending, in-progress, and blocked steps; cancelled steps
     * appear in neither list.
     * @returns goals with task context and the two flattened task lists.
     */
    overview(): Promise<PersonalGoalsOverview>;
    /**
     * Read one goal.
     * @param request - goal identity.
     * @returns the goal, or null when it does not exist.
     */
    get(request: GetPersonalGoalRequest): Promise<PersonalGoalView | null>;
    /**
     * Create one goal from an explicit user action.
     * @param input - title, optional detail, and optional completion criteria.
     * @returns the created goal.
     */
    create(input: CreatePersonalGoalInput): Promise<PersonalGoalView>;
    /**
     * Create one goal together with its initial steps after an explicit user request.
     *
     * Every field is validated before the first write, so an invalid step cannot
     * leave a goal behind. The tool layer owns the human-authority check; this
     * method is not Remote-exposed.
     * @param input - goal fields plus ordered initial steps.
     * @returns the created goal and its steps.
     */
    createPlan(input: CreatePersonalGoalPlanInput): Promise<PersonalGoalPlanResult>;
    /**
     * Create one monitor goal and schedule its checks.
     *
     * Monitors have no tasks: the check cadence, condition, and expiry are the
     * whole plan. Checks are scheduled in the calling Session, which is required
     * so a monitor cannot outlive its only observation channel.
     * @param input - monitor subject, condition, cadence, bounds, and check-in Session.
     * @returns the created monitor as a goal view.
     */
    createMonitor(input: CreatePersonalMonitorInput): Promise<PersonalGoalView>;
    /**
     * Record one monitor observation and apply its trigger, cooldown, expiry, or
     * failure transition. This method serves the model tool; it is not Remote.
     * @param input - observed state, source, and failure detail.
     * @returns the stored observation and the transitions it caused.
     */
    recordCheck(input: RecordPersonalMonitorCheckInput): Promise<PersonalMonitorCheckResult>;
    /**
     * Resume a triggered monitor after the user chose to keep watching.
     * @param request - monitor identity.
     * @returns the resumed monitor.
     */
    resumeMonitor(request: ResumePersonalMonitorRequest): Promise<PersonalGoalView>;
    /**
     * List recent observations for one monitor, newest first.
     * @param input - monitor identity and record limit.
     * @returns stored observations.
     */
    listChecks(input: ListPersonalMonitorChecksInput): Promise<PersonalMonitorCheck[]>;
    /**
     * Update one goal; `status` is how a user completes or archives it.
     * @param request - goal identity plus the fields to replace.
     * @returns the updated goal.
     */
    update(request: UpdatePersonalGoalRequest): Promise<PersonalGoalView>;
    /**
     * Add one task to a goal.
     * @param input - goal identity and task fields.
     * @returns the created task.
     */
    addTask(input: CreatePersonalTaskInput): Promise<PersonalTaskRecord>;
    /**
     * Update one task's text, due instant, or work state.
     * @param request - task identity plus the fields to replace.
     * @returns the updated task.
     */
    updateTask(request: UpdatePersonalTaskRequest): Promise<PersonalTaskRecord>;
    /**
     * List suggestions, newest first.
     * @param input - optional review-state filter.
     * @returns matching suggestions.
     */
    listIdeas(input: ListPersonalIdeasInput): Promise<PersonalIdeaRecord[]>;
    /**
     * Record one suggestion. Not Remote-exposed: the model tool is the only producer.
     * @param input - suggestion text, optional target, and session evidence.
     * @returns the stored suggestion; an identical open suggestion is reused.
     */
    proposeIdea(input: ProposePersonalIdeaInput): Promise<PersonalIdeaRecord>;
    /**
     * Accept one suggestion into a goal and derive exactly one task.
     * @param input - idea identity plus the target goal or a new goal title.
     * @returns the resolved idea and what acceptance produced.
     */
    acceptIdea(input: AcceptPersonalIdeaInput): Promise<PersonalIdeaResolution>;
    /**
     * Dismiss one suggestion without creating work.
     * @param request - idea identity.
     * @returns the dismissed idea.
     */
    dismissIdea(request: ResolvePersonalIdeaRequest): Promise<PersonalIdeaRecord>;
    /**
     * Render the bounded goal list for the system-prompt section.
     *
     * Synchronous by contract: prompt assembly cannot await storage. Before the
     * domain opens this returns an empty list, which is the same state as a user
     * with no goals.
     * @param maxGoals - maximum goals to include; non-positive values produce none.
     * @returns active, paused, and blocked goals ordered by most recent update.
     */
    snapshotForPrompt(maxGoals: number): readonly PersonalPromptGoal[];
    private allGoals;
    private allTasks;
    private allIdeas;
    private allChecks;
    /** Keep only the newest configured number of observations for one monitor. */
    private pruneChecks;
    private getDomain;
    /** Delete the weekly check-in bound to one goal, when it still exists. */
    private deleteCheckIn;
    /**
     * Create the weekly check-in for one goal and return its schedule id.
     * Scheduling failure is logged and leaves the goal usable without a reminder.
     */
    private ensureCheckIn;
    private emitChanged;
    private emitDeleted;
    private serialize;
}
export default PersonalGoalsService;
//# sourceMappingURL=index.d.ts.map