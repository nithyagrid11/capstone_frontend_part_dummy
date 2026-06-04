import { useEffect, useMemo, useState } from "react";
import axios, { type AxiosRequestConfig } from "axios";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  GitBranch,
  Network,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { routes, type RouteId } from "./routes";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const INITIAL_SCENARIO_ID = "SCN_014";
const READ_ONLY_API = API_BASE.includes("ngrok-free.dev");

type ApiState<T> = {
  data: T;
  loading: boolean;
  source: "api" | "demo";
  error?: string;
};

type Pattern = {
  pattern_id?: string;
  pattern_name: string;
  confidence: number;
  evidence?: unknown;
};

type SimilarMatch = {
  scenario_id: string;
  account_name: string;
  outcome: "won" | "lost";
  confidence: string | number;
  narrative: string;
};

type Experience = {
  experience_id: string;
  experience_type: string;
  opportunity_id: string;
  outcome: "won" | "lost";
  vertical: string;
  confidence: number;
  narrative_summary: string;
};

type CandidateSkill = {
  candidate_skill_id: string;
  name: string;
  skill_type: string;
  confidence: number;
  support_count: number;
  status: "candidate" | "approved" | "rejected";
};

type GraphStat = {
  type: string;
  count: number;
};

type DealSummary = {
  account_name: string;
  industry: string;
  account_size: string;
  amount: number;
  outcome: "won" | "lost";
  progression_shape: string;
  duration_days: number;
  activity_count: number;
  team_roles: string[] | string;
  actor_names: string[] | string;
};

type ExplainData = {
  behavioral_summary?: Partial<DealSummary>;
  patterns?: Pattern[];
  similar_deals?: SimilarMatch[] | string[];
  clusters?: {
    cluster_label?: string;
    membership_prob?: number;
  }[];
  explanation?: string;
};

type GraphStatsResponse = {
  nodes?: GraphStat[] | Record<string, number>;
  edges?: GraphStat[] | Record<string, number>;
};

type Cluster = {
  cluster_id: string | number;
  cluster_label: string;
  cluster_method: string;
  members: string[];
  size: number;
  noise_count: number;
};

type PatternSummary = {
  pattern_id: string;
  pattern_name: string;
  scenario_count: number;
  avg_confidence: number;
  scenarios?: string[];
};

type Chemistry = {
  actor_key?: string;
  actor_names_key?: string;
  vertical?: string;
  account_size?: string;
  win_rate?: number;
  scenario_count?: number;
};

type NegativePair = {
  pair_signature: string;
  loss_rate: number;
  loss_count?: number;
  win_count?: number;
};

type TemporalFlow = {
  opportunity_id: string;
  mermaid_graph: string;
};

type SalesforceOpportunity = {
  Id: string;
  Name: string;
  StageName: string;
  Amount?: number;
  CloseDate?: string;
};

type SalesforceResponse = {
  success: boolean;
  data: SalesforceOpportunity[];
  total_size?: number;
  message?: string;
};

const demoPatterns: Pattern[] = [
  {
    pattern_id: "PAT_MULTI_THREAD",
    pattern_name: "Executive sponsor rescued stalled discovery",
    confidence: 0.86,
    evidence: "VP escalation followed by two stakeholder meetings within 6 days.",
  },
  {
    pattern_id: "PAT_DELIVERY_ALIGNMENT",
    pattern_name: "Delivery architect added before proposal",
    confidence: 0.78,
    evidence: "Solutions and delivery joined before commercial approval.",
  },
  {
    pattern_id: "PAT_RISK_REVOPS",
    pattern_name: "RevOps intervention reduced forecast drift",
    confidence: 0.71,
    evidence: "Forecast changed once after RevOps reviewed the opportunity.",
  },
];

const demoMatches: SimilarMatch[] = [
  {
    scenario_id: "SCN_014",
    account_name: "Northstar Health",
    outcome: "won",
    confidence: "strong",
    narrative: "Won after delivery joined discovery and sponsor alignment happened before pricing.",
  },
  {
    scenario_id: "SCN_021",
    account_name: "Aster Finance",
    outcome: "lost",
    confidence: "medium",
    narrative: "Similar stage regression, but no executive sponsor appeared before procurement.",
  },
  {
    scenario_id: "SCN_006",
    account_name: "Vertex Retail",
    outcome: "won",
    confidence: "medium",
    narrative: "Architect-led demo created reusable security evidence for the buying committee.",
  },
];

