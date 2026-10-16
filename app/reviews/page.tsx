"use client";

import { useState } from "react";

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}



export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Math Student");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      role: role.trim() || "Student",
      rating,
      comment: comment.trim(),
      date: "Just now",
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);



    setName("");
    setComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main className="wrap page-shell">
      <div className="page-header">
        <span className="pill-badge">Community feedback</span>
        <h1>No public reviews yet</h1>
        <p className="page-lede">
          There are no published student reviews on CalcTutor. You can leave a note below; it will appear only in this browser session.
        </p>
      </div>

      <div className="reviews-layout">
        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card glass-card card-3d">
              <div className="review-card-header">
                <div>
                  <h3>{r.name}</h3>
                  <span className="review-role">{r.role}</span>
                </div>
                <span className="review-date">{r.date}</span>
              </div>
              <div className="star-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r.rating ? "star-active" : "star-inactive"}>
                    ★
                  </span>
                ))}
              </div>
              <p className="review-comment">“{r.comment}”</p>
            </div>
          ))}
        </div>

        {/* Submit Review Form */}
        <div className="submit-review-card glass-card">
          <h2>Share Your Experience</h2>
          <p>Your note is a local preview, not a public submission.</p>

          {submitted && (
            <div className="success-banner">
              Your note is now shown in this browser session.
            </div>
          )}

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="rev-name">Your Name</label>
              <input
                id="rev-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rev-role">Course / Role</label>
              <input
                id="rev-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. AP Statistics Student"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rev-rating">Rating</label>
              <select
                id="rev-rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>★★★★★ (5/5) Excellent</option>
                <option value={4}>★★★★☆ (4/5) Very Good</option>
                <option value={3}>★★★☆☆ (3/5) Good</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rev-comment">Review</label>
              <textarea
                id="rev-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was useful, confusing, or missing?"
                required
              />
            </div>

            <button type="submit" className="button button-primary width-full">
              Add local note
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
