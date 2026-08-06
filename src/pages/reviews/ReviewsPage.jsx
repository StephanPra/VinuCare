import { useState, useEffect } from "react";
import ReviewHero from "./ReviewHero";
import RatingsSummary from "./RatingsSummary";
import WriteReview from "./WriteReview";
import ReviewsGrid from "./ReviewsGrid";
import "../../styles/reviews.css";

function ReviewsPage({ onNavigate, isLoggedIn, setRedirectAfterLogin }) {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/reviews')
      .then(res => res.json())
      .then(data => { setAllReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAddNewReview = (newReview) => {
    setAllReviews(prev => [newReview, ...prev]);
  };

  return (
    <div id="page-reviews" className="page active">
      <ReviewHero />
      <RatingsSummary reviews={allReviews} />
      <WriteReview
        onReviewSubmit={handleAddNewReview}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        setRedirectAfterLogin={setRedirectAfterLogin}
      />
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading reviews…</p>
      ) : allReviews.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No reviews yet. Be the first!</p>
      ) : (
        <ReviewsGrid reviewsList={allReviews} />
      )}
    </div>
  );
}

export default ReviewsPage;