const demoExperiences: Experience[] = [
  {
    experience_id: "EXP-201",
    experience_type: "success_experience",
    opportunity_id: "SCN_014",
    outcome: "won",
    vertical: "Healthcare",
    confidence: 0.9,
    narrative_summary:
      "Healthcare enterprise deals close faster when delivery joins before proposal and the VP sponsor is engaged during discovery.",
  },
  {
    experience_id: "EXP-219",
    experience_type: "failure_experience",
    opportunity_id: "SCN_021",
    outcome: "lost",
    vertical: "Finance",
    confidence: 0.82,
    narrative_summary:
      "Repeated proposal-stage regression without executive ownership is a high-risk signal for enterprise finance deals.",
  },
  {
    experience_id: "EXP-232",
    experience_type: "handoff_experience",
    opportunity_id: "SCN_006",
    outcome: "won",
    vertical: "Retail",
    confidence: 0.76,
    narrative_summary:
      "Security questionnaire reuse worked best when RevOps routed the prior evidence package before legal review.",
  },
];

const demoSkills: CandidateSkill[] = [
  {
    candidate_skill_id: "8f2d-demo",
    name: "Escalate Healthcare Deal To Delivery Architect",
    skill_type: "handoff",
    confidence: 0.88,
    support_count: 7,
    status: "candidate",
  },
  {
    candidate_skill_id: "4ab1-demo",
    name: "Attach Executive Sponsor Before Proposal",
    skill_type: "collaboration",
    confidence: 0.81,
    support_count: 5,
    status: "approved",
  },
  {
    candidate_skill_id: "1c90-demo",
    name: "Trigger RevOps Review On Forecast Regression",
    skill_type: "forecast_guardrail",
    confidence: 0.74,
    support_count: 4,
    status: "candidate",
  },
];

const demoGraphStats: GraphStat[] = [
  { type: "Opportunity", count: 31 },
  { type: "Pattern", count: 18 },
  { type: "Skill", count: 12 },
  { type: "Person", count: 24 },
  { type: "Tool", count: 9 },
];

const demoClusters: Cluster[] = [
  { cluster_id: 0, cluster_label: "Assisted enterprise wins", cluster_method: "hdbscan", members: ["SCN_014", "SCN_006", "SCN_031", "SCN_018"], size: 4, noise_count: 0 },
  { cluster_id: 1, cluster_label: "Solo AE losses", cluster_method: "hdbscan", members: ["SCN_021", "SCN_009", "SCN_024"], size: 3, noise_count: 0 },
  { cluster_id: 2, cluster_label: "Escalated proposal saves", cluster_method: "hdbscan", members: ["SCN_003", "SCN_012", "SCN_028"], size: 3, noise_count: 0 },
];

const demoPatternSummaries: PatternSummary[] = demoPatterns.map((pattern, index) => ({
  pattern_id: pattern.pattern_id ?? `PAT_${index}`,
  pattern_name: pattern.pattern_name,
  scenario_count: 9 - index * 2,
  avg_confidence: pattern.confidence,
}));

const demoChemistry: Chemistry[] = [
  { actor_key: "AE+Architect+Delivery", vertical: "Healthcare", win_rate: 0.88, scenario_count: 8 },
  { actor_key: "AE+Executive", vertical: "Finance", win_rate: 0.76, scenario_count: 6 },
  { actor_key: "AE", vertical: "Enterprise", win_rate: 0.42, scenario_count: 9 },
];

const demoNegativePairs: NegativePair[] = [
  { pair_signature: "No sponsor + Finance", loss_rate: 0.83, loss_count: 5, win_count: 1 },
  { pair_signature: "Solo AE + Enterprise", loss_rate: 0.71, loss_count: 5, win_count: 2 },
  { pair_signature: "Late security review", loss_rate: 0.64, loss_count: 7, win_count: 4 },
];

const demoFlow: TemporalFlow = {
  opportunity_id: INITIAL_SCENARIO_ID,
  mermaid_graph: `graph LR
    A([Start Deal]) --> B([Qualify])
    B --> C([Discovery])
    C --> D([Proposal])
    D --> E([Negotiation])
    E --> F([Closed])`,
};

const demoOpportunities: SalesforceOpportunity[] = [
  { Id: "006-demo-1", Name: "Northstar Health", StageName: "Discovery", Amount: 420000, CloseDate: "2026-06-28" },
  { Id: "006-demo-2", Name: "Aster Finance", StageName: "Proposal", Amount: 310000, CloseDate: "2026-07-15" },
  { Id: "006-demo-3", Name: "Vertex Retail", StageName: "Negotiation", Amount: 185000, CloseDate: "2026-06-20" },
];

