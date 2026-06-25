# ARIA Deployment Checklist (Vercel + Supabase)

## 1. Supabase Setup

### Database
- [ ] Run `ARIA-Database-Schema.sql` in Supabase SQL Editor
- [ ] Enable Realtime on the `notifications` table (Dashboard → Database → Replication)
- [ ] Verify Row Level Security policies are active
- [ ] (Optional) Create indexes if performance becomes an issue

### Authentication
- [ ] Enable Email + Password authentication (or the providers you use)
- [ ] Set up redirect URLs for production (`https://yourdomain.com/auth/callback`)
- [ ] Configure email templates (welcome, password reset, etc.)

### Environment Variables (Supabase)
Add these in Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server-side only
```

## 2. Vercel Deployment

### Project Setup
- [ ] Connect your GitHub repo to Vercel
- [ ] Set Framework Preset to **Next.js**
- [ ] Set Root Directory to your project root (if monorepo)

### Environment Variables (Vercel)
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY=sk-ant-...          # If using Claude fallback
```

### Build Settings
- Build Command: `npm run build` (or `yarn build`)
- Output Directory: `.next`
- Install Command: `npm install`

## 3. Domain & DNS (Optional but Recommended)

- [ ] Add custom domain in Vercel
- [ ] Update DNS records (CNAME or A record)
- [ ] Enable HTTPS (automatic on Vercel)

## 4. Post-Deployment Checks

### Functionality
- [ ] Landing page loads correctly
- [ ] User can sign up / log in
- [ ] Onboarding flow works end-to-end
- [ ] Dashboard loads with correct data
- [ ] Quizzes work and save progress
- [ ] Real-time notifications appear instantly
- [ ] Email sequences are triggering correctly

### Performance & Monitoring
- [ ] Set up Vercel Analytics (optional but recommended)
- [ ] Monitor Supabase usage (especially Realtime connections)
- [ ] Check error logs in Vercel and Supabase

## 5. Email Service Setup (Recommended)

Choose one:
- **Customer.io** (best for complex flows)
- **Klaviyo** (great segmentation)
- **Resend** or **SendGrid** (simpler transactional)

Add the corresponding API keys as environment variables.

## 6. Final Production Steps

- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Update redirect URLs in Supabase Auth settings
- [ ] Test password reset and email verification flows
- [ ] Set up monitoring/alerts for critical errors
- [ ] Create a backup plan for Supabase (daily backups are automatic on paid plans)

---

**Deployment is usually straightforward** once the environment variables and database schema are in place.

Would you like a **one-click deployment guide** or help with any specific step?