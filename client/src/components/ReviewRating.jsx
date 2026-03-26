import { useState } from "react";
import { Star, Send, X, CheckCircle } from "lucide-react";
import axios from "axios";
import { API_URL } from "../utils/api";

export default function ReviewRating({ 
  appointment, 
  onClose, 
  onSubmitSuccess,
  isStandalone = false 
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const lawyerName = appointment?.lawyerName || appointment?.lawyerId?.name || "the lawyer";
  const lawyerId = appointment?.lawyerId?._id || appointment?.lawyerId;
  const appointmentId = appointment?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!lawyerId || !appointmentId) {
      setError("Missing appointment or lawyer information");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          lawyerId,
          appointmentId,
          rating,
          comment: comment.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(true);
      
      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess(response.data);
          if (onClose) onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setError(
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${isStandalone ? "w-full" : "w-full max-w-md"} text-center`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
        <p className="text-gray-500">Your review has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 ${isStandalone ? "w-full max-w-lg mx-auto" : "w-full max-w-md"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Rate Your Experience</h3>
          <p className="text-sm text-gray-500 mt-1">
            How was your appointment with {lawyerName}?
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transform hover:scale-110 transition-transform"
            >
              <Star
                size={36}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center mt-2 text-sm text-gray-600">
          {rating === 5 && "Excellent!"}
          {rating === 4 && "Very Good"}
          {rating === 3 && "Good"}
          {rating === 2 && "Fair"}
          {rating === 1 && "Poor"}
        </p>
      </div>

      {/* Comment Textarea */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-400 mt-1">
            Your feedback helps others make informed decisions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
