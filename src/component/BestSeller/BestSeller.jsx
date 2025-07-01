import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./BestSeller.css";
import axios from "axios";
import Notification from "../Notification/Notification";
import { checkAuth } from "../LoginRequired/checkAuth";

const BestSeller = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-backend-da9u.onrender.com/api/products/?is_best=true"
        );

        const productsWithImagesAndSizes = res.data.map((product) => {
          let imageUrl = null;
          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            if (firstColor.images?.length > 0) {
              const defaultImage = firstColor.images.find(
                (img) => img.is_default
              );
              imageUrl =
                defaultImage?.image_url || firstColor.images[0].image_url;
            }
          }

          // Find first available size or default to first size
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          return {
            ...product,
            image: imageUrl,
            defaultSize: firstAvailableSize,
          };
        });

        setBestSellers(productsWithImagesAndSizes);

        // Initialize selected sizes with first available or first size
        const initialSizes = {};
        productsWithImagesAndSizes.forEach((product) => {
          if (product.defaultSize) {
            initialSizes[product.id] = product.defaultSize.id;
          }
        });
        setSelectedSizes(initialSizes);
      } catch (err) {
        console.error("Failed to load best sellers", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeId,
    }));
  };

  const addToCart = async (productId) => {
    if (!(await checkAuth())) {
      navigate("/login/", { state: { from: location.pathname } });
      return;
    }

    const selectedSizeId = selectedSizes[productId];
    if (!selectedSizeId) {
      showNotification("Please select a size", "error");
      return;
    }

    const product = bestSellers.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return;
    }

    try {
      setAddingToCartId(productId);
      const csrftoken = getCookie("csrftoken");

      // Get the first available color ID (if colors exist)
      const colorId =
        product.colors?.length > 0 ? product.colors[0].color.id : null;

      const response = await fetch(
        `https://ecommerce-backend-da9u.onrender.com/api/cart/add/${productId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({
            quantity: 1,
            size_id: selectedSizeId,
            color_id: colorId, // This will be null if no colors exist
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add to cart");
      }

      const data = await response.json();

      showNotification(
        data.message || `${product.name} added to cart successfully!`
      );

      // Update cart count globally
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      showNotification(
        error.message || "Failed to add to cart. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) return <div className="loading">Loading best sellers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="bestseller">Best Seller</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="best-seller-container">
        <div className="best-seller-cards">
          {bestSellers.map((item) => (
            <div className="best-seller-card" key={item.id}>
              <Link to={`/product/${item.id}/`}>
                <div className="best-seller-image-container">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="best-seller-image"
                    />
                  ) : (
                    <div className="no-image-placeholder" />
                  )}
                  <span className="best-seller-badge">Best Seller</span>
                </div>
              </Link>
              <div className="best-seller-info">
                <h3 className="best-seller-title">
                  <Link
                    to={`/product/${item.id}/`}
                    className="best-seller-title-link"
                  >
                    {item.name}
                  </Link>
                </h3>
                <div className="best-seller-price-wrapper">
                  <span className="best-seller-current-price">
                    ₹{item.currentprice}
                  </span>
                  {item.orignalprice &&
                    item.orignalprice > item.currentprice && (
                      <span className="best-seller-original-price">
                        ₹{item.orignalprice}
                      </span>
                    )}
                </div>

                {/* Size Selection Dropdown */}
                {item.sizes?.length > 0 && (
                  <div className="size-selector">
                    <select
                      value={selectedSizes[item.id] || ""}
                      onChange={(e) =>
                        handleSizeChange(item.id, e.target.value)
                      }
                      className="size-dropdown"
                    >
                      {item.sizes.map(({ size, stock }) => (
                        <option
                          key={size.id}
                          value={size.id}
                          disabled={stock <= 0}
                        >
                          {size.name} {stock <= 0 ? "(Out of Stock)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  className="best-seller-add-to-cart"
                  onClick={() => addToCart(item.id)}
                  disabled={
                    addingToCartId === item.id || !selectedSizes[item.id]
                  }
                >
                  {addingToCartId === item.id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="view-all-btn-div d-flex justify-content-center my-3">
        <Link to="/bestseller/" className="view-all-btn text-white">
          VIEW ALL
        </Link>
      </div>
    </>
  );
};

export default BestSeller;
