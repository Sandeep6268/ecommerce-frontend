import React from "react";
import "./CommunitySection.css";

const CommunitySection = () => {
  return (
    <section className="community-section my-5">
      <div className="feature-text">
        <div className="feature-image">
          <img
            src="https://www.zuclothing.com/cdn/shop/files/Group_17_2_800x.png?v=1741257525"
            alt="ZU Community"
            className="slide-in-image"
          />
        </div>
        <div className="feature-content">
          <header className="section-header">
            <h3 className="subheading">HEAR FROM THE ZU CLOTHING COMMUNITY</h3>
            <div className="description">
              <p>
                Where Unity Sparks Growth, Support Inspires Flourishing, and Connections Ignite Possibilities
                <br />
                <br />
                <a href="" title="Contact Us">
                  JOIN THE COMMUNITY
                </a>
              </p>
            </div>
          </header>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
