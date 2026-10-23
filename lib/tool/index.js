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
import { delegationDepthOf } from '@deepseek-ai/dsh-subagent';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { PersonalGoalId, PersonalGoalsError, PersonalTaskId } from '../service/index.js';
import z from '@deepseek-ai/schemastery';
/** Plugin name registered with the Loader. */
export const name = 'tool-personal-goals';
/** Host services this plugin consumes. */
export const inject = ['tools', 'systemPrompt', 'personalGoals'];
/** Validated bounds for the prompt section. */
export const Config = z.object({
    maxGoals: z.number().step(1).min(1).max(50).default(5),
    maxChars: z.number().step(1).min(200).max(8000).default(2400),
});
/** Resolve defaults explicitly so the plugin never reads a bare optional. */
function resolveConfig(config) {
    return {
        maxGoals: config.maxGoals ?? 5,
        maxChars: config.maxChars ?? 2400,
    };
}
const ERROR_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        code: { type: 'string', required: true },
        message: { type: 'string', required: true },
    },
};
const TASK_VIEW_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        status: { type: 'string', required: true },
    },
};
const GOAL_VIEW_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        status: { type: 'string', required: true },
        doneCriteria: { type: 'string' },
        tasks: { type: 'array', required: true, items: TASK_VIEW_SCHEMA },
        openIdeas: { type: 'integer', required: true },
    },
};
const READ_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                goals: { type: 'array', required: true, items: GOAL_VIEW_SCHEMA },
            },
        },
        ERROR_SCHEMA,
    ],
};
const PROPOSE_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                ideaId: { type: 'string', required: true },
                status: { type: 'string', required: true, const: 'open' },
                title: { type: 'string', required: true },
            },
        },
        ERROR_SCHEMA,
    ],
};
const IDEA_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                ideaId: { type: 'string', required: true },
                status: { type: 'string', required: true, const: 'open' },
                goalId: { type: 'string' },
            },
        },
        ERROR_SCHEMA,
    ],
};
const TASK_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                taskId: { type: 'string', required: true },
                goalId: { type: 'string', required: true },
                title: { type: 'string', required: true },
                status: { type: 'string', required: true },
            },
        },
        ERROR_SCHEMA,
    ],
};
const CREATE_PLAN_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                goalId: { type: 'string', required: true },
                title: { type: 'string', required: true },
                taskIds: { type: 'array', required: true, items: { type: 'string' } },
            },
        },
        ERROR_SCHEMA,
    ],
};
const GOAL_UPDATE_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                goalId: { type: 'string', required: true },
                title: { type: 'string', required: true },
                status: { type: 'string', required: true },
            },
        },
        ERROR_SCHEMA,
    ],
};
const MONITOR_CREATE_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                goalId: { type: 'string', required: true },
                title: { type: 'string', required: true },
                cadence: { type: 'string', required: true },
            },
        },
        ERROR_SCHEMA,
    ],
};
const MONITOR_RECORD_OUTPUT_SCHEMA = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                goalId: { type: 'string', required: true },
                matched: { type: 'boolean', required: true },
                triggered: { type: 'boolean', required: true },
                expired: { type: 'boolean', required: true },
                warn: { type: 'boolean', required: true },
                cooldownUntil: { type: 'string' },
            },
        },
        ERROR_SCHEMA,
    ],
};
/**
 * Refuse a delegated child caller: goal state is user-level and shared, so a
 * subagent must not mutate it or seed suggestions the user never saw.
 * @param agent - calling agent, when the runtime supplied one.
 * @returns the stable refusal, or undefined for a root caller.
 */
function subagentCallerRefusal(agent) {
    if (agent === undefined || delegationDepthOf(agent) === 0)
        return undefined;
    return { code: 'subagent_session', message: 'A delegated subagent cannot use personal goals.' };
}
/**
 * Whether the current open turn contains a human-authored message.
 *
 * Goal creation changes the user's own asset, so it needs the same authority
 * `dsh-tool-goal` requires: a direct user message after the last `turn/start`.
 * A goal round or autonomous continuation never qualifies.
 * @param agent - calling root agent.
 * @returns true when the open turn carries direct human input.
 */
