# ARIA Win-Back SMS Strategy

## Overview
This document outlines a respectful, compliant SMS strategy to win back cancelled or long-inactive ARIA users. SMS has significantly higher open rates than email (~98% vs ~20%), but it must be used sparingly and with clear value.

**Important**: SMS requires explicit consent. Only send messages to users who have opted in to SMS communications.

---

## Recommended Cadence

| Message | Timing                  | Purpose                          | Type          |
|---------|-------------------------|----------------------------------|---------------|
| SMS 1   | Day 7 after cancellation| Gentle check-in                  | Value         |
| SMS 2   | Day 14                  | Easy win + reminder              | Value         |
| SMS 3   | Day 21                  | Limited-time win-back offer      | Offer         |
| SMS 4   | Day 35                  | Final attempt (optional)         | Last chance   |

**Rule of thumb**: Never send more than 1 SMS per week during a win-back sequence.

---

## SMS Message Examples

### SMS 1: Day 7 Check-in (Gentle)

**Message:**
```
Hi [First Name], this is ARIA. We noticed you cancelled recently. No pressure — just checking in. Your progress is still saved if you want to return. Reply STOP to unsubscribe.
```

**Why it works**: Short, low-pressure, reminds them of saved progress.

---

### SMS 2: Day 14 – Easy Win

**Message:**
```
Hi [First Name], quick 3-min quiz waiting in ARIA if you want an easy win today. Your weak areas are still tracked. Reply STOP to opt out.
```

**Why it works**: Offers a low-friction action and reminds them of personalization.

---

### SMS 3: Day 21 – Win-Back Offer (Highest Leverage)

**Message:**
```
Hi [First Name], we’d love to have you back on ARIA. Use code COMEBACK40 for 40% off your next 3 months. Valid 7 days. Reply STOP to unsubscribe.
```

**Why it works**: Clear offer + urgency + easy redemption.

---

### SMS 4: Day 35 – Final Attempt (Use sparingly)

**Message:**
```
Hi [First Name], last message from ARIA. Your account is still here if you need help with your exam. COMEBACK40 still works for 40% off. Reply STOP to unsubscribe.
```

**Why it works**: Creates a sense of finality while still offering value.

---

## Best Practices

### 1. Compliance (Critical)
- Only send SMS to users who have **explicitly opted in** to text messages.
- Always include **"Reply STOP to unsubscribe"** in every message.
- Comply with TCPA regulations (United States).
- Keep records of SMS consent.

### 2. Frequency
- Maximum **1 SMS per week** during win-back.
- Avoid sending SMS at odd hours (best times: 10am – 7pm local time).

### 3. Personalization
- Use first name when possible.
- Reference their specific exam type or state if available.
- Reference saved progress when relevant.

### 4. Message Length
- Keep messages under **160 characters** when possible (single SMS).
- Avoid long links — use short, branded links if needed (e.g., `aria.co/comeback`).

### 5. Segmentation
- Send stronger offers to users who were more engaged before cancelling.
- Send gentler messages to users who barely engaged.

---

## Recommended Tech Stack

| Tool                  | Use Case                          | Notes |
|-----------------------|-----------------------------------|-------|
| **Twilio**            | SMS sending                       | Most popular, reliable |
| **Customer.io**       | Trigger-based messaging           | Good for combining email + SMS |
| **Klaviyo**           | Ecommerce-style flows             | Strong segmentation |
| **Attentive**         | SMS marketing platform            | Built specifically for SMS |
| **Postscript**        | Shopify-style SMS                 | Easy to use |

---

## Integration with Email Sequences

**Recommended Approach:**

- Run the **Email Win-back Sequence** first (more detailed).
- Layer in **SMS** at key moments for higher visibility:
  - Day 7 SMS (complements Email 1)
  - Day 21 SMS (supports the big offer in Email 3)

**Do not** send both email and SMS on the same day unless the messages are highly coordinated.

---

## Metrics to Track

- SMS open rate (usually very high)
- Click-through rate on links
- Reactivation / win-back conversion rate
- Unsubscribe rate
- Complaints / spam reports

---

## Summary Recommendation

| Phase              | Channel     | Frequency     | Offer Strength |
|--------------------|-------------|---------------|----------------|
| Early re-engagement| Email       | Higher        | Low            |
| Mid re-engagement  | Email + SMS | Moderate      | Medium         |
| Strong win-back    | Email + SMS | Low           | High (40%+)    |
| Final attempt      | SMS only    | Very low      | Strong         |

---

**Would you like me to also create**:
- Subject line + SMS copy variations for A/B testing?
- A combined **Email + SMS journey map**?
- An **in-app win-back notification strategy**?

Just let me know what to build next.