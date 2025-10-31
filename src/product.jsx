import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      alert("Failed to load product details.");
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  const handleAddToCart = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to add items to cart.");
        navigate("/app");
        return;
      }

      const { data: existingItem, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking cart:", fetchError.message);
        alert("Error checking your cart.");
        return;
      }

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) {
          console.error("Error updating cart item:", updateError.message);
          alert("Failed to update cart.");
          return;
        }
      } else {
        const { error: insertError } = await supabase.from("cart_items").insert([
          {
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          },
        ]);

        if (insertError) {
          console.error("Error adding to cart:", insertError.message);
          alert("Failed to add item to cart.");
          return;
        }
      }

      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleLogout = () => (window.location.href = "/app");
  const handleUserInfo = () => (window.location.href = "/user_info");
  const handleHistory = () => (window.location.href = "/history");
  const handleCartClick = () => (window.location.href = "/cart");

  if (loading) return <p className="text-center mt-10">Loading product...</p>;
  if (!product) return <p className="text-center mt-10">Product not found.</p>;

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white text-[#7D322E] px-8 py-4 rounded-xl shadow-lg text-lg font-medium animate-fadeInOut">
            ✅ Added to cart
          </div>
        </div>
      )}

      {/* ✅ Header (same design as Homepage) */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
        {/* Back Button (left) */}
        <button
          onClick={() => navigate("/homepage")}
          className="flex items-center text-gray-700 hover:text-[#7D322E] font-medium transition"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Logo (center) */}
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

        {/* Right side: Cart + User Menu */}
        <div className="flex items-center space-x-4 relative">
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

      {/* ✅ Product Details Section */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Product Image */}
          <div className="md:w-1/2 w-full">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="rounded-lg w-full h-auto object-cover border border-gray-200 shadow-md"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 w-full flex flex-col justify-start">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h2>
            <p className="text-2xl text-[#7D322E] font-semibold mb-4">₱{product.price}</p>
            <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
            <p className="text-gray-500 mb-6">Stock: {product.stock}</p>

            <button
              onClick={handleAddToCart}
              className="bg-[#7D322E] text-white text-lg font-medium px-6 py-3 rounded-none hover:bg-[#5E2724] transition duration-300"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
