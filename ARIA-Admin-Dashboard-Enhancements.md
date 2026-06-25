# ARIA Admin Dashboard Enhancements

## Overview

This document outlines recommended enhancements for an Admin Dashboard to manage ARIA as a standalone product.

---

## Core Admin Features

### 1. User Management
- View all users with search/filter
- See current readiness, streak, last active date
- Manually adjust readiness or weak domains (for support)
- Impersonate user (view their dashboard)

### 2. Question Bank Management
- Use the existing `AdminQuestionManager.tsx` as a base
- Add bulk import (CSV/JSON)
- Edit existing questions
- Version control for questions
- Analytics on question performance (correct rate, difficulty rating)

### 3. Analytics Dashboard
**Key Metrics to Track:**
- Total active users
- Trial → Paid conversion rate
- Average readiness improvement
- Most common weak domains
- Quiz completion rate
- Churn rate by cohort

### 4. Notification Management
- Send manual notifications to users or segments
- View notification delivery stats
- A/B test notification copy

### 5. Content & Curriculum
- Manage study plan templates
- Create targeted campaigns (e.g., "Users weak in Annuities")
- Upload additional learning resources

---

## Recommended Tech for Admin Dashboard

- Use **shadcn/ui** + Tailwind for fast beautiful UI
- Use **TanStack Table** for data tables
- Use **Recharts** or **Tremor** for analytics charts
- Protect all admin routes with role-based access (e.g., `role === 'admin'`)

---

## Quick Wins

1. **User List + Search** (highest immediate value)
2. **Question Bank Manager** (already partially built)
3. **Basic Analytics Cards** (MAU, conversion, average readiness)
4. **Manual Notification Sender**

---

## File to Start With

You already have `AdminQuestionManager.tsx`. The next most valuable addition would be a **User Management table**.

Would you like me to create a **User Management table component** next?