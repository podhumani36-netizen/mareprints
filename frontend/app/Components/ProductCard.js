export default function CartList({ items }) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-4 bg-white border rounded-2xl p-3 shadow-sm hover:shadow-md transition"
        >
          {/* Product Image */}
          <img
            src={item.image}
            className="w-20 h-20 object-cover rounded-xl border"
          />

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">
              {item.name}
            </h3>
            <p className="text-green-600 font-bold text-lg">
              ₹{item.price}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mt-2">
              <button className="px-2 py-1 border rounded hover:bg-gray-100">
                -
              </button>

              <span className="px-3 py-1 border rounded">
                1
              </span>

              <button className="px-2 py-1 border rounded hover:bg-gray-100">
                +
              </button>
            </div>
          </div>

          {/* Remove Button */}
          <button className="text-red-500 hover:text-red-600 text-sm">
            Remove
          </button>
        </div>
      ))}

      {/* Checkout Section */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between text-lg font-semibold mb-3">
          <span>Total</span>
          <span>₹{/* calculate total */}</span>
        </div>

        <button className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}