function hasTurnSource(agent, allowSchedule) {
    // oxlint-disable-next-line typescript/no-deprecated -- Authority needs the open-turn event suffix.
    const events = agent.session.snapshotEvents();
    for (let index = events.length - 1; index >= 0; index -= 1) {
        if (events[index]?.type !== 'turn/start')
            continue;
        for (let cursor = index + 1; cursor < events.length; cursor += 1) {
            const event = events[cursor];
            if (event?.type !== 'user/message')
                continue;
            const kind = event.data.source.kind;
            if (kind === 'user' || (allowSchedule && kind === 'schedule'))
                return true;
        }
        return false;
    }
    return false;
}
/** Whether the open turn carries a direct human message. */
function hasDirectHumanTurn(agent) {
    return hasTurnSource(agent, false);
}
/** Whether the open turn is a monitor check or a direct human request. */
function hasMonitorCheckTurn(agent) {
    return hasTurnSource(agent, true);
}
/**
 * Map a domain failure to a stable tool value without leaking internals.
 * @param error - rejection from the service.
 * @returns the error value rendered to the model.
 */
function operationError(error) {
    if (error instanceof PersonalGoalsError)
        return { code: error.code, message: error.message };
    return { code: 'internal_error', message: 'The personal goals operation failed.' };
}
function renderValue(_args, value) {
    return [{ type: 'text', text: JSON.stringify(value) }];
}
function present(title, kind, rawInput) {
    return { card: 'generic', title, kind, ...(rawInput === undefined ? {} : { rawInput }) };
}
function goalSummary(goal) {
    return {
        id: goal.id,
        title: goal.title,
        status: goal.status,
        ...(goal.doneCriteria === undefined ? {} : { doneCriteria: goal.doneCriteria }),
        tasks: goal.tasks.map(task => ({ id: task.id, title: task.title, status: task.status })),
        openIdeas: goal.openIdeaCount,
    };
}
function taskValue(task) {
    return { taskId: task.id, goalId: task.goalId, title: task.title, status: task.status };
}
function ideaValue(idea) {
    return { ideaId: idea.id, status: 'open', ...(idea.goalId === undefined ? {} : { goalId: idea.goalId }) };
}
const READ_DESCRIPTION = 'List the user\'s cross-session personal goals and their tasks. '
    + 'Completed and archived goals are omitted unless include_completed is true. '
    + 'Use this before proposing suggestions or tracking work so you refer to real goal ids.';
const PROPOSE_DESCRIPTION = 'Propose a new long-term personal goal for the user. '
    + 'This records an open idea; it does NOT create the goal. '
    + 'The user reviews the idea in the Goals page and accepts or dismisses it. '
    + 'Propose only when the conversation reveals a lasting outcome the user wants, not for one-off requests.';
const CREATE_PLAN_DESCRIPTION = 'Create a personal goal together with its initial step-by-step tasks. '
    + 'Use this only when the user explicitly started a plan and has answered your intake questions; '
    + 'for an opportunistic suggestion use personal_goal_propose instead. '
    + 'Ask one question at a time: start with what the user wants to move forward, then choose each next question '
    + 'from that answer. Ask only the missing current state, time, constraints, and timeline details; never run a '
    + 'fixed questionnaire or repeat details the user already gave. Then create three to seven concrete steps in '
    + 'execution order, with at most five steps expected in any one week. '
    + 'Set each step due_at from the user timeline; the plugin creates a weekly check-in in this session. '
    + 'After creating, ask whether the breakdown fits and offer targeted adjustments. '
    + 'This requires a direct user message in the current turn.';
const UPDATE_GOAL_DESCRIPTION = 'Update one personal goal\'s title, detail, or definition of done after the user asks for a change. '
    + 'Use this for targeted revisions to a plan the user already has; it cannot change the goal\'s phase. '
    + 'This requires a direct user message in the current turn.';
