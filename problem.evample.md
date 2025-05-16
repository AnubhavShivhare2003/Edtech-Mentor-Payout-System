Payout Automation System for EdTech Mentors
Scenario
As EdTech platforms scale, they rely on hundreds of mentors, instructors, and evaluators working across different time zones and formats — live sessions, recorded reviews, evaluations, etc. Tracking and disbursing accurate payouts becomes a nightmare: multiple session types, varying rates, tax considerations, and poor communication make things inefficient and non-transparent.
Your challenge is to build — a secure, flexible, and auditable payout automation platform that streamlines how EdTech companies manage payments to mentors and educators.
Objective
Create a system where the EdTech admin can:
* Collect session data linked to mentors
* Automate calculation of payouts with custom rate breakdowns
* Generate structured receipts including taxes and charges
* Share receipts with mentors instantly
* Communicate with mentors securely
* View historical audit logs and payout records
Mentors should:
* View their session history and payout breakdown
* Access downloadable receipts
* Chat with the organization for clarifications
User Roles
1. Admin (EdTech Organization)
   * Add session/payout data
   * Define breakdown logic and taxes
   * Generate & send receipts
   * Chat with mentors
   * View audit trail
2. Mentor (Contributor)
   * View payout dashboard
   * Download receipts
   * Chat with admin
   * Track payment status
Core Functional Modules
1. Session Data Collection & Breakdown Logic
* Admin can enter mentor session data (manual or CSV upload)
   * Fields: Mentor name, session date/time, session type, duration, rate/hour
* Smart breakdown: e.g., ₹4000/hour rate is auto-divided into custom slots (₹2000 for 30 mins, etc.)
* Filter sessions by date range (last 7, 15, 30 days or custom)
* Calculate cumulative payout within selected range
2. Automated Payout Calculation & Tax Handling
* Apply platform fee, GST, or custom charges
* Support deductions (if applicable)
* Final amount payable should be clear and transparent
* Allow manual overrides if needed (with logging)
3. Receipt Generation & Sharing
* Generate structured receipts per mentor:
   * Task list with time and rate
   * Tax/charge breakdown
   * Final payout amount
* Add a custom message
* One-click send via email to mentor
4. Mentor Dashboard
* View session and payout history
* Filter by date ranges
* Download receipts
* Track payment status (Pending, Paid, Under Review)
5. Secure Chat Between Admin and Mentor
* One-to-one encrypted chat
* Useful for clarifying payout doubts
* Shows timestamped communication logs
6. Audit Logs & Modification History
* Every change to payout data or receipt must be logged:
   * What changed, who changed it, and when
* Admin can view historical modifications for transparency
7. Test Mode / Simulation
* Admin can run a “dry run” to preview payouts before sending
* Useful for reviewing payout structures before confirmation
8. Optional: Data Export & Integration Hooks
* Export payout summaries as CSV for accounting
* Optional webhook trigger when payouts are finalized
🛠️ Bonus Complexity (Optional for Bonus Points)
* Support multiple session types (Live, Evaluation, Recording Review)
* Add mentor-level rate overrides (e.g., ₹4000/hr for Mentor A, ₹3000/hr for Mentor B)
* Allow mentors to submit payout disputes or correction requests

can you make some notes for this
frontend and backend as well
using tech stack:- React+vite, NodeJS