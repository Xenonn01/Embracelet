import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get("tab") || "All";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all orders and products once
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // ✅ Fetch logged-in user's orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError);
        alert("Please log in to view your order history.");
        navigate("/app");
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        alert("Failed to fetch your orders.");
      } else {
        setOrders(ordersData || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching orders:", err);
      alert("Something went wrong while loading your orders.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all products for reference (to get product names & images)
  const fetchProducts = async () => {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products. Please check Supabase settings.");
      return;
    }

    const projectUrl = "https://yiszwmmtpvkygsjpyxke.supabase.co";
    const bucketName = "product-images";

    const productsWithUrls = (data || []).map((p) => {
      const isFullUrl = p.image_url?.startsWith("http");
      return {
        ...p,
        image_url: isFullUrl
          ? p.image_url
          : `${projectUrl}/storage/v1/object/public/${bucketName}/${p.image_url}`,
      };
    });

    setProducts(productsWithUrls);
  } catch (err) {
    console.error("Unexpected error fetching products:", err);
    alert("Something went wrong while fetching product data.");
  }
};


  // ✅ Filter orders by status
  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter(
          (o) => o.status?.toLowerCase() === activeTab.toLowerCase()
        );

  // ✅ Navigation handlers
  const handleLogout = () => (window.location.href = "/app");
  const handleUserInfo = () => navigate("/user_info");
  const handleHistory = () => navigate("/history");
  const handleCartClick = () => navigate("/cart");
  const handleBackToHome = () => navigate("/homepage");

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

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

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

      {/* ✅ Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#7D322E]">
          Order History
        </h2>

        {/* Tabs */}
        <div className="flex justify-around text-sm font-medium text-gray-600 mb-6 border-b">
          {["All", "Unpaid", "To ship", "Shipped", "Delivered"].map(
            (tab) => (
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
            )
          )}
        </div>

        {/* Orders */}
        {loading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4"
            >

              {order.items?.map((item, i) => {
  const product = products.find((p) => p.name === item.product_name);
                return (
                  <div key={i} className="flex items-center gap-4 mb-2">
                    <img
                      src={product?.image_url || "/placeholder.png"}
                      alt={product?.name || "Product"}
                      className="w-20 h-20 rounded-md border object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {product?.name || "Unknown Product"}
                      </p>
                      <p className="text-gray-600 text-sm">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 font-medium">₱{item.price}</p>
                      <p className="text-gray-500 text-sm">
                        Total: ₱{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                );
              })}

              <p className="text-right text-gray-700 font-semibold mt-2">
                Order Total: ₱{order.total}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No orders found.</p>
        )}
      </div>
    </div>
  );
}
