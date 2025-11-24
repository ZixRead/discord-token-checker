# Discord Token Checker - TODO

## Core Features
- [x] โทเค็นแยกวิเคราะห์ (Token Parser) - แยกโทเค็นจากข้อมูลที่ป้อน
- [x] ตรวจสอบความถูกต้องของโทเค็น (Token Validation) - ตรวจสอบรูปแบบและความถูกต้อง
- [x] ตรวจสอบสถานะโทเค็น (Token Status Check) - เรียก Discord API เพื่อตรวจสอบว่าโทเค็นใช้ได้จริง
- [x] แสดงผลการตรวจสอบ (Display Results) - แสดงรายละเอียดของโทเค็นที่ตรวจสอบ
- [x] ส่วนติดต่อผู้ใช้ (UI) - สร้างหน้าเว็บสำหรับป้อนและแสดงผล
- [x] kuy
## Database Schema
- [ ] สร้างตาราเก็บประวัติการตรวจสอบ (Check History)

## Testing
- [x] เขียน Vitest สำหรับฟังก์ชันแยกวิเคราะห์โทเค็น
- [x] เขียน Vitest สำหรับฟังก์ชันตรวจสอบความถูกต้อง
- [x] ทดสอบ tRPC procedures สำหรับตรวจสอบโทเค็น

## Deployment
- [x] สร้าง Checkpoint ก่อนการเผยแพร่

## Improvements (New)
- [x] ดึงข้อมูลผู้ใช้ที่ครบถ้วน (User Profile, Email, Verified, Avatar)
- [x] ดึงจำนวน Server ที่ผู้ใช้เข้าร่วม
- [x] ดึง Linked Accounts (Connections)
- [x] ไม่เก็บข้อมูลในฐานข้อมูล - ตรวจสอบแล้วแสดงผลเลย
- [x] ปรับปรุง UI ให้สวยงามและแสดงข้อมูลที่ครบถ้วน
- [x] ตรวจสอบให้ได้แบบ 100% ไม่มีข้อผิดพลาด

## New Features (Phase 2)
- [x] แสดงข้อมูลโทเค็นที่ไม่ใช้ได้ (Email, Password, เหตุผล)
- [x] คัดลอก 2 แบบ (email:password:token และ token อย่างเดียว)
- [x] ดาวน์โหลดโทเค็นที่ใช้ได้
- [x] ดาวน์โหลดโทเค็นที่ไม่ใช้ได้ (พร้อมเหตุผล)
- [x] ปรับปรุง UI ให้สวยงาม
- [x] เพิ่ม Animation และลูกเล่น

## Phase 3: Monetization & Security
- [x] เพิ่ม reCAPTCHA v3 ตรวจสอบบ่อน
- [x] เพิ่ม Google AdSense โฆษณา
- [ ] เพิ่ม Dark/Light Theme Toggle
- [ ] ปรับปรุง UI ให้สวยงามกว่า
- [ ] เพิ่ม Real-time Validation
- [x] ทดสอบ reCAPTCHA และ AdSense
