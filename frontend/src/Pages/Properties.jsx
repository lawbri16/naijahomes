import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";
import FilterPanel from "../Components/FilterPanel";
import PropertyCard from "../Components/PropertyCard";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Properties() {
  const [SearchTerm, SetSearchTerm] = useState("");
  const [propertyType, setpropertyType] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [location, setLocation] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setsortBy] = useState("newest");
  const [filters, setFilters] = useState({ cities: [], types: [] });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Location and type options come from the listings that actually exist
  useEffect(() => { api("/properties/meta/filters").then(setFilters).catch(() => {}); }, []);

  // The server does the searching, filtering and sorting; wait 300ms after typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({ sort: sortBy, limit: 100 });
      if (SearchTerm.trim()) params.set("q", SearchTerm.trim());
      if (propertyType !== "all") params.set("type", propertyType);
      if (purpose !== "all") params.set("purpose", purpose);
      if (location !== "all") params.set("city", location);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      setLoading(true);
      api(`/properties?${params}`)
        .then((r) => { setProperties(r.data); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [SearchTerm, propertyType, purpose, location, minPrice, maxPrice, sortBy]);

  return (
    <div className="properties-section">
      <NavBar />
      <div className="properties-header">
        <h2> Explore our available Properties</h2> <br />
        <p>
          <i>
            Browse through our selection of quality properties and find a place
            that feels like home.
          </i>
        </p>
      </div>
      <div className="SearchAndFilter">
        <SearchBar SearchTerm={SearchTerm} SetSearchTerm={SetSearchTerm} />
        <FilterPanel
          propertyType={propertyType} setpropertyType={setpropertyType}
          purpose={purpose} setPurpose={setPurpose}
          location={location} setLocation={setLocation}
          minPrice={minPrice} setMinPrice={setMinPrice}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          sortBy={sortBy} setsortBy={setsortBy}
          filters={filters}
        />
      </div>
      <div className="property-space">
        {error ? (
          <p className="no-properties">Could not load properties: {error}</p>
        ) : loading ? (
          <p className="no-properties">Loading properties...</p>
        ) : properties.length > 0 ? (
          properties.map((property) => <PropertyCard key={property.id} property={property} />)
        ) : (
          <p className="no-properties">No matching properties (for now 😏)....</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
