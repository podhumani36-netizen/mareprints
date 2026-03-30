export default function FavoritesList({ items }) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
      {items.map((item) => (
        <div
          key={item.id}
          className="min-w-[140px] sm:min-w-[160px] bg-gray-50 rounded-xl p-3 shadow-sm flex-shrink-0"
        >
          <img
            src={item.image}
            className="w-full h-24 sm:h-28 object-cover rounded-lg mb-2"
          />
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">₹{item.price}</p>
        </div>
      ))}
    </div>
  );
}