import { useState, useEffect } from "react";
import ExtraBanners from '../../components/ExtraBanners';
import ReviewHero from "./ReviewHero";
import RatingsSummary from "./RatingsSummary";
import WriteReview from "./WriteReview";
import ReviewsGrid from "./ReviewsGrid";
import ReviewCardSkeleton from "./ReviewCardSkeleton";
import "../../styles/reviews.css";
import { API_BASE_URL } from "../../config/api";

function ReviewsPage({ onNavigate, isLoggedIn, setRedirectAfterLogin }) {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews`)
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
      <ExtraBanners page="reviews" />
      <RatingsSummary reviews={allReviews} />
      <WriteReview
        onReviewSubmit={handleAddNewReview}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        setRedirectAfterLogin={setRedirectAfterLogin}
      />
      {loading ? (
        <div className="reviews-full-grid">
          {Array.from({ length: 6 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
        </div>
      ) : allReviews.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No reviews yet. Be the first!</p>
      ) : (
        <ReviewsGrid reviewsList={allReviews} />
      )}
    </div>
  );
}

export default ReviewsPage;