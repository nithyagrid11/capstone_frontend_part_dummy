import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import MetricCard from "./components/MetricCard";
import WorkflowTable from "./components/WorkflowTable";
import SlackPanel from "./components/SlackPanel";
import { metrics } from "./data/metrics";

function App() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-3 gap-5">
            {metrics.map((item, index) => (
              <MetricCard key={index} item={item} />
            ))}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-5 mt-6">
            {/* Workflow Table */}
            <div className="col-span-2">
              <WorkflowTable />
            </div>

            {/* Slack Events */}
            <div>
              <SlackPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;