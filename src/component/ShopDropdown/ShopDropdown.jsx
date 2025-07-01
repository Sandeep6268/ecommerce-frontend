import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ShopDropdown = () => {
  const [categories, setCategories] = useState([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://ecommerce-backend-da9u.onrender.com/api/categories/"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // if (loading) return <div>Loading...</div>;

  return (
    <>
      <a
        className="nav-link dropdown-toggle"
        href="#"
        data-bs-toggle="dropdown"
      >
        Shop
      </a>
      <ul className="dropdown-menu">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              className="dropdown-item"
              to={`/category/${category.id}/products/`}
            >
              {category.category}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ShopDropdown;
