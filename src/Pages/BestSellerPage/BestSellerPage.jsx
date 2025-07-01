import React, { useEffect, useState } from "react";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import BestSeller from "../../component/BestSeller/BestSeller";
import axios from "axios";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { checkAuth } from "../../component/LoginRequired/checkAuth";
import Notification from "../../component/Notification/Notification";

const BestSellerPage = () => {
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
          let imageUrl = "/placeholder-product.jpg";

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

        // Initialize selected sizes
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

    // Check if selected size is available
    const selectedSize = product.sizes?.find(
      (size) => size.size.id === selectedSizeId
    );
    if (!selectedSize || selectedSize.stock <= 0) {
      showNotification("Selected size is out of stock", "error");
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
          credentials: "include",
          body: JSON.stringify({
            quantity: 1,
            size_id: selectedSizeId,
            color_id: colorId,
            update_quantity: true, // This tells backend to update quantity if item exists
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      showNotification(
        data.message || `${product.name} added to cart successfully!`
      );

      // Update cart count globally
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification(
        error.message || "Failed to add product. Please try again.",
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
      <Header />
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
                  <img
                    src={item.image}
                    alt={item.name}
                    className="best-seller-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />
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

                {/* Added size selector */}
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
      <Footer />
    </>
  );
};

export default BestSellerPage;
