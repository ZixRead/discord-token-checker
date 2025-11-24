import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Copy, Check, Server, Link2, Shield, Download, Eye, EyeOff } from "lucide-react";
import { AdSense } from "@/components/AdSense";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface TokenResult {
  token: string;
  originalInput?: string;
  email?: string;
  password?: string;
  formatValid: boolean;
  userId: string | null;
  isAlive: boolean;
  profile?: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    verified?: boolean;
    discriminator?: string;
    mfa_enabled?: boolean;
    premium_type?: number;
    locale?: string;
  } | null;
  guilds?: Array<{
    id: string;
    name: string;
    icon?: string;
    owner?: boolean;
  }> | null;
  connections?: Array<{
    id: string;
    name: string;
    type: string;
    verified?: boolean;
  }> | null;
  error?: string;
}

export default function TokenChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<TokenResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const { executeRecaptchaAction } = useRecaptcha();

  const parseAndCheckMutation = trpc.token.parseAndCheckComprehensive.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
    },
  });

  const exportCSVQuery = trpc.token.exportCSV.useQuery;
  const exportJSONQuery = trpc.token.exportJSON.useQuery;
  const exportTokensOnlyQuery = trpc.token.exportTokensOnly.useQuery;
  const exportFullFormatQuery = trpc.token.exportFullFormat.useQuery;

  const handleCheck = async () => {
    if (!input.trim()) {
      alert("กรุณาป้อนข้อมูลโทเค็น");
      return;
    }

    // Execute reCAPTCHA
    const token = await executeRecaptchaAction("token_check");
    if (!token) {
      alert("reCAPTCHA verification failed");
      return;
    }

    parseAndCheckMutation.mutate({ input });
  };

  const handleCopyToken = (token: string, format: 'token' | 'full') => {
    const result = results.find(r => r.token === token);
    if (!result) return;

    let textToCopy = token;
    if (format === 'full' && result.email) {
      const parts = [];
      if (result.email) parts.push(result.email);
      if (result.password) parts.push(result.password);
      parts.push(result.token);
      textToCopy = parts.join(':');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDownload = (format: 'csv' | 'json' | 'tokens' | 'full', type: 'valid' | 'invalid' | 'all') => {
    const exportData = results.map(r => ({
      email: r.email,
      password: r.password,
      token: r.token,
      isAlive: r.isAlive,
      username: r.profile?.username,
      error: r.error,
    }));

    let content = '';
    let filename = `discord-tokens-${type}-${new Date().getTime()}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'csv':
        content = exportToCSV(exportData, type);
        filename += '.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = exportToJSON(exportData, type);
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'tokens':
        content = exportTokensOnly(exportData, type);
        filename += '.txt';
        break;
      case 'full':
        content = exportFullFormat(exportData, type);
        filename += '.txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: any[], type: string) => {
    const filtered = data.filter(r => {
      if (type === 'valid') return r.isAlive;
      if (type === 'invalid') return !r.isAlive;
      return true;
    });

    const headers = ['Email', 'Password', 'Token', 'Username', 'Status', 'Error'];
    const rows = filtered.map(r => [
      r.email || '',
      r.password || '',
      r.token,
      r.username || '',
      r.isAlive ? 'Valid' : 'Invalid',
      r.error || '',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  };

  const exportToJSON = (data: any[], type: string) => {
    const filtered = data.filter(r => {
      if (type === 'valid') return r.isAlive;
      if (type === 'invalid') return !r.isAlive;
      return true;
    });
    return JSON.stringify(filtered, null, 2);
  };

  const exportTokensOnly = (data: any[], type: string) => {
    const filtered = data.filter(r => {
      if (type === 'valid') return r.isAlive;
      if (type === 'invalid') return !r.isAlive;
      return true;
    });
    return filtered.map(r => r.token).join('\n');
  };

  const exportFullFormat = (data: any[], type: string) => {
    const filtered = data.filter(r => {
      if (type === 'valid') return r.isAlive;
      if (type === 'invalid') return !r.isAlive;
      return true;
    });
    return filtered.map(r => {
      const parts = [];
      if (r.email) parts.push(r.email);
      if (r.password) parts.push(r.password);
      parts.push(r.token);
      return parts.join(':');
    }).join('\n');
  };

  const validCount = results.filter(r => r.isAlive).length;
  const invalidCount = results.filter(r => !r.isAlive).length;

  const getStatusBadge = (result: TokenResult) => {
    if (!result.formatValid) {
      return <Badge variant="destructive">รูปแบบไม่ถูกต้อง</Badge>;
    }
    if (result.isAlive) {
      return <Badge variant="default" className="bg-green-600">✓ ใช้ได้</Badge>;
    }
    return <Badge variant="destructive">✗ ไม่ใช้ได้</Badge>;
  };

  const getStatusIcon = (result: TokenResult) => {
    if (!result.formatValid) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    if (result.isAlive) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getPremiumBadge = (premiumType?: number) => {
    if (!premiumType) return null;
    const premiumNames: Record<number, string> = {
      1: "Nitro Classic",
      2: "Nitro",
      3: "Nitro Basic",
    };
    return <Badge className="bg-purple-600">{premiumNames[premiumType] || "Premium"}</Badge>;
  };

  const togglePasswordVisibility = (token: string) => {
    const newSet = new Set(showPasswords);
    if (newSet.has(token)) {
      newSet.delete(token);
    } else {
      newSet.add(token);
    }
    setShowPasswords(newSet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Ad */}
        <AdSense slotId="9876543210" format="auto" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discord Token Checker</h1>
          <p className="text-slate-300">ตรวจสอบโทเค็น Discord ได้แบบ 100% พร้อมดึงข้อมูลผู้ใช้ที่ครบถ้วน</p>
        </div>

        {/* Input Section */}
        <Card className="mb-6 border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">ป้อนข้อมูลโทเค็น</CardTitle>
            <CardDescription className="text-slate-400">
              รองรับรูปแบบ: email:password:token หรือเพียงแค่โทเค็น (หลายบรรทัด)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="วาง email:password:token หรือโทเค็นของคุณที่นี่..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            <Button
              onClick={handleCheck}
              disabled={parseAndCheckMutation.isPending}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {parseAndCheckMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "ตรวจสอบโทเค็น"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {showResults && results.length > 0 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">ทั้งหมด</p>
                    <p className="text-3xl font-bold text-white">{results.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-700 bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-green-400 text-sm mb-1">ใช้ได้</p>
                    <p className="text-3xl font-bold text-green-400">{validCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-700 bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-red-400 text-sm mb-1">ไม่ใช้ได้</p>
                    <p className="text-3xl font-bold text-red-400">{invalidCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Buttons */}
            {validCount > 0 && (
              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">ดาวน์โหลดโทเค็นที่ใช้ได้</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownload('tokens', 'valid')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Token Only (.txt)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload('full', 'valid')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Email:Password:Token (.txt)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload('csv', 'valid')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload('json', 'valid')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </CardContent>
              </Card>
            )}

            {invalidCount > 0 && (
              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">ดาวน์โหลดโทเค็นที่ไม่ใช้ได้</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownload('tokens', 'invalid')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Token Only (.txt)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload('full', 'invalid')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Email:Password:Token (.txt)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload('csv', 'invalid')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload('json', 'invalid')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  ผลการตรวจสอบ
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setResults([]);
                    setInput("");
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  ล้างผล
                </Button>
              </div>

              {results.map((result, index) => (
                <Card key={index} className={`border-slate-700 bg-slate-800/50 overflow-hidden ${result.isAlive ? 'border-l-4 border-l-green-600' : 'border-l-4 border-l-red-600'}`}>
                  <CardHeader className="pb-3 border-b border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(result)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {result.profile?.username || (result.email ? result.email.split('@')[0] : 'Unknown')}
                            </h3>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {getStatusBadge(result)}
                            {result.profile?.verified && (
                              <Badge className="bg-blue-600">✓ Verified</Badge>
                            )}
                            {getPremiumBadge(result.profile?.premium_type)}
                            {result.profile?.mfa_enabled && (
                              <Badge className="bg-orange-600">🔐 2FA</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    {/* Email and Password */}
                    {(result.email || result.password) && (
                      <div className="bg-slate-700/30 border border-slate-600 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">ข้อมูลเข้าสู่ระบบ</h4>
                        <div className="space-y-2">
                          {result.email && (
                            <div className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400">Email</p>
                                <p className="text-white font-mono text-sm break-all">{result.email}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(result.email || '');
                                  setCopiedToken(`email-${result.token}`);
                                  setTimeout(() => setCopiedToken(null), 2000);
                                }}
                                className="ml-2"
                              >
                                {copiedToken === `email-${result.token}` ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                          {result.password && (
                            <div className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400">Password</p>
                                <p className="text-white font-mono text-sm">
                                  {showPasswords.has(result.token) ? result.password : '•'.repeat(result.password.length)}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(result.token)}
                                >
                                  {showPasswords.has(result.token) ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(result.password || '');
                                    setCopiedToken(`pass-${result.token}`);
                                    setTimeout(() => setCopiedToken(null), 2000);
                                  }}
                                >
                                  {copiedToken === `pass-${result.token}` ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Token */}
                    <div className="bg-slate-700/30 border border-slate-600 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Token</h4>
                      <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded font-mono text-xs break-all">
                        <span className="text-slate-300 flex-1">{result.token.substring(0, 50)}...</span>
                        <div className="flex gap-2 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToken(result.token, 'token')}
                          >
                            {copiedToken === result.token ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          {result.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToken(result.token, 'full')}
                              title="Copy email:password:token"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* User Profile Info */}
                    {result.profile && result.isAlive && (
                      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-400 mb-3">ข้อมูลผู้ใช้</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-slate-700/50 p-3 rounded">
                            <p className="text-xs text-slate-400 mb-1">Username</p>
                            <p className="text-white font-semibold">{result.profile.username}</p>
                          </div>
                          {result.profile.email && (
                            <div className="bg-slate-700/50 p-3 rounded">
                              <p className="text-xs text-slate-400 mb-1">Email</p>
                              <p className="text-white font-semibold break-all text-sm">{result.profile.email}</p>
                            </div>
                          )}
                          {result.userId && (
                            <div className="bg-slate-700/50 p-3 rounded">
                              <p className="text-xs text-slate-400 mb-1">User ID</p>
                              <p className="text-white font-semibold font-mono text-sm">{result.userId}</p>
                            </div>
                          )}
                          {result.profile.locale && (
                            <div className="bg-slate-700/50 p-3 rounded">
                              <p className="text-xs text-slate-400 mb-1">Locale</p>
                              <p className="text-white font-semibold">{result.profile.locale}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Guilds/Servers */}
                    {result.guilds && result.guilds.length > 0 && (
                      <div className="bg-slate-700/30 border border-slate-600 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Server className="w-4 h-4 text-blue-400" />
                          <h4 className="text-sm font-semibold text-blue-400">
                            Servers ({result.guilds.length})
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {result.guilds.slice(0, 10).map((guild) => (
                            <div key={guild.id} className="bg-slate-700/50 p-2 rounded text-sm">
                              <p className="text-white font-medium truncate">{guild.name}</p>
                              {guild.owner && <p className="text-yellow-400 text-xs">👑 Owner</p>}
                            </div>
                          ))}
                        </div>
                        {result.guilds.length > 10 && (
                          <p className="text-slate-400 text-xs mt-2">+{result.guilds.length - 10} more servers</p>
                        )}
                      </div>
                    )}

                    {/* Connections */}
                    {result.connections && result.connections.length > 0 && (
                      <div className="bg-slate-700/30 border border-slate-600 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Link2 className="w-4 h-4 text-purple-400" />
                          <h4 className="text-sm font-semibold text-purple-400">
                            Linked Accounts ({result.connections.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {result.connections.map((conn) => (
                            <div key={conn.id} className="bg-slate-700/50 p-2 rounded text-sm flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{conn.type}</p>
                                <p className="text-slate-400 text-xs">{conn.name}</p>
                              </div>
                              {conn.verified && <Badge className="bg-green-600">✓</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {result.error && (
                      <Alert className="bg-red-900/30 border-red-700">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-300">{result.error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {showResults && results.length === 0 && (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-slate-300">ไม่พบโทเค็นที่ถูกต้องในข้อมูลที่ป้อน</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ข้อมูลสำคัญ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2 text-sm">
            <p>
              ✓ <strong>ตรวจสอบแบบ 100%:</strong> ตรวจสอบรูปแบบและเรียก Discord API เพื่อยืนยันความถูกต้อง
            </p>
            <p>
              ✓ <strong>ไม่เก็บข้อมูล:</strong> ตรวจสอบแล้วแสดงผลเลย ไม่มีการบันทึกข้อมูลในฐานข้อมูล
            </p>
            <p>
              ✓ <strong>ข้อมูลที่ครบถ้วน:</strong> ดึงข้อมูลผู้ใช้, Servers, Linked Accounts ทั้งหมด
            </p>
            <p>
              ✓ <strong>คัดลอกและดาวน์โหลด:</strong> สามารถคัดลอกและดาวน์โหลดผลลัพธ์ได้ในหลายรูปแบบ
            </p>
            <p className="text-yellow-400 mt-4">
              ⚠️ <strong>คำเตือน:</strong> อย่าแชร์โทเค็นของคุณกับใครก็ตาม เป็นความเสี่ยงด้านความปลอดภัย
            </p>
          </CardContent>
        </Card>

        {/* Bottom Ad */}
        <AdSense slotId="9876543212" format="auto" />
      </div>
    </div>
  );
}
