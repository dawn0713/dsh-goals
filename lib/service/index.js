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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { randomUUID } from 'node:crypto';
import { Service } from '@deepseek-ai/cordis';
import { SessionId } from '@deepseek-ai/dsh-session';
import { ScheduleId } from '@deepseek-ai/dsh-schedule';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { PersonalGoalId, PersonalIdeaId, PersonalMonitorCheckId, PersonalTaskId, isInstant, personalGoalsDomain, } from "./domain.js";
export { PersonalGoalId, PersonalIdeaId, PersonalMonitorCheckId, PersonalTaskId, personalGoalsDomain, } from "./domain.js";
/** A rejected Personal Goals operation; `code` is stable for callers. */
export class PersonalGoalsError extends Error {
    code;
    /**
     * @param code - stable failure code.
     * @param message - actionable description.
     */
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'PersonalGoalsError';
    }
}
const MAX_TITLE_LENGTH = 200;
const MAX_DETAIL_LENGTH = 4000;
const MAX_DONE_CRITERIA_LENGTH = 2000;
const MAX_NOTES_LENGTH = 4000;
const MAX_IDEA_LENGTH = 2000;
const MAX_PLAN_TASKS = 20;
const CHECK_IN_INTERVAL_SECONDS = 604800;
const CHECK_IN_TITLE_MAX = 120;
const DEFAULT_MONITOR_COOLDOWN_HOURS = 24;
const DEFAULT_MAX_CHECKS_PER_MONITOR = 200;
const DEFAULT_MAX_ACTIVE_MONITORS = 5;
const MONITOR_CADENCE_SECONDS = {
    daily: 86400,
    every_12h: 43200,
    every_6h: 21600,
    weekly: 604800,
};
/** Validated monitor bounds. */
export const Config = z.object({
    monitorCooldownHours: z.number().step(1).min(1).max(720).default(DEFAULT_MONITOR_COOLDOWN_HOURS),
    maxChecksPerMonitor: z.number().step(1).min(10).max(2000).default(DEFAULT_MAX_CHECKS_PER_MONITOR),
    maxActiveMonitors: z.number().step(1).min(1).max(50).default(DEFAULT_MAX_ACTIVE_MONITORS),
});
/** Weekly check-in reminder title for one goal. */
function checkInTitle(title) {
    return `Check-in: ${title}`.slice(0, CHECK_IN_TITLE_MAX);
}
/** Weekly check-in prompt; the marker tells the model this is a goal review. */
function checkInPrompt(goalId, title) {
    return `[PERSONAL GOALS CHECK-IN] goal=${goalId}\n`
        + `Review the goal "${title}": read the goal and its steps, summarize the last period, ask the user about `
        + 'progress, and update step status. If a check-in was missed, add a short note and roll forward; do not mark '
        + 'the goal blocked automatically. When every step is done or the plan period ends, ask whether the goal is '
        + 'complete; if it finished early, ask whether to append the next phase or create a new goal.';
}
/** Monitor check prompt; the marker tells the model this is a state observation. */
function monitorPrompt(goalId, monitor) {
    const sources = monitor.preferredSources === undefined || monitor.preferredSources.length === 0
        ? ''
        : `\nPreferred sources: ${monitor.preferredSources.join(', ')}`;
    return `[PERSONAL GOALS MONITOR] goal=${goalId} mode=${monitor.mode}\n`
        + `Watch "${monitor.subject}": ${monitor.condition}${sources}\n`
        + 'Research the current external state with web search or fetch. Record the result with personal_monitor_record '
        + '(summary, matched, value, source, error). Notify the user only when the condition first matches or after the '
        + 'cooldown; if the check is ambiguous, record why and do not match. Never buy, book, or execute any action.';
}
function requiredInstant(value, field) {
    const text = value.trim();
    if (!isInstant(text))
        throw new PersonalGoalsError('invalid_input', `${field} must be an ISO 8601 instant`);
    return text;
}
function normalizeSources(values) {
    if (values === undefined)
        return undefined;
    const sources = values.map(value => value.trim()).filter(value => value.length > 0);
    if (sources.length === 0)
        return undefined;
    if (sources.length > 5) {
        throw new PersonalGoalsError('invalid_input', 'preferredSources must contain at most 5 entries');
    }
    if (sources.some(source => source.length > 500)) {
        throw new PersonalGoalsError('invalid_input', 'preferredSources entries must be at most 500 characters');
    }
    return sources;
}
function validateThreshold(threshold) {
    if (threshold === undefined)
        return undefined;
    const metric = requiredText(threshold.metric, 'threshold.metric', MAX_TITLE_LENGTH);
    if (!Number.isFinite(threshold.value)) {
        throw new PersonalGoalsError('invalid_input', 'threshold.value must be a finite number');
    }
    const unit = optionalText(threshold.unit, 'threshold.unit', 32);
    return {
        metric,
        operator: threshold.operator,
        value: threshold.value,
        ...(unit === undefined ? {} : { unit }),
    };
}
const GOAL_TRANSITIONS = {
    active: ['paused', 'blocked', 'completed', 'archived'],
    paused: ['active', 'completed', 'archived'],
    blocked: ['active', 'completed', 'archived'],
    completed: ['archived'],
    archived: [],
};
const TASK_TRANSITIONS = {
    pending: ['in_progress', 'blocked', 'done', 'cancelled'],
    in_progress: ['pending', 'blocked', 'done', 'cancelled'],
    blocked: ['pending', 'in_progress', 'done', 'cancelled'],
    done: ['in_progress'],
    cancelled: [],
};
/**
 * Validate one transition against the closed status graph.
 * @param from - current status.
 * @param to - requested status.
 * @param table - transition table for the record kind.
 * @param subject - record kind used in the failure message.
 */
