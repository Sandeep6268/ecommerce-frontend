import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import "./ProductDetail.css";
import Notification from "../../component/Notification/Notification";
import { checkAuth } from "../../component/LoginRequired/checkAuth";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false); // Toggle for description
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [notification, setNotification] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // In your ProductDetailPage.jsx
  const addToCart = async () => {
    // First check authentication
    if (!(await checkAuth())) {
      navigate("/login/", { state: { from: location.pathname } });
      return;
    }

    // Then validate required fields
    if (!selectedSize) {
      showNotification("Please select a size before adding to cart", "error");
      return;
    }

    try {
      setIsAddingToCart(true);
      const csrftoken = getCookie("csrftoken");

      // Validate CSRF token
      if (!csrftoken) {
        throw new Error(
          "Authentication error. Please refresh the page and try again."
        );
      }

      const response = await fetch(
        `https://ecommerce-backend-da9u.onrender.com/api/cart/add/${product.id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          credentials: "include",
          body: JSON.stringify({
            quantity,
            size_id: selectedSize.id,
            color_id: selectedColor?.id, // Make sure this is being passed
          }),
        }
      );

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response");
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(", ") || "Invalid request");
        }
        throw new Error(data.message || `Error: ${response.statusText}`);
      }

      // Success handling
      showNotification(
        data.message ||
          `${product.name} (Size: ${selectedSize.name}) added to cart!`,
        "success"
      );

      // Update cart count in header
      if (window.updateCartCount) {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Cart Error:", {
        error: error.message,
        productId: product.id,
        sizeId: selectedSize.id,
      });

      // User-friendly error messages
      const errorMessage = error.message.includes("Network Error")
        ? "Network error - please check your connection"
        : error.message || "Failed to update your cart. Please try again.";

      showNotification(errorMessage, "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      showNotification("Please select a size", "error");
      return;
    }

    await addToCart();

    if (!notification?.type === "error") {
      navigate("/checkout");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `https://ecommerce-backend-da9u.onrender.com/api/products/${id}/`
        );
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);

        if (data.colors?.length > 0) {
          const firstColor = data.colors[0];
          setSelectedColor(firstColor.color);
          updateColorImages(firstColor);
        }

        if (data.sizes?.length > 0) {
          const firstAvailableSize =
            data.sizes.find((size) => size.stock > 0)?.size ||
            data.sizes[0].size;
          setSelectedSize(firstAvailableSize);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const updateColorImages = (colorData) => {
    if (colorData?.images?.length > 0) {
      setCurrentImages(colorData.images);
      const defaultImage = colorData.images.find((img) => img.is_default);
      setMainImage(defaultImage?.image_url || colorData.images[0].image_url);
    } else {
      setCurrentImages([]);
      setMainImage("");
    }
  };

  const handleColorChange = (colorData) => {
    setSelectedColor(colorData.color);
    updateColorImages(colorData);

    // Instead of setting to null, find if the currently selected size is available for this color
    // If not, find the first available size
    const availableSizes = product.sizes.filter((size) => size.stock > 0);
    const sizeToSelect =
      availableSizes.find((size) => size.size.id === selectedSize?.id)?.size ||
      availableSizes[0]?.size;
    setSelectedSize(sizeToSelect);
  };

  const handleImageClick = (img) => {
    setMainImage(img.image_url);
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showNotification("Link copied to clipboard!", "success");
      })
      .catch(() => {
        showNotification("Failed to copy link", "error");
      });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  const currentPrice = product.currentprice;
  const originalPrice = product.orignalprice;

  return (
    <>
      <Header />
      <div className="product-detail-page">
        <div className="product-wrapper">
          {/* Product Gallery */}
          <div className="product-gallery">
            {currentImages.length > 0 ? (
              <>
                <div className="gallery-thumbnails">
                  {currentImages.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${
                        mainImage === img.image_url ? "active" : ""
                      }`}
                      onClick={() => handleImageClick(img)}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} - ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="main-image">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} />
                  ) : (
                    <div className="no-image-placeholder">
                      No image selected
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-images">
                No images available for this color
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>

            {/* Price Section */}
            <div className="price-section">
              <span className="current-price">₹ {currentPrice}</span>
              {originalPrice && originalPrice !== currentPrice && (
                <span className="compare-price">₹ {originalPrice}</span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="product-option">
                <label>Color:</label>
                <div className="color-swatches">
                  {product.colors.map((colorData) => (
                    <div
                      key={colorData.color.id}
                      className={`color-swatch ${
                        selectedColor?.id === colorData.color.id ? "active" : ""
                      }`}
                      style={{
                        backgroundColor: colorData.color.hex_code || "#F4C2C2",
                      }}
                      onClick={() => handleColorChange(colorData)}
                      title={colorData.color.name}
                    >
                      <span className="sr-only">{colorData.color.name}</span>
                    </div>
                  ))}
                </div>
                {selectedColor && (
                  <span className="selected-color-name">
                    {selectedColor.name}
                  </span>
                )}
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="product-option">
                <label>
                  Size:
                  <a
                    href="#size-chart"
                    className="size-guide-link"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("size-chart").style.display =
                        "block";
                    }}
                  >
                    Size chart
                  </a>
                </label>
                <div className="size-selector">
                  <select
                    value={selectedSize?.id || ""}
                    onChange={(e) => {
                      const sizeId = e.target.value;
                      const size = product.sizes.find(
                        (s) => s.size.id === parseInt(sizeId)
                      )?.size;
                      setSelectedSize(size);
                    }}
                  >
                    {product.sizes.map(({ size, stock }) => (
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
              </div>
            )}

            {/* Quantity Selector */}
            <div className="product-option">
              <label style={{ fontWeight: 600 }}>Quantity:</label>
              <br />
              <div className="quantity-selector">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="add-to-cart"
                onClick={addToCart} // Changed from onClick={() => addToCart(product.id)}
                disabled={isAddingToCart || !selectedSize}
              >
                {isAddingToCart ? (
                  "Adding..."
                ) : (
                  <>
                    <span>Add to cart</span>
                    <span className="separator">•</span>
                    <span>
                      ₹ {(product.currentprice * quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </button>
              <button
                className="buy-now"
                onClick={handleBuyNow}
                disabled={isAddingToCart || !selectedSize}
              >
                Buy it now
              </button>
            </div>

            {/* Description Section with Toggle */}
            <div className="product-description-toggle">
              <button
                className={`description-toggle-button ${
                  showDescription ? "open" : ""
                }`}
                onClick={toggleDescription}
              >
                Description{" "}
                <span className="text-right">
                  {showDescription ? "▲" : "▼"}
                </span>
              </button>
              {showDescription && (
                <div className="product-description-content">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Commented out other sections */}
            {/*
            <div className="product-tabs">
              <div className="tab">
                <button>Fabric</button>
              </div>
              <div className="tab">
                <button>Wash Care</button>
              </div>
              <div className="tab-content">
                <p>Content would go here</p>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <div className="size-chart-modal" id="size-chart">
        <div className="modal-content">
          <h3>Indian Size Chart (in cm)</h3>
          <div className="size-chart-container">
            <table className="size-chart-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hip</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>S</td>
                  <td>86-91</td>
                  <td>71-76</td>
                  <td>91-96</td>
                  <td>66</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>91-96</td>
                  <td>76-81</td>
                  <td>96-101</td>
                  <td>68</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>96-101</td>
                  <td>81-86</td>
                  <td>101-106</td>
                  <td>70</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>101-106</td>
                  <td>86-91</td>
                  <td>106-111</td>
                  <td>72</td>
                </tr>
                <tr>
                  <td>XXL</td>
                  <td>106-112</td>
                  <td>91-97</td>
                  <td>111-117</td>
                  <td>74</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button
            className="close-modal"
            onClick={() =>
              (document.getElementById("size-chart").style.display = "none")
            }
          >
            Close
          </button>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <Footer />
    </>
  );
};

export default ProductDetailPage;
