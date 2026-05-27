type Props = {
  item: {
    title: string;
    value: string;
    subtitle: string;
    color: string;
  };
};

export default function MetricCard({ item }: Props) {
  return (
    <div className=" bg-white rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300">
      <h3 className="text-gray-500 text-sm">{item.title}</h3>

      <div className={`text-3xl font-bold mt-3
       ${
        item.color === "green"
          ? "text-green-600"
          : item.color === "red"
          ? "text-red-600"
          : item.color === "yellow"
          ? "text-yellow-600"
          : "text-gray-800"
       }
     `}>
        {item.value}
      </div>

      <p className="text-sm text-gray-400 mt-2">{item.subtitle}</p>
    </div>
  );
}