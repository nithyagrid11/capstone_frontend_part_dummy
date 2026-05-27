import {
  LayoutDashboard,
  Briefcase,
  Workflow,
  Clock3,
  Users,
  Shield,
  Activity,
  Database,
  Settings,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Briefcase, label: "Opportunity" },
  { icon: Workflow, label: "Workflow Runs" },
  { icon: Clock3, label: "Temporal" },
  { icon: Users, label: "Employee" },
  { icon: Shield, label: "Guardrails" },
  { icon: Activity, label: "Activity Feed" },
  { icon: Database, label: "Salesforce Objects" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <div className="w-72 bg-gray-700 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-12">
        Admin UI
      </h1>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-600 cursor-pointer transition"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}