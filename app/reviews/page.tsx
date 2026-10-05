"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}

const SEED_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "AP Statistics Student",
    rating: 5,
    comment:
      "CalcTutor saved my AP Stats grade! Learning normalcdf and invNorm on a real visual TI-84 keypad where the buttons glowed as I clicked made everything click in 10 minutes.",
    date: "2 days ago",
  },
  {
    id: "2",
    name: "Marcus Vance",
    role: "Algebra II Student",
    rating: 5,
    comment:
      "The 'You Press' interactive mode is amazing. Instead of watching a boring 20-minute video tutorial, I actually pressed Y=, ZStandard, and CALC Zero myself.",
    date: "1 week ago",
  },
  {
    id: "3",
    name: "Prof. David Miller",
    role: "High School Math Teacher",
    rating: 5,
    comment:
      "I recommend CalcTutor to all my students. The TI-84 Plus CE emulator is spot on, and the step-by-step key sequence generator accepts natural wording without getting confused.",
    date: "2 weeks ago",
  },
  {
    id: "4",
    name: "Elena Rostova",
    role: "Calculus AB Student",
    rating: 5,
    comment:
      "Finding graph intersections and calculating definite integrals with fnInt used to confuse me during exams. CalcTutor made the keypresses muscle memory!",
    date: "3 weeks ago",
  },
];

const STORAGE_KEY = "calcTutor.userReviews";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Math Student");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReviews([...JSON.parse(saved), ...SEED_REVIEWS]);
      }
    } catch {
      /* fallback to seed */
    }
  }, []);

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

    try {
      const userOnly = updated.filter((r) => !SEED_REVIEWS.some((s) => s.id === r.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
    } catch {
      /* ignore */
    }

    setName("");
    setComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main className="wrap page-shell">
      <div className="page-header">
        <span className="pill-badge">Community Feedback</span>
        <h1>Loved by Students & Educators</h1>
        <p className="page-lede">
          See how CalcTutor is helping thousands of students master their TI-84 Plus CE for algebra, calculus, AP statistics, and standardized test prep.
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
              <p className="review-comment">"{r.comment}"</p>
            </div>
          ))}
        </div>

        {/* Submit Review Form */}
        <div className="submit-review-card glass-card">
          <h2>Share Your Experience</h2>
          <p>Did CalcTutor help you master your TI-84? Leave a review for fellow students!</p>

          {submitted && (
            <div className="success-banner">
              ✨ Thank you! Your review has been added.
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
                placeholder="How did CalcTutor help you learn button sequences or solve class problems?"
                required
              />
            </div>

            <button type="submit" className="button button-primary width-full">
              Post Review
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
