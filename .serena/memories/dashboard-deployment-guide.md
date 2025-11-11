# Carve Wiki Dashboard - Deployment Guide

**Version**: 1.0.0 (MVP)  
**Last Updated**: 2025-01-10  
**Status**: Production Ready

## Pre-Deployment Checklist

### Database Setup
- [x] All migrations applied to production database
- [x] Database triggers functional and tested
- [x] RLS policies enabled on all tables
- [x] Database functions created
- [ ] **ACTION REQUIRED**: Seed achievements data (optional but recommended)

### Environment Variables
Ensure these are set in production environment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Application Verification
- [x] Production build successful
- [x] TypeScript compilation clean
- [x] All 17 routes accessible
- [x] Error boundaries implemented
- [x] Loading states implemented
- [x] Real data integration (no mock data)

## Deployment Steps

### Step 1: Database Preparation

1. **Verify Database Schema**
   ```sql
   -- Check all tables exist
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   
   -- Expected tables:
   -- profiles, user_stats, workouts, exercises, meals
   -- friendships, activity_feed, achievements, user_achievements
   ```

2. **Verify Triggers**
   ```sql
   -- Check triggers exist
   SELECT trigger_name, event_object_table, action_statement
   FROM information_schema.triggers
   WHERE trigger_schema = 'public';
   
   -- Expected triggers:
   -- on_workout_inserted, on_exercise_inserted, on_meal_inserted
   -- on_achievement_unlocked, on_stats_updated_check_achievements
   -- on_friendship_status_changed
   ```

3. **Verify RLS Policies**
   ```sql
   -- Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- All tables should have rowsecurity = true
   ```

4. **Seed Achievements (Optional but Recommended)**
   ```sql
   -- Basic achievements should already exist
   SELECT code, name, tier FROM achievements ORDER BY code;
   
   -- Expected: first_workout, first_meal, first_pr, first_friend
   -- level_5, level_10, workout_10, workout_50, streak_3, streak_7, etc.
   ```

### Step 2: Application Deployment

#### Option A: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   # Via Vercel Dashboard or CLI
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_SITE_URL
   ```

3. **Deploy**
   ```bash
   # Preview deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

#### Option B: Self-Hosted

1. **Build Application**
   ```bash
   pnpm install
   pnpm run build
   ```

2. **Start Production Server**
   ```bash
   # Option 1: Node.js
   pnpm start
   
   # Option 2: PM2
   pm2 start npm --name "carve-wiki" -- start
   
   # Option 3: Docker
   docker build -t carve-wiki .
   docker run -p 3000:3000 carve-wiki
   ```

3. **Set Up Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Step 3: Post-Deployment Verification

1. **Test Authentication**
   - [ ] Sign up new user
   - [ ] Verify profile created automatically
   - [ ] Verify user_stats row created
   - [ ] Login existing user

2. **Test Workout Tracking**
   - [ ] Log a workout with exercises
   - [ ] Verify XP awarded (check user_stats.total_xp)
   - [ ] Verify workout appears in history
   - [ ] Verify activity feed entry created
   - [ ] Log another workout to test PR detection

3. **Test Nutrition Tracking**
   - [ ] Log a meal
   - [ ] Verify XP awarded
   - [ ] Verify daily totals calculate correctly
   - [ ] Verify meal appears in history

4. **Test Social Features**
   - [ ] Search for users
   - [ ] Send friend request
   - [ ] Accept friend request (use second account)
   - [ ] Verify friend appears in list
   - [ ] Verify activity appears in social feed
   - [ ] Verify dashboard highlights show friend activity

5. **Test Error Handling**
   - [ ] Test with invalid data
   - [ ] Verify error boundaries show friendly messages
   - [ ] Verify "Try Again" button works
   - [ ] Check console for error logging

6. **Test Loading States**
   - [ ] Verify skeleton loaders appear
   - [ ] Test on slow network (Chrome DevTools)
   - [ ] Verify smooth transitions

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **Application Health**
   - Response times (target: <1s for dashboard)
   - Error rates (target: <1%)
   - Uptime (target: 99.9%)

2. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Database size growth

3. **User Engagement**
   - Daily active users (DAU)
   - Workouts logged per day
   - Meals logged per day
   - Friend connections made
   - Average XP per user

### Database Maintenance

