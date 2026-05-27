import { workflows } from "../data/workflows";

export default function WorkflowTable() {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="text-xl font-semibold mb-5">
        Recent Workflow Activity
      </h2>

      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-3">Workflow ID</th>
            <th className="pb-3">Started By</th>
            <th className="pb-3">Duration</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {workflows.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-4">{item.id}</td>
              <td>{item.startedBy}</td>
              <td>{item.duration}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}