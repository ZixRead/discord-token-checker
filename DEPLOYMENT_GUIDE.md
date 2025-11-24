# Discord Token Checker - Deployment Guide

## วิธีการลง Vercel

เว็บแอปพลิเคชัน Discord Token Checker สามารถลง Vercel ได้ง่ายๆ ตามขั้นตอนต่อไปนี้:

### ขั้นตอนที่ 1: เตรียมโปรเจกต์

โปรเจกต์นี้ใช้ React 19 + Express 4 + tRPC 11 และพร้อมสำหรับการ Deploy บน Vercel แล้ว

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables

ก่อนลง Vercel ให้ตั้งค่า Environment Variables ดังต่อไปนี้:

**Server-side Variables:**
```
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
RECAPTCHA_SECRET_KEY=6LeOBBYsAAAAAE-Mc5LCcjCiPXWOEi_tm_6VrlYP
```

**Client-side Variables:**
```
VITE_APP_ID=<your-app-id>
VITE_APP_TITLE=Discord Token Checker
VITE_APP_LOGO=<your-logo-url>
VITE_OAUTH_PORTAL_URL=<your-oauth-url>
VITE_FRONTEND_FORGE_API_URL=<your-api-url>
VITE_FRONTEND_FORGE_API_KEY=<your-api-key>
```

### ขั้นตอนที่ 3: ลง Vercel

#### วิธีที่ 1: ใช้ Vercel Dashboard
1. ไปที่ https://vercel.com/dashboard
2. คลิก "Add New..." → "Project"
3. เลือก Git Repository ของโปรเจกต์นี้
4. ตั้งค่า Environment Variables
5. คลิก "Deploy"

#### วิธีที่ 2: ใช้ Vercel CLI
```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login เข้า Vercel
vercel login

# Deploy โปรเจกต์
vercel

# Deploy ไปยัง Production
vercel --prod
```

### ขั้นตอนที่ 4: ตั้งค่า Custom Domain (Optional)

หากต้องการใช้ Custom Domain:
1. ไปที่ Vercel Dashboard
2. เลือก Project
3. ไปที่ Settings → Domains
4. เพิ่ม Custom Domain
5. ตั้งค่า DNS Records ตามคำแนะนำของ Vercel

## ความสามารถของเว็บแอปพลิเคชัน

### 1. Token Checking (ตรวจสอบโทเค็น)
- ✓ ตรวจสอบรูปแบบโทเค็น Discord
- ✓ ยืนยันความถูกต้องผ่าน Discord API
- ✓ ดึงข้อมูลผู้ใช้ (Username, Email, Avatar, Verified Status)
- ✓ ดึงข้อมูล Servers และ Linked Accounts
- ✓ แสดงสถานะ Nitro และ 2FA

### 2. Input Formats (รูปแบบการป้อนข้อมูล)
รองรับหลายรูปแบบ:
- `email:password:token` - ชุดข้อมูลสมบูรณ์
- `token` - เพียงแค่โทเค็น
- Multiple lines - ป้อนหลายโทเค็นพร้อมกัน

### 3. Export Options (ตัวเลือกการส่งออก)
- ✓ Token Only - เฉพาะโทเค็น
- ✓ Email:Password:Token - ชุดข้อมูลสมบูรณ์
- ✓ CSV Format - สำหรับ Excel/Sheets
- ✓ JSON Format - สำหรับการประมวลผลอื่นๆ

### 4. Security Features (ฟีเจอร์ความปลอดภัย)
- ✓ reCAPTCHA v3 - ตรวจสอบบ่อน
- ✓ No Data Storage - ไม่เก็บข้อมูลในฐานข้อมูล
- ✓ HTTPS Only - การเชื่อมต่อที่ปลอดภัย
- ✓ Password Masking - ซ่อนรหัสผ่านโดยค่าเริ่มต้น

### 5. Monetization (การหารายได้)
- ✓ Google AdSense - โฆษณา Google AdSense
- ✓ Multiple Ad Placements - โฆษณาที่หน้า Top และ Bottom

## ข้อมูลทางเทคนิค

### Stack
- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Express 4, tRPC 11
- **Database:** MySQL/TiDB (Drizzle ORM)
- **Authentication:** Manus OAuth
- **Testing:** Vitest (38 tests passing)
- **Deployment:** Vercel

### API Endpoints
- `/api/trpc/*` - tRPC endpoints
- `/api/oauth/callback` - OAuth callback
- `/api/health` - Health check

### Database Schema
- `users` - ข้อมูลผู้ใช้
- ไม่มีตารางสำหรับเก็บโทเค็น (ตรวจสอบแล้วแสดงผลเลย)

## การแก้ไขปัญหา

### ปัญหา: Build Failed
- ตรวจสอบ Environment Variables
- ตรวจสอบ Database Connection
- ดูที่ Vercel Build Logs

### ปัญหา: reCAPTCHA ไม่ทำงาน
- ตรวจสอบ RECAPTCHA_SITE_KEY และ RECAPTCHA_SECRET_KEY
- ตรวจสอบว่า Domain ถูกเพิ่มใน reCAPTCHA Console

### ปัญหา: Google AdSense ไม่แสดงโฆษณา
- ตรวจสอบ Google AdSense Account Status
- ตรวจสอบ ads.txt ที่ `/public/ads.txt`
- รอ 24-48 ชั่วโมงเพื่อให้ Google อนุมัติ

## ติดต่อและสนับสนุน

หากมีปัญหาหรือคำถาม สามารถติดต่อได้ที่:
- GitHub Issues
- Email Support
- Discord Community

---

**Created:** November 23, 2025
**Version:** 1.0.0
**Status:** Production Ready