const MONITOR_CREATE_DESCRIPTION = 'Create a monitor that watches an external state: a price threshold, an announcement, or availability. '
    + 'Use this when the user wants to wait for a condition instead of executing steps; do not invent tasks. '
    + 'Ask one open question about what to watch first. After that answer, ask only the missing condition, cadence, '
    + 'expiry, sources, or one-shot detail needed to create it, one at a time. '
    + 'Before creating, research the current state from at least one preferred source and confirm it is reachable; '
    + 'if no source works, report the failure and do not create a blind monitor. '
    + 'After creating, immediately record that first observation with personal_monitor_record, even when nothing matched, '
    + 'then report what you found and when the next check will run. '
    + 'Set a cadence (daily default, minimum six hours), an expiry, and preferred sources. '
    + 'Fact monitors may use any user-specified source. This requires a direct user message in the current turn.';
const MONITOR_RECORD_DESCRIPTION = 'Record one monitor observation after researching the current state. '
    + 'Use this immediately after creating a monitor for its first check, and in a monitor check-in turn or a direct user turn. '
    + 'Report the summary, whether the condition matched, the observed value, and the source. '
    + 'Never buy, book, or execute any action.';
const IDEA_DESCRIPTION = 'Record a suggestion for one of the user\'s personal goals, or a general suggestion when goal_id is absent. '
    + 'Use this for opportunities, blockers, or a concrete next step you notice. '
    + 'You never execute goal work on your own; the user reviews every suggestion in the Goals page.';
const TASK_ADD_DESCRIPTION = 'Add a task to a personal goal the user already has. '
    + 'Use only when the user asks to track work; goal_id must come from personal_goals_read. '
    + 'You cannot create goals with this tool.';
const TASK_UPDATE_DESCRIPTION = 'Update a personal task the user is tracking: mark progress, block it, complete it, or correct its text. '
    + 'Use only when the user asks for the change or confirms it.';
/**
 * Render the bounded personal-goals section for prompt assembly.
 * @param ctx - plugin context providing the service.
 * @param config - resolved bounds.
 * @returns prompt text, truncated to the configured character budget.
 */
function renderSection(ctx, config) {
    const header = 'The user keeps long-term personal goals that persist across sessions. '
        + 'Guided intake: ask one question at a time with ask_user_question, starting with one open question about what '
        + 'the user wants to move forward or watch. Do not classify it or ask about time, frequency, or constraints yet; '
        + 'after the answer, choose each next question from what the user said and ask only what you still need. Never run a '
        + 'fixed questionnaire or repeat details already given. Then present a realistic plan and call personal_goal_create '
        + 'once with three to seven ordered steps, at most five '
        + 'per week; set each step due_at from the user timeline (default one week per step). After creating it, ask whether '
        + 'the breakdown fits and which step should change; edit with personal_goal_update, personal_task_update, or '
        + 'personal_task_add, and mark a removed step cancelled instead of recreating the goal. '
        + 'Check-in: when a [PERSONAL GOALS CHECK-IN] message arrives, read the goal, summarize progress, ask about the last '
        + 'period, and update step status. If the plan ends or every step is done, ask whether the goal is complete; if it '
        + 'finished early, ask whether to append the next phase or create a new goal. A missed check-in rolls forward with '
        + 'a short note; do not block the goal automatically. '
        + 'Monitors: when the answer shows the user wants to watch an external state (price, announcement, availability) '
        + 'instead of executing steps, first ask what to watch and what change matters if that is not already clear; then '
        + 'ask only the missing cadence (daily default; minimum six hours), expiry, sources, and once/ongoing detail, one '
        + 'at a time, then call personal_monitor_create; never invent tasks. '
        + 'Before creating, research the current state from at least one preferred source and verify that source is '
        + 'reachable. If none works, tell the user what failed and do not create the monitor. After creating it, immediately '
        + 'call personal_monitor_record with the observation you just made, even when nothing matched, and report the '
        + 'current state plus the next scheduled check; the user must not wait one cadence for the first result. '
        + 'Choose between a plan and a monitor by what moves the work forward: the user acting step by step is a goal '
        + 'plan; waiting for an external price, announcement, availability, or other condition is a monitor. When a new '
        + 'request could be either, ask one direct question ("will you work through this in steps, or wait for an '
        + 'external condition?") after the first open answer and confirm the choice before creating. Never create both '
        + 'for the same request. '
        + 'On a [PERSONAL GOALS MONITOR] message, research the current state from the preferred sources, record it with '
        + 'personal_monitor_record, and tell the user only when it first matches or after the cooldown, or after three '
        + 'consecutive failures. '
        + 'Never buy, book, or execute. '
        + 'Use personal_goal_propose only for opportunistic suggestions; it records an idea and never creates a goal. '
        + 'Use personal_idea_propose for other suggestions; never execute goal work yourself. Read with personal_goals_read. '
        + 'When memory tools are available, consult relevant memories before proposing goals.';
    const goals = ctx.personalGoals.snapshotForPrompt(config.maxGoals);
    if (goals.length === 0)
        return header;
    const lines = goals.map(goal => `- ${goal.title} [${goal.status}] (${goal.openTasks}/${goal.totalTasks} open tasks)`);
    const text = `${header}\n\nCurrent personal goals:\n${lines.join('\n')}`;
    return text.length <= config.maxChars ? text : `${text.slice(0, Math.max(0, config.maxChars - 1))}…`;
}
/**
 * Register the goal tools and the prompt section.
 * @param ctx - plugin context with the tool registry, prompt assembly, and service.
 * @param config - validated prompt bounds.
 */
