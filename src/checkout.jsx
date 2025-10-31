import React, { Component } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import "./App.css";

class Checkout extends Component {
  state = {
    cartItems: [],
    totalPrice: 0,
    user: null,
    userProfile: null,
    paymentMethod: "cod",
    isDropdownOpen: false,
    loading: true,
    orderPlaced: false,
  };

  async componentDidMount() {
    await this.fetchUserProfile();
    await this.fetchCartItems();
  }

  // ✅ Fetch user profile
  fetchUserProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please log in first.");
      this.props.navigate("/app");
      return;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("name, email, address")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
    }

    this.setState({ user, userProfile: data });
  };

  // ✅ Fetch cart items
  fetchCartItems = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (id, name, price, stock)
      `)
      .eq("user_id", user.id);

    if (error) {
      alert("Failed to fetch your cart.");
      return;
    }

    const total = data.reduce((sum, item) => {
      const price = item.products?.price || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);

    this.setState({ cartItems: data, totalPrice: total, loading: false });
  };

  toggleDropdown = () => {
    this.setState((prev) => ({ isDropdownOpen: !prev.isDropdownOpen }));
  };

  handleLogout = () => {
    this.props.navigate("/app");
  };

  handleUserInfo = () => {
    this.props.navigate("/user_info");
  };

  handlePaymentChange = (e) => {
    this.setState({ paymentMethod: e.target.value });
  };

  // ✅ Place order logic
  handlePlaceOrder = async () => {
    const { user, userProfile, paymentMethod, cartItems, totalPrice } =
      this.state;

    if (!userProfile?.address) {
      alert("Please save your shipping address first.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const formattedItems = cartItems.map((item) => ({
      product_name: item.products.name,
      quantity: item.quantity,
      price: item.products.price,
    }));

    const order = {
      user_id: user.id,
      name: userProfile.name,
      email: userProfile.email,
      address: userProfile.address,
      payment_method: paymentMethod,
      total: totalPrice,
      items: formattedItems,
      status: "Pending",
    };

    try {
      const { error: orderError } = await supabase
        .from("orders")
        .insert([order]);
      if (orderError) throw orderError;

      // Update stock
      for (const item of cartItems) {
        const productId = item.products.id;
        const qty = item.quantity;

        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        const newStock = (productData.stock || 0) - qty;
        if (newStock >= 0) {
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", productId);
        }
      }

      await supabase.from("cart_items").delete().eq("user_id", user.id);

      this.setState({ orderPlaced: true });
    } catch (err) {
      alert("Something went wrong while placing your order.");
      console.error(err);
    }
  };

  // ✅ Go to unpaid orders
  handleGoToUnpaid = () => {
    this.props.navigate("/history?tab=Unpaid");
  };

  render() {
    const {
      cartItems,
      totalPrice,
      userProfile,
      paymentMethod,
      isDropdownOpen,
      loading,
      orderPlaced,
    } = this.state;

    return (
      <div className="min-h-screen bg-white relative">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
          <button
            onClick={() => this.props.navigate("/homepage")}
            className="flex items-center text-gray-700 hover:text-[#7D322E] font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
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

          <img
            src="/src/assets/logo-embracelet.png"
            alt="EMBRACELET"
            className="w-48 h-auto object-contain"
          />

          <div className="relative">
            <button
              onClick={this.toggleDropdown}
              className="focus:outline-none"
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
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={this.handleUserInfo}
                >
                  User Info
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={this.handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ✅ Thank You Screen */}
        {orderPlaced ? (
          <section className="flex flex-col items-center justify-center h-[70vh] text-center animate-fadeInOut">
            <div className="text-green-600 text-6xl mb-4"></div>
            <h2 className="text-3xl font-bold text-[#7D322E] mb-4">
              Thank you for your order!
            </h2>
            <p className="text-gray-600 mb-8">
              Your order has been placed successfully.
            </p>
            <button
              onClick={this.handleGoToUnpaid}
              className="bg-[#7D322E] text-white px-8 py-3 rounded-lg hover:bg-[#652823] transition"
            >
              Go to Order History
            </button>
          </section>
        ) : (
          /* 🛒 Checkout Page */
          <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>

              {/* Shipping Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Shipping Information
                </h3>
                {userProfile ? (
                  <div className="border p-4 rounded-md bg-gray-50 space-y-1">
                    <p>
                      <strong>Name:</strong> {userProfile.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {userProfile.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {userProfile.address}
                    </p>
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={this.handlePaymentChange}
                    className="mr-2"
                  />
                  Cash on Delivery
                </label>
              </div>

              {/* Order Summary */}
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              {loading ? (
                <p>Loading cart...</p>
              ) : (
                <ul className="divide-y">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-2 flex justify-between">
                      <span>
                        {item.products.name} × {item.quantity}
                      </span>
                      <span>
                        ₱{(item.products.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={this.handlePlaceOrder}
                className="w-full mt-8 bg-[#7D322E] text-white py-3 rounded-lg font-medium hover:bg-[#652823] transition"
              >
                Place Order
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }
}

// ✅ Wrap class to use navigate()
function withRouter(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

export default withRouter(Checkout);
