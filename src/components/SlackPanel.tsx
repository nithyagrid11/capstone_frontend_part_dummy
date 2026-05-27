import { slackEvents } from "../data/slackEvents";

export default function SlackPanel() {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="text-xl font-semibold mb-5">
        Slack Bot Events
      </h2>

      <div className="space-y-4">
        {slackEvents.map((event, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-lg p-3 text-sm"
          >
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}