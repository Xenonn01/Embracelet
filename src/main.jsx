import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Homepage from "./homepage.jsx";
import ProductPage from "./product.jsx";
import Admin from "./admin.jsx";
import UserInfo from "./user_info.jsx";
import Cart from "./cart.jsx";
import Checkout from "./checkout.jsx";
import Collection from "./collection.jsx";
import History from "./history.jsx";
import UserEdit from "./userEdit.jsx"; // ✅ add this line

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<App />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/user_info" element={<UserInfo />} />
        <Route path="/userEdit" element={<UserEdit />} /> {/* ✅ add this route */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
