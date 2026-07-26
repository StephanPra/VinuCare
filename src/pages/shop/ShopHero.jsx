
export default function ShopHero() {
  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img src="https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=1400&auto=format&fit=crop&q=70" alt="Pet store" />
      </div>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <span className="pill-tag" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>Pet Shop</span>
        <h1>Premium Pet Products</h1>
        <p>Vet-approved food, accessories, health supplements and more — delivered to your door.</p>
      </div>
    </div>
  );
}