const demoSalesforceResponse: SalesforceResponse = {
  success: true,
  data: demoOpportunities,
  total_size: demoOpportunities.length,
};

const demoExplain: ExplainData = {
  behavioral_summary: {
    account_name: "Northstar Health",
    industry: "Healthcare",
    account_size: "Enterprise",
    amount: 420000,
    outcome: "won",
    progression_shape: "escalated_win",
    duration_days: 42,
    activity_count: 31,
    team_roles: ["AE", "Architect", "Delivery", "Executive"],
    actor_names: ["Sarah Chen", "Ishaan Rao", "Maya Lewis"],
  },
  patterns: demoPatterns,
  similar_deals: demoMatches,
  clusters: [{ cluster_label: "Enterprise healthcare assisted wins", membership_prob: 0.82 }],
  explanation:
    "This deal resembles prior assisted wins where the sponsor and delivery architect were activated before proposal.",
};

const pipeline = [
  ["Raw CRM", "Salesforce opportunities, people, stage history"],
  ["Behavior", "Patterns, clusters, precedents"],
  ["Experience", "Reusable organizational memory"],
  ["Skills", "Candidate automations with evidence"],
  ["Context", "People, tools, and graph retrieval"],
  ["Harness", "Actions surfaced to the workflow agent"],
];

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

async function fetchJson<T>(path: string, fallback: T, init?: AxiosRequestConfig): Promise<ApiState<T>> {
  try {
    const response = await api.request<T>({
      url: path,
      method: "GET",
      ...init,
    });

    return { data: response.data, loading: false, source: "api" };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message
      : error instanceof Error
        ? error.message
        : "API unavailable";

    return {
      data: fallback,
      loading: false,
      source: "demo",
      error: message,
    };
  }
}

function getInitialRoute(): RouteId {
  const hash = window.location.hash.replace("#", "") as RouteId;
  return routes.some((route) => route.id === hash) ? hash : "journey";
}

function App() {
  const [activeRoute, setActiveRoute] = useState<RouteId>(getInitialRoute);

  useEffect(() => {
    window.location.hash = activeRoute;
  }, [activeRoute]);

  const route = useMemo(
    () => routes.find((item) => item.id === activeRoute) ?? routes[0],
    [activeRoute],
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Sidebar activeRoute={activeRoute} onRouteChange={setActiveRoute} />
      <div className="min-h-screen lg:pl-72">
        <Navbar route={route} apiBase={API_BASE} />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <RouteContent route={activeRoute} />
        </main>
      </div>
    </div>
  );
}

function RouteContent({ route }: { route: RouteId }) {
  if (route === "journey") return <JourneyPage />;
  if (route === "experience") return <ExperiencePage />;
  if (route === "clusters") return <ClusterPage />;
  if (route === "search") return <PrecedentSearchPage />;
  if (route === "analytics") return <AnalyticsPage />;
  if (route === "graph") return <GraphPage />;
  if (route === "timeline") return <TimelinePage />;
  if (route === "opportunities") return <ActiveOpportunitiesPage />;
  return <SkillApprovalPage />;
}

