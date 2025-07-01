import React from "react";
import "./GallerySlider.css";

const images = [
  "//www.zuclothing.com/cdn/shop/files/USPS-1-01_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-02_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-03_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-04_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-05_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-06_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/free-shipping.jpg?v=1710403069",
  "//www.zuclothing.com/cdn/shop/files/easy-return.jpg?v=1710403068",
];

const GallerySlider = () => (
  <section className="gallery-section">
    <div className="gallery-container">
      <ul className="gallery-list p-0" type='none'>
        {images.map((src, idx) => (
          <li key={idx} className="gallery-item">
            <div className="gallery-image-wrapper">
              <img src={src} alt={`gallery-${idx}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default GallerySlider;
