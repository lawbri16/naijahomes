import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="about-hero">
      <div className="about-hero-content">
        <marquee>
          <p className="section-label">NIGERIAN REAL ESTATE, SIMPLIFIED</p>
        </marquee>
        <h1>
          Find a place you'll love to call{" "}
          <span>home.</span>
        </h1>

        <p className="hero-description">
          NaijaHomes makes it easier to discover quality homes,
          apartments, land, and other properties across Nigeria.
          Whether you're looking to buy or rent, we're here to
          help you explore properties that fit your needs.
        </p>

        <div className="hero-actions">
          <Link to="/properties"><button className="primary-btn">Browse properties</button></Link>
          <Link to="/agent/register" className="ghost-btn">List your property</Link>
        </div>
      </div>
    </section>
  );
}
