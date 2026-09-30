# PUNCHX Product Build Plan — MVP to Full Marketplace

This document is the implementation checklist for the features discussed in the PunchX product/competitor research. It is intentionally staged so the existing MVP can be strengthened without replacing working flows unnecessarily.

## 0. Test foundation — NOW

- [x] Demo professional mode behind `VITE_ENABLE_DEMO_PROFESSIONALS=true` (also enabled in local development).
- [ ] Demo profiles for every PunchX service category.
- [ ] Clear `DEMO` labels on every test profile.
- [ ] Demo-only data must never be described as a real professional.
- [ ] Keep demo data easy to remove later through one data/config module.
- [ ] Test fixed-price, hourly, quote, emergency and recurring booking paths.

## 1. Commerce / pricing — NOW

Current MVP rules from the agreed PunchX booking table:

| Service value | Commission | PunchX commission | Citizen platform fee | PunchX gross revenue |
|---:|---:|---:|---:|---:|
| ₹49 | 5% | ₹2.45 | ₹10 | ₹12.45 |
| ₹300 | 8% | ₹24 | ₹10 | ₹34 |
| ₹800 | 10% | ₹80 | ₹10 | ₹90 |
| ₹1,500 | 12% | ₹180 | ₹10 | ₹190 |
| ₹3,000 | 15% | ₹450 | ₹10 | ₹460 |
| ₹5,000 | 18% | ₹900 | ₹10 | ₹910 |
| ₹10,000 | 20% | ₹2,000 | ₹10 | ₹2,010 |
| ₹20,000 | 23% | ₹4,600 | ₹10 | ₹4,610 |

Implementation rule: commission is a professional-side deduction; the citizen-facing checkout adds the separate ₹10 PunchX platform/protection fee. Do not add the commission again to the citizen bill.

- [x] Centralized commission calculator.
- [ ] Show fee breakdown before confirmation.
- [ ] Store commission, citizen fee and professional payout on every order.
- [ ] Add admin reporting for GMV, commission revenue and citizen-fee revenue.
- [ ] Add refunds/discount handling to the same calculation engine.
- [ ] Keep tax treatment configurable; do not hard-code a production GST assumption without the final accounting/tax setup.

## 2. Trust & professional marketplace — NOW

- [ ] Professional profile card.
- [ ] ID verification badge.
- [ ] Skill verification badge.
- [ ] Background-check status where applicable.
- [ ] Training/certification badge.
- [ ] Insurance status where applicable.
- [ ] Completed jobs.
- [ ] Rating/review count.
- [ ] On-time rate.
- [ ] Availability.
- [ ] Distance/area.
- [ ] Choose a professional OR let PunchX auto-match.
- [ ] Favorite/rebook the same professional.
- [ ] Two-sided customer/professional ratings.

## 3. Booking lifecycle — NOW

`Discover → Diagnose → Select service → Select/auto-match professional → Address → Date/time → Price → Checkout → OTP arrival → Work → Additional-work approval → Completion OTP → Invoice → Warranty → Review → Rebook`

- [ ] OTP check-in/check-out.
- [ ] Booking timeline/status.
- [ ] Automatic reassignment if a professional cancels.
- [ ] Cancellation/reschedule rules.
- [ ] Secure in-app chat.
- [ ] Before/after proof for eligible jobs.
- [ ] Digital invoice.
- [ ] Complaint/dispute workflow.

## 4. Transparent work and pricing — NEXT

- [ ] Fixed-price service.
- [ ] Hourly service.
- [ ] Request-a-quote service.
- [ ] Multi-service cart / one-visit booking.
- [ ] Parts/material line items.
- [ ] Additional Work Approval: customer explicitly approves extra labour/material before it is added.
- [ ] Quote comparison: price + rating + ETA + verification + experience.

## 5. Protection — NEXT

- [x] Existing warranty data model retained.
- [ ] Customer-facing warranty summary on booking.
- [ ] Category-specific warranty duration.
- [ ] Warranty claim flow.
- [ ] Warranty rebooking without charging the customer where the policy says PunchX covers the revisit fee.
- [ ] Evidence and dispute audit trail.

## 6. PunchX differentiators — NEXT

### PunchX AI Service Diagnosis
Photo/video/text → clarifying questions → likely service category → recommended booking type → relevant professionals.

### PunchX Home Passport
Per-home service history:
- appliance/service history
- professional used
- work performed
- parts/materials
- invoice
- warranty expiry
- next maintenance suggestion

### Smart Maintenance
Use the Home Passport to generate non-urgent service reminders based on the actual service history.

### PunchX Instant
Only show an instant ETA when a suitable professional is genuinely available in the service area. Never fabricate an ETA.

### PunchX Emergency
Separate urgent-service flow with category-specific eligibility and pricing.

### Professional AI Assistant
Help professionals with job notes, quote drafting, checklists, invoices and customer communication.

## 7. Community / B2B2C — LATER

### PunchX Community
- Society/RWA dashboard
- approved professional pool
- resident bookings
- entry/visit records
- complaints
- service analytics
- community offers

### Professional benefits
Potential later integrations for insurance, training, financial services and professional development.

## 8. Payments — production gate

Current app must not fake online payment success. Keep cash-on-service testing available until a real payment gateway is configured.

Before production online payments:
- [ ] Razorpay/payment provider account and KYC completed.
- [ ] Marketplace/route-split settlement model confirmed.
- [ ] Refund and chargeback handling tested.
- [ ] Gateway fees recorded separately from PunchX revenue.
- [ ] Accounting/tax treatment reviewed.
- [ ] Production webhooks verified.

## 9. Admin controls

- [ ] Service catalogue management.
- [ ] Professional approval/suspension.
- [ ] Demo-mode visibility toggle.
- [ ] Commission settings.
- [ ] Citizen platform-fee setting.
- [ ] Warranty settings.
- [ ] Emergency pricing settings.
- [ ] Booking reassignment.
- [ ] Complaints/warranty claims.
- [ ] Revenue and payout reporting.

## 10. Release/testing gates

Every feature should be tested with demo data first.

### Test scenarios
1. Low-value ₹49 booking.
2. ₹300 booking.
3. ₹800 booking.
4. ₹1,500 booking.
5. ₹3,000 booking.
6. ₹5,000 booking.
7. ₹10,000 booking.
8. ₹20,000 booking.
9. Professional selection.
10. Auto-match.
11. Professional cancellation → reassignment.
12. Additional-work approval.
13. Warranty claim.
14. Complaint/dispute.
15. Rebooking same professional.
16. Multi-service booking.
17. Quote comparison.
18. Hourly booking.
19. Emergency booking.
20. Demo professional in every service category.

## Demo data removal

All demo professionals are namespaced with `demo-` IDs and must remain clearly labelled. When the product owner says to remove the test data, delete/disable the single demo data module and turn off demo mode; do not delete real professional/customer data.
