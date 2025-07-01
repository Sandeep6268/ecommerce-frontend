import React, { useState, useEffect } from "react";
import "./Cart.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { Link } from "react-router-dom";
import Notification from "../Notification/Notification";

const Cart = () => {
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
    item_count: 0,
    isLoading: true,
    error: null,
  });
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCartData = async () => {
    try {
      setCartData((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch(
        "https://ecommerce-backend-da9u.onrender.com/api/cart/",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Debug log
      console.log("Cart API response:", data);

      // More flexible response handling
      const items = data.items || data.cart?.items || [];
      const total = data.total || data.cart?.total || 0;
      const item_count = data.item_count || data.cart?.item_count || 0;

      const processedItems = items.map((item) => ({
        ...item,
        image: item.image || "/placeholder-product.jpg",
        color: item.color || item.color_name || "",
        size: item.size || item.size_name || "",
        size_id: item.size_id || null,
        product_id: item.product_id || item.id || null,
      }));

      setCartData({
        items: processedItems,
        total,
        item_count,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Cart fetch error:", error);
      setCartData({
        items: [],
        total: 0,
        item_count: 0,
        isLoading: false,
        error: error.message,
      });
      showNotification("Failed to load cart. Please try again.", "error");
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const handleCartAction = async (
    productId,
    action,
    quantity,
    sizeId = null,
    colorId = null
  ) => {
    try {
      let endpoint = "";
      let body = {};

      if (action === "remove") {
        endpoint = `https://ecommerce-backend-da9u.onrender.com/api/cart/remove/${productId}/`;
        body = { size_id: sizeId, color_id: colorId };
      } else if (action === "update") {
        endpoint = `https://ecommerce-backend-da9u.onrender.com/api/cart/update/${productId}/`;
        body = {
          quantity,
          size_id: sizeId,
          color_id: colorId,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} item`);
      }

      showNotification(
        action === "remove"
          ? "Item removed from cart"
          : "Cart updated successfully"
      );
      await fetchCartData();
    } catch (error) {
      console.error(`Cart ${action} error:`, error);
      showNotification(error.message || "Something went wrong", "error");
    }
  };

  if (cartData.isLoading) return <div className="loading">Loading cart...</div>;
  if (cartData.error) {
    return (
      <div className="error">
        Error: {cartData.error}
        <button onClick={fetchCartData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Header cartItemCount={cartData.item_count} />
      <div className="cart-container">
        <h1 className="cart-title">Your Shopping Cart</h1>

        {cartData.item_count > 0 ? (
          <>
            <div className="cart-header">
              <div>Product</div>
              <div>Quantity</div>
              <div>Total</div>
            </div>

            <div className="cart-items">
              {cartData.items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      {item.color_name && (
                        <p className="item-variant">Color: {item.color_name}</p>
                      )}
                      {item.size_name && (
                        <p className="item-variant">Size: {item.size_name}</p>
                      )}
                      <p className="item-price">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="quantity-section">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleCartAction(
                            item.product_id,
                            "update",
                            item.quantity - 1,
                            item.size_id,
                            item.color_id
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleCartAction(
                            item.product_id,
                            "update",
                            item.quantity + 1,
                            item.size_id,
                            item.color_id
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        handleCartAction(
                          item.product_id,
                          "remove",
                          null,
                          item.size_id,
                          item.color_id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="price-section">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="total-section">
                <p className="total-amount">
                  Total: ₹{cartData.total.toFixed(2)}
                </p>
                <p className="shipping-note">
                  Shipping & taxes calculated at checkout
                </p>
                <Link to="/checkout" className="checkout-btn">
                  CHECKOUT
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/" className="continue-shopping text-white">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
      <Footer />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default Cart;
