import React, { Component } from "react";
import Homepage from "./homepage.jsx";
import Admin from "./admin.jsx";
import { supabase } from "./supabaseClient";
import "./App.css";

export default class App extends Component {
  state = {
    email: "",
    password: "",
    message: "",
    isLogin: true,
    isLoggedIn: false,
    isAdmin: false,
  };

  adminEmail = "admin@embracelet.com";
  adminPassword = "admin123";

  // ✅ Handle Login
  handleLogin = async (e) => {
    e.preventDefault();
    this.setState({ message: "Logging in..." });

    const { email, password } = this.state;

    try {
      // Admin login
      if (email === this.adminEmail && password === this.adminPassword) {
        this.setState({
          message: "Admin logged in successfully!",
          isAdmin: true,
          isLoggedIn: true,
        });
        return;
      }

      // User login via Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        this.setState({ message: error.message });
      } else {
        this.setState({ message: "Successfully logged in!", isLoggedIn: true });
      }
    } catch {
      this.setState({ message: "Something went wrong. Please try again." });
    }
  };

  // ✅ Handle Sign Up
  handleSignUp = async (e) => {
    e.preventDefault();
    this.setState({ message: "Creating account..." });

    const { email, password } = this.state;

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return this.setState({ message: error.message });

      const user = data.user;
      if (user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([{ id: user.id, email }]);

        if (profileError) {
          console.error("Error inserting into user_profiles:", profileError);
          return this.setState({ message: "Account created, but failed to save profile." });
        }
      }

      this.setState({
        message: "Account created successfully! Please check your email to verify.",
      });
    } catch {
      this.setState({ message: "Something went wrong. Please try again." });
    }
  };

  render() {
    const { email, password, message, isLogin, isLoggedIn, isAdmin } = this.state;

    if (isLoggedIn) {
      return isAdmin ? <Admin /> : <Homepage />;
    }

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/src/assets/logo-embracelet.png"
            alt="EMBRACELET"
            className="w-48 h-auto object-contain"
          />
        </div>

        {/* Login / Signup Form */}
        <div className="w-full max-w-md border border-gray-200 rounded-lg p-8 shadow-sm bg-[#fff9f8]">
          <h1 className="text-2xl font-semibold text-[#8b3a2b] mb-8 text-center">
            {isLogin ? "Log in" : "Create account"}
          </h1>

          <form onSubmit={isLogin ? this.handleLogin : this.handleSignUp} className="space-y-6">
            {/* Email */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="email"
                className="block w-[80%] text-left text-sm font-medium text-[#8b3a2b] mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => this.setState({ email: e.target.value })}
                className="w-[80%] h-[40px] border border-gray-300 rounded-lg px-4 text-base focus:ring-2 focus:ring-[#8b3a2b] bg-white"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="password"
                className="block w-[80%] text-left text-sm font-medium text-[#8b3a2b] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
                className="w-[80%] h-[40px] border border-gray-300 rounded-lg px-4 text-base focus:ring-2 focus:ring-[#8b3a2b] bg-white"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-[80%] h-12 bg-[#8b3a2b] text-white font-semibold rounded-lg hover:bg-[#6d2a1f] transition duration-200 block mx-auto"
            >
              {isLogin ? "Log in" : "Create account"}
            </button>
          </form>

          {/* Message */}
          {message && <p className="text-sm text-center text-[#8b3a2b] mt-4">{message}</p>}

          {/* Toggle Login/Signup */}
          <p className="text-sm text-center mt-8 text-[#8b3a2b]">
            {isLogin ? "Don't have an account? " : "Have an account? "}
            <button
              onClick={() => this.setState({ isLogin: !isLogin })}
              className="text-[#8b3a2b] font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    );
  }
}
