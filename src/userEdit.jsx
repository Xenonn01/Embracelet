import React, { Component } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import "./App.css";

export default class UserInfo extends Component {
  state = {
    user: null,
    name: "",
    email: "",
    address: "",
    loading: false,
    isDropdownOpen: false, // ✅ dropdown for user menu
  };

  async componentDidMount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("No user logged in!");
      window.location.href = "/app"; // redirect to login if no user
      return;
    }

    this.setState({ user, email: user.email || "" });
    this.fetchUserProfile(user.id);
  }

  fetchUserProfile = async (userId) => {
    this.setState({ loading: true });

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
    } else if (data) {
      this.setState({
        name: data.name || "",
        address: data.address || "",
      });
    }

    this.setState({ loading: false });
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSave = async () => {
    const { user, name, email, address } = this.state;
    if (!user) return;

    this.setState({ loading: true });

    const { error } = await supabase.from("user_profiles").upsert([
      {
        id: user.id,
        name,
        email,
        address,
      },
    ]);

    if (error) {
      alert("❌ Failed to save info!");
      console.error(error);
    } else {
      alert("✅ Information saved successfully!");
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

  render() {
    const { name, email, address, loading, isDropdownOpen } = this.state;

    return (
      <div className="min-h-screen bg-white">
        {/* Header (same as homepage) */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 relative z-50">
          <div className="flex items-center">
            <Link
              to="/user_info"
              className="flex items-center text-gray-700 hover:text-[#7D322E] font-medium transition"
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
            </Link>
          </div>

          {/* Clickable Logo */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => (window.location.href = "/homepage")}
          >
            <img
              src="/src/assets/logo-embracelet.png"
              alt="EMBRACELET"
              className="w-40 h-auto object-contain"
            />
          </div>

          {/* Dropdown (User Icon) */}
          <div className="relative">
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
            </button>

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
          </div>
        </header>

        {/* User Info Form Section */}
        <div className="max-w-xl mx-auto mt-12 p-8 bg-white border border-gray-200 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            User Information
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Enter your name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Address:</label>
                <textarea
                  name="address"
                  value={address}
                  onChange={this.handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Enter your address"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                <button
                  onClick={this.handleSave}
                  disabled={loading}
                  className="bg-[#7D322E] text-white px-8 py-2 rounded-lg hover:bg-[#5E2724] transition"
                >
                  {loading ? "Saving..." : "Save Info"}
                </button>

                <Link
                  to="/homepage"
                  className="bg-gray-200 text-gray-800 px-8 py-2 rounded-lg hover:bg-gray-300 transition text-center"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
