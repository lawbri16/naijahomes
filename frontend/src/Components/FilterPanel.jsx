import { useState } from "react";
import { pretty } from "../api";

export default function FilterPanel({
  propertyType, setpropertyType,
  purpose, setPurpose,
  location, setLocation,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  sortBy, setsortBy,
  filters, // { cities: [], types: [] } loaded from the database
}) {
  const [isOpen, setisOpen] = useState(false);
  return (
    <div className="filter-panel">
      <button onClick={() => setisOpen(!isOpen)}>Filters </button>

      {isOpen && (
        <div className="filter-options">
          <div className="filter-group">
            <label> For</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option value="all"> Sale or rent</option>
              <option value="sale"> For sale</option>
              <option value="rent"> For rent</option>
            </select>
          </div>
          <div className="filter-group">
            <label> Property Type</label>
            <select value={propertyType} onChange={(e) => setpropertyType(e.target.value)}>
              <option value="all"> All types</option>
              {filters.types.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label> Location </label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="all"> All locations</option>
              {filters.cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Min price (₦)</label>
            <input type="number" min="0" placeholder="Any" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Max price (₦)</label>
            <input type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>SortBy </label>
            <select value={sortBy} onChange={(e) => setsortBy(e.target.value)}>
              <option value="newest"> Newest</option>
              <option value="price-low"> Price: low to High </option>
              <option value="price-high"> Price:High to Low </option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
