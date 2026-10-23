window.__ModuleLoader__.load({
	id: "dsh-personal-goals",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:D:\deepseek-harness\packages\client\ui-personal-goals\src\client\GoalsPage.module.css.mjs
		const css = ".pcv30a_page{box-sizing:border-box;background:var(--dsw-alias-bg-base);height:100%;color:var(--dsw-alias-label-primary);grid-template-columns:minmax(0,1fr) minmax(320px,384px);align-content:start;gap:20px 32px;padding:28px clamp(24px,4vw,48px) 48px;display:grid;overflow:auto}.pcv30a_header{grid-column:1/-1;justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.pcv30a_title{margin:0;font-size:24px;font-weight:600;line-height:32px}.pcv30a_subtitle{color:var(--dsw-alias-label-secondary);margin:4px 0 0;font-size:13px;line-height:20px}.pcv30a_notice{color:var(--dsw-alias-state-error-primary);grid-column:1/-1;margin:0;font-size:13px;line-height:20px}.pcv30a_column{flex-direction:column;grid-column:1;gap:32px;min-width:0;display:flex}.pcv30a_section{min-width:0}.pcv30a_sectionTitle{margin:0 0 12px;font-size:16px;font-weight:600;line-height:24px}.pcv30a_sectionHint{color:var(--dsw-alias-label-secondary);margin:-4px 0 12px;font-size:13px;line-height:20px}.pcv30a_rows{flex-direction:column;display:flex}.pcv30a_row{border:0;border-bottom:1px solid var(--dsw-alias-border-l1);width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border-radius:8px;align-items:center;gap:12px;padding:12px 8px;display:flex}.pcv30a_row:hover,.pcv30a_rowActive{background:var(--dsw-alias-interactive-bg-hover)}.pcv30a_rowBody{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.pcv30a_rowTitle{text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:22px;overflow:hidden}.pcv30a_rowMeta{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.pcv30a_statusRing{border:1.5px solid var(--dsw-alias-border-l3);border-radius:50%;flex:none;justify-content:center;align-items:center;width:18px;height:18px;display:flex}.pcv30a_statusDone{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-inverted)}.pcv30a_statusArchived{opacity:.45}.pcv30a_glyph{background:var(--dsw-alias-bg-layer-2);width:32px;height:32px;color:var(--dsw-alias-brand-primary);border-radius:10px;flex:none;justify-content:center;align-items:center;font-size:13px;font-weight:600;display:flex}.pcv30a_chevron{color:var(--dsw-alias-label-tertiary);flex:none;display:flex}.pcv30a_detail{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2);border-radius:16px;flex-direction:column;grid-column:2;align-self:start;gap:16px;padding:20px;display:flex;position:sticky;top:4px}.pcv30a_detailHead{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.pcv30a_detailTitle{margin:0;font-size:18px;font-weight:600;line-height:26px}.pcv30a_chip{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap;border-radius:999px;flex:none;padding:2px 8px;font-size:11px;line-height:16px}.pcv30a_detailMeta{color:var(--dsw-alias-label-secondary);margin:-8px 0 0;font-size:12px;line-height:18px}.pcv30a_actions{flex-wrap:wrap;gap:6px;display:flex}.pcv30a_block{flex-direction:column;gap:8px;display:flex}.pcv30a_blockLabel{letter-spacing:.02em;color:var(--dsw-alias-label-secondary);text-transform:uppercase;margin:0;font-size:12px;font-weight:600}.pcv30a_body{color:var(--dsw-alias-label-primary);white-space:pre-wrap;margin:0;font-size:13px;line-height:20px}.pcv30a_steps{flex-direction:column;gap:2px;margin:0;padding:0;list-style:none;display:flex}.pcv30a_stepRow{border-radius:8px;align-items:center;gap:10px;padding:8px 4px;display:flex}.pcv30a_stepRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.pcv30a_stepMarker{border:1px solid var(--dsw-alias-border-l3);width:22px;height:22px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;font-size:11px;display:flex}.pcv30a_stepMarkerDone{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-inverted)}.pcv30a_stepTitle{min-width:0;font-size:13px;line-height:20px}.pcv30a_stepTitleDone{min-width:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;text-decoration:line-through}.pcv30a_addStep{align-items:center;gap:8px;display:flex}.pcv30a_dangerAction{color:var(--dsw-alias-state-error-primary)}.pcv30a_ideas{border-top:1px solid var(--dsw-alias-border-l1);flex-direction:column;gap:8px;padding-top:16px;display:flex}.pcv30a_idea{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;flex-direction:column;gap:6px;padding:12px;display:flex}.pcv30a_ideaText{color:var(--dsw-alias-label-primary);white-space:pre-wrap;margin:0;font-size:13px;line-height:20px}.pcv30a_ideaGoal{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:18px}.pcv30a_checks{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}.pcv30a_checkItem{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}.pcv30a_checkTime{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.pcv30a_checkText{color:var(--dsw-alias-label-primary);white-space:pre-wrap;margin:0;font-size:13px;line-height:20px}.pcv30a_checkMeta{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:18px}.pcv30a_empty{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:20px}.pcv30a_errorBlock{flex-direction:column;align-items:flex-start;gap:8px;display:flex}@media (width<=900px){.pcv30a_page{grid-template-columns:minmax(0,1fr)}.pcv30a_column,.pcv30a_detail{grid-column:1}.pcv30a_detail{position:static}}";
		const tagId = "@deepseek-ai/dsh-client-ui-personal-goals/GoalsPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-personal-goals";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var GoalsPage_module_css_default = {
			"actions": "pcv30a_actions",
			"addStep": "pcv30a_addStep",
			"block": "pcv30a_block",
			"blockLabel": "pcv30a_blockLabel",
			"body": "pcv30a_body",
			"checkItem": "pcv30a_checkItem",
			"checkMeta": "pcv30a_checkMeta",
			"checkText": "pcv30a_checkText",
			"checkTime": "pcv30a_checkTime",
			"checks": "pcv30a_checks",
			"chevron": "pcv30a_chevron",
			"chip": "pcv30a_chip",
			"column": "pcv30a_column",
			"dangerAction": "pcv30a_dangerAction",
			"detail": "pcv30a_detail",
			"detailHead": "pcv30a_detailHead",
			"detailMeta": "pcv30a_detailMeta",
			"detailTitle": "pcv30a_detailTitle",
			"empty": "pcv30a_empty",
			"errorBlock": "pcv30a_errorBlock",
			"glyph": "pcv30a_glyph",
			"header": "pcv30a_header",
			"idea": "pcv30a_idea",
			"ideaGoal": "pcv30a_ideaGoal",
			"ideaText": "pcv30a_ideaText",
			"ideas": "pcv30a_ideas",
			"notice": "pcv30a_notice",
			"page": "pcv30a_page",
			"row": "pcv30a_row",
			"rowActive": "pcv30a_rowActive",
			"rowBody": "pcv30a_rowBody",
			"rowMeta": "pcv30a_rowMeta",
			"rowTitle": "pcv30a_rowTitle",
			"rows": "pcv30a_rows",
			"section": "pcv30a_section",
			"sectionHint": "pcv30a_sectionHint",
			"sectionTitle": "pcv30a_sectionTitle",
			"statusArchived": "pcv30a_statusArchived",
			"statusDone": "pcv30a_statusDone",
			"statusRing": "pcv30a_statusRing",
			"stepMarker": "pcv30a_stepMarker",
			"stepMarkerDone": "pcv30a_stepMarkerDone",
			"stepRow": "pcv30a_stepRow",
			"stepTitle": "pcv30a_stepTitle",
			"stepTitleDone": "pcv30a_stepTitleDone",
			"steps": "pcv30a_steps",
			"subtitle": "pcv30a_subtitle",
			"title": "pcv30a_title"
		};
		//#endregion
		//#region src/client/GoalsPage.tsx
		/**
		* Personal Goals page in the Muse Goals shape: the goal list, a "create a
		* plan" area list that starts a guided conversation, and one goal's detail
		* panel with its steps and suggestions.
		*
		* Category clicks open a new Session and submit the first message; the agent
		* asks intake questions and creates the goal and steps. The page itself never
		* creates a plan from a category.
		*/
		const GOAL_STATUS_KEY = {
			active: "status.active",
			paused: "status.paused",
			blocked: "status.blocked",
			completed: "status.completed",
			archived: "status.archived"
		};
		const TASK_STATUS_KEY = {
			pending: "task.pending",
			in_progress: "task.in_progress",
			blocked: "task.blocked",
			done: "task.done",
			cancelled: "task.cancelled"
		};
		const CATEGORIES = [
			{
				id: "health",
				label: "category.health",
				hint: "category.health.hint",
				glyph: "category.health.glyph"
			},
			{
				id: "relationships",
				label: "category.relationships",
				hint: "category.relationships.hint",
				glyph: "category.relationships.glyph"
			},
			{
				id: "finance",
				label: "category.finance",
				hint: "category.finance.hint",
				glyph: "category.finance.glyph"
			},
			{
				id: "career",
				label: "category.career",
				hint: "category.career.hint",
				glyph: "category.career.glyph"
			},
			{
				id: "interests",
				label: "category.interests",
				hint: "category.interests.hint",
				glyph: "category.interests.glyph"
			},
			{
				id: "productivity",
				label: "category.productivity",
				hint: "category.productivity.hint",
				glyph: "category.productivity.glyph"
			},
			{
				id: "tracking",
				label: "category.tracking",
				hint: "category.tracking.hint",
				glyph: "category.tracking.glyph"
			},
			{
				id: "other",
				label: "category.other",
				hint: "category.other.hint",
				glyph: "category.other.glyph"
			}
		];
		const CONFIRM_KEY = {
			complete: "detail.confirmComplete",
			archive: "detail.confirmArchive",
			delete: "detail.confirmDelete"
		};
		/**
		* Render the goal list, the guided-plan starters, and the selected goal panel.
		* @param props - framework share, injected source, and localized copy.
		* @returns the page content.
		*/
		function GoalsPage(props) {
			const { t, usePersonalGoals, onRetry, onUpdateGoal, onAddTask, onUpdateTask, onAcceptIdea, onDismissIdea, onStartPlan, onDeleteGoal, onListChecks, onResumeMonitor } = props;
			const state = usePersonalGoals((snapshot) => snapshot);
			const [selectedId, setSelectedId] = (0, react.useState)(null);
			const [pendingAction, setPendingAction] = (0, react.useState)(null);
			const [checks, setChecks] = (0, react.useState)([]);
			const [stepTitle, setStepTitle] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)(false);
			const selected = state.goals.find((goal) => goal.id === selectedId) ?? state.goals[0];
			const openIdeas = state.ideas.filter((idea) => idea.status === "open");
			const plans = state.goals.filter((goal) => goal.kind !== "monitor");
			const monitors = state.goals.filter((goal) => goal.kind === "monitor");
			(0, react.useEffect)(() => {
				if (selected?.kind !== "monitor") {
					setChecks([]);
					return;
				}
				let cancelled = false;
				onListChecks(selected.id).then((result) => {
					if (!cancelled) setChecks(result ?? []);
				});
				return () => {
					cancelled = true;
				};
			}, [
				onListChecks,
				selected?.id,
				selected?.kind
			]);
			const startCategory = (category) => {
				if (category.id === "tracking") {
					onStartPlan(t("startTrackPrompt"));
					return;
				}
				if (category.id === "other") {
					onStartPlan(t("startOtherPrompt"));
					return;
				}
				onStartPlan(t("startPrompt", { area: t(category.label) }));
			};
			const resumeMonitor = async (goal) => {
				setNotice(!await onResumeMonitor(goal.id));
			};
			const monitorStatus = (goal) => {
				if (goal.monitor?.expiredAt !== void 0) return "monitor.expired";
				if (goal.monitor?.triggeredAt !== void 0) return "monitor.triggered";
				return "monitor.watching";
			};
			const submitStep = async (goal) => {
				const trimmed = stepTitle.trim();
				if (trimmed === "") return;
				if (await onAddTask({
					goalId: goal.id,
					title: trimmed
				})) {
					setStepTitle("");
					setNotice(false);
				} else setNotice(true);
			};
			const changeGoalStatus = async (goal, status) => {
				setNotice(!await onUpdateGoal(goal.id, { status }));
			};
			const toggleStep = async (taskId, status) => {
				setNotice(!await onUpdateTask({
					taskId,
					status: status === "done" ? "in_progress" : "done"
				}));
			};
			const acceptTarget = (idea) => {
				if (idea.goalId !== void 0 || idea.suggestedGoalTitle !== void 0) return { ideaId: idea.id };
				return selected === void 0 ? void 0 : {
					ideaId: idea.id,
					goalId: selected.id
				};
			};
			const accept = async (idea) => {
				const input = acceptTarget(idea);
				if (input === void 0) return;
				setNotice(!await onAcceptIdea(input));
			};
			const dismiss = async (idea) => {
				setNotice(!await onDismissIdea(idea.id));
			};
			const removeGoal = async (goal) => {
				if (await onDeleteGoal(goal.id)) {
					setSelectedId(null);
					setNotice(false);
				} else setNotice(true);
			};
			const runPendingAction = async (goal) => {
				const action = pendingAction;
				if (action === null) return;
				if (action === "delete") await removeGoal(goal);
				else await changeGoalStatus(goal, action === "complete" ? "completed" : "archived");
				setPendingAction(null);
			};
			const doneSteps = selected?.tasks.filter((task) => task.status === "done").length ?? 0;
			const goalRow = (goal) => {
				const done = goal.tasks.filter((task) => task.status === "done").length;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: goal.id === selected?.id ? `${GoalsPage_module_css_default.row} ${GoalsPage_module_css_default.rowActive}` : GoalsPage_module_css_default.row,
					onClick: () => {
						setSelectedId(goal.id);
						setPendingAction(null);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: goal.status === "completed" ? `${GoalsPage_module_css_default.statusRing} ${GoalsPage_module_css_default.statusDone}` : goal.status === "archived" ? `${GoalsPage_module_css_default.statusRing} ${GoalsPage_module_css_default.statusArchived}` : GoalsPage_module_css_default.statusRing,
							children: goal.status === "completed" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 11 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: GoalsPage_module_css_default.rowBody,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: GoalsPage_module_css_default.rowTitle,
								children: goal.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: GoalsPage_module_css_default.rowMeta,
								children: goal.kind === "monitor" ? `${t(monitorStatus(goal))} · ${t(`monitor.cadence.${goal.monitor?.cadence ?? "daily"}`)} · ${goal.monitor?.lastValue ?? goal.monitor?.lastSummary ?? t("monitor.noCheck")}` : `${t(GOAL_STATUS_KEY[goal.status])} · ${done}/${goal.tasks.length}${t("goals.stepsDone")}`
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GoalsPage_module_css_default.chevron,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { size: 16 })
						})
					]
				}, goal.id);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GoalsPage_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
						className: GoalsPage_module_css_default.header,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
							className: GoalsPage_module_css_default.title,
							children: t("title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: GoalsPage_module_css_default.subtitle,
							children: t("subtitle")
						})] })
					}),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: GoalsPage_module_css_default.notice,
						role: "status",
						children: t("action.error")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GoalsPage_module_css_default.column,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: GoalsPage_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
										className: GoalsPage_module_css_default.sectionTitle,
										children: t("goals.title")
									}),
									state.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GoalsPage_module_css_default.empty,
										children: t("goals.loading")
									}),
									state.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: GoalsPage_module_css_default.errorBlock,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: GoalsPage_module_css_default.empty,
											children: t("goals.error")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "outline",
											onClick: () => {
												onRetry();
											},
											children: t("goals.retry")
										})]
									}),
									state.status === "ready" && plans.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GoalsPage_module_css_default.empty,
										children: t("goals.empty")
									}),
									plans.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: GoalsPage_module_css_default.rows,
										role: "navigation",
										"aria-label": t("goals.listAria"),
										children: plans.map((goal) => goalRow(goal))
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: GoalsPage_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
										className: GoalsPage_module_css_default.sectionTitle,
										children: t("monitors.title")
									}),
									state.status === "ready" && monitors.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GoalsPage_module_css_default.empty,
										children: t("monitors.empty")
									}),
									monitors.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: GoalsPage_module_css_default.rows,
										role: "navigation",
										"aria-label": t("monitors.listAria"),
										children: monitors.map((goal) => goalRow(goal))
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: GoalsPage_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
										className: GoalsPage_module_css_default.sectionTitle,
										children: t("create.title")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GoalsPage_module_css_default.sectionHint,
										children: t("create.hint")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: GoalsPage_module_css_default.rows,
										children: CATEGORIES.map((category) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: GoalsPage_module_css_default.row,
											onClick: () => {
												startCategory(category);
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: GoalsPage_module_css_default.glyph,
													children: t(category.glyph)
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: GoalsPage_module_css_default.rowBody,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: GoalsPage_module_css_default.rowTitle,
														children: t(category.label)
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: GoalsPage_module_css_default.rowMeta,
														children: t(category.hint)
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: GoalsPage_module_css_default.chevron,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { size: 16 })
												})
											]
										}, category.id))
									})
								]
							})
						]
					}),
					selected === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
						className: GoalsPage_module_css_default.detail,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: GoalsPage_module_css_default.empty,
							children: t("detail.empty")
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: GoalsPage_module_css_default.detail,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GoalsPage_module_css_default.detailHead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: GoalsPage_module_css_default.detailTitle,
									children: selected.title
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: GoalsPage_module_css_default.chip,
									children: selected.kind === "monitor" ? t(monitorStatus(selected)) : t(GOAL_STATUS_KEY[selected.status])
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GoalsPage_module_css_default.detailMeta,
								children: selected.kind === "monitor" ? `${t(`monitor.cadence.${selected.monitor?.cadence ?? "daily"}`)} · ${selected.monitor?.lastSummary ?? t("monitor.noCheck")}` : `${doneSteps}/${selected.tasks.length}${t("goals.stepsDone")}`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: GoalsPage_module_css_default.actions,
								children: pendingAction === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									selected.kind === "plan" && selected.status === "active" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											changeGoalStatus(selected, "paused");
										},
										children: t("detail.pause")
									}),
									selected.kind === "plan" && (selected.status === "paused" || selected.status === "blocked") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											changeGoalStatus(selected, "active");
										},
										children: t("detail.resume")
									}),
									selected.kind === "monitor" && selected.status !== "archived" && selected.monitor?.triggeredAt !== void 0 && selected.checkInScheduleId === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "primary",
										onClick: () => {
											resumeMonitor(selected);
										},
										children: t("monitor.keepWatching")
									}),
									(selected.status === "active" || selected.status === "paused" || selected.status === "blocked") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											setPendingAction("complete");
										},
										children: selected.kind === "monitor" ? t("monitor.markHandled") : t("detail.complete")
									}),
									selected.status !== "archived" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											setPendingAction("archive");
										},
										children: selected.kind === "monitor" ? t("monitor.stop") : t("detail.archive")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										className: GoalsPage_module_css_default.dangerAction,
										onClick: () => {
											setPendingAction("delete");
										},
										children: t("detail.delete")
									})
								] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "outline",
									className: pendingAction === "delete" ? GoalsPage_module_css_default.dangerAction : void 0,
									onClick: () => {
										runPendingAction(selected);
									},
									children: pendingAction === "complete" && selected.kind === "monitor" ? t("monitor.confirmHandled") : pendingAction === "archive" && selected.kind === "monitor" ? t("monitor.confirmStop") : t(CONFIRM_KEY[pendingAction])
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setPendingAction(null);
									},
									children: t("detail.cancel")
								})] })
							}),
							selected.kind === "monitor" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: GoalsPage_module_css_default.block,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
											className: GoalsPage_module_css_default.blockLabel,
											children: t("monitor.condition")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: GoalsPage_module_css_default.body,
											children: selected.monitor?.condition ?? t("detail.noDoneCriteria")
										}),
										selected.monitor?.threshold !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
											className: GoalsPage_module_css_default.detailMeta,
											children: [
												t("monitor.mode.threshold"),
												" · ",
												selected.monitor.threshold.metric,
												" ",
												selected.monitor.threshold.operator,
												" ",
												selected.monitor.threshold.value,
												selected.monitor.threshold.unit === void 0 ? "" : ` ${selected.monitor.threshold.unit}`
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: GoalsPage_module_css_default.block,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
											className: GoalsPage_module_css_default.blockLabel,
											children: t("monitor.cadence")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
											className: GoalsPage_module_css_default.body,
											children: [t(`monitor.cadence.${selected.monitor?.cadence ?? "daily"}`), selected.monitor?.expiresAt !== void 0 ? ` · ${t("monitor.expiryLabel")} ${selected.monitor.expiresAt.slice(0, 10)}` : ""]
										}),
										selected.monitor?.preferredSources !== void 0 && selected.monitor.preferredSources.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
											className: GoalsPage_module_css_default.detailMeta,
											children: [
												t("monitor.sources"),
												" · ",
												selected.monitor.preferredSources.join("、")
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: GoalsPage_module_css_default.block,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
											className: GoalsPage_module_css_default.blockLabel,
											children: t("monitor.lastCheck")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: GoalsPage_module_css_default.body,
											children: selected.monitor?.lastSummary ?? t("monitor.noCheck")
										}),
										selected.monitor?.lastCheckAt !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: GoalsPage_module_css_default.detailMeta,
											children: new Date(selected.monitor.lastCheckAt).toLocaleString()
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: GoalsPage_module_css_default.block,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
											className: GoalsPage_module_css_default.blockLabel,
											children: t("monitor.history")
										}),
										checks.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: GoalsPage_module_css_default.body,
											children: t("monitor.historyEmpty")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
											className: GoalsPage_module_css_default.checks,
											children: checks.map((check) => {
												const details = [
													check.value,
													check.matched ? t("monitor.triggered") : void 0,
													check.error
												].filter((part) => part !== void 0);
												return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
													className: GoalsPage_module_css_default.checkItem,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															className: GoalsPage_module_css_default.checkTime,
															children: new Date(check.checkedAt).toLocaleString()
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
															className: GoalsPage_module_css_default.checkText,
															children: check.summary
														}),
														details.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
															className: GoalsPage_module_css_default.checkMeta,
															children: details.join(" · ")
														})
													]
												}, check.id);
											})
										})
									]
								})
							] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GoalsPage_module_css_default.block,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									className: GoalsPage_module_css_default.blockLabel,
									children: t("detail.doneCriteria")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: GoalsPage_module_css_default.body,
									children: selected.doneCriteria ?? t("detail.noDoneCriteria")
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GoalsPage_module_css_default.block,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										className: GoalsPage_module_css_default.blockLabel,
										children: t("detail.steps")
									}),
									selected.tasks.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GoalsPage_module_css_default.body,
										children: t("detail.noSteps")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
										className: GoalsPage_module_css_default.steps,
										children: selected.tasks.map((task, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											className: GoalsPage_module_css_default.stepRow,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: task.status === "done" ? `${GoalsPage_module_css_default.stepMarker} ${GoalsPage_module_css_default.stepMarkerDone}` : GoalsPage_module_css_default.stepMarker,
												"aria-label": t("task.toggle"),
												title: t(TASK_STATUS_KEY[task.status]),
												onClick: () => {
													toggleStep(task.id, task.status);
												},
												children: task.status === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 11 }) : index + 1
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: task.status === "done" ? GoalsPage_module_css_default.stepTitleDone : GoalsPage_module_css_default.stepTitle,
												children: task.title
											})]
										}, task.id))
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
										className: GoalsPage_module_css_default.addStep,
										onSubmit: (event) => {
											event.preventDefault();
											submitStep(selected);
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											value: stepTitle,
											"aria-label": t("detail.addStepPlaceholder"),
											placeholder: t("detail.addStepPlaceholder"),
											onChange: (event) => {
												setStepTitle(event.target.value);
											}
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											type: "submit",
											size: "sm",
											variant: "outline",
											children: t("detail.addStepAction")
										})]
									})
								]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GoalsPage_module_css_default.ideas,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										className: GoalsPage_module_css_default.blockLabel,
										children: t("ideas.title")
									}),
									openIdeas.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GoalsPage_module_css_default.body,
										children: t("ideas.empty")
									}),
									openIdeas.map((idea) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: GoalsPage_module_css_default.idea,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: GoalsPage_module_css_default.ideaText,
												children: idea.content
											}),
											idea.suggestedGoalTitle !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
												className: GoalsPage_module_css_default.ideaGoal,
												children: [
													t("ideas.newGoal"),
													" · ",
													idea.suggestedGoalTitle
												]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: GoalsPage_module_css_default.actions,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													size: "sm",
													variant: "primary",
													disabled: acceptTarget(idea) === void 0,
													onClick: () => {
														accept(idea);
													},
													children: t("ideas.accept")
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													size: "sm",
													variant: "outline",
													onClick: () => {
														dismiss(idea);
													},
													children: t("ideas.dismiss")
												})]
											})
										]
									}, idea.id))
								]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/GoalsPanelIcon.tsx
		/** Decorative occupant for the Personal Goals sidebar entry. */
		/**
		* Render the checklist glyph at the size the sidebar asks for; the sidebar
		* owns the accessible navigation label.
		* @param props - the sidebar's icon share.
		* @returns decorative checklist icon.
		*/
		function GoalsPanelIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, { size });
		}
		//#endregion
		//#region src/client/locales.ts
		/** Copy for the `personalGoals` locale namespace. Chinese is the key-set source. */
		const NS = "personalGoals";
		/** Chinese copy and the key-set source for the `personalGoals` namespace. */
		const zh = {
			"panel": "个人目标",
			"title": "目标",
			"subtitle": "长期目标、分步计划与智能体的建议。",
			"goals.title": "进行中的目标",
			"goals.empty": "还没有目标。从下面选择一个方向开始。",
			"goals.stepsDone": " 个步骤已完成",
			"goals.loading": "正在加载目标…",
			"goals.error": "无法加载个人目标。",
			"goals.retry": "重试",
			"goals.listAria": "目标列表",
			"monitors.title": "进行中的追踪",
			"monitors.empty": "还没有追踪。",
			"monitors.listAria": "追踪列表",
			"create.title": "制定新计划",
			"create.hint": "选择一个方向，或者直接说说你想推进或观察的事。智能体会先问一个问题，再顺着你的回答继续。",
			"startPrompt": "我想制定一个「{area}」方面的计划。",
			"startTrackPrompt": "我想盯着一个东西，有变化时告诉我。",
			"startOtherPrompt": "我想说一件想推进或者想盯着的事。",
			"category.health": "健康与体能",
			"category.health.hint": "睡眠、运动、饮食与精力",
			"category.health.glyph": "健",
			"category.relationships": "关系与家人",
			"category.relationships.hint": "陪伴、沟通与重要的人",
			"category.relationships.glyph": "关",
			"category.finance": "财务与储蓄",
			"category.finance.hint": "预算、储蓄与长期规划",
			"category.finance.glyph": "财",
			"category.career": "事业与项目",
			"category.career.hint": "职业发展、副业与作品",
			"category.career.glyph": "业",
			"category.interests": "兴趣与学习",
			"category.interests.hint": "技能、语言与好奇心",
			"category.interests.glyph": "趣",
			"category.productivity": "效率与习惯",
			"category.productivity.hint": "日常节奏、专注与整理",
			"category.productivity.glyph": "效",
			"category.tracking": "条件追踪",
			"category.tracking.hint": "票价跟踪、新闻提醒等",
			"category.tracking.glyph": "盯",
			"category.other": "其他方向",
			"category.other.hint": "用自己的话描述，想到什么说什么",
			"category.other.glyph": "＋",
			"detail.empty": "选择一个目标查看详情。",
			"detail.doneCriteria": "完成标准",
			"detail.noDoneCriteria": "未设置完成标准",
			"detail.steps": "步骤",
			"detail.noSteps": "还没有步骤。",
			"detail.addStepPlaceholder": "添加一个步骤…",
			"detail.addStepAction": "添加",
			"detail.pause": "暂停",
			"detail.resume": "继续",
			"detail.complete": "标记完成",
			"detail.archive": "归档",
			"detail.delete": "删除",
			"detail.confirmDelete": "确认删除",
			"detail.confirmComplete": "确认完成",
			"detail.confirmArchive": "确认归档",
			"detail.cancel": "取消",
			"detail.updated": "最近更新",
			"status.active": "进行中",
			"status.paused": "已暂停",
			"status.blocked": "受阻",
			"status.completed": "已完成",
			"status.archived": "已归档",
			"task.pending": "待办",
			"task.in_progress": "进行中",
			"task.blocked": "受阻",
			"task.done": "完成",
			"task.cancelled": "取消",
			"task.toggle": "切换步骤完成状态",
			"ideas.title": "建议",
			"ideas.empty": "没有待处理的建议。",
			"ideas.newGoal": "提议的新目标",
			"ideas.accept": "采纳",
			"ideas.dismiss": "忽略",
			"monitor.mode.threshold": "数值阈值",
			"monitor.watching": "监控中",
			"monitor.triggered": "已触发",
			"monitor.expired": "已过期",
			"monitor.condition": "监控条件",
			"monitor.cadence": "检查频率",
			"monitor.expiryLabel": "截止时间",
			"monitor.sources": "优先来源",
			"monitor.lastCheck": "最近观察",
			"monitor.noCheck": "还没有观察记录",
			"monitor.history": "观察历史",
			"monitor.historyEmpty": "还没有观察记录。",
			"monitor.keepWatching": "继续观望",
			"monitor.markHandled": "已处理",
			"monitor.stop": "结束监控",
			"monitor.confirmHandled": "确认已处理",
			"monitor.confirmStop": "确认结束监控",
			"monitor.cadence.daily": "每天",
			"monitor.cadence.every_12h": "每 12 小时",
			"monitor.cadence.every_6h": "每 6 小时",
			"monitor.cadence.weekly": "每周",
			"action.error": "操作未完成，请重试。"
		};
		/** English copy; keys match {@link zh}. */
		const en = {
			"panel": "Personal goals",
			"title": "Goals",
			"subtitle": "Long-term goals, step-by-step plans, and agent suggestions.",
			"goals.title": "In progress",
			"goals.empty": "No goals yet. Pick a direction below to start one.",
			"goals.stepsDone": " steps completed",
			"goals.loading": "Loading goals…",
			"goals.error": "Could not load personal goals.",
			"goals.retry": "Retry",
			"goals.listAria": "Personal goal list",
			"monitors.title": "Active tracking",
			"monitors.empty": "No tracking yet.",
			"monitors.listAria": "Tracking list",
			"create.title": "Create a goal",
			"create.hint": "Pick a direction, or just describe what you want to move forward or watch. The agent asks one question first, then follows your answer.",
			"startPrompt": "I want to make a plan for {area}.",
			"startTrackPrompt": "I want to watch something and hear when it changes.",
			"startOtherPrompt": "I want to talk about something I want to move forward or keep an eye on.",
			"category.health": "Health & fitness",
			"category.health.hint": "Sleep, movement, food, and energy",
			"category.health.glyph": "H",
			"category.relationships": "Relationships",
			"category.relationships.hint": "Time and communication with people who matter",
			"category.relationships.glyph": "R",
			"category.finance": "Money & savings",
			"category.finance.hint": "Budget, savings, and long-term planning",
			"category.finance.glyph": "$",
			"category.career": "Career & projects",
			"category.career.hint": "Growth, side projects, and portfolio",
			"category.career.glyph": "C",
			"category.interests": "Interests & learning",
			"category.interests.hint": "Skills, languages, and curiosity",
			"category.interests.glyph": "I",
			"category.productivity": "Productivity & habits",
			"category.productivity.hint": "Daily rhythm, focus, and organization",
			"category.productivity.glyph": "P",
			"category.tracking": "Condition tracking",
			"category.tracking.hint": "Price tracking, news alerts, and more",
			"category.tracking.glyph": "T",
			"category.other": "Something else",
			"category.other.hint": "Say it in your own words; the agent will follow up",
			"category.other.glyph": "+",
			"detail.empty": "Select a goal to see its detail.",
			"detail.doneCriteria": "Definition of done",
			"detail.noDoneCriteria": "No definition of done yet",
			"detail.steps": "Steps",
			"detail.noSteps": "No steps yet.",
			"detail.addStepPlaceholder": "Add a step…",
			"detail.addStepAction": "Add",
			"detail.pause": "Pause",
			"detail.resume": "Resume",
			"detail.complete": "Mark complete",
			"detail.archive": "Archive",
			"detail.delete": "Delete",
			"detail.confirmDelete": "Confirm delete",
			"detail.confirmComplete": "Confirm complete",
			"detail.confirmArchive": "Confirm archive",
			"detail.cancel": "Cancel",
			"detail.updated": "Updated",
			"status.active": "Active",
			"status.paused": "Paused",
			"status.blocked": "Blocked",
			"status.completed": "Completed",
			"status.archived": "Archived",
			"task.pending": "To do",
			"task.in_progress": "In progress",
			"task.blocked": "Blocked",
			"task.done": "Done",
			"task.cancelled": "Cancelled",
			"task.toggle": "Toggle step completion",
			"ideas.title": "Ideas",
			"ideas.empty": "No open ideas.",
			"ideas.newGoal": "Proposed new goal",
			"ideas.accept": "Accept",
			"ideas.dismiss": "Dismiss",
			"monitor.mode.threshold": "Threshold",
			"monitor.watching": "Watching",
			"monitor.triggered": "Triggered",
			"monitor.expired": "Expired",
			"monitor.condition": "Monitor condition",
			"monitor.cadence": "Check frequency",
			"monitor.expiryLabel": "Expires",
			"monitor.sources": "Preferred sources",
			"monitor.lastCheck": "Last observation",
			"monitor.noCheck": "No observations yet",
			"monitor.history": "Observation history",
			"monitor.historyEmpty": "No observations yet.",
			"monitor.keepWatching": "Keep watching",
			"monitor.markHandled": "Mark handled",
			"monitor.stop": "Stop monitoring",
			"monitor.confirmHandled": "Confirm handled",
			"monitor.confirmStop": "Confirm stop monitoring",
			"monitor.cadence.daily": "Daily",
			"monitor.cadence.every_12h": "Every 12 hours",
			"monitor.cadence.every_6h": "Every 6 hours",
			"monitor.cadence.weekly": "Weekly",
			"action.error": "That change did not go through. Try again."
		};
		//#endregion
		//#region src/client/source.ts
		/**
		* Create the page source and start its subscriptions.
		* @param deps - Remote calls and invalidation subscriptions.
		* @returns the injected face and a disposer.
		*/
		function createPersonalGoalsSource(deps) {
			let snapshot = {
				status: "loading",
				goals: [],
				ideas: []
			};
			const listeners = /* @__PURE__ */ new Set();
			let disposed = false;
			const publish = (next) => {
				snapshot = next;
				for (const listener of listeners) listener();
			};
			const read = async () => {
				try {
					const [goals, ideas] = await Promise.all([deps.list(), deps.listIdeas({})]);
					if (disposed) return;
					publish(goals.ok && ideas.ok ? {
						status: "ready",
						goals: goals.value,
						ideas: ideas.value
					} : {
						...snapshot,
						status: "error"
					});
				} catch (_error) {
					if (!disposed) publish({
						...snapshot,
						status: "error"
					});
				}
			};
			const mutate = async (call) => {
				try {
					if (!(await call()).ok) return false;
					await read();
					return true;
				} catch (_error) {
					return false;
				}
			};
			const offReset = deps.subscribeReset(() => {
				read();
			});
			const timer = setInterval(() => {
				if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
				read();
			}, 5e3);
			read();
			return {
				injected: {
					hooks: { personalGoals: {
						getSnapshot: () => snapshot,
						subscribe: (listener) => {
							listeners.add(listener);
							return () => {
								listeners.delete(listener);
							};
						}
					} },
					onRetry: read,
					onUpdateGoal: (goalId, patch) => mutate(() => deps.update({
						goalId,
						...patch
					})),
					onAddTask: (input) => mutate(() => deps.addTask(input)),
					onUpdateTask: (request) => mutate(() => deps.updateTask(request)),
					onAcceptIdea: (input) => mutate(() => deps.acceptIdea(input)),
					onDismissIdea: (ideaId) => mutate(() => deps.dismissIdea({ ideaId })),
					onStartPlan: (prompt) => {
						deps.startPlan(prompt);
					},
					onDeleteGoal: (goalId) => mutate(() => deps.deleteGoal(goalId)),
					onListChecks: async (goalId) => {
						const result = await deps.listChecks({
							goalId,
							limit: 20
						});
						return result.ok ? result.value : null;
					},
					onResumeMonitor: (goalId) => mutate(() => deps.resumeMonitor({ goalId }))
				},
				dispose: () => {
					disposed = true;
					clearInterval(timer);
					offReset();
					listeners.clear();
				}
			};
		}
		//#endregion
		//#region src/client/index.ts
		const PANEL_ID = "personal-goals";
		/** Services required by the page, the sidebar entry, RPC, and guided sessions. */
		const inject = [
			"slots",
			"locale",
			"connection",
			"uiWorkspace"
		];
		/**
		* Register the Personal Goals page and its sidebar entry.
		* @param ctx - browser services used by these contributions.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-personal-goals: dictionaries");
			const t = ctx.locale.bind(NS);
			const call = async (method, args = {}) => {
				const result = await ctx.connection.rpc.call("/api", `personalGoals/${method}`, { args });
				return result.ok ? {
					ok: true,
					value: result.value
				} : {
					ok: false,
					error: result.error
				};
			};
			const source = createPersonalGoalsSource({
				list: () => call("list"),
				listIdeas: (input) => call("listIdeas", { input }),
				update: (request) => call("update", { request }),
				addTask: (input) => call("addTask", { input }),
				updateTask: (request) => call("updateTask", { request }),
				acceptIdea: (input) => call("acceptIdea", { input }),
				dismissIdea: (request) => call("dismissIdea", { request }),
				subscribeReset: (listener) => ctx.on("connection/reset", listener),
				startPlan: (prompt) => {
					ctx.uiWorkspace.startSession(void 0, {
						prompt,
						submit: true
					});
				},
				deleteGoal: (goalId) => call("delete", { request: { goalId } }),
				listChecks: (input) => call("listChecks", { input }),
				resumeMonitor: (request) => call("resumeMonitor", { request })
			});
			ctx.effect(() => () => {
				source.dispose();
			}, "ui-personal-goals: catalog subscriptions");
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS,
				inject: () => source.injected
			}, GoalsPage));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 11,
				locale: NS,
				label: () => t("panel")
			}, GoalsPanelIcon));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map