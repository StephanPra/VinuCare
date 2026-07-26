function ReviewHero() {
  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img src="https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=1400&auto=format&fit=crop&q=70" alt="Happy dog owner" />
      </div>

      <div className="page-hero-overlay"></div>

      <div className="page-hero-content">
        <span
          className="pill-tag"
          style={{
            background: "rgba(255,255,255,.2)",
            color: "#fff",
          }}
        >
          Customer Love
        </span>

        <h1>What Our Pet Families Say</h1>

        <p>
          Real stories from real pet owners who trust VinuCare with the
          animals they love.
        </p>
      </div>
    </div>
  );
}

export default ReviewHero;