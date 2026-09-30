# PUNCHX Citizen Panel — Finishing Blueprint

This is the single source of truth for the citizen-side finishing pass before the worker-panel redesign. Existing backend, Firebase data, authentication, branding and service data must be preserved wherever possible.

## A. Implemented in the current finishing pass

### QA / demo environment
- [x] Demo professionals are namespaced with `demo-` IDs.
- [x] Demo services can appear for all PunchX categories when QA mode is enabled.
- [x] Demo data is clearly labelled and separated from real professionals.
- [x] Production QA flag: `VITE_ENABLE_DEMO_PROFESSIONALS=true`.
- [x] Demo data remains removable without deleting real users.

### Commerce
- [x] Central commission calculator.
- [x] Current commission table: ₹49 5%, ₹300 8%, ₹800 10%, ₹1,500 12%, ₹3,000 15%, ₹5,000 18%, ₹10,000 20%, ₹20,000+ 23%.
- [x] Citizen PunchX platform/protection fee: ₹10.
- [x] Professional commission is deducted from professional payout, not added again to the citizen bill.
- [x] Commission, citizen fee, professional payout and PunchX gross revenue are stored on orders.
- [x] Specific-professional preference fee rule: first 3 completed bookings with the same professional are free; from booking 4 onward, 5% of service value is charged to the citizen.
- [x] Auto-match/random professional selection has no preference fee.
- [x] Checkout explains the separate fee lines.

### Professional choice
- [x] Citizen can choose a specific professional.
- [x] Citizen can use PunchX Auto-Match instead.
- [x] Demo and approved real professionals can appear in the selection list.
- [x] Professional profile information includes rating, reviews, jobs, availability and verification fields where available.
- [x] Completed bookings with the selected professional are checked from the backend before calculating the preference fee.

### Booking protection foundation
- [x] Booking records include dispatch mode and personal-selection metadata.
- [x] Warranty metadata is attached to newly created bookings.
- [x] Booking timeline stages are recorded: BOOKED → PROFESSIONAL_MATCH → ARRIVAL → WORK_STARTED → ADDITIONAL_WORK_APPROVAL → COMPLETION → INVOICE → WARRANTY → REVIEW.
- [x] Service-proof fields are reserved on the order.
- [x] Existing warranty and complaint components remain part of the app.

## B. Citizen-side features to finish next

### Trust & choice
- [ ] Full professional profile screen with verification passport.
- [ ] Favourite professional / rebook button.
- [ ] Two-sided customer/professional rating workflow.
- [ ] Explicit automatic reassignment UI when a professional cancels.

### Transparent service models
- [ ] Fixed-price booking polish.
- [ ] Hourly booking mode.
- [ ] Request-a-quote mode.
- [ ] Quote comparison: price + rating + ETA + verification + experience.
- [ ] Multi-service cart / one-visit booking.
- [ ] Materials/parts line items.
- [ ] Additional Work Approval: professional requests extra labour/material; citizen approves/rejects before it affects the order.

### Protection
- [ ] Citizen booking timeline screen.
- [ ] Arrival OTP / start-work OTP and completion OTP.
- [ ] Before/after proof upload for eligible categories.
- [ ] Digital invoice with service, labour, materials, fees and warranty.
- [ ] Category-specific warranty display.
- [ ] Warranty claim and warranty rebooking UX using the existing claim backend.
- [ ] Complaint/dispute UX using the existing complaint backend.

### PunchX differentiators
- [ ] AI Service Diagnosis: text/photo/video → clarifying questions → category → booking type.
- [ ] Home Passport: home/appliance/service history, professional, work, materials, invoice and warranty.
- [ ] Smart Maintenance reminders based on real service history.
- [ ] PunchX Instant: show an ETA only when a suitable professional is genuinely available.
- [ ] PunchX Emergency: urgent-service flow with category-specific eligibility/pricing.
- [ ] Secure in-app chat tied to the booking.

### Community / B2B2C
- [ ] PunchX Community / RWA dashboard.
- [ ] Approved professional pool per community.
- [ ] Resident booking and visit records.
- [ ] Community complaints and service analytics.

## C. Production gates

- [ ] Configure a real payment gateway; never fake online-payment success.
- [ ] Confirm marketplace settlement/commission accounting.
- [ ] Test refunds, chargebacks and gateway fees.
- [ ] Finalize tax/GST treatment with accounting advice.
- [ ] Verify production webhooks and security rules.
- [ ] Turn off `VITE_ENABLE_DEMO_PROFESSIONALS` before public launch.

## D. QA test matrix

1. ₹49 booking — 5% commission + ₹10 citizen fee.
2. ₹300 — 8% + ₹10.
3. ₹800 — 10% + ₹10.
4. ₹1,500 — 12% + ₹10.
5. ₹3,000 — 15% + ₹10.
6. ₹5,000 — 18% + ₹10.
7. ₹10,000 — 20% + ₹10.
8. ₹20,000 — 23% + ₹10.
9. Auto-match/random — no personal-selection fee.
10. Specific professional booking #1 — no preference fee.
11. Specific professional booking #2 — no preference fee.
12. Specific professional booking #3 — no preference fee.
13. Specific professional booking #4 — 5% preference fee.
14. Switch from specific professional to Auto-Match — preference fee becomes zero.
15. Demo professional in every category.
16. Real approved professional + demo professional coexist.
17. Professional cancellation → reassignment.
18. Additional-work request → approve/reject.
19. Warranty claim.
20. Complaint/dispute.
21. Rebook same professional.
22. Hourly booking.
23. Quote comparison.
24. Multi-service booking.
25. Emergency booking.
26. Home Passport / service history.

## E. Demo data policy

Demo professionals/services are QA-only. They must always be visibly marked `DEMO`. They must never be represented as real PunchX workers. When the product owner says “delete the demo accounts”, remove/disable the single demo module and QA flag; do not delete genuine professional or customer data.

## F. Worker-panel phase

After the citizen-panel QA gate passes, redesign the worker side as a separate controlled phase. The worker redesign must consume the same booking/commerce/trust rules rather than creating a second incompatible system.