function JourneyPage() {
  const [scenarioId, setScenarioId] = useState(INITIAL_SCENARIO_ID);
  const [explain, setExplain] = useState<ApiState<ExplainData>>({
    data: demoExplain,
    loading: true,
    source: "demo",
  });
  const [experiences, setExperiences] = useState<ApiState<{ experiences: Experience[] }>>({
    data: { experiences: demoExperiences },
    loading: true,
    source: "demo",
  });

  const load = async () => {
    setExplain((state) => ({ ...state, loading: true }));
    setExperiences((state) => ({ ...state, loading: true }));
    const [explainResult, experienceResult] = await Promise.all([
      fetchJson(`/intelligence/scenario/${scenarioId}/explain`, explain.data),
      fetchJson(`/experiences/by-opportunity/${scenarioId}`, { experiences: demoExperiences }),
    ]);
    setExplain(explainResult);
    setExperiences(experienceResult);
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchJson(`/intelligence/scenario/${INITIAL_SCENARIO_ID}/explain`, demoExplain),
      fetchJson(`/experiences/by-opportunity/${INITIAL_SCENARIO_ID}`, { experiences: demoExperiences }),
    ]).then(([explainResult, experienceResult]) => {
      if (!isMounted) return;
      setExplain(explainResult);
      setExperiences(experienceResult);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = explain.data.behavioral_summary ?? {};
  const patterns = explain.data.patterns ?? demoPatterns;
  const similar = normalizeSimilarDeals(explain.data.similar_deals);

  return (
    <div className="space-y-5">
      <ApiBanner source={explain.source} error={explain.error} />
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Deal Intelligence Journey</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              React version of the Streamlit stakeholder demo, following one opportunity from raw CRM data to AI-ready context.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={scenarioId}
              onChange={(event) => setScenarioId(event.target.value)}
              aria-label="Scenario ID"
            />
            <Button onClick={load}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {pipeline.map(([title, copy], index) => (
            <div key={title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stage {index}</span>
                {index < pipeline.length - 1 ? <ArrowRight size={15} className="text-slate-400" /> : <Bot size={15} />}
              </div>
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <section className="panel">
          <SectionTitle icon={Database} title="Raw Deal Snapshot" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Metric label="Account" value={summary.account_name ?? "Northstar Health"} />
            <Metric label="Industry" value={summary.industry ?? "Healthcare"} />
            <Metric label="Amount" value={formatMoney(summary.amount ?? 420000)} />
            <Metric label="Outcome" value={(summary.outcome ?? "won").toUpperCase()} good={summary.outcome !== "lost"} />
            <Metric label="Progression" value={summary.progression_shape ?? "escalated_win"} />
            <Metric label="Activity Count" value={String(summary.activity_count ?? 31)} />
          </div>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Actors:</span>{" "}
            {asStringArray(summary.actor_names, ["Sarah Chen", "Ishaan Rao", "Maya Lewis"]).join(", ")}
          </div>
        </section>

        <section className="panel">
          <SectionTitle icon={Sparkles} title="Behavioral Intelligence" />
          <p className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
            {explain.data.explanation ?? "Patterns and similar deals explain what the engine considers notable."}
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {patterns.slice(0, 3).map((pattern: Pattern) => (
              <PatternCard key={pattern.pattern_id ?? pattern.pattern_name} pattern={pattern} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel">
          <SectionTitle icon={Search} title="Closest Precedents" />
          <div className="mt-4 space-y-3">
            {similar.slice(0, 3).map((match: SimilarMatch) => (
              <MatchRow key={match.scenario_id} match={match} />
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionTitle icon={ShieldCheck} title="Extracted Experiences" />
          <div className="mt-4 space-y-3">
            {experiences.data.experiences.slice(0, 3).map((experience) => (
              <ExperienceRow key={experience.experience_id} experience={experience} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ExperiencePage() {
  const [scenarioId, setScenarioId] = useState(INITIAL_SCENARIO_ID);
  const [stage, setStage] = useState<ApiState<{ experiences: Experience[] }>>({
    data: { experiences: demoExperiences },
    loading: false,
    source: "demo",
  });
  const [patterns, setPatterns] = useState<ApiState<Pattern[]>>({
    data: demoPatterns,
    loading: true,
    source: "demo",
  });

  const extract = async () => {
    setStage((state) => ({ ...state, loading: true }));
    await fetchJson(`/experiences/extract/${scenarioId}`, {}, { method: "POST" });
    const [experienceResult, patternResult] = await Promise.all([
      fetchJson(`/experiences/by-opportunity/${scenarioId}`, { experiences: demoExperiences }),
      fetchJson(`/intelligence/scenario/${scenarioId}/patterns`, demoPatterns),
    ]);
    setStage(experienceResult);
    setPatterns(patternResult);
  };

  useEffect(() => {
    void Promise.all([
      fetchJson(`/experiences/by-opportunity/${INITIAL_SCENARIO_ID}`, { experiences: demoExperiences }),
      fetchJson(`/intelligence/scenario/${INITIAL_SCENARIO_ID}/patterns`, demoPatterns),
    ]).then(([experienceResult, patternResult]) => {
      setStage(experienceResult);
      setPatterns(patternResult);
    });
  }, []);

  return (
    <div className="space-y-5">
      <ApiBanner source={stage.source} error={stage.error} />
      <section className="panel">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionTitle icon={GitBranch} title="Deal Experience Progression" />
          <div className="flex gap-2">
            <Input value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} />
            <Button onClick={extract} disabled={stage.loading} title="Extract experiences">
              <Play size={16} />
              {stage.loading ? "Extracting" : "Extract"}
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <StageColumn title="1. Raw Deal Data" copy="Fetch current opportunity context from the behavior record." items={["Account profile", "Team topology", "Stage history"]} />
          <StageColumn title="2. Stage 1 Analysis" copy="GET /intelligence/scenario/{id}/patterns" items={patterns.data.map((item) => item.pattern_name)} />
          <StageColumn title="3. Stage 2 Memory" copy="Convert evidence into reusable experiences." items={stage.data.experiences.map((item) => item.narrative_summary)} />
        </div>
      </section>
    </div>
  );
}

function ClusterPage() {
  const [clusters, setClusters] = useState<ApiState<Cluster[]>>({
    data: demoClusters,
    loading: true,
    source: "demo",
  });
  const [noise, setNoise] = useState<ApiState<{ scenario_id: string; membership_prob: number }[]>>({
    data: [],
    loading: true,
    source: "demo",
  });

  useEffect(() => {
    void Promise.all([
      fetchJson("/intelligence/clusters", demoClusters),
      fetchJson("/intelligence/noise", []),
    ]).then(([clusterResult, noiseResult]) => {
      setClusters(clusterResult);
      setNoise(noiseResult);
    });
  }, []);

  const totalMembers = clusters.data.reduce((sum, cluster) => sum + Number(cluster.size ?? cluster.members.length), 0);

  return (
    <div className="space-y-5">
      <ApiBanner source={clusters.source} error={clusters.error} />
      <section className="panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle icon={CircleDot} title="HDBSCAN Cluster Memberships" />
          <div className="flex gap-2">
            <StatusBadge good label={`${clusters.data.length} clusters`} />
            <StatusBadge good={noise.data.length === 0} label={`${noise.data.length} noise points`} />
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Live data from <code>/intelligence/clusters</code>. The backend currently returns cluster memberships, but not the 2D t-SNE coordinates used by Streamlit.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-h-96 rounded-lg border border-slate-200 bg-slate-950 p-5">
            <div className="grid h-full gap-4 md:grid-cols-2">
              {clusters.data.map((cluster, clusterIndex) => (
                <div key={String(cluster.cluster_id)} className="rounded-md border border-slate-700 bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-2 text-white">
                    <p className="text-sm font-semibold">{cluster.cluster_label}</p>
                    <span className="text-xs text-slate-400">{cluster.size} members</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {(cluster.members ?? []).map((member, memberIndex) => (
                      <span
                        key={member}
                        title={`${member} · ${cluster.cluster_label}`}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-[9px] font-semibold text-white ${
                          ["border-emerald-300 bg-emerald-600", "border-blue-300 bg-blue-600", "border-amber-300 bg-amber-600"][clusterIndex % 3]
                        }`}
                        style={{ transform: `translateY(${memberIndex % 2 === 0 ? 0 : 8}px)` }}
                      >
                        {member.replace("SCN_", "S")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Metric label="Clustered Scenarios" value={String(totalMembers)} />
            {clusters.data.map((cluster) => (
              <div key={String(cluster.cluster_id)} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold">{cluster.cluster_label}</p>
                <p className="mt-1 text-sm text-slate-500">
                  ID {cluster.cluster_id} · {cluster.cluster_method} · {cluster.size} scenarios
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PrecedentSearchPage() {
  const [industry, setIndustry] = useState("Healthcare");
  const [outcome, setOutcome] = useState("");
  const [results, setResults] = useState<ApiState<{ matches: SimilarMatch[]; risk_warnings?: { narrative: string }[] }>>({
    data: { matches: demoMatches, risk_warnings: [{ narrative: "Finance deals with no sponsor and repeated stage regression tend to slip or close lost." }] },
    loading: false,
    source: "demo",
  });

  const search = async () => {
    setResults((state) => ({ ...state, loading: true }));
    const data = {
      industry: industry || undefined,
      outcome: outcome || undefined,
      has_architect: true,
      top_k: 5,
    };
    setResults(await fetchJson("/intelligence/similar", results.data, { method: "POST", data }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="panel">
        <SectionTitle icon={Search} title="Precedent Search" />
        <div className="mt-4 space-y-3">
          <Field label="Industry" value={industry} onChange={setIndustry} options={["", "Healthcare", "Technology", "Retail", "Finance", "Banking"]} />
          <Field label="Outcome" value={outcome} onChange={setOutcome} options={["", "won", "lost"]} />
          <label className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm">
            <input type="checkbox" defaultChecked />
            Has architect
          </label>
          <label className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm">
            <input type="checkbox" />
            Solo AE risk
          </label>
          <Button className="w-full" onClick={search}>
            <Search size={16} />
            Find Precedents
          </Button>
        </div>
      </section>
      <section className="panel">
        <ApiBanner source={results.source} error={results.error} compact />
        {results.data.risk_warnings?.[0] ? (
          <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle size={18} />
            {results.data.risk_warnings[0].narrative}
          </div>
        ) : null}
        <div className="mt-4 space-y-3">
          {results.data.matches.map((match) => (
            <MatchRow key={match.scenario_id} match={match} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AnalyticsPage() {
  const [patterns, setPatterns] = useState<ApiState<PatternSummary[]>>({ data: demoPatternSummaries, loading: true, source: "demo" });
  const [chemistry, setChemistry] = useState<ApiState<Chemistry[]>>({ data: demoChemistry, loading: true, source: "demo" });
  const [negativePairs, setNegativePairs] = useState<ApiState<NegativePair[]>>({ data: demoNegativePairs, loading: true, source: "demo" });

  useEffect(() => {
    void Promise.all([
      fetchJson("/intelligence/patterns", demoPatternSummaries),
      fetchJson("/intelligence/chemistry", demoChemistry),
      fetchJson("/intelligence/negative-pairs", demoNegativePairs),
    ]).then(([patternResult, chemistryResult, pairResult]) => {
      setPatterns(patternResult);
      setChemistry(chemistryResult);
      setNegativePairs(pairResult);
    });
  }, []);

  return (
    <div className="space-y-5">
      <ApiBanner source={patterns.source} error={patterns.error} />
      <section className="panel">
        <SectionTitle icon={BarChart3} title="Pattern & Chemistry Analytics" />
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <AnalyticsCard title="Behavioral Patterns" rows={patterns.data.slice(0, 8).map((item) => [item.pattern_name, item.scenario_count])} />
          <AnalyticsCard title="Team Chemistry Win Rates" rows={chemistry.data.slice(0, 8).map((item) => [item.actor_key ?? item.actor_names_key ?? "Unknown team", Math.round((item.win_rate ?? 0) * 100)])} suffix="%" />
          <AnalyticsCard title="Negative Pair Risk" rows={negativePairs.data.slice(0, 8).map((item) => [item.pair_signature, Math.round(item.loss_rate * 100)])} suffix="%" danger />
        </div>
      </section>
    </div>
  );
}

function GraphPage() {
  const [stats, setStats] = useState<ApiState<GraphStatsResponse | GraphStat[]>>({
    data: { nodes: demoGraphStats },
    loading: true,
    source: "demo",
  });

  useEffect(() => {
    void fetchJson("/context/stats", { nodes: demoGraphStats }).then(setStats);
  }, []);

  const rows: GraphStat[] = Array.isArray(stats.data)
    ? stats.data
    : Array.isArray(stats.data.nodes)
      ? stats.data.nodes
      : stats.data.nodes
        ? Object.entries(stats.data.nodes).map(([type, count]) => ({ type, count }))
        : demoGraphStats;

  return (
    <div className="space-y-5">
      <ApiBanner source={stats.source} error={stats.error} />
      <section className="panel">
        <SectionTitle icon={Network} title="Neo4j Deal Graph" />
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="relative h-96 rounded-lg border border-slate-200 bg-white">
            {["Opportunity", "Pattern", "Skill", "Tool", "Person"].map((node, index) => (
              <div
                key={node}
                className="absolute flex h-24 w-24 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-center text-xs font-semibold shadow-sm"
                style={{
                  left: `${12 + (index % 3) * 32}%`,
                  top: `${16 + Math.floor(index / 3) * 45}%`,
                }}
              >
                {node}
              </div>
            ))}
            <div className="absolute left-[28%] top-[28%] h-px w-[34%] rotate-12 bg-slate-300" />
            <div className="absolute left-[49%] top-[31%] h-px w-[25%] rotate-[32deg] bg-slate-300" />
            <div className="absolute left-[23%] top-[65%] h-px w-[42%] -rotate-12 bg-slate-300" />
          </div>
          <div className="space-y-3">
            {rows.map((row) => (
              <Metric key={row.type} label={row.type} value={String(row.count)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelinePage() {
  const [opportunityId, setOpportunityId] = useState(INITIAL_SCENARIO_ID);
  const [flow, setFlow] = useState<ApiState<TemporalFlow>>({ data: demoFlow, loading: true, source: "demo" });

  const loadFlow = async () => {
    setFlow((state) => ({ ...state, loading: true }));
    setFlow(await fetchJson(`/temporal/opportunity/${opportunityId}/flow`, { ...demoFlow, opportunity_id: opportunityId }));
  };

  useEffect(() => {
    void fetchJson(`/temporal/opportunity/${INITIAL_SCENARIO_ID}/flow`, demoFlow).then(setFlow);
  }, []);

  const nodes = extractMermaidNodes(flow.data.mermaid_graph);

  return (
    <div className="space-y-5">
      <ApiBanner source={flow.source} error={flow.error} />
      <section className="panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle icon={Clock3} title="Temporal Opportunity Flow" />
          <div className="flex gap-2">
            <Input value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)} aria-label="Opportunity ID" />
            <Button onClick={loadFlow}>
              <RefreshCw size={16} />
              Load flow
            </Button>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Live workflow definition from <code>/temporal/opportunity/{flow.data.opportunity_id}/flow</code>.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {nodes.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center gap-2">
              <span className={`rounded-md border px-3 py-2 text-sm font-semibold ${node.includes("Tool") || node.includes("Sign-off") ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50"}`}>
                {node}
              </span>
              {index < nodes.length - 1 ? <ArrowRight size={16} className="text-slate-400" /> : null}
            </div>
          ))}
        </div>
        <details className="mt-6 rounded-md border border-slate-200 bg-slate-950 p-4 text-sm text-slate-200">
          <summary className="cursor-pointer font-semibold">Raw Mermaid workflow returned by backend</summary>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap">{flow.data.mermaid_graph}</pre>
        </details>
      </section>
    </div>
  );
}

function ActiveOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ApiState<SalesforceResponse>>({ data: demoSalesforceResponse, loading: true, source: "demo" });

  const loadOpportunities = async () => {
    setOpportunities((state) => ({ ...state, loading: true }));
    setOpportunities(await fetchJson("/sf/fetch/soql", demoSalesforceResponse, {
      method: "POST",
      data: {
        query: "SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity WHERE IsClosed = false ORDER BY CloseDate ASC LIMIT 50",
      },
    }));
  };

  useEffect(() => {
    void fetchJson("/sf/fetch/soql", demoSalesforceResponse, {
      method: "POST",
      data: {
        query: "SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity WHERE IsClosed = false ORDER BY CloseDate ASC LIMIT 50",
      },
    }).then(setOpportunities);
  }, []);

  return (
    <div className="space-y-5">
      <ApiBanner source={opportunities.source} error={opportunities.error} />
      <section className="panel">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle icon={Activity} title="Active Salesforce Opportunities" />
          <Button variant="secondary" onClick={loadOpportunities}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Uses <code>POST /sf/fetch/soql</code> through the FastAPI Salesforce connector.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">Opportunity</th>
                <th className="px-3 py-3">Stage</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Close Date</th>
                <th className="px-3 py-3">Salesforce ID</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.data.data.map((opportunity) => (
                <tr key={opportunity.Id} className="border-b border-slate-100">
                  <td className="px-3 py-4 font-semibold">{opportunity.Name}</td>
                  <td className="px-3 py-4"><StatusBadge good label={opportunity.StageName} /></td>
                  <td className="px-3 py-4">{opportunity.Amount ? formatMoney(opportunity.Amount) : "—"}</td>
                  <td className="px-3 py-4 text-slate-600">{opportunity.CloseDate ?? "—"}</td>
                  <td className="px-3 py-4 font-mono text-xs text-slate-500">{opportunity.Id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {opportunities.data.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No open Salesforce opportunities returned.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SkillApprovalPage() {
  const [skills, setSkills] = useState<ApiState<CandidateSkill[]>>({ data: demoSkills, loading: true, source: "demo" });
  const [message, setMessage] = useState("");

  const loadSkills = async () => {
    setSkills(await fetchJson<CandidateSkill[]>("/skills/search?limit=20", demoSkills));
  };

  const decide = async (skill: CandidateSkill, decision: "approve" | "reject") => {
    if (READ_ONLY_API) return;
    const data = decision === "approve"
      ? { approved_by: "react_demo" }
      : { reason: "Rejected from React demo review", rejected_by: "react_demo" };
    const result = await fetchJson(`/skills/${skill.candidate_skill_id}/${decision}`, { status: "demo" }, { method: "POST", data });
    setMessage(result.source === "api" ? `${skill.name} was ${decision}d.` : `Could not ${decision} through API; showing demo data.`);
    await loadSkills();
  };

  useEffect(() => {
    void fetchJson<CandidateSkill[]>("/skills/search?limit=20", demoSkills).then(setSkills);
  }, []);

  return (
    <div className="space-y-5">
      <ApiBanner source={skills.source} error={skills.error} />
      {message ? <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">{message}</div> : null}
      <section className="panel">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle icon={ShieldCheck} title="Candidate Skill Registry" />
          <Button variant="secondary" onClick={loadSkills}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Lists <code>GET /skills/search</code> results and sends decisions to <code>POST /skills/{`{candidate_id}`}/approve</code> or <code>/reject</code>.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {skills.data.map((skill) => (
            <div key={skill.candidate_skill_id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{skill.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{skill.skill_type} · {skill.support_count} supporting deals</p>
                </div>
                <StatusBadge good={skill.status === "approved"} label={skill.status} />
              </div>
              <div className="mt-4">
                <Progress value={Math.round(skill.confidence * 100)} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => decide(skill, "approve")} disabled={READ_ONLY_API || skill.status !== "candidate"} title={READ_ONLY_API ? "Disabled because the ngrok backend is read-only" : "Approve candidate"}>
                  <CheckCircle2 size={15} />
                  Approve
                </Button>
                <Button variant="secondary" onClick={() => decide(skill, "reject")} disabled={READ_ONLY_API || skill.status !== "candidate"} title={READ_ONLY_API ? "Disabled because the ngrok backend is read-only" : "Reject candidate"}>
                  <XCircle size={15} />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Activity; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
        <Icon size={18} />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function ApiBanner({ source, error, compact = false }: { source: "api" | "demo"; error?: string; compact?: boolean }) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${source === "api" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"} ${compact ? "" : "shadow-sm"}`}>
      {source === "api" ? "Connected to FastAPI backend." : `Using demo fallback data${error ? ` because API returned ${error}.` : "."}`}
    </div>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${good === undefined ? "text-slate-950" : good ? "text-emerald-700" : "text-rose-700"}`}>{value}</p>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{pattern.pattern_name}</p>
        <span className="text-sm font-semibold text-emerald-700">{Math.round(pattern.confidence * 100)}%</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{formatEvidence(pattern.evidence)}</p>
    </div>
  );
}

function MatchRow({ match }: { match: SimilarMatch }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{match.account_name}</p>
          <p className="text-sm text-slate-500">{match.scenario_id} · confidence {String(match.confidence)}</p>
        </div>
        <StatusBadge good={match.outcome === "won"} label={match.outcome} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{match.narrative}</p>
    </div>
  );
}

function ExperienceRow({ experience }: { experience: Experience }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold capitalize">{experience.experience_type.replaceAll("_", " ")}</p>
        <span className="text-sm font-semibold text-slate-600">{Math.round(experience.confidence * 100)}%</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{experience.narrative_summary}</p>
    </div>
  );
}

function StageColumn({ title, copy, items }: { title: string; copy: string; items: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{copy}</p>
      <div className="mt-4 space-y-2">
        {items.slice(0, 4).map((item) => (
          <div key={item} className="rounded-md bg-white p-3 text-sm text-slate-600 shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select className="input mt-1 w-full" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Any"}
          </option>
        ))}
      </select>
    </label>
  );
}

function AnalyticsCard({ title, rows, suffix = "", danger = false }: { title: string; rows: readonly (readonly [string, number])[]; suffix?: string; danger?: boolean }) {
  const max = Math.max(...rows.map((row) => row[1]));
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="truncate text-slate-600">{label}</span>
              <span className="font-semibold">{value}{suffix}</span>
            </div>
            <div className="h-2 rounded-full bg-white">
              <div className={`h-2 rounded-full ${danger ? "bg-rose-500" : "bg-slate-900"}`} style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ good, label }: { good: boolean; label: string }) {
  return <Badge variant={good ? "success" : "danger"}>{label}</Badge>;
}

function Progress({ value }: { value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-500">Confidence</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function normalizeSimilarDeals(deals?: SimilarMatch[] | string[]): SimilarMatch[] {
  if (!deals?.length) return demoMatches;
  return deals.map((deal, index) => {
    if (typeof deal !== "string") return deal;
    return {
      scenario_id: deal,
      account_name: `Similar scenario ${deal}`,
      outcome: index % 2 === 0 ? "won" : "lost",
      confidence: "vector match",
      narrative: "Returned by the behavioral_structured similarity index.",
    };
  });
}

function formatEvidence(evidence: unknown): string {
  if (!evidence) return "Evidence from stage history, actor roles, and behavior vectors.";
  if (typeof evidence === "string") return evidence;
  return JSON.stringify(evidence);
}

function extractMermaidNodes(graph: string): string[] {
  const matches = [...graph.matchAll(/\(\[([^\]]+)\]\)/g)].map((match) => match[1]);
  return [...new Set(matches)];
}

function asStringArray(value: string[] | string | undefined, fallback: string[] = []): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : fallback;
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

export default App;
