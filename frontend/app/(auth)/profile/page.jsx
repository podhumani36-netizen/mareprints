"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [purchased, setPurchased] = useState([]);

  const [favorites] = useState([
    { id: 1, name: "Classic Wooden Frame", price: 3499, image: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773848543/ChatGPT_Image_Mar_18__2026__06_11_53_PM_xfuyyc.png" },
    { id: 2, name: "Modern Metal Frame", price: 2199, image: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773848554/ChatGPT_Image_Mar_18__2026__06_10_11_PM_o3w4yc.png" },
    { id: 3, name: "Gold Ornate Frame", price: 1799, image: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773837359/ChatGPT_Image_Mar_18__2026__06_05_47_PM_ofmxc6.png" },
    { id: 4, name: "Rustic Barnwood Frame", price: 2499, image: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773834379/ChatGPT_Image_Mar_18__2026__05_16_04_PM_i4t6od.png" },
  ]);

  const [cart] = useState([
    { id: 5, name: "Rustic Frame", price: 2199, qty: 1, image: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773834015/ChatGPT_Image_Mar_18__2026__04_24_25_PM_vb3420.png" },
    { id: 6, name: "Gold Ornate Frame", price: 3299, qty: 2, image: "https://res.cloudinary.com/dsprfys3x/image/upload/v1772770559/3d-rendered-photos-family-collage-templates-half-tone-different-designs_1096167-29794_wvwe0m.avif" },
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {}
    }

    const storedOrders = localStorage.getItem("mareprints_orders");
    if (storedOrders) {
      try {
        setPurchased(JSON.parse(storedOrders));
      } catch (_) {}
    }
  }, []);

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
    : "";

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img
              src="/images/avatar.png"
              className="w-14 h-14 rounded-full border"
            />
            <div>
              <h1 className="text-xl font-bold">{displayName || "User"}</h1>
              <p className="text-gray-500 text-sm">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* FAVORITES */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center p-2 overflow-hidden">
          <h2 className="font-semibold mb-3">❤️ Favorites</h2>
          <div style={{
            display: "flex",
            overflowX: "auto",
            gap: "16px",
            paddingBottom: "8px",
            scrollbarWidth: "none",
          }}>
            {favorites.map((item) => (
              <div key={item.id} style={{ minWidth: "160px", flexShrink: 0 }}
                className="bg-gray-50 rounded-xl p-3 shadow-sm">
                <img src={item.image} alt={item.name}  style={{ width: "200px", height: "250px", objectFit: "cover" }}
                  className="w-full aspect-square object-contain bg-white p-2 rounded-lg mb-2"
                    />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price}</p>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* CART */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="font-semibold mb-3">🛒 Cart</h2>
          <div style={{
            display: "flex",
            overflowX: "auto",
            gap: "16px",
            paddingBottom: "8px",
            scrollbarWidth: "none",
          }}>
            {cart.map((item) => (
              <div key={item.id} style={{ minWidth: "160px", flexShrink: 0 }}
                className="bg-gray-50 rounded-xl p-3 shadow-sm">
                <img src={item.image} alt={item.name} style={{ width: "200px", height: "200px" }}
                 className="w-full h-32 object-contain rounded-lg mb-2 bg-white p-2"  />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price} × {item.qty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold mb-3">📦 Orders</h2>
          {purchased.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet.</p>
          ) : (
            <div style={{
              display: "flex",
              overflowX: "auto",
              gap: "16px",
              paddingBottom: "8px",
              scrollbarWidth: "none",
            }}>
              {purchased.map((item) => (
                <div key={item.id} style={{ minWidth: "220px", flexShrink: 0 }}
                  className="bg-gray-50 rounded-xl p-4 shadow-sm">
                  <p className="font-semibold">{item.order}</p>
                  <p className="text-xs text-gray-500 mb-1">{item.date}</p>
                  {item.productName && (
                    <p className="text-sm text-gray-700 mb-1">{item.productName}</p>
                  )}
                  {item.size && (
                    <p className="text-xs text-gray-500 mb-1">{item.size} · {item.thickness} · Qty {item.quantity}</p>
                  )}
                  {item.amount && (
                    <p className="text-sm font-semibold text-blue-600 mb-2">₹{item.amount}</p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full inline-block
                    ${item.status === "Delivered"
                      ? "bg-green-100 text-green-600"
                      : item.status === "Confirmed"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-yellow-100 text-yellow-600"}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
