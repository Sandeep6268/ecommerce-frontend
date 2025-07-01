import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { IoCallOutline } from "react-icons/io5";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";
import ShopDropdown from "../ShopDropdown/ShopDropdown";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          "https://ecommerce-backend-da9u.onrender.com/api/check-auth/",
          {
            withCredentials: true,
          }
        );
        setIsLoggedIn(response.data.isAuthenticated);
        console.log(isLoggedIn)
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1 && showSearchBar) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, showSearchBar]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://ecommerce-backend-da9u.onrender.com/api/search/suggestions/`,
        { params: { q: query } }
      );
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate("/profile/");
    } else {
      navigate("/login/");
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearchBar(!showSearchBar);
    setShowSuggestions(false);
    if (showSearchBar && searchQuery.trim()) {
      handleSearchSubmit(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}/`);
      setSearchQuery("");
      setShowSearchBar(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}/`);
    setShowSearchBar(false);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="topnav1">
        <p>EXPLORE OUR WIDE RANGE OF PRODUCTS</p>
      </div>
      <div className="nav2 d-flex justify-content-evenly">
        <div className="mobileno">
          <a className="contact_info" href="tel:+919740227938">
            <IoCallOutline size={22} />
            +91-97402-27938
          </a>
        </div>
        <div className="line"></div>
        <div className="gmail">
          <a className="contact_info" href="mailto:clothing@gmail.com">
            clothing@gmail.com
          </a>
        </div>
      </div>
      <header className="bg-white border-bottom sticky-top">
        <div className="container-fluid py-2 px-3">
          <div className="d-flex align-items-center justify-content-between">
            {/* Mobile Menu Button */}
            <button
              className="btn d-md-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#sidebarMenu"
              aria-controls="sidebarMenu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="fill w-25"></div>

            {/* Logo */}
            <Link
              to={"/"}
              className="navbar-brand mx-auto d-md-block d-none w-25"
            >
              <img
                src="https://www.zuclothing.com/cdn/shop/files/ZU_438ede84-8d3d-4544-95ca-ceaafda670cf_70x.png?v=1703589164"
                alt="ZU Clothing Logo"
                height="70"
              />
            </Link>

            {/* Header Icons */}
            <div className="d-flex align-items-center gap-3">
              <a
                href="#"
                className="text-dark"
                onClick={handleProfileClick}
                style={{ textDecoration: "none" }}
              >
                <i className="bi bi-person" style={{ fontSize: "20px" }}></i>
              </a>

              {/* Search Icon and Search Bar */}
              <div className="search-container" ref={suggestionsRef}>
                {showSearchBar ? (
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="search-input-container">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        className="search-input"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="clear-search-btn"
                          onClick={() => {
                            setSearchQuery("");
                            setSuggestions([]);
                          }}
                        >
                          <FiX />
                        </button>
                      )}
                      <button type="submit" className="search-button">
                        <FiSearch size={20} />
                      </button>
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </form>
                ) : (
                  <a href="#" className="text-dark" onClick={handleSearchClick}>
                    <i
                      className="bi bi-search"
                      style={{ fontSize: "20px" }}
                    ></i>
                  </a>
                )}
              </div>

              <Link to={"/cart/"} className="position-relative text-dark">
                <i className="bi bi-cart" style={{ fontSize: "20px" }}></i>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="d-none d-md-flex justify-content-center mt-3">
            <ul className="nav">
              <li className="nav-item">
                <Link to={"/"} className="nav-link" href="">
                  Home
                </Link>
              </li>
              <li className="nav-item dropdown">
                <ShopDropdown />
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="">
                      Coord Sets
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Basic Tshirts
                    </a>
                  </li>
                  <li className="dropdown-submenu">
                    <a className="dropdown-item dropdown-toggle" href="">
                      Oversized T-shirt
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item" href="">
                          Printed
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="">
                          Holographic
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Tie & Dye
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Vest
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Hoodies
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Sweatshirts
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <Link to={"/bestseller/"} className="nav-link" href="">
                  Best Sellers
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href=""
                  data-bs-toggle="dropdown"
                >
                  New Collection
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="">
                      Winter
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Summer
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="">
                  Wholesale
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href=""
                  data-bs-toggle="dropdown"
                >
                  Brand
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="">
                      Verticals
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Why Buy from Us
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      How Apparel is Made
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="">
                      Responsibility
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="">
                  Blogs
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
