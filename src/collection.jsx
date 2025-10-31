import React, { Component } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "./supabaseClient";
import braceletImg from "./assets/image-removebg-preview (1).png";
import "./App.css";

export default class AllProducts extends Component {
  state = {
    cartCount: 0,
    isDropdownOpen: false,
    products: [],
    filteredProducts: [],
    loading: false,
    searchQuery: "",
    showSearchResults: false,
    showFilter: false,
    showSearchInput: false, 
  };

  componentDidMount() {
    this.fetchProducts();
  }

  fetchProducts = async () => {
    this.setState({ loading: true });
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products.");
    } else {
      this.setState({ products: data });
    }
    this.setState({ loading: false });
  };

  toggleDropdown = () => {
    this.setState((prev) => ({ isDropdownOpen: !prev.isDropdownOpen }));
  };

  handleLogout = () => {
    window.location.href = "/app";
  };

  handleUserInfo = () => {
    window.location.href = "/user_info";
  };

  handleCartClick = () => {
    window.location.href = "/cart";
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    this.setState({
      searchQuery: query,
      showSearchResults: query.trim() !== "",
    });

    if (query.trim() === "") {
      this.setState({ filteredProducts: [] });
    } else {
      const searchResults = this.state.products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      this.setState({ filteredProducts: searchResults });
    }
  };

  handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.setState({ showSearchResults: true });
    }
  };

  render() {
    const {
      isDropdownOpen,
      cartCount,
      products,
      filteredProducts,
      searchQuery,
      showSearchResults,
      loading,
      showFilter,
    } = this.state;

    return (
      <div className="min-h-screen bg-white">
        {/* HEADER */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
         {/* Left: Search (icon toggles input) */}
<div className="flex items-center space-x-2 relative flex-shrink-0">
  {!this.state.showSearchInput ? (
    // 🔍 Search icon (shown initially)
    <button
      onClick={() => this.setState({ showSearchInput: true })}
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
    // 🔎 Search Input (replaces icon when clicked)
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Search products..."
        value={this.state.searchQuery}
        onChange={this.handleSearchChange}
        onKeyDown={this.handleSearchKeyDown}
        autoFocus
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-80 focus:outline-none focus:border-[#7D322E] transition-all"
      />

      {/* ❌ Close button to hide input again */}
      <button
        onClick={() =>
          this.setState({
            showSearchInput: false,
            searchQuery: "",
            filteredProducts: [],
            showSearchResults: false,
          })
        }
        className="absolute right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      {/* Search dropdown results */}
      {this.state.showSearchResults && (
        <div className="absolute top-10 left-0 w-[500px] max-h-[400px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          {this.state.filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No results found.</p>
          ) : (
            this.state.filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() =>
                  (window.location.href = `/product/${product.id}`)
                }
                className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">₱{product.price}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )}
</div>

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

          {/* Right: Cart & User */}
          <div className="flex items-center space-x-4 relative">
            <button
              onClick={this.handleCartClick}
              className="text-gray-600 hover:text-amber-600 font-medium transition"
            >
              Cart ({cartCount})
            </button>

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
                    onClick={this.handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* PAGE TITLE */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-[#7D322E] tracking-wide mb-3">
            ALL PRODUCTS
          </h2>
          <div className="w-20 h-0.5 bg-[#7D322E] mx-auto"></div>
        </section>

        {/* FILTER BAR */}
        <div className="flex justify-start items-center px-10 mb-6 relative">
          <p className="font-medium text-gray-600 mr-2">Filter:</p>

          <div className="relative">
            <div
              onClick={() => this.setState({ showFilter: !showFilter })}
              className="flex items-center text-gray-700 font-medium cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition"
            >
              <span>Availability</span>
              <ChevronDown
                className={`ml-2 w-4 h-4 text-gray-600 transition-transform ${
                  showFilter ? "rotate-180" : ""
                }`}
              />
            </div>

            {showFilter && (
              <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-lg shadow-md w-40 z-50">
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  In Stock
                </button>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Out of Stock
                </button>
                <button className="block w-full text-left px-4 py-2 text-gray-500 text-sm hover:bg-gray-100">
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <section className="px-8 pb-20">
          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products found.</p>
          ) : (
            <div
              className="flex flex-wrap justify-center gap-6 overflow-y-auto"
              style={{
                maxHeight: "calc(4 * 280px)",
                paddingRight: "8px",
              }}
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() =>
                    (window.location.href = `/product/${product.id}`)
                  }
                  className="w-[20%] min-w-[200px] bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 flex flex-col items-center"
                >
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={product.image_url || braceletImg}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 text-center line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-sm italic text-gray-600 text-center">
                    ₱{product.price}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }
}
