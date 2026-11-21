import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, pretty } from "../api";
import { useAuth } from "../AuthContext";

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("loading");
  const [img, setImg] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", message: "" });
  const [sent, setSent] = useState("");

  useEffect(() => {
    api(`/properties/${id}`)
      .then((p) => { setProperty(p); setStatus("ok"); })
      .catch(() => setStatus("missing"));
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/enquiries", { method: "POST", body: { ...form, property: property.id } });
      setSent("Enquiry sent. We will get back to you soon.");
      setShowForm(false);
    } catch (err) { setSent(err.message); }
  };

  if (status === "loading") return <h2>Loading...</h2>;
  if (status === "missing") return <h2>Property not found</h2>;

  return (
    <div className="property-details-page">
      <NavBar />
      <main className="property-details-container">
        <div className="property-details-image-wrapper">
          {property.images.length > 0 ? (
            <img src={property.images[img]} alt={property.title} className="property-details-image" />
          ) : (
            <div className="no-image" style={{ height: 320 }}>No image</div>
          )}
        </div>
        {property.images.length > 1 && (
          <div className="thumbs">
            {property.images.map((src, i) => (
              <img key={src} src={src} alt="" className={i === img ? "on" : ""} onClick={() => setImg(i)} />
            ))}
          </div>
        )}

        <div className="property-details-content">
          <div className="property-details-heading">
            <div>
              <p className="property-details-location">{property.location}</p>
              <h1>{property.title}</h1>
            </div>
            <div className="property-details-price">
              <h2>₦{property.price.toLocaleString()}</h2>
              {property.pricePeriod && <span>per {property.pricePeriod}</span>}
            </div>
          </div>

          <div className="property-info">
            <div><span>Bedrooms</span><strong>{property.bedrooms}</strong></div>
            <div><span>Bathrooms</span><strong>{property.bathrooms}</strong></div>
            <div><span>Area</span><strong>{property.area} m²</strong></div>
          </div>

          <section className="property-details-section">
            <h2>Description</h2>
            <p>{property.description || "No description provided."}</p>
          </section>

          {property.amenities.length > 0 && (
            <section className="property-details-section">
              <h2>Amenities</h2>
              <div className="amenities-list">
                {property.amenities.map((a, i) => <span key={i}>{a}</span>)}
              </div>
            </section>
          )}

          <section className="property-details-section">
            <h2>Property Information</h2>
            <div className="property-information">
              <div><span>Property Type</span><strong>{pretty(property.type)}</strong></div>
              <div><span>Purpose</span><strong>For {property.purpose}</strong></div>
              <div><span>Location</span><strong>{property.location}</strong></div>
              <div><span>Availability</span><strong>{pretty(property.status)}</strong></div>
            </div>
          </section>

          <section className="agent-section">
            <div>
              <p>Interested in this property?</p>
              <h2>Contact {property.agent?.name || "the property owner"}</h2>
              {property.agent?.phone && <p>Phone: {property.agent.phone}</p>}
              {sent && <p>{sent}</p>}
            </div>
            <button onClick={() => setShowForm(!showForm)}>Send rental enquiry</button>
          </section>

          {showForm && (
            <form className="filter-options" style={{ flexDirection: "column", alignItems: "stretch", marginTop: 20 }} onSubmit={submit}>
              <div className="filter-group"><label>Your name</label><input name="name" required value={form.name} onChange={change} /></div>
              <div className="filter-group"><label>Email</label><input name="email" type="email" required value={form.email} onChange={change} /></div>
              <div className="filter-group"><label>Phone</label><input name="phone" value={form.phone} onChange={change} /></div>
              <div className="filter-group"><label>Message</label><textarea name="message" rows="4" required value={form.message} onChange={change} /></div>
              <button className="primary-btn" type="submit">Submit enquiry</button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
