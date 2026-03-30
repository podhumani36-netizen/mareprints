"use client";

import { useState } from "react";

export default function ProfilePage() {

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

  const [purchased] = useState([
    { id: 7, order: "#123456", date: "Jan 15, 2024", status: "Delivered" },
    { id: 8, order: "#123123", date: "Dec 20, 2023", status: "Shipped" },
  ]);

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
              <h1 className="text-xl font-bold">Athula</h1>
              <p className="text-gray-500 text-sm">Welcome back </p>
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
          <div style={{
            display: "flex",
            overflowX: "auto",
            gap: "16px",
            paddingBottom: "8px",
            scrollbarWidth: "none",
          }}>
            {purchased.map((item) => (
              <div key={item.id} style={{ minWidth: "200px", flexShrink: 0 }}
                className="bg-gray-50 rounded-xl p-4 shadow-sm">
                <p className="font-semibold">{item.order}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block 
                  ${item.status === "Delivered"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}