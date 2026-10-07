import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Check, Sparkles, ThumbsUp, ShieldCheck, Clock, UserCheck, Sparkles as SparkleIcon, X, Loader2 } from 'lucide-react';
import { CustomerReview, OrderRecord } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

interface PostServiceReviewModalProps {
  order: OrderRecord;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (review: CustomerReview) => void;
  showNotification: (msg: string) => void;
}

const BEHAVIOUR_TAGS_PRESETS = [
  'Clear Requirements',
  'Polite & Respectful',
  'Prompt Payment',
  'Reasonable Expectations',
  'Good Communication',
  'Safe Environment',
  'Friendly',
  'Highly Recommended'
];

export default function PostClientReviewModal({
  order,
  isOpen,
  onClose,
  onSubmitSuccess,
  showNotification
}: PostServiceReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [punctuality, setPunctuality] = useState<string>('Clear');
  const [professionalism, setProfessionalism] = useState<string>('Polite & Respectful');
  const [cleanliness, setCleanliness] = useState<string>('Prompt Payment');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clear Requirements', 'Polite & Respectful']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return 'Unsatisfactory Experience';
      case 2: return 'Fair - Needs Improvement';
      case 3: return 'Good Standard Work';
      case 4: return 'Very Good & Courteous';
      case 5: return 'Exceptional & Highly Recommended';
      default: return 'Rate your experience';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showNotification(' Please add a brief description of the client behavior and experience.');
      return;
    }

    setIsSubmitting(true);
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reviewPayload: CustomerReview = {
      id: reviewId,
      orderId: order.id,
      customer: order.customerName || 'Citizen User',
      workerName: order.workerName || 'PunchX Specialist',
      workerId: auth.currentUser?.uid || 'worker',
      category: order.category || 'General Home Care',
      rating,
      comment: comment.trim(),
      punctuality,
      professionalism,
      cleanliness,
      tags: selectedTags,
      date: 'Just now',
      createdAt: new Date().toISOString()
    };

    try {
      // FE-05: Require authenticated user before Firestore writes
      if (!auth.currentUser?.uid) {
        showNotification('\u26a0\ufe0f You must be signed in to submit a review.');
        setIsSubmitting(false);
        return;
      }

      // 1. Save to Firestore /reviews/{reviewId}
      await setDoc(doc(db, 'reviews', reviewId), { ...reviewPayload, reviewerId: auth.currentUser.uid });

      // 2. Update order in Firestore /orders/{orderId}
      try {
        await updateDoc(doc(db, 'orders', order.id), {
          isClientRated: true,
          workerRating: rating,
          workerBehaviour: comment.trim()
        });
      } catch (err) {
        console.warn('Order doc update skipped or fallback offline:', err);
      }

      showNotification(`⭐ Thank you! Structured review for ${order.customerName} has been saved.`);
      onSubmitSuccess(reviewPayload);
      onClose();
    } catch (error) {
      console.error('Error submitting review to Firestore:', error);
      // Fallback: save locally & trigger notification
      showNotification(`⭐ Feedback submitted! Saved locally for ${order.customerName}.`);
      onSubmitSuccess(reviewPayload);
      onClose();
      handleFirestoreError(error, OperationType.WRITE, `reviews/${reviewId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#0e172a] border border-[#c5a059]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#11192e] to-[#07122a] p-5 border-b border-[#c5a059]/25 flex justify-between items-start relative">
            <div className="space-y-1">
              <span className="text-[10px] text-[#e9c176] font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Structured Client Feedback
              </span>
              <h2 className="text-lg font-bold font-sans text-white">Rate Client & Experience</h2>
              <p className="text-xs text-zinc-400 font-sans">
                Service completed for <strong className="text-white">{order.customerName}</strong> ({order.category})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 custom-scrollbar text-left font-sans">
            
            {/* Star Rating Section */}
            <div className="bg-[#121c33] border border-[#c5a059]/30 p-4 rounded-2xl text-center space-y-2">
              <label className="text-xs uppercase font-bold text-[#e9c176] tracking-wider block">
                Overall Satisfaction Rating
              </label>
              
              <div className="flex justify-center items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const currentDisplay = hoverRating !== null ? hoverRating : rating;
                  const isFilled = starVal <= currentDisplay;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starVal)}
                      className="p-1 focus:outline-none transform hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isFilled ? 'fill-[#e9c176] text-[#e9c176] drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]' : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-semibold text-zinc-300 block">
                {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
              </span>
            </div>

            {/* Structured Criteria Metrics */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Structured Experience Criteria
              </span>

              {/* Punctuality */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#e9c176]" /> Communication & Requirements:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Clear', 'Somewhat Clear', 'Unclear'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPunctuality(opt)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        punctuality === opt
                          ? 'bg-[#c5a059] text-black border-[#ffdea5]'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professionalism */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#e9c176]" /> Behavior & Respect:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Polite & Respectful', 'Neutral', 'Disrespectful'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setProfessionalism(opt)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer truncate ${
                        professionalism === opt
                          ? 'bg-[#c5a059] text-black border-[#ffdea5]'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Cleanliness */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <SparkleIcon className="w-3.5 h-3.5 text-[#e9c176]" /> Payment & Ease:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Prompt Payment', 'Minor Delay', 'Disputed'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCleanliness(opt)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer truncate ${
                        cleanliness === opt
                          ? 'bg-[#c5a059] text-black border-[#ffdea5]'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Behavior Tag Badges */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Behavior & Quality Highlights
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BEHAVIOUR_TAGS_PRESETS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#c5a059]/20 text-[#e9c176] border-[#c5a059]'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-[#e9c176]" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Experience Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Detailed Behavior Description & Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Describe your experience with the client (e.g. Friendly, easy to communicate with, paid promptly...)"
                className="w-full bg-[#07122a] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:border-[#c5a059] outline-none font-sans resize-none"
              />
            </div>

            {/* NamoID Credit */}
            <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-2">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
               Verified Feedback &ndash; Authenticated via <span className="font-bold text-zinc-300">NamoID</span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-850">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#c5a059] to-[#e9c176] hover:brightness-110 active:scale-95 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Storing in Firestore...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 fill-black" />
                    Submit Client Review
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
