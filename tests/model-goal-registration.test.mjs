// 使用官方 Agent 循环与模拟模型真实调用 Goals 工具；存储完全隔离，不产生模型费用。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { resolve, join, dirname } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
const host = 'rc2';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = root;
const require = createRequire(join(runtime, 'package.json'));
const load = name => import(pathToFileURL(require.resolve(name)));
const { Context } = await load('@deepseek-ai/cordis');
const { default: Storage } = await load('@deepseek-ai/dsh-storage');
const JsonStorage = await load('@deepseek-ai/dsh-storage-json');
const Domains = await load('@deepseek-ai/dsh-storage-domain');
const { default: SystemPrompt } = await load('@deepseek-ai/dsh-system-prompt');
const { default: Tools } = await load('@deepseek-ai/dsh-tools');
const { default: Llm, LlmAdapter, createUserMessage } = await load('@deepseek-ai/dsh-llm');
const { default: Sessions, SessionId } = await load('@deepseek-ai/dsh-session');
const { default: Projections } = await load('@deepseek-ai/dsh-session-projection');
const { default: Agents } = await load('@deepseek-ai/dsh-agent');
const { default: Loop } = await load('@deepseek-ai/dsh-agent-loop');
const { default: Goals } = await import(pathToFileURL(join(root, 'lib/service/index.js')));
const GoalTools = await import(pathToFileURL(join(root, 'lib/tool/index.js')));
test('工具对模型可见、Agent 创建目标与步骤、重启后持久化', async t => {
const storage = await mkdtemp(join(tmpdir(), 'dsh-goals-registration-'));
t.after(() => rm(storage, { recursive: true, force: true }));
async function boot(withAgent) {
  const ctx = new Context();
  await ctx.plugin(Storage); await ctx.plugin(JsonStorage, { root: storage }); await ctx.plugin(Domains, { backend: 'json' });
  await ctx.plugin(SystemPrompt); await ctx.plugin(Tools);
  // 排程边界仅记录测试提醒，不启动真实定时器或触碰用户会话。
  ctx.provide('schedule', { create: async () => ({ id: 'isolated-check-in' }), delete: async () => {} });
  await ctx.plugin(Goals); await ctx.plugin(GoalTools, {});
  assert.ok(ctx.personalGoals, '目标服务必须挂载');
  assert.equal(ctx.tools.schemas().filter(t => t.name.startsWith('personal_')).length, 9, '九个目标工具必须提供给模型');
  if (withAgent) {
    for (const plugin of [Llm, Sessions, Projections, Agents]) await ctx.plugin(plugin);
    await ctx.plugin(Loop, { agents: [] });
  }
  return ctx;
}
let ctx = await boot(true), calls = 0, schemaNames = [];
try {
  class Model extends LlmAdapter {
    async resolveModel(provider, model) { return { provider, id: model, name: model }; }
    async *stream(options) {
      calls++; schemaNames = options.tools.map(t => t.name);
      assert.ok(schemaNames.includes('personal_goal_create'));
      if (calls === 1) {
        yield { type: 'block-start', index: 0, blockType: 'tool-call' };
        yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: 'create-test-goal', name: 'personal_goal_create', arguments: JSON.stringify({ title: '隔离验证计划', tasks: ['准备','执行','复盘'].map(title => ({ title })) }) } };
        yield { type: 'finish', reason: { kind: 'tool-calls' } };
      } else {
        yield { type: 'text-delta', index: 0, text: '目标已通过工具创建。' };
        yield { type: 'finish', reason: { kind: 'stop' } };
      }
    }
  }
  ctx.llm.registerAdapter(['isolated'], new Model());
  const agent = await ctx.agentLoop.create(SessionId('isolated-goal-create'), { provider: 'isolated', model: 'test' });
  agent.followup(createUserMessage({ content: [{ type: 'text', text: '请将已确认的测试计划及三个步骤保存到 Goals。' }], source: { kind: 'user' } }));
  await agent.whenIdle();
  const views = await ctx.personalGoals.list();
  assert.equal(views.length, 1, '工具调用必须实际创建目标，而不是只输出文档');
  assert.equal(views[0].tasks.length, 3); assert.equal(views[0].status, 'active');
  const goalId = views[0].id;
  assert.ok(agent.session.snapshotEvents().some(e => e.type === 'tool/call' && e.data.name === 'personal_goal_create'));
  await ctx.fiber.dispose(); ctx = await boot(false);
  const restored = await ctx.personalGoals.list();
  assert.equal(restored[0].id, goalId); assert.equal(restored[0].tasks.length, 3);
  const result = { host, registeredGoalTools: 9, visibleToModel: true, realAgentToolCall: true, persistedGoal: true, taskCount: 3, goalStatus: 'active', survivesRestart: true, paidModelCalls: 0 };
  console.log(JSON.stringify(result, null, 2));
} finally { await ctx.fiber.dispose(); }

});
