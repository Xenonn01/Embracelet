import React, { Component } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

export default class Admin extends Component {
  state = {
    activeTab: "dashboard",
    products: [],
    orders: [],
    users: [],
    name: "",
    description: "",
    price: "",
    stock: "",
    imageFile: null,
    editingId: null,
    loading: false,
    searchQuery: "",
    activeOrder: null,
    isDropdownOpen: false,
  };

  componentDidMount() {
    this.fetchProducts();
    this.fetchOrders();
    this.fetchUsers();
  }

  toggleDropdown = () => {
    this.setState((prev) => ({ isDropdownOpen: !prev.isDropdownOpen }));
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isDropdownOpen: false });
    if (tab === "products") this.fetchProducts();
    if (tab === "orders") this.fetchOrders();
    if (tab === "dashboard") {
      this.fetchProducts();
      this.fetchOrders();
      this.fetchUsers();
    }
  };

  handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/app";
  };

  fetchProducts = async () => {
    this.setState({ loading: true });
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
      this.setState({ products: [] });
    } else {
      this.setState({ products: data || [] });
    }
    this.setState({ loading: false });
  };

  fetchOrders = async () => {
    this.setState({ loading: true });
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching orders:", error);
      this.setState({ orders: [] });
    } else {
      this.setState({ orders: data || [] });
    }
    this.setState({ loading: false });
  };

  fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
      this.setState({ users: [] });
    } else {
      this.setState({ users: data || [] });
    }
  };

  handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) this.setState({ imageFile: file });
  };

  uploadImage = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.name}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      const { data: publicUrlData, error: publicUrlError } = await supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      if (publicUrlError) throw publicUrlError;
      const publicUrl =
        publicUrlData && (publicUrlData.publicUrl || publicUrlData.public_url);
      return publicUrl || null;
    } catch (err) {
      console.error("Image upload error:", err);
      alert(
        "Failed to upload image. Make sure your bucket exists and RLS/policies allow inserts."
      );
      return null;
    }
  };

  handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    const { name, description, price, stock, imageFile, editingId } = this.state;

    if (!name || price === "" || stock === "") {
      alert("Please fill in all required fields.");
      return;
    }

    this.setState({ loading: true });

    let imageUrl = null;
    if (imageFile) imageUrl = await this.uploadImage(imageFile);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      ...(imageUrl && { image_url: imageUrl }),
    };

    let error = null;

    if (editingId) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", Number(editingId));
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert([productData]);
      error = insertError;
    }

    if (error) {
      alert(`Failed to ${editingId ? "update" : "add"} product!`);
      console.error(error);
    } else {
      alert(`Product ${editingId ? "updated" : "added"} successfully!`);
      this.setState({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageFile: null,
        editingId: null,
      });
      await this.fetchProducts();
    }

    this.setState({ loading: false });
  };

  handleEditProduct = (product) => {
    this.setState({
      activeTab: "products",
      name: product.name || "",
      description: product.description || "",
      price: product.price != null ? product.price : "",
      stock: product.stock != null ? product.stock : "",
      imageFile: null,
      editingId: product.id,
    });
  };

  handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    this.setState({ loading: true });
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Failed to delete product!");
      console.error(error);
    } else {
      alert("Product deleted!");
      await this.fetchProducts();
    }

    this.setState({ loading: false });
  };

  render() {
    const {
      activeTab,
      products,
      orders,
      users,
      name,
      description,
      price,
      stock,
      loading,
      editingId,
      searchQuery,
      activeOrder,
      isDropdownOpen,
    } = this.state;

    const totalSales = (orders || []).reduce(
      (sum, order) => sum + parseFloat(order.total || 0),
      0
    );

    const formattedTotalSales = totalSales.toFixed(2);

    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-end p-4 bg-white shadow">
          <div className="flex items-center space-x-4 relative flex-shrink-0">
            <button
              onClick={this.toggleDropdown}
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => this.setActiveTab("dashboard")}
                  >
                    Dashboard
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => this.setActiveTab("products")}
                  >
                    Products
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => this.setActiveTab("orders")}
                  >
                    Orders
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => this.setActiveTab("settings")}
                  >
                    Settings
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => this.setActiveTab("Store Information")}
                  >
                    Store Information
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={this.handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>

          <main className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-semibold text-[#8b3a2b] mb-6 capitalize">
              {activeTab}
            </h2>

            {activeTab === "dashboard" && (
              <div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6">
                  <div className="grid grid-cols-3 text-center gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">
                        Total Products
                      </h4>
                      <p className="text-2xl font-bold text-[#8b3a2b]">
                        {products.length}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">
                        Total Orders
                      </h4>
                      <p className="text-2xl font-bold text-[#8b3a2b]">
                        {orders.length}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">
                        Total Customers
                      </h4>
                      <p className="text-2xl font-bold text-[#8b3a2b]">
                        {users.length}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Total Sales:
                    </span>
                    <span className="text-2xl font-bold text-[#8b3a2b] ml-2">
                      ₱{formattedTotalSales}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h3 className="text-xl font-semibold text-[#8b3a2b] mb-4">
                    Recent Orders
                  </h3>

                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    className="p-3 border rounded-lg mb-4 w-full"
                    value={searchQuery}
                    onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  />

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f2e6df] text-[#5a2e1f]">
                        <th className="p-3 border">Order ID</th>
                        <th className="p-3 border">Name</th>
                        <th className="p-3 border">Total</th>
                        <th className="p-3 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orders || [])
                        .filter((order) => {
                          const query = (searchQuery || "").toLowerCase();
                          const name = (order.name || "").toString().toLowerCase();
                          const idString = (order.id || "").toString();
                          return name.includes(query) || idString.includes(query);
                        })
                        .slice(0, 5)
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-[#f9f5f3]">
                            <td className="p-3 border text-center">{order.id}</td>
                            <td className="p-3 border text-center">{order.name || "—"}</td>
                            <td className="p-3 border text-center">₱{Number(order.total || 0).toFixed(2)}</td>
                            <td className="p-3 border text-center">
                              <button
                                className="bg-[#8b3a2b] text-white px-3 py-1 rounded hover:bg-[#6d2a1f]"
                                onClick={() => this.setState({ activeOrder: order })}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {activeOrder && (
  <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 border border-gray-200 relative">
      <h2 className="text-2xl font-bold text-[#8b3a2b] mb-4 text-center">
        ORDER DETAILS
      </h2>
                  {/* Order Information */}
      <div className="mb-4 border-b pb-3">
        <p>
          <strong>Order ID:</strong> {activeOrder.id || "—"}
        </p>
        <p>
          <strong>Placed on:</strong>{" "}
          {activeOrder.created_at
            ? new Date(activeOrder.created_at).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })
            : "—"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="inline-flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            {activeOrder.status || "—"}
          </span>
        </p>
      </div>

      {/* Customer Information */}
      <div className="mb-4 border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Customer Information
        </h3>
        <p>
          <strong>Name:</strong> {activeOrder.name || "—"}
        </p>
        <p>
          <strong>Email:</strong> {activeOrder.email || "—"}
        </p>
        <p>
          <strong>Shipping Address:</strong> {activeOrder.address || "—"}
        </p>
        <p>
          <strong>Payment Method:</strong> {activeOrder.payment_method || "—"}
        </p>
      </div>

      {/* Order Items Table */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Order Items
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-sm text-center">
          <thead className="bg-[#8b3a2b] text-white">
            <tr>
              <th className="border border-gray-300 px-2 py-1">Product</th>
              <th className="border border-gray-300 px-2 py-1">Quantity</th>
              <th className="border border-gray-300 px-2 py-1">Price(₱)</th>
              <th className="border border-gray-300 px-2 py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {activeOrder.items?.length > 0 ? (
              activeOrder.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.product_name}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.price}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.price * item.quantity}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border border-gray-300 py-2">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <p className="text-right text-lg font-semibold">
        Total: ₱{Number(activeOrder.total || 0).toFixed(2)}
      </p>

      {/* Close Button */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
          onClick={() => this.setState({ activeOrder: null })}
        >
          Close
        </button>       
                      
                      
                     </div>
    </div>
  </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <form
                  onSubmit={this.handleAddOrUpdateProduct}
                  className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100"
                >
                  <h3 className="text-xl font-semibold text-[#8b3a2b] mb-4">
                    {editingId ? "Edit Product" : "Add New Product"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={name}
                      onChange={(e) => this.setState({ name: e.target.value })}
                      className="p-3 border rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => this.setState({ price: e.target.value })}
                      className="p-3 border rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={stock}
                      onChange={(e) => this.setState({ stock: e.target.value })}
                      className="p-3 border rounded-lg"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={description}
                      onChange={(e) => this.setState({ description: e.target.value })}
                      className="p-3 border rounded-lg md:col-span-2"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={this.handleFileChange}
                      className="p-3 border rounded-lg md:col-span-2"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 bg-[#8b3a2b] text-white px-6 py-2 rounded-lg hover:bg-[#6d2a1f] transition"
                  >
                    {loading ? "Processing..." : editingId ? "Update Product" : "Add Product"}
                  </button>
                </form>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
  <h3 className="text-xl font-semibold text-[#8b3a2b] mb-4">Product List</h3>

  {/* ✅ Search bar */}
  <input
    type="text"
    placeholder="Search product..."
    value={this.state.searchQuery}
    onChange={(e) => this.setState({ searchQuery: e.target.value })}
    className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b3a2b]"
  />

  {this.state.loading ? (
    <p>Loading products...</p>
  ) : this.state.products.length === 0 ? (
    <p className="text-gray-600">No products available.</p>
  ) : (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#f2e6df] text-[#5a2e1f]">
          <th className="p-3 border">Image</th> 
          <th className="p-3 border">Product Name</th>
          <th className="p-3 border">Action</th>
          <th className="p-3 border bg-[#f2e6df] text-[#5a2e1f] text-center">
            <div className="flex justify-center items-center">
             <svg
                 className="w-5 h-5 item-center"
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
            </div>
        </th>
        </tr>
      </thead>
      <tbody>
        {(this.state.products || [])
          .filter(
            (product) =>
              product.name
                ?.toLowerCase()
                .includes(this.state.searchQuery?.toLowerCase() || "")
          )
          .map((product) => (
            <tr key={product.id} className="hover:bg-[#f9f5f3]">
              <td className="p-3 border text-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover mx-auto rounded"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3 border text-center">{product.name}</td>
              <td className="p-3 border text-center space-x-2">
                <button
                  onClick={() => this.handleEditProduct(product)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => this.handleDeleteProduct(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
                </td>
                <td className="p-3 border text-center space-x-2">
                <button
                  onClick={() =>
                    this.setState({ activeProduct: product })
                  }
                  className="bg-[#8b3a2b] text-white px-4 py-1 rounded-md hover:bg-[#6d2a1f] transition"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )}

  {/* ✅ Modal for product details */}
  {this.state.activeProduct && (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold text-[#8b3a2b] mb-3">
          {this.state.activeProduct.name}
        </h3>
        <img
          src={this.state.activeProduct.image_url}
          alt={this.state.activeProduct.name}
          className="w-full h-48 object-cover rounded mb-3"
        />
        <p className="text-gray-700 mb-2">
          <strong>Description:</strong>{" "}
          {this.state.activeProduct.description || "—"}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Price:</strong> ₱
          {Number(this.state.activeProduct.price || 0).toFixed(2)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Stock:</strong> {this.state.activeProduct.stock || 0}
        </p>
        <button
          onClick={() => this.setState({ activeProduct: null })}
          className="mt-4 bg-[#8b3a2b] text-white px-4 py-2 rounded-md hover:bg-[#6d2a1f] transition"
        >
          Close
        </button>
      </div>
    </div>
  )}
</div>
</div>
            )}

           {activeTab === "orders" && (
  <div className="flex flex-col items-center">
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 w-full max-w-5xl">
      <h3 className="text-xl font-semibold text-[#8b3a2b] mb-4 text-center">
        Order List
      </h3>

      {/* 🔍 Search bar */}
      <input
        type="text"
        placeholder="Search by name or order ID..."
        value={this.state.searchQuery}
        onChange={(e) => this.setState({ searchQuery: e.target.value })}
        className="mb-4 w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
      />

      {this.state.loading ? (
        <p className="text-center">Loading orders...</p>
      ) : (this.state.orders || []).length === 0 ? (
        <p className="text-center text-gray-600">No orders yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f2e6df] text-[#5a2e1f]">
              <th className="p-3 border text-center">Order ID</th>
              <th className="p-3 border text-center">Customer Name</th>
              <th className="p-3 border text-center">Total Price</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {(this.state.orders || [])
              .filter(
                (order) =>
                  order.id?.toString().includes(this.state.searchQuery) ||
                  order.name
                    ?.toLowerCase()
                    .includes(this.state.searchQuery.toLowerCase())
              )
              .map((order) => (
                <tr key={order.id} className="hover:bg-[#f9f5f3]">
                  <td className="p-3 border text-center">{order.id}</td>
                  <td className="p-3 border text-center">{order.name || "—"}</td>
                  <td className="p-3 border text-center">
                    ₱{Number(order.total || 0).toFixed(2)}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() =>
                        this.setState({ activeOrder: order })
                      }
                      className="bg-[#8b3a2b] text-white px-4 py-1 rounded-md hover:bg-[#6d2a1f] transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>

    {this.state.activeOrder && (
      <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full relative">
          <button
            onClick={() => this.setState({ activeOrder: null })}
            className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
          >
            ✕
          </button>

          <h3 className="text-2xl font-semibold text-[#8b3a2b] mb-4 text-center">
            Order Details
          </h3>

           <div className="mb-4 border-b pb-3">
        <p>
          <strong>Order ID:</strong> {activeOrder.id || "—"}
        </p>
        <p>
          <strong>Placed on:</strong>{" "}
          {activeOrder.created_at
            ? new Date(activeOrder.created_at).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })
            : "—"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="inline-flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            {activeOrder.status || "—"}
          </span>
        </p>
      </div>

      {/* Customer Information */}
      <div className="mb-4 border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Customer Information
        </h3>
        <p>
          <strong>Name:</strong> {activeOrder.name || "—"}
        </p>
        <p>
          <strong>Email:</strong> {activeOrder.email || "—"}
        </p>
        <p>
          <strong>Shipping Address:</strong> {activeOrder.address || "—"}
        </p>
        <p>
          <strong>Payment Method:</strong> {activeOrder.payment_method || "—"}
        </p>
      </div>

      {/* Order Items Table */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Order Items
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-sm text-center">
          <thead className="bg-[#8b3a2b] text-white">
            <tr>
              <th className="border border-gray-300 px-2 py-1">Product</th>
              <th className="border border-gray-300 px-2 py-1">Quantity</th>
              <th className="border border-gray-300 px-2 py-1">Price(₱)</th>
              <th className="border border-gray-300 px-2 py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {activeOrder.items?.length > 0 ? (
              activeOrder.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.product_name}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.price}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.price * item.quantity}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border border-gray-300 py-2">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <p className="text-right text-lg font-semibold">
        Total: ₱{Number(activeOrder.total || 0).toFixed(2)}
      </p>

      {/* Close Button */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
          onClick={() => this.setState({ activeOrder: null })}
        >
          Close
        </button>       
                      
                      
                     </div>
    </div>
  </div>
                  )}
                </div>
              
            )}

{activeTab === "settings" && (
  <div className="flex flex-col items-center min-h-screen">
    <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100 max-w-2xl w-full">
      <h4 className="text-lg font-semibold text-[#5a2e1f] mb-4">
        Manage Profile
      </h4>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#5a2e1f] mb-1">Email:</label>
            <input
              type="email"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm text-[#5a2e1f] mb-1">Name:</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm text-[#5a2e1f] mb-1">Password:</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
              placeholder="Enter new password"
            />
          </div>
        </div>
      </form>
      <div className="flex justify-end mt-6 space-x-3">
        <button className="bg-[#8b3a2b] text-white px-5 py-2 rounded-lg hover:bg-[#6d2a1f] transition">
          Edit
        </button>
        <button className="bg-[#8b3a2b] text-white px-5 py-2 rounded-lg hover:bg-[#6d2a1f] transition">
          Save
        </button>
      </div>
    </div>
  </div>
)}

{activeTab === "Store Information" && (
  <div className="flex flex-col items-center min-h-screen">
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-2xl w-full">
      <h4 className="text-lg font-semibold text-[#5a2e1f] mb-4">
        Manage Information
      </h4>
      <form className="space-y-4">
        <div>
          <label className="block text-sm text-[#5a2e1f] mb-1">
            Store Name:
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
            placeholder="Enter store name"
          />
        </div>
        <div>
          <label className="block text-sm text-[#5a2e1f] mb-1">
            Store Description:
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
            placeholder="Enter store description"
          />
        </div>
        <div>
          <label className="block text-sm text-[#5a2e1f] mb-1">
            Contact Number:
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8b3a2b]"
            placeholder="Enter contact number"
          />
        </div>
      </form>
      <div className="flex justify-end mt-6 space-x-3">
        <button className="bg-[#8b3a2b] text-white px-5 py-2 rounded-lg hover:bg-[#6d2a1f] transition">
          Edit
        </button>
        <button className="bg-[#8b3a2b] text-white px-5 py-2 rounded-lg hover:bg-[#6d2a1f] transition">
          Save
        </button>
      </div>
    </div>
  </div>
)}

     </main>
   </div>
);
}
}
