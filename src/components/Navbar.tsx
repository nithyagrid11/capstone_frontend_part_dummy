import { Bell, Radio } from "lucide-react";
import type { Route } from "../routes";

type Props = {
  route: Route;
  apiBase: string;
};

export default function Navbar({ route, apiBase }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {route.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">{route.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
            <Radio size={16} className="text-emerald-600" />
            {apiBase}
          </div>
          <button className="icon-button" type="button" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-400 text-xs font-bold text-slate-950">
              SI
            </span>
            Demo
          </div>
        </div>
      </div>
    </header>
  );
}
