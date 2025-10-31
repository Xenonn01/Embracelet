import React, { Component } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default class Cart extends Component {
  state = {
    cartItems: [],
    isDropdownOpen: false,
    loading: false,
  };

  async componentDidMount() {
    await this.fetchCartItems();
  }

  // Fetch all cart items for the logged-in user
  fetchCartItems = async () => {
    this.setState({ loading: true });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to view your cart.");
      window.location.href = "/app";
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (name, price, image_url)
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching cart items:", error);
      alert("Failed to fetch cart items.");
    } else {
      this.setState({ cartItems: data });
    }

    this.setState({ loading: false });
  };

  // Update item quantity
  updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    this.setState((prev) => ({
      cartItems: prev.cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ),
    }));

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", id);

    if (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity.");
      this.fetchCartItems();
    }
  };

  // Delete cart item
  deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    this.setState((prev) => ({
      cartItems: prev.cartItems.filter((item) => item.id !== id),
    }));

    const { error } = await supabase.from("cart_items").delete().eq("id", id);

    if (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
      this.fetchCartItems();
    }
  };

  // Toggle dropdown
  toggleDropdown = () => {
    this.setState((prev) => ({ isDropdownOpen: !prev.isDropdownOpen }));
  };

  // Navigation
  handleCheckout = () => (window.location.href = "/checkout");
  handleLogout = () => (window.location.href = "/app");
  handleUserInfo = () => (window.location.href = "/user_info");
  handleBackToHome = () => (window.location.href = "/homepage");

  render() {
    const { cartItems, isDropdownOpen, loading } = this.state;
    const total = cartItems.reduce(
      (sum, item) => sum + (item.products?.price || 0) * (item.quantity || 1),
      0
    );

    return (
      <div className="min-h-screen bg-white relative">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
          {/* Back Button */}
          <button
            onClick={this.handleBackToHome}
            className="flex items-center text-gray-700 hover:text-[#7D322E] font-medium"
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

          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer">
            <img
              src="/src/assets/logo-embracelet.png"
              alt="EMBRACELET"
              className="w-48 h-auto object-contain hover:opacity-80 transition"
              onClick={this.handleBackToHome}
            />
          </div>

          {/* User Dropdown */}
          <div className="flex items-center relative">
            <button onClick={this.toggleDropdown} className="focus:outline-none">
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
                    onClick={this.handleUserInfo}
                  >
                    User Info
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => (window.location.href = "/history")}
                  >
                    History
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={this.handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Cart Section */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">Your Cart</h3>
              <div className="w-16 h-0.5 bg-black mx-auto"></div>
            </div>

            {loading ? (
              <p className="text-center">Loading your cart...</p>
            ) : cartItems.length === 0 ? (
              <p className="text-center text-gray-600">Your cart is empty 😢</p>
            ) : (
              <>
                <div className="flex flex-col space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 rounded-md">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 px-4">
                        <h4 className="text-lg font-semibold">
                          {item.products?.name || "Unnamed Product"}
                        </h4>
                        <p className="text-gray-600">
                          ₱{item.products?.price?.toFixed(2) || "0.00"}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() =>
                              this.updateQuantity(item.id, item.quantity - 1)
                            }
                            className="bg-gray-200 px-2 py-1 rounded-l hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-t border-b">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              this.updateQuantity(item.id, item.quantity + 1)
                            }
                            className="bg-gray-200 px-2 py-1 rounded-r hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total + Delete */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#7D322E]">
                          ₱{(
                            (item.products?.price || 0) * (item.quantity || 1)
                          ).toFixed(2)}
                        </p>
                        <button
                          onClick={() => this.deleteItem(item.id)}
                          className="text-red-500 text-sm mt-2 hover:text-red-700"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total + Checkout */}
                <div className="flex justify-between items-center mt-10 border-t border-gray-200 pt-6">
                  <h4 className="text-xl font-semibold">Total</h4>
                  <p className="text-2xl font-bold text-[#7D322E]">
                    ₱{total.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={this.handleCheckout}
                    className="bg-[#7D322E] text-white px-8 py-3 rounded-lg hover:bg-[#652823] transition"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }
}