function assertTransition(from, to, table, subject) {
    if (!table[from].includes(to)) {
        throw new PersonalGoalsError('invalid_transition', `A ${subject} cannot move from ${from} to ${to}`);
    }
}
function timestamp() {
    return new Date().toISOString();
}
function requiredText(value, field, max) {
    const text = value.trim();
    if (text.length === 0)
        throw new PersonalGoalsError('invalid_input', `${field} must not be empty`);
    if (text.length > max)
        throw new PersonalGoalsError('invalid_input', `${field} must be at most ${max} characters`);
    return text;
}
function optionalText(value, field, max) {
    if (value === undefined)
        return undefined;
    const text = value.trim();
    if (text.length === 0)
        return undefined;
    if (text.length > max)
        throw new PersonalGoalsError('invalid_input', `${field} must be at most ${max} characters`);
    return text;
}
function optionalInstant(value, field) {
    if (value === undefined)
        return undefined;
    const text = value.trim();
    if (!isInstant(text))
        throw new PersonalGoalsError('invalid_input', `${field} must be an ISO 8601 instant`);
    return text;
}
function firstLine(content) {
    const line = content.split('\n', 1)[0] ?? content;
    return line.trim().slice(0, MAX_TITLE_LENGTH);
}
/**
 * Project one goal with its tasks and open-suggestion count.
 * @param goal - stored goal.
 * @param tasks - every stored task.
 * @param ideas - every stored idea.
 * @returns the goal as the page and tools read it.
 */
