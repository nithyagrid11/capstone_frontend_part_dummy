import {
  BarChart3,
  Brain,
  Briefcase,
  CheckSquare,
  Clock3,
  GitBranch,
  Network,
  Search,
  Sparkles,
} from "lucide-react";

export const routes = [
  {
    id: "journey",
    icon: Sparkles,
    label: "Deal Journey",
    eyebrow: "Stakeholder demo",
    title: "Deal Intelligence Journey",
  },
  {
    id: "experience",
    icon: GitBranch,
    label: "Experience Demo",
    eyebrow: "Stage 1 to 2",
    title: "Deal Experience Progression",
  },
  {
    id: "clusters",
    icon: Brain,
    label: "Clusters",
    eyebrow: "Behavior vectors",
    title: "Cluster Visualization",
  },
  {
    id: "search",
    icon: Search,
    label: "Precedent Search",
    eyebrow: "Similarity engine",
    title: "Behavioral Precedent Search",
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    eyebrow: "Patterns and chemistry",
    title: "Pattern Analytics",
  },
  {
    id: "graph",
    icon: Network,
    label: "Deal Graph",
    eyebrow: "Context graph",
    title: "Neo4j Deal Graph",
  },
  {
    id: "timeline",
    icon: Clock3,
    label: "Timeline",
    eyebrow: "Stage history",
    title: "Status & Timeline",
  },
  {
    id: "opportunities",
    icon: Briefcase,
    label: "Opportunities",
    eyebrow: "Open pipeline",
    title: "Active Opportunities",
  },
  {
    id: "skills",
    icon: CheckSquare,
    label: "Skill Approval",
    eyebrow: "Human in loop",
    title: "Skill Approval",
  },
] as const;

export type RouteId = (typeof routes)[number]["id"];
export type Route = (typeof routes)[number];
