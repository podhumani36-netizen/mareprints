export default function CartList({ items }) {
  return (
    <div className="space-y-3">

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 bg-gray-50 rounded-xl p-2 shadow-sm"
        >
          {/* SMALL IMAGE */}
          <img
            src={item.image}
            className="w-14 h-14 object-cover rounded-lg border"
          />

          {/* INFO */}
          <div className="flex-1">
            <h3 className="text-sm font-medium">{item.name}</h3>

            <p className="text-green-600 text-sm font-semibold">
              ₹{item.price}
            </p>

            {/* QTY */}
            <div className="flex items-center gap-1 mt-1">
              <button className="px-2 border rounded text-xs">-</button>
              <span className="px-2 text-xs">{item.qty}</span>
              <button className="px-2 border rounded text-xs">+</button>
            </div>
          </div>

          {/* REMOVE */}
          <button className="text-red-500 text-xs">✕</button>
        </div>
      ))}

      {/* TOTAL */}
      <div className="bg-white border rounded-xl p-3 shadow-sm">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span>Total</span>
          <span>
            ₹{items.reduce((acc, i) => acc + i.price * i.qty, 0)}
          </span>
        </div>

        <button className="w-full bg-green-500 text-white py-2 rounded-lg text-sm">
          Checkout
        </button>
      </div>
    </div>
  );
}