function goalView(goal, tasks, ideas) {
    return {
        ...goal,
        tasks: tasks
            .filter(task => task.goalId === goal.id)
            // Stable sort: tasks created by one plan share a timestamp and keep their
            // insertion order, which is the execution order the plan was written in.
            .toSorted((left, right) => left.createdAt.localeCompare(right.createdAt)),
        openIdeaCount: ideas.filter(idea => idea.goalId === goal.id && idea.status === 'open').length,
    };
}
/** Cross-session Personal Goals service; every mutation is durable before it is visible. */
let PersonalGoalsService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    let _delete_decorators;
    let _overview_decorators;
    let _get_decorators;
    let _create_decorators;
    let _createMonitor_decorators;
    let _resumeMonitor_decorators;
    let _listChecks_decorators;
    let _update_decorators;
    let _addTask_decorators;
    let _updateTask_decorators;
    let _listIdeas_decorators;
    let _acceptIdea_decorators;
    let _dismissIdea_decorators;
    return class PersonalGoalsService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _list_decorators = [Remote('list')];
            _delete_decorators = [Remote('delete')];
            _overview_decorators = [Remote('overview')];
            _get_decorators = [Remote('get')];
            _create_decorators = [Remote('create')];
            _createMonitor_decorators = [Remote('createMonitor')];
            _resumeMonitor_decorators = [Remote('resumeMonitor')];
            _listChecks_decorators = [Remote('listChecks')];
            _update_decorators = [Remote('update')];
            _addTask_decorators = [Remote('addTask')];
            _updateTask_decorators = [Remote('updateTask')];
            _listIdeas_decorators = [Remote('listIdeas')];
            _acceptIdea_decorators = [Remote('acceptIdea')];
            _dismissIdea_decorators = [Remote('dismissIdea')];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _overview_decorators, { kind: "method", name: "overview", static: false, private: false, access: { has: obj => "overview" in obj, get: obj => obj.overview }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_decorators, { kind: "method", name: "get", static: false, private: false, access: { has: obj => "get" in obj, get: obj => obj.get }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createMonitor_decorators, { kind: "method", name: "createMonitor", static: false, private: false, access: { has: obj => "createMonitor" in obj, get: obj => obj.createMonitor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resumeMonitor_decorators, { kind: "method", name: "resumeMonitor", static: false, private: false, access: { has: obj => "resumeMonitor" in obj, get: obj => obj.resumeMonitor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listChecks_decorators, { kind: "method", name: "listChecks", static: false, private: false, access: { has: obj => "listChecks" in obj, get: obj => obj.listChecks }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addTask_decorators, { kind: "method", name: "addTask", static: false, private: false, access: { has: obj => "addTask" in obj, get: obj => obj.addTask }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTask_decorators, { kind: "method", name: "updateTask", static: false, private: false, access: { has: obj => "updateTask" in obj, get: obj => obj.updateTask }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listIdeas_decorators, { kind: "method", name: "listIdeas", static: false, private: false, access: { has: obj => "listIdeas" in obj, get: obj => obj.listIdeas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _acceptIdea_decorators, { kind: "method", name: "acceptIdea", static: false, private: false, access: { has: obj => "acceptIdea" in obj, get: obj => obj.acceptIdea }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _dismissIdea_decorators, { kind: "method", name: "dismissIdea", static: false, private: false, access: { has: obj => "dismissIdea" in obj, get: obj => obj.dismissIdea }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['storageDomain', 'schedule'];
        static Config = Config;
        ready = __runInitializers(this, _instanceExtraInitializers);
        initialized;
        monitorCooldownHours;
        maxChecksPerMonitor;
        maxActiveMonitors;
        domain;
        chain = Promise.resolve();
        stopping = false;
        /**
         * @param ctx - Host context providing the storage-domain facility.
         * @param config - monitor bounds; omissions use deployment defaults.
         */
        constructor(ctx, config = {}) {
            super(ctx, 'personalGoals');
            this.monitorCooldownHours = config.monitorCooldownHours ?? DEFAULT_MONITOR_COOLDOWN_HOURS;
            this.maxChecksPerMonitor = config.maxChecksPerMonitor ?? DEFAULT_MAX_CHECKS_PER_MONITOR;
            this.maxActiveMonitors = config.maxActiveMonitors ?? DEFAULT_MAX_ACTIVE_MONITORS;
            this.ready = ctx.storageDomain.open(personalGoalsDomain).then((domain) => {
                this.domain = domain;
                return domain;
            });
            this.initialized = ctx.effect(async () => {
                const domain = await this.ready;
                return async () => {
                    this.stopping = true;
                    await this.chain.catch(() => undefined);
                    await domain.close();
                };
            });
        }
        /** Wait until the storage domain is open and readable. */
        async [Service.init]() {
            await this.initialized;
        }
        /**
         * List every goal with its tasks, most recently updated first.
         * @returns the current goals.
         */
        async list() {
            const domain = await this.getDomain();
            const tasks = this.allTasks(domain);
            const ideas = this.allIdeas(domain);
            return this.allGoals(domain)
                .map(goal => goalView(goal, tasks, ideas))
                .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id));
        }
        /**
         * Delete one goal together with its tasks and linked suggestions.
         *
         * Deletion is user-only: it is exposed on the Remote surface and has no model
         * tool. Suggestions and tasks are removed before the goal, so a failed
         * cascade leaves a retryable goal rather than orphaned child records.
         * @param request - goal identity.
         * @returns whether the goal existed and was removed.
         */
        async delete(request) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const goals = domain.table('goals');
                const goal = goals.get(request.goalId);
                if (goal === undefined) {
                    return { goalId: request.goalId, deleted: false };
                }
                await this.deleteCheckIn(goal);
                const ideas = domain.table('ideas');
                for (const [id, idea] of [...ideas.entries()]) {
                    if (idea.goalId === request.goalId)
                        await ideas.delete(id);
                }
                const checks = domain.table('checks');
                for (const [id, check] of [...checks.entries()]) {
                    if (check.goalId === request.goalId)
                        await checks.delete(id);
                }
                const tasks = domain.table('tasks');
                for (const [id, task] of [...tasks.entries()]) {
                    if (task.goalId === request.goalId)
                        await tasks.delete(id);
                }
                await goals.delete(request.goalId);
                this.emitDeleted(request.goalId);
                this.emitChanged();
                return { goalId: request.goalId, deleted: true };
            });
        }
        /**
         * Read a flat report of current goals, open steps, and completed steps.
         *
         * This is the cross-plugin query seam: another Host plugin injects
         * `personalGoals` and calls `overview()` without projecting storage itself.
         * `openTasks` covers pending, in-progress, and blocked steps; cancelled steps
         * appear in neither list.
         * @returns goals with task context and the two flattened task lists.
         */
        async overview() {
            const domain = await this.getDomain();
            const tasks = this.allTasks(domain);
            const ideas = this.allIdeas(domain);
            const goals = this.allGoals(domain)
                .map(goal => goalView(goal, tasks, ideas))
                .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id));
            const openTasks = [];
            const completedTasks = [];
            for (const goal of goals) {
                for (const task of goal.tasks) {
                    const summary = {
                        goalId: goal.id,
                        goalTitle: goal.title,
                        goalStatus: goal.status,
                        taskId: task.id,
                        title: task.title,
                        status: task.status,
                        ...(task.dueAt === undefined ? {} : { dueAt: task.dueAt }),
                    };
                    if (task.status === 'pending' || task.status === 'in_progress' || task.status === 'blocked') {
                        openTasks.push(summary);
                    }
                    else if (task.status === 'done') {
                        completedTasks.push(summary);
                    }
                }
            }
            return { goals, openTasks, completedTasks };
        }
        /**
         * Read one goal.
         * @param request - goal identity.
         * @returns the goal, or null when it does not exist.
         */
        async get(request) {
            const domain = await this.getDomain();
            const goal = domain.table('goals').get(request.goalId);
            if (goal === undefined)
                return null;
            return goalView(goal, this.allTasks(domain), this.allIdeas(domain));
        }
        /**
         * Create one goal from an explicit user action.
         * @param input - title, optional detail, and optional completion criteria.
         * @returns the created goal.
         */
        async create(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const detail = optionalText(input.detail, 'detail', MAX_DETAIL_LENGTH);
                const doneCriteria = optionalText(input.doneCriteria, 'doneCriteria', MAX_DONE_CRITERIA_LENGTH);
                const now = timestamp();
                const record = {
                    id: PersonalGoalId(randomUUID()),
                    title: requiredText(input.title, 'title', MAX_TITLE_LENGTH),
                    status: 'active',
                    kind: 'plan',
                    createdAt: now,
                    updatedAt: now,
                    ...(detail === undefined ? {} : { detail }),
                    ...(doneCriteria === undefined ? {} : { doneCriteria }),
                };
                await domain.table('goals').put(record.id, record);
                this.emitChanged();
                return goalView(record, [], []);
            });
        }
        /**
         * Create one goal together with its initial steps after an explicit user request.
         *
         * Every field is validated before the first write, so an invalid step cannot
         * leave a goal behind. The tool layer owns the human-authority check; this
         * method is not Remote-exposed.
         * @param input - goal fields plus ordered initial steps.
         * @returns the created goal and its steps.
         */
        async createPlan(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const title = requiredText(input.title, 'title', MAX_TITLE_LENGTH);
                const detail = optionalText(input.detail, 'detail', MAX_DETAIL_LENGTH);
                const doneCriteria = optionalText(input.doneCriteria, 'doneCriteria', MAX_DONE_CRITERIA_LENGTH);
                if (input.tasks.length > MAX_PLAN_TASKS) {
                    throw new PersonalGoalsError('invalid_input', `tasks must contain at most ${MAX_PLAN_TASKS} entries`);
                }
                const steps = input.tasks.map((task, index) => ({
                    title: requiredText(task.title, `tasks[${index}].title`, MAX_TITLE_LENGTH),
                    notes: optionalText(task.notes, `tasks[${index}].notes`, MAX_NOTES_LENGTH),
                    dueAt: optionalInstant(task.dueAt, `tasks[${index}].dueAt`),
                }));
                const now = timestamp();
                let goal = {
                    id: PersonalGoalId(randomUUID()),
                    title,
                    status: 'active',
                    kind: 'plan',
                    createdAt: now,
                    updatedAt: now,
                    ...(detail === undefined ? {} : { detail }),
                    ...(doneCriteria === undefined ? {} : { doneCriteria }),
                };
                await domain.table('goals').put(goal.id, goal);
                const tasks = [];
                for (const step of steps) {
                    const task = {
                        id: PersonalTaskId(randomUUID()),
                        goalId: goal.id,
                        title: step.title,
                        status: 'pending',
                        createdAt: now,
                        updatedAt: now,
                        ...(step.notes === undefined ? {} : { notes: step.notes }),
                        ...(step.dueAt === undefined ? {} : { dueAt: step.dueAt }),
                    };
                    await domain.table('tasks').put(task.id, task);
                    tasks.push(task);
                }
                if (input.checkInSessionId !== undefined) {
                    const withSession = { ...goal, checkInSessionId: input.checkInSessionId };
                    const scheduleId = await this.ensureCheckIn(withSession);
                    if (scheduleId !== undefined) {
                        goal = { ...withSession, checkInScheduleId: scheduleId };
                        await domain.table('goals').put(goal.id, goal);
                    }
                }
                this.emitChanged();
                return { goal, tasks };
            });
        }
        /**
         * Create one monitor goal and schedule its checks.
         *
         * Monitors have no tasks: the check cadence, condition, and expiry are the
         * whole plan. Checks are scheduled in the calling Session, which is required
         * so a monitor cannot outlive its only observation channel.
         * @param input - monitor subject, condition, cadence, bounds, and check-in Session.
         * @returns the created monitor as a goal view.
         */
        async createMonitor(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const subject = requiredText(input.subject, 'subject', MAX_TITLE_LENGTH);
                const condition = requiredText(input.condition, 'condition', MAX_IDEA_LENGTH);
                const checkInSessionId = requiredText(input.checkInSessionId, 'checkInSessionId', MAX_IDEA_LENGTH);
                const expiresAt = requiredInstant(input.expiresAt, 'expiresAt');
                if (Date.parse(expiresAt) <= Date.now()) {
                    throw new PersonalGoalsError('invalid_input', 'expiresAt must be in the future');
                }
                const threshold = input.mode === 'threshold' ? validateThreshold(input.threshold) : undefined;
                if (input.mode === 'threshold' && threshold === undefined) {
                    throw new PersonalGoalsError('invalid_input', 'threshold monitors require a threshold');
                }
                const sources = normalizeSources(input.preferredSources);
                const activeMonitors = this.allGoals(domain).filter(goal => goal.kind === 'monitor' && goal.status === 'active');
                if (activeMonitors.length >= this.maxActiveMonitors) {
                    throw new PersonalGoalsError('invalid_input', `At most ${this.maxActiveMonitors} active monitors are allowed`);
                }
                const now = timestamp();
                const monitor = {
                    subject,
                    condition,
                    mode: input.mode,
                    cadence: input.cadence,
                    once: input.once,
                    expiresAt,
                    errorStreak: 0,
                    ...(threshold === undefined ? {} : { threshold }),
                    ...(sources === undefined ? {} : { preferredSources: sources }),
                };
                let goal = {
                    id: PersonalGoalId(randomUUID()),
                    title: subject,
                    status: 'active',
                    kind: 'monitor',
                    monitor,
                    checkInSessionId,
                    createdAt: now,
                    updatedAt: now,
                };
                await domain.table('goals').put(goal.id, goal);
                const scheduleId = await this.ensureCheckIn(goal);
                if (scheduleId !== undefined) {
                    goal = { ...goal, checkInScheduleId: scheduleId };
                    await domain.table('goals').put(goal.id, goal);
                }
                this.emitChanged();
                return goalView(goal, [], []);
            });
        }
        /**
         * Record one monitor observation and apply its trigger, cooldown, expiry, or
         * failure transition. This method serves the model tool; it is not Remote.
         * @param input - observed state, source, and failure detail.
         * @returns the stored observation and the transitions it caused.
         */
        async recordCheck(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const goals = domain.table('goals');
                const goal = goals.get(input.goalId);
                if (goal === undefined) {
                    throw new PersonalGoalsError('goal_not_found', `Goal ${input.goalId} does not exist`);
                }
                if (goal.kind !== 'monitor' || goal.monitor === undefined) {
                    throw new PersonalGoalsError('not_a_monitor', `Goal ${input.goalId} is not a monitor`);
                }
                if (goal.status !== 'active') {
                    throw new PersonalGoalsError('monitor_not_active', `Monitor ${input.goalId} is ${goal.status}`);
                }
                const monitor = goal.monitor;
                const now = input.checkedAt === undefined ? timestamp() : requiredInstant(input.checkedAt, 'checkedAt');
                const expired = Date.parse(now) >= Date.parse(monitor.expiresAt);
                const value = optionalText(input.value, 'value', MAX_IDEA_LENGTH);
                const source = optionalText(input.source, 'source', 500);
                const errorText = optionalText(input.error, 'error', MAX_IDEA_LENGTH);
                const check = {
                    id: PersonalMonitorCheckId(randomUUID()),
                    goalId: goal.id,
                    checkedAt: now,
                    summary: requiredText(input.summary, 'summary', MAX_IDEA_LENGTH),
                    matched: input.matched,
                    ...(value === undefined ? {} : { value }),
                    ...(source === undefined ? {} : { source }),
                    ...(errorText === undefined ? {} : { error: errorText }),
                };
                await domain.table('checks').put(check.id, check);
                await this.pruneChecks(domain, goal.id);
                let nextMonitor = {
                    ...monitor,
                    lastCheckAt: now,
                    lastSummary: check.summary,
                    ...(check.value === undefined ? {} : { lastValue: check.value }),
                    ...(check.source === undefined ? {} : { lastSource: check.source }),
                    errorStreak: check.error === undefined ? 0 : monitor.errorStreak + 1,
                    ...(check.error === undefined ? { failureNotifiedAt: undefined } : {}),
                };
                let next = { ...goal, monitor: nextMonitor, updatedAt: now };
                let triggered = false;
                let warn = false;
                if (expired) {
                    nextMonitor = { ...nextMonitor, expiredAt: now };
                    next = { ...next, status: 'archived', monitor: nextMonitor };
                    await this.deleteCheckIn(next);
                    next = { ...next, checkInScheduleId: undefined };
                }
                else if (check.error !== undefined) {
                    if (nextMonitor.errorStreak >= 3 && monitor.failureNotifiedAt === undefined) {
                        warn = true;
                        nextMonitor = { ...nextMonitor, failureNotifiedAt: now };
                        next = { ...next, monitor: nextMonitor };
                    }
                }
                else if (input.matched) {
                    const inCooldown = monitor.cooldownUntil !== undefined
                        && Date.parse(now) < Date.parse(monitor.cooldownUntil);
                    if (!inCooldown) {
                        triggered = true;
                        const cooldownUntil = monitor.once
                            ? undefined
                            : new Date(Date.parse(now) + this.monitorCooldownHours * 3_600_000).toISOString();
                        nextMonitor = {
                            ...nextMonitor,
                            triggeredAt: monitor.triggeredAt ?? now,
                            lastNotifiedAt: now,
                            ...(cooldownUntil === undefined ? {} : { cooldownUntil }),
                        };
                        next = { ...next, monitor: nextMonitor };
                        await this.deleteCheckIn(next);
                        next = { ...next, checkInScheduleId: undefined };
                    }
                }
                else {
                    nextMonitor = { ...nextMonitor, cooldownUntil: undefined, failureNotifiedAt: undefined };
                    next = { ...next, monitor: nextMonitor };
                }
                await goals.put(next.id, next);
                this.emitChanged();
                return {
                    goalId: next.id,
                    check,
                    triggered,
                    expired,
                    warn,
                    ...(nextMonitor.cooldownUntil === undefined ? {} : { cooldownUntil: nextMonitor.cooldownUntil }),
                };
            });
        }
        /**
         * Resume a triggered monitor after the user chose to keep watching.
         * @param request - monitor identity.
         * @returns the resumed monitor.
         */
        async resumeMonitor(request) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const goals = domain.table('goals');
                const current = goals.get(request.goalId);
                if (current === undefined) {
                    throw new PersonalGoalsError('goal_not_found', `Goal ${request.goalId} does not exist`);
                }
                if (current.kind !== 'monitor' || current.monitor === undefined) {
                    throw new PersonalGoalsError('not_a_monitor', `Goal ${request.goalId} is not a monitor`);
                }
                const now = timestamp();
                const cooldownUntil = new Date(Date.parse(now) + this.monitorCooldownHours * 3_600_000).toISOString();
                let next = {
                    ...current,
                    status: 'active',
                    updatedAt: now,
                    monitor: { ...current.monitor, cooldownUntil },
                };
                if (next.checkInSessionId !== undefined && next.checkInScheduleId === undefined) {
                    const scheduleId = await this.ensureCheckIn(next);
                    if (scheduleId !== undefined)
                        next = { ...next, checkInScheduleId: scheduleId };
                }
                await goals.put(next.id, next);
                this.emitChanged();
                return goalView(next, this.allTasks(domain), this.allIdeas(domain));
            });
        }
        /**
         * List recent observations for one monitor, newest first.
         * @param input - monitor identity and record limit.
         * @returns stored observations.
         */
        async listChecks(input) {
            const domain = await this.getDomain();
            const limit = Math.min(200, Math.max(1, input.limit ?? 20));
            return this.allChecks(domain)
                .filter(check => check.goalId === input.goalId)
                .toSorted((left, right) => right.checkedAt.localeCompare(left.checkedAt))
                .slice(0, limit);
        }
        /**
         * Update one goal; `status` is how a user completes or archives it.
         * @param request - goal identity plus the fields to replace.
         * @returns the updated goal.
         */
        async update(request) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const goals = domain.table('goals');
                const current = goals.get(request.goalId);
                if (current === undefined) {
                    throw new PersonalGoalsError('goal_not_found', `Goal ${request.goalId} does not exist`);
                }
                let next = { ...current, updatedAt: timestamp() };
                if (request.title !== undefined) {
                    next = { ...next, title: requiredText(request.title, 'title', MAX_TITLE_LENGTH) };
                }
                if (request.detail !== undefined) {
                    const detail = optionalText(request.detail, 'detail', MAX_DETAIL_LENGTH);
                    next = detail === undefined ? { ...next, detail: undefined } : { ...next, detail };
                }
                if (request.doneCriteria !== undefined) {
                    const doneCriteria = optionalText(request.doneCriteria, 'doneCriteria', MAX_DONE_CRITERIA_LENGTH);
                    next = doneCriteria === undefined ? { ...next, doneCriteria: undefined } : { ...next, doneCriteria };
                }
                if (request.status !== undefined && request.status !== current.status) {
                    assertTransition(current.status, request.status, GOAL_TRANSITIONS, 'goal');
                    next = { ...next, status: request.status };
                    if (request.status === 'completed')
                        next = { ...next, completedAt: next.updatedAt };
                    if (request.status === 'paused' || request.status === 'completed' || request.status === 'archived') {
                        await this.deleteCheckIn(current);
                        next = { ...next, checkInScheduleId: undefined };
                    }
                    else if (request.status === 'active' && current.status === 'paused') {
                        const scheduleId = await this.ensureCheckIn(next);
                        if (scheduleId !== undefined)
                            next = { ...next, checkInScheduleId: scheduleId };
                    }
                }
                await goals.put(next.id, next);
                this.emitChanged();
                return goalView(next, this.allTasks(domain), this.allIdeas(domain));
            });
        }
        /**
         * Add one task to a goal.
         * @param input - goal identity and task fields.
         * @returns the created task.
         */
        async addTask(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const owner = domain.table('goals').get(input.goalId);
                if (owner === undefined) {
                    throw new PersonalGoalsError('goal_not_found', `Goal ${input.goalId} does not exist`);
                }
                if (owner.kind === 'monitor') {
                    throw new PersonalGoalsError('not_a_plan', 'Monitor goals do not have tasks');
                }
                if (input.parentTaskId !== undefined) {
                    const parent = domain.table('tasks').get(input.parentTaskId);
                    if (parent === undefined) {
                        throw new PersonalGoalsError('task_not_found', `Task ${input.parentTaskId} does not exist`);
                    }
                    if (parent.goalId !== input.goalId) {
                        throw new PersonalGoalsError('invalid_parent', 'A parent task must belong to the same goal');
                    }
                }
                const notes = optionalText(input.notes, 'notes', MAX_NOTES_LENGTH);
                const dueAt = optionalInstant(input.dueAt, 'dueAt');
                const now = timestamp();
                const task = {
                    id: PersonalTaskId(randomUUID()),
                    goalId: input.goalId,
                    title: requiredText(input.title, 'title', MAX_TITLE_LENGTH),
                    status: 'pending',
                    createdAt: now,
                    updatedAt: now,
                    ...(input.parentTaskId === undefined ? {} : { parentTaskId: input.parentTaskId }),
                    ...(notes === undefined ? {} : { notes }),
                    ...(dueAt === undefined ? {} : { dueAt }),
                };
                await domain.table('tasks').put(task.id, task);
                this.emitChanged();
                return task;
            });
        }
        /**
         * Update one task's text, due instant, or work state.
         * @param request - task identity plus the fields to replace.
         * @returns the updated task.
         */
        async updateTask(request) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const tasks = domain.table('tasks');
                const current = tasks.get(request.taskId);
                if (current === undefined) {
                    throw new PersonalGoalsError('task_not_found', `Task ${request.taskId} does not exist`);
                }
                let next = { ...current, updatedAt: timestamp() };
                if (request.title !== undefined) {
                    next = { ...next, title: requiredText(request.title, 'title', MAX_TITLE_LENGTH) };
                }
                if (request.notes !== undefined) {
                    const notes = optionalText(request.notes, 'notes', MAX_NOTES_LENGTH);
                    next = notes === undefined ? { ...next, notes: undefined } : { ...next, notes };
                }
                if (request.dueAt !== undefined) {
                    const dueAt = optionalInstant(request.dueAt, 'dueAt');
                    next = dueAt === undefined ? { ...next, dueAt: undefined } : { ...next, dueAt };
                }
                if (request.status !== undefined && request.status !== current.status) {
                    assertTransition(current.status, request.status, TASK_TRANSITIONS, 'task');
                    next = { ...next, status: request.status };
                }
                await tasks.put(next.id, next);
                this.emitChanged();
                return next;
            });
        }
        /**
         * List suggestions, newest first.
         * @param input - optional review-state filter.
         * @returns matching suggestions.
         */
        async listIdeas(input) {
            const domain = await this.getDomain();
            return this.allIdeas(domain)
                .filter(idea => input.status === undefined || idea.status === input.status)
                .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id));
        }
        /**
         * Record one suggestion. Not Remote-exposed: the model tool is the only producer.
         * @param input - suggestion text, optional target, and session evidence.
         * @returns the stored suggestion; an identical open suggestion is reused.
         */
        async proposeIdea(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const content = requiredText(input.content, 'content', MAX_IDEA_LENGTH);
                if (input.goalId !== undefined && input.suggestedGoalTitle !== undefined) {
                    throw new PersonalGoalsError('invalid_input', 'An idea targets an existing goal or proposes a new title, not both');
                }
                if (input.goalId !== undefined && domain.table('goals').get(input.goalId) === undefined) {
                    throw new PersonalGoalsError('goal_not_found', `Goal ${input.goalId} does not exist`);
                }
                const suggestedGoalTitle = optionalText(input.suggestedGoalTitle, 'suggestedGoalTitle', MAX_TITLE_LENGTH);
                const sessionId = requiredText(input.source.sessionId, 'source.sessionId', MAX_TITLE_LENGTH);
                const duplicate = this.allIdeas(domain).find(idea => idea.status === 'open'
                    && idea.content === content
                    && idea.goalId === input.goalId
                    && idea.suggestedGoalTitle === suggestedGoalTitle);
                if (duplicate !== undefined)
                    return duplicate;
                const now = timestamp();
                const idea = {
                    id: PersonalIdeaId(randomUUID()),
                    content,
                    status: 'open',
                    source: {
                        sessionId,
                        ...(input.source.messageId === undefined ? {} : { messageId: input.source.messageId }),
                    },
                    createdAt: now,
                    ...(input.goalId === undefined ? {} : { goalId: input.goalId }),
                    ...(suggestedGoalTitle === undefined ? {} : { suggestedGoalTitle }),
                };
                await domain.table('ideas').put(idea.id, idea);
                this.emitChanged();
                return idea;
            });
        }
        /**
         * Accept one suggestion into a goal and derive exactly one task.
         * @param input - idea identity plus the target goal or a new goal title.
         * @returns the resolved idea and what acceptance produced.
         */
        async acceptIdea(input) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const ideas = domain.table('ideas');
                const goals = domain.table('goals');
                const current = ideas.get(input.ideaId);
                if (current === undefined) {
                    throw new PersonalGoalsError('idea_not_found', `Idea ${input.ideaId} does not exist`);
                }
                if (current.status !== 'open') {
                    throw new PersonalGoalsError('idea_not_open', `Idea ${input.ideaId} is already ${current.status}`);
                }
                const now = timestamp();
                let goal;
                let goalId;
                if (input.goalId !== undefined) {
                    goal = goals.get(input.goalId);
                    if (goal === undefined)
                        throw new PersonalGoalsError('goal_not_found', `Goal ${input.goalId} does not exist`);
                    goalId = goal.id;
                }
                else if (current.goalId !== undefined) {
                    goal = goals.get(current.goalId);
                    if (goal === undefined)
                        throw new PersonalGoalsError('goal_not_found', `Goal ${current.goalId} does not exist`);
                    goalId = goal.id;
                }
                else {
                    const title = optionalText(input.newGoalTitle, 'newGoalTitle', MAX_TITLE_LENGTH)
                        ?? current.suggestedGoalTitle;
                    if (title === undefined) {
                        throw new PersonalGoalsError('idea_needs_target', 'Choose an existing goal or name the goal this idea becomes');
                    }
                    goal = {
                        id: PersonalGoalId(randomUUID()),
                        title: requiredText(title, 'title', MAX_TITLE_LENGTH),
                        status: 'active',
                        kind: 'plan',
                        createdAt: now,
                        updatedAt: now,
                    };
                    await goals.put(goal.id, goal);
                    goalId = goal.id;
                }
                const task = {
                    id: PersonalTaskId(randomUUID()),
                    goalId,
                    title: firstLine(current.content),
                    status: 'pending',
                    createdAt: now,
                    updatedAt: now,
                };
                await domain.table('tasks').put(task.id, task);
                const idea = { ...current, status: 'accepted', goalId, resolvedAt: now };
                await ideas.put(idea.id, idea);
                this.emitChanged();
                return { idea, task, goal };
            });
        }
        /**
         * Dismiss one suggestion without creating work.
         * @param request - idea identity.
         * @returns the dismissed idea.
         */
        async dismissIdea(request) {
            return this.serialize(async () => {
                const domain = await this.getDomain();
                const ideas = domain.table('ideas');
                const current = ideas.get(request.ideaId);
                if (current === undefined) {
                    throw new PersonalGoalsError('idea_not_found', `Idea ${request.ideaId} does not exist`);
                }
                if (current.status !== 'open') {
                    throw new PersonalGoalsError('idea_not_open', `Idea ${request.ideaId} is already ${current.status}`);
                }
                const idea = { ...current, status: 'dismissed', resolvedAt: timestamp() };
                await ideas.put(idea.id, idea);
                this.emitChanged();
                return idea;
            });
        }
        /**
         * Render the bounded goal list for the system-prompt section.
         *
         * Synchronous by contract: prompt assembly cannot await storage. Before the
         * domain opens this returns an empty list, which is the same state as a user
         * with no goals.
         * @param maxGoals - maximum goals to include; non-positive values produce none.
         * @returns active, paused, and blocked goals ordered by most recent update.
         */
        snapshotForPrompt(maxGoals) {
            const domain = this.domain;
            if (domain === undefined)
                return [];
            const tasks = this.allTasks(domain);
            return this.allGoals(domain)
                .filter(goal => goal.status === 'active' || goal.status === 'paused' || goal.status === 'blocked')
                .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id))
                .slice(0, Math.max(0, maxGoals))
                .map((goal) => {
                const owned = tasks.filter(task => task.goalId === goal.id);
                return {
                    id: goal.id,
                    title: goal.title,
                    status: goal.status,
                    openTasks: owned.filter(task => task.status === 'pending' || task.status === 'in_progress' || task.status === 'blocked').length,
                    totalTasks: owned.length,
                };
            });
        }
        allGoals(domain) {
            return [...domain.table('goals').entries()].map(([, goal]) => goal);
        }
        allTasks(domain) {
            return [...domain.table('tasks').entries()].map(([, task]) => task);
        }
        allIdeas(domain) {
            return [...domain.table('ideas').entries()].map(([, idea]) => idea);
        }
        allChecks(domain) {
            return [...domain.table('checks').entries()].map(([, check]) => check);
        }
        /** Keep only the newest configured number of observations for one monitor. */
        async pruneChecks(domain, goalId) {
            const checks = this.allChecks(domain)
                .filter(check => check.goalId === goalId)
                .toSorted((left, right) => left.checkedAt.localeCompare(right.checkedAt));
            const excess = checks.slice(0, Math.max(0, checks.length - this.maxChecksPerMonitor));
            for (const check of excess)
                await domain.table('checks').delete(check.id);
        }
        async getDomain() {
            await this.initialized;
            return this.ready;
        }
        /** Delete the weekly check-in bound to one goal, when it still exists. */
        async deleteCheckIn(goal) {
            if (goal.checkInSessionId === undefined || goal.checkInScheduleId === undefined)
                return;
            await this.ctx.schedule.delete({
                sessionId: SessionId(goal.checkInSessionId),
                id: ScheduleId(goal.checkInScheduleId),
            });
        }
        /**
         * Create the weekly check-in for one goal and return its schedule id.
         * Scheduling failure is logged and leaves the goal usable without a reminder.
         */
        async ensureCheckIn(goal) {
            if (goal.checkInSessionId === undefined || goal.checkInScheduleId !== undefined)
                return undefined;
            const monitor = goal.kind === 'monitor' ? goal.monitor : undefined;
            try {
                const record = await this.ctx.schedule.create(SessionId(goal.checkInSessionId), {
                    title: checkInTitle(goal.title),
                    prompt: monitor === undefined ? checkInPrompt(goal.id, goal.title) : monitorPrompt(goal.id, monitor),
                    every_seconds: monitor === undefined ? CHECK_IN_INTERVAL_SECONDS : MONITOR_CADENCE_SECONDS[monitor.cadence],
                });
                return record.id;
            }
            catch (error) {
                this.ctx.logger.warn(`personal-goals: check-in scheduling failed: ${String(error)}`);
                return undefined;
            }
        }
        emitChanged() {
            try {
                this.ctx.emit('personalGoals/changed');
            }
            catch (error) {
                this.ctx.logger.warn(`personal-goals: personalGoals/changed listener failed: ${String(error)}`);
            }
        }
        emitDeleted(goalId) {
            try {
                this.ctx.emit('personalGoals/deleted', goalId);
            }
            catch (error) {
                this.ctx.logger.warn(`personal-goals: personalGoals/deleted listener failed: ${String(error)}`);
            }
        }
        serialize(work) {
            if (this.stopping) {
                return Promise.reject(new PersonalGoalsError('unavailable', 'The Personal Goals service is stopping'));
            }
            const pending = this.chain.then(work);
            this.chain = pending.catch(() => undefined);
            return pending;
        }
    };
})();
export { PersonalGoalsService };
export default PersonalGoalsService;
//# sourceMappingURL=index.js.map