# ⚡ ШВИДКИЙ ДЕПЛОЙ - ФУСАФ v133

## 🎯 Quick Start Commands

```bash
# 1. GitHub Upload
git init
git add .
git commit -m "🚀 FUSAF v133 - Ready for Vercel"
git remote add origin https://github.com/YOUR_USERNAME/fusaf-sportivna-aerobika.git
git push -u origin main

# 2. Vercel Deploy
# Go to vercel.com → Import GitHub repo → Deploy
```

## 🔑 Environment Variables (Vercel Dashboard)

```env
NEXTAUTH_URL=https://fusaf-sportivna-aerobika.vercel.app
NEXTAUTH_SECRET=fusaf-simple-auth-secret-2025
NODE_ENV=production
SKIP_TYPE_CHECK=true
DISABLE_ESLINT=true
```

## 👥 Demo Accounts (After Deploy)

```
Admin: andfedos@gmail.com / password123
Coach: coach@fusaf.org.ua / password123
Athlete: athlete@fusaf.org.ua / password123
```

## 🧪 Test URLs

```
Home: https://fusaf-sportivna-aerobika.vercel.app
Login: /auth/signin
Register: /auth/signup
Athletes: /membership/athletes
Admin: /admin
API: /api/athletes
```

## ✅ Success Checklist

- [ ] GitHub repo created and code uploaded
- [ ] Vercel project imported from GitHub
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Home page loads correctly
- [ ] Login with demo accounts works
- [ ] Athletes list displays
- [ ] Admin panel accessible
- [ ] API endpoints respond
- [ ] All major features tested

## 🆘 Quick Fixes

**Build fails?** → Check Environment Variables
**404 on APIs?** → Verify Vercel Functions
**Auth not working?** → Clear browser cache
**Slow loading?** → Normal, Vercel optimizes automatically

**📖 Full Guide: See `VERCEL_DEPLOY_GUIDE.md`**
