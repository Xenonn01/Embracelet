import React, { Component } from "react";
import { supabase } from "./supabaseClient";
import homepageImage from "./assets/image.homepage.png";
import "./App.css";

export default class Homepage extends Component {
  state = {
    cartCount: 0,
    isDropdownOpen: false,
    products: [],
    filteredProducts: [], // used only for search dropdown
    loading: false,
    searchQuery: "",
    showSearchResults: false,
  };

  componentDidMount() {
    this.fetchProducts();
  }

  fetchProducts = async () => {
    this.setState({ loading: true });
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products. Check your Supabase RLS/public policies.");
    } else {
      // store products in main list only
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

  handleHistory = () => {
    window.location.href = "/history";
  }

  handleUserInfo = () => {
    window.location.href = "/user_info";
  };

  handleCartClick = () => {
    window.location.href = "/cart";
  };

  // ✅ this now only affects the search dropdown, not the main product grid
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
      cartCount,
      isDropdownOpen,
      filteredProducts,
      loading,
      searchQuery,
      showSearchResults,
      products,
    } = this.state;

    return (
      <div className="min-h-screen bg-white relative">
        {/* Header */}
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

        {/* ❌ Close button */}
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

  {/* Center: Clickable Logo */}
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
      onClick={this.handleCartClick}
      className="text-gray-600 hover:text-[#7D322E] font-medium focus:outline-none transition"
    >
      Cart
    </button>

    <button onClick={this.toggleDropdown} className="focus:outline-none relative">
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

      {this.state.isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={this.handleUserInfo}
          >
            User Info
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={this.handleHistory}
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



        {/* Hero Section */}
<section className="relative h-[500px] bg-cover bg-center overflow-hidden">
  {/* Background image layer with brightness filter */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url(${homepageImage})`,
      filter: "brightness(50%)",
    }}
  ></div>

  {/* Content layer (not affected by filter) */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
    <h2 className="text-5xl font-bold mb-6 tracking-wide drop-shadow-md">
      STRING YOUR STYLE
    </h2>

    <button
      onClick={() => (window.location.href = "/collection")}
 className="px-8 py-3 border-2 border-white text-white font-semibold text-lg hover:bg-[#7D322E] hover:border-[#7D322E] hover:text-white transition duration-300 rounded-none"
    >
      Shop the Collection
    </button>
  </div>
</section>

        {/* Product Section */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-2 leading-[2] font-sfpro"> BEST SELLER </h3>
              <div className="w-16 h-0.5 bg-black mx-auto"></div>
            </div>

            

            {loading ? (
              <p className="text-center">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-center">No products found.</p>
            ) : (
              <div className="flex flex-wrap gap-6 justify-center py-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() =>
                      (window.location.href = `/product/${product.id}`)
                    }
                    className="w-64 bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-lg transition-shadow focus:outline-none"
                  >
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-black mb-2">
                      {product.name}
                    </h4>
                    <p className="text-gray-600">₱{product.price}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
}