export function apply(ctx, config) {
    const resolved = resolveConfig(config);
    ctx.systemPrompt.section({
        name: 'tool:personal-goals',
        order: ctx.systemPrompt.getSectionOrder('PERSONAL_GOALS'),
        text: () => renderSection(ctx, resolved),
    });
    ctx.tools.register(defineTool({
        name: 'personal_goals_read',
        description: READ_DESCRIPTION,
        parameters: {
            include_completed: {
                type: 'boolean',
                description: 'Include completed and archived goals as well as active ones.',
            },
        },
        output: { schema: READ_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            try {
                const goals = await ctx.personalGoals.list();
                const visible = args.include_completed === true
                    ? goals
                    : goals.filter(goal => goal.status !== 'completed' && goal.status !== 'archived');
                return { goals: visible.map(goalSummary) };
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: () => present('Read personal goals', 'read'),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_goal_propose',
        description: PROPOSE_DESCRIPTION,
        parameters: {
            title: { type: 'string', required: true, description: 'Short goal title, at most 200 characters.' },
            detail: { type: 'string', description: 'Why the goal matters or what it covers.' },
        },
        output: { schema: PROPOSE_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            try {
                const content = args.detail === undefined ? args.title : `${args.title}\n\n${args.detail}`;
                const idea = await ctx.personalGoals.proposeIdea({
                    content,
                    suggestedGoalTitle: args.title,
                    source: { sessionId: agent.session.id },
                });
                return { ideaId: idea.id, status: 'open', title: idea.suggestedGoalTitle ?? idea.content };
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Propose a personal goal', 'other', args.title),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_goal_create',
        description: CREATE_PLAN_DESCRIPTION,
        parameters: {
            title: { type: 'string', required: true, description: 'Goal title, at most 200 characters.' },
            detail: { type: 'string', description: 'Why the goal matters or what it covers.' },
            done_criteria: { type: 'string', description: 'What "done" means for this goal.' },
            tasks: {
                type: 'array',
                required: true,
                description: 'Initial steps in execution order, three to seven items.',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        title: { type: 'string', required: true, description: 'One actionable step, at most 200 characters.' },
                        notes: { type: 'string', description: 'Optional guidance for this step.' },
                        due_at: { type: 'string', description: 'ISO 8601 instant this step is due; default one week per step.' },
                    },
                },
            },
        },
        output: { schema: CREATE_PLAN_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            if (!hasDirectHumanTurn(agent)) {
                return { code: 'human_turn_required', message: 'Creating a goal requires a direct user request in the current turn.' };
            }
            try {
                const plan = await ctx.personalGoals.createPlan({
                    title: args.title,
                    checkInSessionId: agent.session.id,
                    tasks: args.tasks.map(task => ({
                        title: task.title,
                        ...(task.notes === undefined ? {} : { notes: task.notes }),
                        ...(task.due_at === undefined ? {} : { dueAt: task.due_at }),
                    })),
                    ...(args.detail === undefined ? {} : { detail: args.detail }),
                    ...(args.done_criteria === undefined ? {} : { doneCriteria: args.done_criteria }),
                });
                return { goalId: plan.goal.id, title: plan.goal.title, taskIds: plan.tasks.map(task => task.id) };
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Create a personal goal plan', 'other', args.title),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_goal_update',
        description: UPDATE_GOAL_DESCRIPTION,
        parameters: {
            goal_id: { type: 'string', required: true, description: 'Goal id from personal_goals_read.' },
            title: { type: 'string', description: 'Replacement goal title.' },
            detail: { type: 'string', description: 'Replacement detail or scope.' },
            done_criteria: { type: 'string', description: 'Replacement definition of done.' },
        },
        output: { schema: GOAL_UPDATE_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            if (!hasDirectHumanTurn(agent)) {
                return { code: 'human_turn_required', message: 'Updating a goal requires a direct user request in the current turn.' };
            }
            if (args.title === undefined && args.detail === undefined && args.done_criteria === undefined) {
                return { code: 'invalid_input', message: 'Supply at least one of title, detail, or done_criteria.' };
            }
            try {
                const goal = await ctx.personalGoals.update({
                    goalId: PersonalGoalId(args.goal_id),
                    ...(args.title === undefined ? {} : { title: args.title }),
                    ...(args.detail === undefined ? {} : { detail: args.detail }),
                    ...(args.done_criteria === undefined ? {} : { doneCriteria: args.done_criteria }),
                });
                return { goalId: goal.id, title: goal.title, status: goal.status };
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Update a personal goal', 'other', args.title),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_monitor_create',
        description: MONITOR_CREATE_DESCRIPTION,
        parameters: {
            subject: { type: 'string', required: true, description: 'What is watched: a route, artist, product, or event.' },
            condition: { type: 'string', required: true, description: 'Natural-language condition that must become true.' },
            mode: { type: 'string', required: true, enum: ['threshold', 'fact'], description: 'Numeric threshold or fact detection.' },
            metric: { type: 'string', description: 'Required for threshold mode; the observed metric name.' },
            operator: { type: 'string', enum: ['<', '<=', '>', '>='], description: 'Required for threshold mode.' },
            value: { type: 'number', description: 'Required for threshold mode; the target value.' },
            unit: { type: 'string', description: 'Optional threshold unit, such as CNY.' },
            cadence: {
                type: 'string',
                required: true,
                enum: ['daily', 'every_12h', 'every_6h', 'weekly'],
                description: 'Check frequency; daily default, minimum six hours.',
            },
            once: { type: 'boolean', required: true, description: 'Stop after the first match (typical for announcements).' },
            expires_at: { type: 'string', required: true, description: 'ISO 8601 instant when the monitor expires.' },
            sources: {
                type: 'array',
                description: 'Preferred sources; any user-specified page or account is allowed.',
                items: { type: 'string' },
            },
        },
        output: { schema: MONITOR_CREATE_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            if (!hasDirectHumanTurn(agent)) {
                return { code: 'human_turn_required', message: 'Creating a monitor requires a direct user request in the current turn.' };
            }
            let threshold;
            if (args.mode === 'threshold') {
                if (args.metric === undefined || args.operator === undefined || args.value === undefined) {
                    return { code: 'invalid_input', message: 'Threshold monitors require metric, operator, and value.' };
                }
                threshold = {
                    metric: args.metric,
                    operator: args.operator,
                    value: args.value,
                    ...(args.unit === undefined ? {} : { unit: args.unit }),
                };
            }
            try {
                const goal = await ctx.personalGoals.createMonitor({
                    subject: args.subject,
                    condition: args.condition,
                    mode: args.mode,
                    cadence: args.cadence,
                    once: args.once,
                    expiresAt: args.expires_at,
                    ...(threshold === undefined ? {} : { threshold }),
                    ...(args.sources === undefined ? {} : { preferredSources: args.sources }),
                    checkInSessionId: agent.session.id,
                });
                return { goalId: goal.id, title: goal.title, cadence: goal.monitor?.cadence ?? args.cadence };
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Start a monitor', 'other', args.subject),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_monitor_record',
        description: MONITOR_RECORD_DESCRIPTION,
        parameters: {
            goal_id: { type: 'string', required: true, description: 'Monitor goal id from personal_goals_read.' },
            summary: { type: 'string', required: true, description: 'What was observed, including ambiguity or failure.' },
            matched: { type: 'boolean', required: true, description: 'Whether the monitor condition holds.' },
            value: { type: 'string', description: 'Observed value, such as a price.' },
            source: { type: 'string', description: 'Source URL or name used for this observation.' },
            error: { type: 'string', description: 'Failure detail when the check could not complete.' },
            checked_at: { type: 'string', description: 'ISO 8601 observation instant; omission uses now.' },
        },
        output: { schema: MONITOR_RECORD_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            if (!hasMonitorCheckTurn(agent)) {
                return { code: 'human_turn_required', message: 'Monitor observations require a check-in or direct user turn.' };
            }
            try {
                const result = await ctx.personalGoals.recordCheck({
                    goalId: PersonalGoalId(args.goal_id),
                    summary: args.summary,
                    matched: args.matched,
                    ...(args.value === undefined ? {} : { value: args.value }),
                    ...(args.source === undefined ? {} : { source: args.source }),
                    ...(args.error === undefined ? {} : { error: args.error }),
                    ...(args.checked_at === undefined ? {} : { checkedAt: args.checked_at }),
                });
                return {
                    goalId: result.goalId,
                    matched: result.check.matched,
                    triggered: result.triggered,
                    expired: result.expired,
                    warn: result.warn,
                    ...(result.cooldownUntil === undefined ? {} : { cooldownUntil: result.cooldownUntil }),
                };
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Record a monitor check', 'other', args.summary),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_idea_propose',
        description: IDEA_DESCRIPTION,
        parameters: {
            content: { type: 'string', required: true, description: 'The suggestion, at most 2000 characters.' },
            goal_id: { type: 'string', description: 'Existing goal id from personal_goals_read; omit for a general suggestion.' },
        },
        output: { schema: IDEA_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            try {
                const idea = await ctx.personalGoals.proposeIdea({
                    content: args.content,
                    source: { sessionId: agent.session.id },
                    ...(args.goal_id === undefined ? {} : { goalId: PersonalGoalId(args.goal_id) }),
                });
                return ideaValue(idea);
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Record an idea', 'other', args.content),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_task_add',
        description: TASK_ADD_DESCRIPTION,
        parameters: {
            goal_id: { type: 'string', required: true, description: 'Goal id from personal_goals_read.' },
            title: { type: 'string', required: true, description: 'Task title, at most 200 characters.' },
            notes: { type: 'string', description: 'Optional notes.' },
        },
        output: { schema: TASK_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            try {
                const task = await ctx.personalGoals.addTask({
                    goalId: PersonalGoalId(args.goal_id),
                    title: args.title,
                    ...(args.notes === undefined ? {} : { notes: args.notes }),
                });
                return taskValue(task);
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Add a personal task', 'other', args.title),
    }));
    ctx.tools.register(defineTool({
        name: 'personal_task_update',
        description: TASK_UPDATE_DESCRIPTION,
        parameters: {
            task_id: { type: 'string', required: true, description: 'Task id from personal_goals_read.' },
            status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'blocked', 'done', 'cancelled'],
                description: 'New work state.',
            },
            title: { type: 'string', description: 'Replacement title.' },
            notes: { type: 'string', description: 'Replacement notes.' },
        },
        output: { schema: TASK_OUTPUT_SCHEMA, render: renderValue },
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                return { code: 'internal_error', message: 'No calling agent is available.' };
            const refusal = subagentCallerRefusal(agent);
            if (refusal !== undefined)
                return refusal;
            try {
                const task = await ctx.personalGoals.updateTask({
                    taskId: PersonalTaskId(args.task_id),
                    ...(args.status === undefined ? {} : { status: args.status }),
                    ...(args.title === undefined ? {} : { title: args.title }),
                    ...(args.notes === undefined ? {} : { notes: args.notes }),
                });
                return taskValue(task);
            }
            catch (error) {
                return operationError(error);
            }
        },
        presentCall: args => present('Update a personal task', 'other', args.title),
    }));
}
//# sourceMappingURL=index.js.map