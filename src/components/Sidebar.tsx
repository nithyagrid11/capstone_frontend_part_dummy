import { Activity } from "lucide-react";
import { routes, type RouteId } from "../routes";

type Props = {
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
};

export default function Sidebar({ activeRoute, onRouteChange }: Props) {
  return (
    <aside className="border-slate-800 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-r">
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500 text-slate-950">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Intelligence Engine</h1>
            <p className="text-xs text-slate-400">Salesforce demo console</p>
          </div>
        </div>

        <nav className="mt-5 grid gap-1">
          {routes.map((item) => {
            const Icon = item.icon;
            const selected = activeRoute === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRouteChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                  selected
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`block text-xs ${selected ? "text-slate-500" : "text-slate-500"}`}>
                    {item.eyebrow}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
