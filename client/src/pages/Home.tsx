import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-white">Discord Token Checker</h1>
          </div>
          {user && (
            <Button
              variant="outline"
              onClick={logout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ออกจากระบบ
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ตรวจสอบโทเค็น Discord ของคุณ
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            เครื่องมือที่ปลอดภัยและรวดเร็วสำหรับตรวจสอบความถูกต้องของโทเค็น Discord
          </p>
          <Button
            onClick={() => navigate("/checker")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            เริ่มตรวจสอบ →
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <CardTitle className="text-white">รวดเร็ว</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                ตรวจสอบโทเค็นหลายตัวในเวลาเพียงไม่กี่วินาที
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <Lock className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle className="text-white">ปลอดภัย</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                ไม่มีการเก็บข้อมูลโทเค็นของคุณ ทั้งหมดประมวลผลในเซิร์ฟเวอร์ส่วนตัว
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <Shield className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">ถูกต้อง</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                ตรวจสอบรูปแบบและเรียก Discord API เพื่อยืนยันความถูกต้อง
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="border-slate-700 bg-slate-800 mb-12">
          <CardHeader>
            <CardTitle className="text-white">วิธีใช้งาน</CardTitle>
            <CardDescription className="text-slate-400">
              ขั้นตอนง่ายๆ เพียง 3 ขั้น
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">วาง email:password:token</h4>
                  <p className="text-slate-300 text-sm">
                    วาง email:password:token หรือเพียงแค่โทเค็นของคุณลงในช่องป้อนข้อมูล
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">คลิกตรวจสอบ</h4>
                  <p className="text-slate-300 text-sm">
                    คลิกปุ่ม "ตรวจสอบโทเค็น" เพื่อเริ่มการตรวจสอบ
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">ดูผลลัพธ์</h4>
                  <p className="text-slate-300 text-sm">
                    ดูผลลัพธ์โดยละเอียดสำหรับแต่ละโทเค็น
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/checker")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            ตรวจสอบโทเค็นของคุณตอนนี้ →
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          <p>Discord Token Checker - ตรวจสอบโทเค็นของคุณอย่างปลอดภัย</p>
        </div>
      </footer>
    </div>
  );
}
