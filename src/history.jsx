import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";

export default function History() {
  // ✅ Get the "tab" query parameter from URL (e.g. ?tab=Unpaid)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get("tab") || "All";

  // ✅ Use defaultTab as initial state
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount] = useState(0);

  const order = {
    name: "Daisy Bloom Bracelet",
    price: 120,
    image: "https://i.ibb.co/mNbsyqL/daisy-bloom.jpg",
  };

  const handleLogout = () => (window.location.href = "/app");
  const handleUserInfo = () => (window.location.href = "/user_info");
  const handleHistory = () => (window.location.href = "/history");
  const handleCartClick = () => (window.location.href = "/cart");
  const handleBackToHome = () => (window.location.href = "/homepage");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
        {/* ✅ Left: Back Button */}
        <button
          onClick={handleBackToHome}
          className="flex items-center text-gray-700 hover:text-[#7D322E] font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Center: Logo */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => (window.location.href = "/homepage")}
        >
          <img
            src="/src/assets/logo-embracelet.png"
            alt="EMBRACELET"
            className="w-48 h-auto object-contain hover:opacity-80 transition"
          />
        </div>

        {/* Right: Cart + User Dropdown */}
        <div className="flex items-center space-x-4 relative flex-shrink-0">
          <button
            onClick={handleCartClick}
            className="text-gray-600 hover:text-[#7D322E] font-medium focus:outline-none transition"
          >
            Cart ({cartCount})
          </button>

          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="focus:outline-none relative"
          >
            <svg
              className="w-6 h-6 text-gray-600 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleUserInfo}
                >
                  User Info
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleHistory}
                >
                  History
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#7D322E]">
          Order History
        </h2>

        {/* Tabs */}
        <div className="flex justify-around text-sm font-medium text-gray-600 mb-6 border-b">
          {["All", "Unpaid", "To ship", "Shipped"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition ${
                activeTab === tab
                  ? "text-[#7D322E] border-b-2 border-[#7D322E]"
                  : "hover:text-[#7D322E]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          {activeTab === "All" && (
            <>
              <p className="text-[#7D322E] font-semibold mb-1">
                Oct 18 Delivered
              </p>
              <p className="text-gray-600 text-sm mb-3">
                Your package has been delivered.
              </p>
            </>
          )}
          {activeTab === "Unpaid" && (
            <>
              <p className="text-[#7D322E] font-semibold mb-1">
                Estimated Arrival 22–25 Oct
              </p>
              <p className="text-gray-600 text-sm mb-3">
                Delivery in progress.
              </p>
            </>
          )}
          {activeTab === "To ship" && (
            <>
              <p className="text-[#7D322E] font-semibold mb-1">Processing</p>
              <p className="text-gray-600 text-sm mb-3">
                Waiting for seller to ship the order.
              </p>
            </>
          )}
          {activeTab === "Shipped" && (
            <>
              <p className="text-[#7D322E] font-semibold mb-1">
                Estimated Arrival 22–25 Oct
              </p>
              <p className="text-gray-600 text-sm mb-3">
                Your package is on the way.
              </p>
            </>
          )}

          {/* Product Info */}
          <div className="flex items-center gap-4">
            <img
              src={order.image}
              alt={order.name}
              className="w-20 h-20 rounded-md border object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{order.name}</p>
              <p className="text-gray-600 text-sm">x1</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800 font-medium">₱{order.price}</p>
              <p className="text-gray-500 text-sm">Total: ₱{order.price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
