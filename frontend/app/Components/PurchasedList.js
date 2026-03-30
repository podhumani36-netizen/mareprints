export default function PurchasedList({ items }) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
      {items.map((item) => (
        <div
          key={item.id}
          className="min-w-[180px] bg-gray-50 rounded-xl p-3 shadow-sm flex-shrink-0"
        >
          <p className="font-semibold text-sm">{item.order}</p>
          <p className="text-xs text-gray-500">{item.date}</p>

          <span
            className={`text-xs px-2 py-1 rounded-full mt-2 inline-block 
              ${item.status === "Delivered"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"}`}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}