**Weekly Tasks**:
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM exercises WHERE workout_id NOT IN (SELECT id FROM workouts);
SELECT COUNT(*) FROM user_achievements WHERE user_id NOT IN (SELECT id FROM profiles);

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Monthly Tasks**:
```sql
-- Vacuum and analyze tables
VACUUM ANALYZE workouts;
VACUUM ANALYZE exercises;
VACUUM ANALYZE meals;
VACUUM ANALYZE activity_feed;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Application Logs

**What to Monitor**:
- Authentication errors
- Database connection errors
- Form submission failures
- API rate limit hits
- Unusual XP patterns (potential exploits)

**Recommended Logging Service**:
- Vercel: Built-in logging
- Self-hosted: Winston + CloudWatch/Datadog

## Scaling Considerations

### Database Scaling (>1000 users)
- Enable Supabase connection pooling
- Add read replicas for queries
- Archive old activity_feed entries (>90 days)
- Consider partitioning large tables

### Application Scaling
- Enable Next.js caching headers
- Implement React Query for client caching
- Consider CDN for static assets
- Monitor bundle size (currently optimized)

### Performance Targets
- **Page Load**: <1s (p95)
- **Database Queries**: <100ms (p95)
- **API Responses**: <500ms (p95)

## Troubleshooting

### Common Issues

**Issue**: Users not getting XP after logging workout
- **Check**: Verify trigger `on_workout_inserted` exists
- **Check**: Run manually: `SELECT handle_workout_insert()` with test data
- **Check**: Verify `user_stats` table has row for user

**Issue**: Friend activity not showing in feed
- **Check**: Verify friendship status is 'accepted'
- **Check**: Verify activity_feed has `is_public = true`
- **Check**: Query manually to debug

**Issue**: Loading states not appearing
- **Check**: Verify Suspense boundaries in place
- **Check**: Check React version (should be 19)
- **Check**: Clear browser cache

**Issue**: 500 errors on dashboard
- **Check**: Database connection
- **Check**: RLS policies allow user access
- **Check**: Error boundaries catch and display

## Rollback Procedure

If critical issues occur:

1. **Immediate Rollback** (Vercel)
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   ```sql
   -- If needed, restore from backup
   -- Supabase provides automatic backups
   ```

3. **Communication**
   - Notify users via status page
   - Provide ETA for fix
   - Document incident for post-mortem

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Service role key kept secret (server-side only)
- [x] Anon key is public-safe
- [x] HTTPS enforced
- [ ] Rate limiting configured (recommended)
- [ ] CORS headers configured
- [ ] CSP headers configured (recommended)

## Backup Strategy

**Automated Backups** (Supabase):
- Daily snapshots (retained 7 days)
- Point-in-time recovery (up to 7 days)

**Manual Backups** (Recommended monthly):
```bash
# Export database
pg_dump -h your-db-host -U postgres -d your-db > backup-$(date +%Y%m%d).sql

# Export to Supabase Storage for redundancy
```

## Support & Maintenance

### Known Limitations
1. No real-time updates (requires page refresh)
2. Fixed pagination limits (50 items)
3. Basic error messages (no detailed logging to users)
4. No image upload for avatars yet

### Planned Enhancements (Phase 7-8)
- Level-up celebration animations
- Achievement toast notifications
- Global leaderboards
- Enhanced error boundaries
- React Query caching
- Comprehensive testing

## Success Criteria

**MVP Launch Success** = All checked:
- [ ] 10+ users signed up
- [ ] 50+ workouts logged
- [ ] 20+ meals logged
- [ ] 5+ friend connections
- [ ] No critical errors
- [ ] Average page load <2s
- [ ] Positive user feedback

## Contact & Support

**Technical Issues**: Check error logs first
**Database Issues**: Contact Supabase support
**Application Bugs**: Create GitHub issue
**Feature Requests**: Document for Phase 7

---

## Quick Reference Commands

```bash
# Build
pnpm run build

# Start production
pnpm start

# Check logs (Vercel)
vercel logs

# Database console
psql -h your-db-host -U postgres -d your-db

# Verify all routes work
curl https://your-domain.com/dashboard
curl https://your-domain.com/dashboard/workouts
curl https://your-domain.com/dashboard/food
curl https://your-domain.com/dashboard/social
```

---

**Deployment Status**: Ready for production! 🚀

Last verified: 2025-01-10
