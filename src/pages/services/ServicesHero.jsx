function ServicesHero() {
  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1400&auto=format&fit=crop&q=70" alt="Veterinary services" />
      </div>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <span className="pill-tag" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>All Services</span>
        <h1>Comprehensive Pet Care Services</h1>
        <p>From routine wellness to specialist procedures — we're your one-stop pet health destination.</p>
      </div>
    </div>
  );
}

export default ServicesHero;