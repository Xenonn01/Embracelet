import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Package } from "lucide-react";

export default function UserInfo() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => navigate("/homepage");
  const handleEdit = () => navigate("/userEdit");

  const handleGoToUnpaid = () => navigate("/history?tab=Unpaid");
  const handleGoToReceive = () => navigate("/history?tab=Shipped");
  const handleGoToShip = () => navigate("/history?tab=To%20ship");

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleLogout = () => navigate("/app");
  const handleHistory = () => navigate("/history");
  const handleUserInfo = () => navigate("/user_info");
  const handleCartClick = () => navigate("/cart");

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ Header (same as homepage) */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
        {/* Left: Search Icon */}
        <div className="flex items-center space-x-2 relative flex-shrink-0">
          {!showSearchInput ? (
            <button
              onClick={() => setShowSearchInput(true)}
              className="focus:outline-none"
            >
              <svg
                className="w-6 h-6 text-gray-600 hover:text-[#7D322E] transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          ) : (
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-80 focus:outline-none focus:border-[#7D322E] transition-all"
              />
              <button
                onClick={() => {
                  setShowSearchInput(false);
                  setSearchQuery("");
                }}
                className="absolute right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Center: Logo */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => navigate("/homepage")}
        >
          <img
            src="/src/assets/logo-embracelet.png"
            alt="EMBRACELET"
            className="w-48 h-auto object-contain hover:opacity-80 transition"
          />
        </div>

        {/* Right: Cart + Dropdown */}
        <div className="flex items-center space-x-4 relative flex-shrink-0">
          <button
            onClick={handleCartClick}
            className="text-gray-600 hover:text-[#7D322E] font-medium focus:outline-none transition"
          >
            Cart
          </button>

          <button onClick={toggleDropdown} className="focus:outline-none relative">
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

      {/* ✅ Profile Section */}
      <section className="flex flex-col items-center mt-10">
        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
        <h2 className="mt-3 text-base font-semibold text-[#7D322E]">
          Grace Getungo
        </h2>
        <button
          onClick={handleEdit}
          className="bg-[#7D322E] text-white text-xs px-4 py-1 rounded-full mt-3 hover:bg-[#A34B46] transition"
        >
          Edit
        </button>
      </section>

      {/* ✅ My Purchases Section */}
      <section className="w-[90%] bg-white mt-10 border rounded-xl p-5 shadow-sm mx-auto">
        <h3 className="text-sm font-medium mb-5 text-gray-800">My purchases</h3>

        <div className="flex justify-around text-center">
          <div
            className="flex flex-col items-center cursor-pointer hover:text-[#7D322E] transition"
            onClick={handleGoToUnpaid}
          >
            <CreditCard className="w-6 h-6 mb-1 text-gray-700" />
            <span className="text-xs text-gray-700">To pay</span>
          </div>

          <div
            className="flex flex-col items-center cursor-pointer hover:text-[#7D322E] transition"
            onClick={handleGoToReceive}
          >
            <Truck className="w-6 h-6 mb-1 text-gray-700" />
            <span className="text-xs text-gray-700">To receive</span>
          </div>

          <div
            className="flex flex-col items-center cursor-pointer hover:text-[#7D322E] transition"
            onClick={handleGoToShip}
          >
            <Package className="w-6 h-6 mb-1 text-gray-700" />
            <span className="text-xs text-gray-700">To ship</span>
          </div>
        </div>
      </section>
    </div>
  );
}
