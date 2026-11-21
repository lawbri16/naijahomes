import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  return (
    <div className="property-card">
      {property.image ? (
        <img src={property.image} alt={property.title} />
      ) : (
        <div className="no-image">No image</div>
      )}
      <div className="card-content">
        <h3>{property.title}</h3>
        <p>{property.location} · For {property.purpose}</p>
        <p>
          ₦{property.price.toLocaleString()}{property.pricePeriod && ` / ${property.pricePeriod}`}{" "}
          <span><Link to={`/property/${property.id}`}>view details</Link></span>
        </p>
      </div>
    </div>
  );
}
