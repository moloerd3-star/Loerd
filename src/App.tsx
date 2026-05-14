import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { AnimatePresence, motion } from "motion/react";
import { 
  SOCIAL_PLATFORMS, 
  SOCIAL_CATALOG, 
  SERVICES_DATA, 
  DURATIONS, 
  TOPUP_AMOUNTS,
  DEFAULT_FAQS
} from "./constants";
import {
  IconBell,
  IconPlus,
  IconWallet,
  IconHome2,
  IconSparkles,
  IconGridDots,
  IconUser,
  IconShoppingCart,
  IconArrowRight,
  IconBrandYoutube,
  IconBrandX,
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandFacebook,
  IconCoin,
  IconCheck,
  IconDots,
  IconWriting,
  IconMessageChatbot,
  IconPalette,
  IconChartBar,
  IconShieldCheck,
  IconX as IconTablerX,
} from "@tabler/icons-react";
import { FinancialServicePage, FinancialGrid } from "./components/FinancialServices";
import WalletPageV2 from "./components/WalletPageV2";
import { marketSync } from "./services/marketSync";
import { auth, db, signInWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from "./lib/firebase";
export { auth, db, signInWithGoogle, loginWithEmail, registerWithEmail, resetPassword };
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDocs,
  runTransaction
} from "firebase/firestore";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/* ═══════════════════════════════════════════════════════════════════
   FIREBASE ERROR HANDLING
═══════════════════════════════════════════════════════════════════ */
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TICKERS = [
  "🔥 عرض محدود: Plus بسعر خاص — لا تفوّت الفرصة!",
  "⚡ تم إضافة خدمات جديدة لمنصة TikTok",
  "🎉 شكراً لك! 248 طلب مكتمل بنجاح",
  "💡 جرّب أدوات الذكاء الاصطناعي الجديدة الآن",
];

const HOMESCREEN_NOTIFICATIONS = [
  {
    id: 1,
    icon: <IconCoin size={16} />,
    color: "#f5c842",
    bg: "rgba(245,200,66,0.15)",
    text: "تم إضافة £50 إلى رصيدك بنجاح",
    time: "منذ 5 دقائق",
  },
  {
    id: 2,
    icon: <IconCheck size={16} />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    text: "طلبك رقم #248 تم تنفيذه بنجاح",
    time: "منذ ساعة",
  },
  {
    id: 3,
    icon: <IconSparkles size={16} />,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    text: "عرض جديد: Plus بخصم 30% لفترة محدودة!",
    time: "منذ 3 ساعات",
  },
];

const TOP_PLATFORMS = [
  { id: "fb",  label: "Facebook",  icon: <IconBrandFacebook size={24} />, color: "#1877f2", bg: "rgba(24,119,242,0.12)" },
  { id: "yt",  label: "YouTube",   icon: <IconBrandYoutube size={24} />,  color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  { id: "tw",  label: "Twitter X", icon: <IconBrandX size={22} />,        color: "#e7e9ea", bg: "rgba(255,255,255,0.06)" },
  { id: "tt",  label: "TikTok",    icon: <IconBrandTiktok size={24} />,   color: "#e7e9ea", bg: "rgba(0,0,0,0.3)"       },
  { id: "ig",  label: "Instagram", icon: <IconBrandInstagram size={24} />,color: "#d946ef", bg: "rgba(217,70,239,0.12)" },
];

const AI_TOOLS_DATA = [
  { id: 1, emoji: <IconWriting size={26} />,         name: "صانع المحتوى",    desc: "أنشئ محتوى احترافي", featured: true  },
  { id: 2, emoji: <IconMessageChatbot size={26} />,  name: "المساعد الذكي",   desc: "دردشة وإجابات فورية",featured: false },
  { id: 3, emoji: <IconPalette size={26} />,         name: "توليد الصور",   desc: "صور وتصاميم مبتكرة", featured: false },
  { id: 4, emoji: <IconChartBar size={26} />,        name: "تلخيص النصوص",  desc: "تقارير وإحصاءات",    featured: false },
];

/* ═══════════════════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════ */
export const G = {
  bg: "#04070f",
  card: "rgba(255,255,255,0.035)",
  cardBorder: "rgba(255,255,255,0.07)",
  blue: "#4F8EF7",
  green: "#10D9A0",
  pink: "#F472B6",
  yellow: "#FBBF24",
  text: "#F0F4FF",
  sub: "rgba(220,230,255,0.38)",
  sub2: "rgba(220,230,255,0.55)",
  font: "'Cairo', sans-serif",
  radius: 20,
  radiusSm: 12,
  // Financial Specific (from attachment)
  fin: {
    bg: "#0e0e0e",
    card: "#161b1b",
    cardAlt: "#131818",
    border: "#1f2b2b",
    borderAlt: "#192424",
    text: "#e8e8e8",
    sub: "#7a8a8a",
    sub2: "#556060",
    yellow: "#d4a017",
    yellowBg: "rgba(212,160,23,.08)",
    yellowBdr: "rgba(212,160,23,.28)",
    greenBadgeBg: "#0d2a18",
    greenBadge: "#4ade80",
    greenBdr: "#1a4a28",
    red: "#e05555",
    input: "#0f1515",
  }
};

/* ═══════════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════════ */

export function GlassCard({ children, style, onClick, className = "", glow = false }: any) {
  return (
    <div
      className={`card ${className} ${glow ? "glow" : ""}`}
      onClick={onClick}
      style={{
        background: G.card,
        border: `1px solid ${G.cardBorder}`,
        borderRadius: G.radius,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Btn({ label, onClick, color = G.blue, icon, full = false, size = "md", variant = "solid", disabled = false }: any) {
  const sizes: any = { sm: { p: "8px 16px", fs: 12 }, md: { p: "13px 22px", fs: 14 }, lg: { p: "16px 28px", fs: 16 } };
  const s = sizes[size];
  const styles: any = {
    solid: { background: `linear-gradient(135deg,${color},${color}bb)`, color: "#fff", boxShadow: `0 4px 20px ${color}35` },
    ghost: { background: `${color}12`, border: `1px solid ${color}35`, color },
    outline: { background: "transparent", border: `1px solid ${color}50`, color },
  };
  return (
    <button
      className="btn"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? "100%" : "auto",
        padding: s.p, fontSize: s.fs, fontWeight: 700,
        borderRadius: G.radiusSm,
        display: "inline-flex", alignItems: "center",
        justifyContent: "center", gap: 8,
        opacity: disabled ? 0.5 : 1,
        ...styles[variant],
      }}
    >
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder, type = "text", icon, dir = "rtl" }: any) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 600, letterSpacing: 0.5 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          className="inp"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          dir={dir}
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${G.cardBorder}`,
            borderRadius: G.radiusSm,
            padding: icon ? "13px 44px 13px 16px" : "13px 16px",
            color: G.text, fontSize: 14,
            outline: "none",
          }}
        />
        {icon && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.45 }}>{icon}</span>}
      </div>
    </div>
  );
}

export function Badge({ label, color, size = "sm" }: any) {
  const sizes: any = { xs: { p: "2px 7px", fs: 9 }, sm: { p: "3px 9px", fs: 10 }, md: { p: "5px 12px", fs: 12 } };
  const s = sizes[size];
  return (
    <span style={{
      padding: s.p, fontSize: s.fs, fontWeight: 700,
      borderRadius: 20,
      background: `${color}20`, color,
      border: `1px solid ${color}30`,
      display: "inline-block",
    }}>{label}</span>
  );
}

export function SectionHeader({ title, onMore, accent = G.blue, icon }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <div style={{ width: 3, height: 16, background: accent, borderRadius: 4, boxShadow: `0 0 8px ${accent}` }} />
        <span style={{ fontSize: 13, color: G.sub2, letterSpacing: 0.5, fontWeight: 700 }}>{title}</span>
      </div>
      {onMore && (
        <button onClick={onMore} style={{ background: "none", border: "none", color: G.blue, fontSize: 12, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
          عرض الكل <span style={{ fontSize: 10 }}>←</span>
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCREENS
═══════════════════════════════════════════════════════════════════ */

function LoginScreen({ onRegister, onForgotPass, addNotification }: any) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) {
      addNotification("نقص في البيانات", "يرجى إدخال البريد الإلكتروني وكلمة المرور للمتابعة", "❌");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, pass);
      // If we reach here, signInWithEmailAndPassword succeeded. 
      // The onAuthStateChanged in App.tsx will handle the navigation.
    } catch (error: any) {
      // If the user actually got signed in despite an error (rare race condition), don't show error
      if (!auth.currentUser) {
        addNotification("خطأ في الدخول", "البريد أو كلمة المرور غير صحيحة", "❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      addNotification("مرحباً بك!", "تم تسجيل الدخول بنجاح عبر Google", "⚡");
    } catch (error) {
      addNotification("فشل تسجيل الدخول", "حدث خطأ أثناء محاولة تسجيل الدخول", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade" style={{ maxWidth: 400, margin: "0 auto", padding: "80px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>👑</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: G.text, background: `linear-gradient(to left, ${G.text}, ${G.sub})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>القائد PRO</h1>
        <p style={{ fontSize: 11, color: G.sub, letterSpacing: 2 }}>NEXT GEN DIGITAL SERVICES</p>
      </div>

      <div className="fade" style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 5, marginBottom: 24, border: `1px solid ${G.cardBorder}` }}>
        <button style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "rgba(79,142,247,0.25)", color: G.blue, border: "none" }}>تسجيل دخول</button>
        <button onClick={() => onRegister()} style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "transparent", color: G.sub, border: "none" }}>إنشاء حساب</button>
      </div>

      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="البريد الإلكتروني" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" icon="✉️" dir="ltr" />
        <Input label="كلمة المرور" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="••••••••" type="password" icon="🔒" dir="ltr" />
        
        <div style={{ textAlign: "right" }}>
          <button onClick={onForgotPass} style={{ background: "none", border: "none", color: G.blue, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>نسيت كلمة المرور؟</button>
        </div>

        <Btn full label={loading ? "جاري المعالجة..." : "🚀 دخول المتجر"} onClick={handleLogin} disabled={loading} size="lg" />
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
          <div style={{ flex: 1, height: 1, background: G.cardBorder }} />
          <span style={{ fontSize: 11, color: G.sub, fontFamily: G.font }}>أو</span>
          <div style={{ flex: 1, height: 1, background: G.cardBorder }} />
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn"
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: G.radiusSm,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${G.cardBorder}`,
            color: G.text,
            fontSize: 14,
            fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: "pointer"
          }}
        >
          <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="G" />
          دخول عبر Google
        </button>
      </div>
    </div>
  );
}

function OrderDetailView({ order, onBack, addNotification, setTab }: any) {
  const roadmap = [
    { id: 'pending', label: 'جاري مراجعة الطلب', icon: '🔍', desc: 'نقوم بمراجعة بيانات طلبك والتأكد من صحتها.' },
    { id: 'received', label: 'تم استلام الطلب', icon: '📥', desc: 'تم استلام طلبك بنجاح وتحويله للقسم المختص.' },
    { id: 'processing', label: 'جاري العمل على الطلب', icon: '⚙️', desc: 'بدأ فريقنا بالعمل على تنفيذ طلبك حالياً.' },
    { id: 'completed', label: 'تم تنفيذ الطلب', icon: '✅', desc: 'تم الانتهاء من تنفيذ الطلب بنجاح.' }
  ];

  const currentIdx = roadmap.findIndex(r => r.id === order.status);
  const isExpired = order.createdAt?.toDate ? (Date.now() - order.createdAt.toDate().getTime() > 48 * 60 * 60 * 1000) : false;

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
       <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 25 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: 0, padding: 10, borderRadius: 12, color: "#fff" }}>🔙</button>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>تفاصيل الطلب</h1>
      </div>

      <GlassCard style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
           <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: G.yellow }}>{order.name || "طلب خدمة"}</div>
              <div style={{ fontSize: 12, color: G.sub }}>#{order.id.slice(-8)}</div>
           </div>
           <Badge 
              label={order.status === 'completed' ? 'مكتمل' : order.status === 'cancelled' ? 'ملغي' : 'نشط'} 
              color={order.status === 'completed' ? G.green : order.status === 'cancelled' ? "#ef4444" : G.yellow} 
           />
        </div>

        <div style={{ display: "grid", gap: 12, fontSize: 13, color: G.text }}>
           <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.sub2 }}>التاريخ:</span>
              <span>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString("ar-EG") : ""}</span>
           </div>
           <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.sub2 }}>القيمة:</span>
              <span style={{ fontWeight: 900, color: G.yellow }}>£{Number(order.total || 0).toLocaleString()}</span>
           </div>
           {order.link && (
             <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                <span style={{ color: G.sub2 }}>الرابط:</span>
                <span style={{ color: G.blue, wordBreak: "break-all", textAlign: "left" }}>{order.link}</span>
             </div>
           )}
           {order.quantity && (
             <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: G.sub2 }}>الكمية:</span>
                <span>{order.quantity.toLocaleString()}</span>
             </div>
           )}
        </div>
      </GlassCard>

      <SectionHeader title="خريطة التنفيذ" accent={G.blue} />
      <div style={{ position: "relative", paddingLeft: 10, marginTop: 20 }}>
        <div style={{ position: "absolute", right: 15, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.05)" }} />
        {roadmap.map((step, idx) => {
          const isActive = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.id} style={{ position: "relative", marginBottom: 30, paddingRight: 45 }}>
              <div style={{ 
                position: "absolute", right: -2, top: 0, width: 36, height: 36, 
                background: isActive ? G.blue : "#1e293b", 
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2, boxShadow: isActive ? `0 0 15px ${G.blue}40` : "none",
                transform: "translateX(50%)"
              }}>
                <span style={{ fontSize: 18, filter: isActive ? "none" : "grayscale(1)" }}>{step.icon}</span>
              </div>
              <div style={{ opacity: isActive ? 1 : 0.4 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: isActive ? "#fff" : G.sub, marginBottom: 4 }}>
                  {step.label}
                  {isCurrent && <span style={{ marginRight: 8, fontSize: 10, background: G.blue, color: "#fff", padding: "2px 6px", borderRadius: 4 }}>حالي</span>}
                </div>
                <div style={{ fontSize: 11, color: G.sub2, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionHeader title="الدعم الفني" accent="#ef4444" />
      <GlassCard style={{ padding: 16 }}>
         <p style={{ fontSize: 12, color: G.sub2, marginBottom: 15 }}>نحن هنا لمساعدتك دائماً. في حال واجهت أي تأخر أو مشكلة في الطلب.</p>
         <Btn 
            full 
            label="إرسال تذكرة دعم فني" 
            onClick={() => {
              setTab("tickets");
              addNotification("الدعم الفني", `فتح تذكرة بخصوص الطلب #${order.id.slice(-6)}`, "📩");
            }} 
            variant={isExpired ? "solid" : "outline"}
            color={isExpired ? "#ef4444" : G.blue}
         />
         {isExpired && <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#ef4444", fontWeight: 900 }}>الطلب متأخر لأكثر من ٤٨ ساعة! اتصل بنا الآن.</div>}
      </GlassCard>
    </div>
  );
}

function OrdersHistoryScreen({ orders, isAdmin, setTab, onSelectOrder }: any) {
  const [filter, setFilter] = useState("all");
  const filtered = orders.filter((o: any) => filter === "all" || o.status === filter);

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* ... keep history header ... */}
      <div style={{ padding: "52px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>سجل الطلبات</h1>
        {isAdmin && (
          <button 
            onClick={() => setTab("admin")}
            style={{ background: `${G.yellow}20`, border: `1px solid ${G.yellow}40`, color: G.yellow, padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900 }}
          >
            📦 إدارة كل الطلبات
          </button>
        )}
      </div>

      <div style={{ padding: "0 20px", display: "flex", gap: 8, overflowX: "auto", marginBottom: 20 }}>
        {["all", "pending", "processing", "completed", "cancelled"].map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "7px 15px", borderRadius: 10, border: 0, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap",
              background: filter === s ? G.blue : "rgba(255,255,255,0.05)",
              color: filter === s ? "#fff" : G.sub2
            }}
          >
            {s === 'all' ? 'الكل' : s === 'pending' ? 'مراجعة' : s === 'processing' ? 'جاري العمل' : s === 'completed' ? 'مكتمل' : 'ملغي'}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
             <div style={{ fontSize: 40, marginBottom: 15 }}>📋</div>
             <p style={{ color: G.sub, fontSize: 13 }}>لا توجد طلبات تطابق هذا التصنيف</p>
          </div>
        ) : (
          filtered.map((o: any) => (
            <GlassCard key={o.id} style={{ padding: 16, cursor: "pointer" }} onClick={() => onSelectOrder(o)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {o.icon || "📦"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: G.text }}>{o.name || "طلب خدمة"}</div>
                    <div style={{ fontSize: 10, color: G.sub }}>#{o.id.slice(-6)} • {o.date || (o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString("ar-EG") : "")}</div>
                  </div>
                </div>
                <Badge 
                  label={
                    o.status === 'pending' ? 'مراجعة' : 
                    o.status === 'received' ? 'تم الاستلام' :
                    o.status === 'processing' ? 'جاري العمل' : 
                    o.status === 'completed' ? 'مكتمل' : 'ملغي'
                  } 
                  color={
                    o.status === 'completed' ? G.green : 
                    o.status === 'cancelled' ? "#ef4444" : 
                    o.status === "processing" ? G.blue : 
                    o.status === "received" ? "#a855f7" : G.yellow
                  }
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 5 }}>
                 <div style={{ fontSize: 11, color: G.sub2 }}>
                    {o.quantity && <span>الكمية: {o.quantity.toLocaleString()}</span>}
                    {o.link && <div style={{ marginTop: 2, color: G.blue, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{o.link}</div>}
                 </div>
                 <div style={{ fontSize: 16, fontWeight: 900, color: G.yellow }}>
                   {o.total ? `£${Number(o.total).toLocaleString()}` : (o.amount ? `£${Number(o.amount).toLocaleString()}` : "£0")}
                 </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ onBack, addNotification }: any) {
  const [activeTab, setActiveTab] = useState("orders");
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Admin Listeners
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    const unsubRecharges = onSnapshot(query(collection(db, "recharge_requests"), orderBy("createdAt", "desc")), (snap) => {
      setRecharges(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    const unsubNews = onSnapshot(collection(db, "ticker"), (snap) => {
      setNews(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    return () => {
      unsubUsers();
      unsubOrders();
      unsubRecharges();
      unsubNews();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      addNotification("تم التحديث", `تغيرت حالة الطلب إلى: ${newStatus}`, "✅");
    } catch (e: any) {
      console.error("Update Order Error:", e);
      addNotification("خطأ", `فشل تحديث الحالة: ${e.message || "عطل غير معروف"}`, "❌");
    }
  };

  const handleRecharge = async (req: any, approved: boolean) => {
    if (req.status !== 'pending') return;
    setLoading(true);
    try {
      if (approved) {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, "users", req.userId);
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) throw "المستخدم غير موجود";
          
          const newBalance = (userDoc.data().balance || 0) + Number(req.amount);
          transaction.update(userRef, { balance: newBalance });
          transaction.update(doc(db, "recharge_requests", req.id), { status: "approved" });
        });
        addNotification("تمت الموافقة", `تم إضافة £${req.amount} لحساب المستخدم`, "💰");
      } else {
        await updateDoc(doc(db, "recharge_requests", req.id), { status: "rejected" });
        addNotification("تم الرفض", "تم رفض طلب الشحن", "⚠️");
      }
    } catch (e) {
      addNotification("خطأ", "فشل معالجة الطلب", "❌");
    } finally {
      setLoading(false);
    }
  };

  const adjustUserBalance = async (userId: string, currentBalance: number, amount: number) => {
    try {
      await updateDoc(doc(db, "users", userId), { balance: currentBalance + amount });
      addNotification("تم التعديل", "تم تحديث رصيد المستخدم", "⚖️");
    } catch (e) {
      addNotification("خطأ", "فشل تعديل الرصيد", "❌");
    }
  };

  const [newNewsText, setNewNewsText] = useState("");
  const [newsSearch, setNewsSearch] = useState("");

  const addNewsItem = async () => {
    if (!newNewsText.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "ticker"), { 
        text: newNewsText, 
        createdAt: serverTimestamp(), 
        order: news.length 
      });
      setNewNewsText("");
      addNotification("تمت الإضافة", "تمت إضافة الخبر بنجاح", "📢");
    } catch (e) {
      addNotification("خطأ", "فشل إضافة الخبر", "❌");
    } finally {
      setLoading(false);
    }
  };

  const deleteNewsItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
    try {
      await deleteDoc(doc(db, "ticker", id));
      addNotification("تم الحذف", "تم حذف الخبر", "🗑️");
    } catch (e) {
      addNotification("خطأ", "فشل الحذف", "❌");
    }
  };

  const filteredNews = news.filter(n => (n.text || "").toLowerCase().includes(newsSearch.toLowerCase()));

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: G.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 25 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: 0, padding: 10, borderRadius: 12, color: "#fff" }}>🔙</button>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.yellow }}>لوحة الإدارة PRO</h1>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 10 }}>
        {["orders", "recharges", "users", "ticker"].map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: 0,
              background: activeTab === t ? G.yellow : "rgba(255,255,255,0.05)",
              color: activeTab === t ? "#000" : "#fff",
              fontWeight: 900,
              fontSize: 12,
              whiteSpace: "nowrap"
            }}
          >
            {t === "orders" ? "📦 الطلبات" : t === "recharges" ? "💰 الشحن" : t === "users" ? "👥 المستخدمين" : "📢 الأخبار"}
          </button>
        ))}
      </div>

      <div style={{ paddingBottom: 100 }}>
        {activeTab === "orders" && (
          <div style={{ display: "grid", gap: 15 }}>
            {orders.length === 0 && <div style={{ textAlign: "center", color: G.sub, padding: 40 }}>لا توجد طلبات حالياً</div>}
            {orders.map(o => (
              <GlassCard key={o.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 900, color: G.yellow }}>طلب #{o.id.slice(-5)}</span>
                  <span style={{ fontSize: 12, color: G.sub }}>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : ""}</span>
                </div>
                <div style={{ fontSize: 13, color: G.text, marginBottom: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 8, marginBottom: 8 }}>
                    <div>
                        <div style={{ fontSize: 10, color: G.sub2 }}>المستخدم</div>
                        <div style={{ fontWeight: 900, color: "#fff" }}>{o.userName || "غير معروف"}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 10, color: G.sub2 }}>الإيميل / الهاتف</div>
                        <div style={{ fontSize: 10, color: G.yellow }}>{o.userEmail}</div>
                        {o.userPhone && <div style={{ fontSize: 10, color: G.sub }}>{o.userPhone}</div>}
                    </div>
                  </div>
                  
                  <b>الخدمة:</b> {o.serviceName || o.serviceId} <br/>
                  <b>الرابط:</b> <a href={o.link} target="_blank" style={{ color: G.yellow, fontSize: 11 }}>{o.link}</a> <br/>
                  <div style={{ marginTop: 10, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: `1px solid ${G.cardBorder}` }}>
                     <div style={{ fontSize: 10, color: G.sub2, marginBottom: 5, fontWeight: 900 }}>🔍 تحليل بيانات الطلب</div>
                     <pre style={{ fontSize: 9, opacity: 0.8, overflowX: "auto", whiteSpace: "pre-wrap", color: G.blue }}>{JSON.stringify(o, (k,v) => ['id','userName','userEmail','status','createdAt','serviceName','date'].includes(k) ? undefined : v, 2)}</pre>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: G.yellow }}>
                    £{o.total ? Number(o.total).toFixed(2) : "0.00"}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[
                    { id: 'pending', label: 'جاري المراجعة' },
                    { id: 'received', label: 'تم استلام الطلب' },
                    { id: 'processing', label: 'جاري العمل' },
                    { id: 'completed', label: 'تم التنفيذ' },
                    { id: 'cancelled', label: 'ملغي' }
                  ].map(s => (
                    <button 
                      key={s.id}
                      onClick={() => updateOrderStatus(o.id, s.id)}
                      style={{
                        padding: "6px 10px", fontSize: 10, borderRadius: 8, border: 0,
                        background: o.status === s.id ? G.green : "rgba(255,255,255,0.08)",
                        color: o.status === s.id ? "#000" : "#fff",
                        fontWeight: 900
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === "recharges" && (
          <div style={{ display: "grid", gap: 15 }}>
            {recharges.length === 0 && <div style={{ textAlign: "center", color: G.sub, padding: 40 }}>لا توجد طلبات شحن منتظرة</div>}
            {recharges.map(r => (
              <GlassCard key={r.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 900, color: "#00d4ff" }}>شحن: £{r.amount}</span>
                  <span style={{ fontSize: 12, color: G.sub }}>{r.method}</span>
                </div>
                {r.userName && <div style={{ fontSize: 12, color: G.text, marginBottom: 4 }}><b>المستخدم:</b> {r.userName}</div>}
                <div style={{ fontSize: 12, color: G.text, marginBottom: 12 }}>
                  <b>الحالة:</b> {r.status === 'pending' ? '⏳ منتظر' : r.status === 'approved' ? '✅ مقبول' : '❌ مرفوض'}
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Btn label="رفض" onClick={() => handleRecharge(r, false)} variant="ghost" color="#ff4d4d" />
                    <Btn label="موافقة" onClick={() => handleRecharge(r, true)} />
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div style={{ display: "grid", gap: 15 }}>
            {users.map(u => (
              <GlassCard key={u.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900, color: "#fff" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: G.sub }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: G.green }}>£{u.balance}</div>
                    <div style={{ fontSize: 10, color: G.yellow }}>{u.points} نقطة</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 15 }}>
                  <button onClick={() => {
                    const val = prompt("المبلغ المراد خصمه:");
                    if(val) adjustUserBalance(u.id, u.balance, -Number(val));
                  }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", padding: 8, borderRadius: 8, fontSize: 11 }}>خصم رصيد</button>
                  <button onClick={() => {
                    const val = prompt("المبلغ المراد إضافته:");
                    if(val) adjustUserBalance(u.id, u.balance, Number(val));
                  }} style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#10b981", padding: 8, borderRadius: 8, fontSize: 11 }}>إضافة رصيد</button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === "ticker" && (
          <div style={{ display: "grid", gap: 15 }}>
            <GlassCard style={{ padding: 16 }}>
              <div style={{ color: G.yellow, fontSize: 13, fontWeight: 900, marginBottom: 8 }}>إضافة خبر جديد</div>
              <textarea 
                value={newNewsText}
                onChange={(e) => setNewNewsText(e.target.value)}
                placeholder="اكتب الخبر هنا..."
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 12, padding: 12, color: "#fff", fontSize: 13, minHeight: 80, marginBottom: 12,
                  outline: "none"
                }}
              />
              <Btn full label="نشر الخبر" onClick={addNewsItem} disabled={!newNewsText.trim() || loading} />
            </GlassCard>
            
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: G.sub, fontSize: 11, fontWeight: 900 }}>الأخبار الحالية</div>
              <input 
                type="text"
                placeholder="🔍 بحث..."
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 11, outline: "none", width: 120
                }}
              />
            </div>

            {filteredNews.map(n => (
              <GlassCard key={n.id} style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#fff" }}>{n.text}</span>
                <button onClick={() => deleteNewsItem(n.id)} style={{ background: "none", border: 0, fontSize: 18 }}>🗑️</button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({ setTab, setServiceDetail, setSocialPlatform, syncedPrices, isSyncing, balance, cart, tickerItems, orders }: any) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasNotif, setHasNotif] = useState(true);
  const [notifications, setNotifications] = useState(HOMESCREEN_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotif = () => {
    setNotifOpen((v) => !v);
    setHasNotif(false);
  };

  const clearNotifs = () => {
    setNotifications([]);
    setNotifOpen(false);
  };

  const dismissNotif = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handlePlatformClick = (platformLabel: string) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.name === platformLabel);
    if (platform) {
      setSocialPlatform(platform);
      setTab("social");
    }
  };

  const handleAIClick = (toolName: string) => {
    const aiCategory = SERVICES_DATA[5];
    const tool = aiCategory.items.find(item => item.name.includes(toolName) || toolName.includes(item.name));
    if (tool) {
      setServiceDetail(tool);
    } else {
      setTab("ai_tools");
    }
  };

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* ── الشريط العلوي ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 20px 14px",
        position: "relative",
        zIndex: 10,
      }}>
        <div>
          <p style={{ fontSize: 12, color: G.sub, marginBottom: 2 }}>مرحباً بك 👋</p>
          <div style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            القائد
            <span style={{
              background: "linear-gradient(135deg,#f5c842,#e8720c)",
              color: "#1a0a00", fontSize: 10, fontWeight: 900,
              padding: "2px 9px", borderRadius: 20,
            }}>PRO</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }} ref={notifRef}>
          {isSyncing && (
             <div style={{ fontSize: 9, color: G.blue, display: "flex", alignItems: "center", gap: 4 }}>
                <span className="spinner" style={{ width: 12, height: 12, border: `2px solid ${G.blue}40`, borderTopColor: G.blue, borderRadius: "50%" }} />
             </div>
          )}

          {/* Cart Icon in Header */}
          <button className="btn" style={{
            width: 38, height: 38,
            background: "#111420",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
          }} onClick={() => setTab("cart")}>
            <IconShoppingCart size={18} color="#8892aa" />
            {cart.length > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6,
                background: G.blue, color: "white", fontSize: 8, fontWeight: 700,
                minWidth: 14, height: 14, borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", border: "1.5px solid #0a0c14",
              }}>{cart.length}</span>
            )}
          </button>

          <button className="btn" style={{
            width: 38, height: 38,
            background: "#111420",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
          }} onClick={openNotif}>
            <IconBell size={18} color={hasNotif ? G.blue : "#8892aa"} />
            {hasNotif && <span style={{
              position: "absolute", top: 8, left: 8,
              width: 8, height: 8,
              background: "#ef4444", borderRadius: "50%",
              border: "1.5px solid #0a0c14",
            }} />}
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute",
              top: 50, left: 0,
              background: "#181d2e",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "14px 14px 6px",
              zIndex: 200,
              boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
              minWidth: 260,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>الإشعارات</span>
                <button style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }} onClick={clearNotifs}>مسح الكل</button>
              </div>
              {notifications.length === 0 ? (
                <p style={{ fontSize: 12, color: "#8892aa", textAlign: "center", padding: "8px 0" }}>لا توجد إشعارات جديدة</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: n.bg, color: n.color, flexShrink: 0 }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>{n.text}</p>
                      <span style={{ fontSize: 10, color: "#8892aa" }}>{n.time}</span>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#8892aa", display: "flex", alignItems: "center", padding: 2 }} onClick={() => dismissNotif(n.id)}>
                      <IconTablerX size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700, color: "white",
            cursor: "pointer", userSelect: "none",
          }} onClick={() => setTab("settings")}>ق</div>
        </div>
      </header>

      {/* ── كارد الرصيد ── */}
      <section style={{
        margin: "4px 16px 14px",
        background: "#111420",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: 20,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#6366f1,#3b82f6,#f5c842)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#8892aa" }}>الرصيد المتاح</span>
          <button className="btn" style={{ width: 28, height: 28, borderRadius: 8, background: "#181d2e", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setTab("wallet")}>
            <IconDots size={14} color="#8892aa" />
          </button>
        </div>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#f5c842", letterSpacing: -1, marginBottom: 16 }}>
          <span style={{ fontSize: 22, marginLeft: 2 }}>£</span>{balance.toLocaleString()}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {(() => {
            const totalOrders = orders?.length || 0;
            const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
            const todayOrders = orders?.filter((o: any) => {
               const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
               return d.toLocaleDateString("en-CA") === today;
            }).length || 0;
            const totalSpent = orders?.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0) || 0;

            return [
              { icon: "💰", val: `£${totalSpent.toLocaleString()}`, lbl: "إجمالي التداول" },
              { icon: "✅", val: totalOrders.toLocaleString(),    lbl: "إجمالي الطلبات" },
              { icon: "📋", val: todayOrders.toLocaleString(),     lbl: "طلبات اليوم" },
            ].map((s) => (
              <div key={s.lbl} style={{ background: "#181d2e", borderRadius: 12, padding: "10px 8px", textAlign: "center", cursor: "pointer" }} onClick={() => setTab("history")}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "#8892aa" }}>{s.lbl}</div>
              </div>
            ));
          })()}
        </div>
        <button className="btn" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          background: "linear-gradient(135deg,#6366f1,#3b82f6)",
          color: "white", border: "none", borderRadius: 12,
          padding: "11px 0", width: "100%",
          fontFamily: G.font,
          fontSize: 14, fontWeight: 700, cursor: "pointer",
        }} onClick={() => setTab("wallet")}>
          <IconPlus size={16} />
          شحن الرصيد
        </button>
      </section>

      {/* ── تيكر التحديثات ── */}
      <div style={{
        margin: "0 16px 14px",
        background: "rgba(99,102,241,0.1)",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
        overflow: "hidden",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ width: 6, height: 6, background: "#6366f1", borderRadius: "50%", flexShrink: 0 }} />
        <span style={{ background: "#6366f1", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>جديد</span>
        <div className="ticker-wrapper" style={{ flex: 1, overflow: "hidden" }}>
          <motion.div 
            animate={{ x: ["100%", "-100%"] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: 12, color: "#f0f4ff", whiteSpace: "nowrap" }}
          >
            {tickerItems && tickerItems.length > 0 
              ? tickerItems.map((t: any) => `📢 ${t.text}`).join(" \u00A0\u00A0\u00A0\u00A0 ") 
              : "مرحباً بك في القائد - أفضل خدمات في الشرق الأوسط"}
          </motion.div>
        </div>
      </div>

      {/* ── منصات السوشيال ميديا ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 10px", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>🚀 منصات السوشيال ميديا</span>
        <button className="btn" style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => setTab("social")}>عرض الكل ←</button>
      </div>
      <div className="no-scrollbar" style={{
        display: "flex", gap: 10,
        padding: "0 16px 20px",
        overflowX: "auto",
        position: "relative", zIndex: 1,
      }}>
        {TOP_PLATFORMS.map((p) => (
          <button key={p.id} className="btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }} onClick={() => handlePlatformClick(p.label)}>
            <div style={{
              width: 54, height: 54, borderRadius: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: p.bg, color: p.color,
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {p.icon}
            </div>
            <span style={{ fontSize: 11, color: "#8892aa" }}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── أدوات الذكاء الاصطناعي ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 10px", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>✨ أدوات الذكاء الاصطناعي</span>
        <button className="btn" style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => setTab("ai_tools")}>المزيد ←</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 20px", position: "relative", zIndex: 1 }}>
        {AI_TOOLS_DATA.map((t) => (
          <button
            key={t.id}
            className="btn"
            style={{
              background: "#111420",
              border: t.featured ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 14,
              cursor: "pointer", textAlign: "right",
              position: "relative", overflow: "hidden",
              fontFamily: G.font,
              ...(t.featured ? { background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(59,130,246,0.1))" } : {}),
            }}
            onClick={() => handleAIClick(t.name)}
          >
            {t.featured && <span style={{ position: "absolute", top: 10, left: 10, background: "#6366f1", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>مميز</span>}
            <div style={{ marginBottom: 8, color: t.featured ? "#a5b4fc" : "#8892aa" }}>
              {t.emoji}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f4ff" }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "#8892aa", marginTop: 3 }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


function SectionGrid({ title, items, onItem, accent, cols = 4 }: any) {
  return (
    <div style={{ marginBottom: 26 }}>
      <SectionHeader title={title} accent={accent} />
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: `repeat(${cols}, 1fr)`, 
        gap: 10, 
        padding: "0 20px" 
      }}>
        {items.map((item: any, i: number) => (
          <div key={i} className={`card fade ${item.comingSoon ? "coming-soon" : ""}`} 
            onClick={() => !item.comingSoon && onItem(item)}
            style={{
              background: G.card, 
              border: `1px solid ${item.comingSoon ? "rgba(255,255,255,0.03)" : G.cardBorder}`, 
              borderRadius: 16, 
              padding: "16px 8px",
              position: "relative", 
              overflow: "hidden", 
              textAlign: "center",
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              justifyContent: "space-between", 
              minHeight: cols === 3 ? 130 : 100,
              boxShadow: item.comingSoon ? "none" : "0 10px 30px -10px rgba(0,0,0,0.3)",
              cursor: item.comingSoon ? "default" : "pointer",
              opacity: item.comingSoon ? 0.4 : 1,
              filter: item.comingSoon ? "grayscale(0.8)" : "none"
            }}>
            {item.comingSoon && (
              <div style={{ 
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2, background: "rgba(0,0,0,0.2)"
              }}>
                <div style={{ 
                  background: G.yellow, color: "#000", fontSize: 9, fontWeight: 900,
                  padding: "4px 10px", borderRadius: 8, transform: "rotate(-12deg)",
                  boxShadow: `0 4px 10px ${G.yellow}40`
                }}>قريباً</div>
              </div>
            )}
            <div style={{ 
              width: 40, height: 40, borderRadius: 12, 
              background: `${item.color}15`, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 20, marginBottom: 10,
              border: `1px solid ${item.color}25`
            }}>
              {item.icon}
            </div>
            <div style={{ 
              fontSize: cols === 3 ? 9 : 10, 
              fontWeight: 900, 
              color: G.text, 
              marginBottom: 4, 
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              {item.name}
            </div>
            <div style={{ 
              fontSize: 8, 
              color: item.color, 
              fontWeight: 800,
              background: `${item.color}10`,
              padding: "2px 6px",
              borderRadius: 4
            }}>
              {item.comingSoon ? "قريباً" : item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialMediaScreen({ initialPlatform, setServiceDetail, syncedPrices }: any) {
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform || SOCIAL_PLATFORMS[0]);
  const [selectedCat, setSelectedCat] = useState("الكل");
  
  const rawServices = SOCIAL_CATALOG[selectedPlatform.name] || [];
  
  // Apply synced prices
  const allServices = rawServices.map((s: any) => ({
    ...s,
    price: syncedPrices[s.id] || s.price
  }));
  
  // Extract unique categories for the current platform
  const categories = ["الكل", ...new Set(allServices.map((s: any) => s.cat))] as string[];

  const filteredServices = selectedCat === "الكل" 
    ? allServices 
    : allServices.filter((s: any) => s.cat === selectedCat);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 20px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>متجر السوشيال ميديا</h1>
      </div>

      {/* Platform Selector */}
      <div style={{ padding: "0 20px", display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14 }}>
        {SOCIAL_PLATFORMS.map((p, i) => (
          <div key={i} className="btn" onClick={() => { setSelectedPlatform(p); setSelectedCat("الكل"); }}
            style={{
              minWidth: 90, padding: "10px 14px", borderRadius: 14, textAlign: "center",
              background: selectedPlatform.name === p.name ? `${p.color}20` : G.card,
              border: `1.5px solid ${selectedPlatform.name === p.name ? p.color : G.cardBorder}`,
              flexShrink: 0, cursor: "pointer"
            }}>
            <div style={{ fontSize: 20 }}>{p.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: G.text, marginTop: 4 }}>{p.name}</div>
          </div>
        ))}
      </div>

      {/* Category Selector (The "Grouping" request) */}
      <div style={{ padding: "0 20px", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, marginTop: 4 }}>
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedCat(cat)}
            style={{ 
              padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: selectedCat === cat ? G.blue : "rgba(255,255,255,0.05)",
              color: selectedCat === cat ? "#fff" : G.sub2,
              border: `1px solid ${selectedCat === cat ? G.blue : G.cardBorder}`,
              whiteSpace: "nowrap", cursor: "pointer"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredServices.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: G.sub, fontSize: 13 }}>لا توجد خدمات في هذا القسم حالياً.</div>
        ) : (
          filteredServices.map((svc: any, i: number) => (
            <div key={i} className="card fade" onClick={() => setServiceDetail({ ...svc, btn: "إرسال الطلب" })}
              style={{
                background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 14, padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${svc.platformColor}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{svc.emoji}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{svc.name.replace(`${svc.platform} — `, "")}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                    <Badge label={svc.cat} color={svc.platformColor} size="xs" />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: G.yellow }}>£{svc.price}</div>
                <div style={{ fontSize: 9, color: G.sub }}>لكل 1000</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ServicesScreen({ setServiceDetail, setTab, balance }: any) {
  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Search Bar - Aesthetic Only for now */}
      <div style={{ padding: "52px 20px 10px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 16 }}>استكشف الخدمات</h1>
        <div style={{ position: "relative" }}>
          <input 
            type="text" 
            placeholder="ابحث عن خدمة (ChatGPT, Netflix...)" 
            style={{ 
              width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.cardBorder}`, 
              borderRadius: 14, padding: "12px 16px 12px 40px", color: G.text, fontSize: 13, outline: "none"
            }} 
          />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>🔍</span>
        </div>
      </div>

      <div style={{ margin: "10px 20px 24px", padding: 22, borderRadius: 22, background: "linear-gradient(135deg,rgba(244,114,182,0.12),rgba(79,142,247,0.08))", border: "1px solid rgba(244,114,182,0.2)", cursor: "pointer", position: "relative", overflow: "hidden" }}
        onClick={() => setTab("social")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: G.text, marginBottom: 4 }}>📱 متجر السوشيال ميديا</div>
            <div style={{ fontSize: 12, color: G.sub2 }}>تطوير حسابات انستجرام، تيك توك، إلخ...</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: G.pink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>→</div>
        </div>
      </div>

      {SERVICES_DATA.map((sec, si) => {
        if (sec.category.includes("المالية")) return null;
        const isLogistics = sec.category.includes("اللوجستية");
        const isThreeCols = sec.category.includes("الألعاب");
        return (
          <div key={si} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: sec.accent, borderRadius: 4, boxShadow: `0 0 10px ${sec.accent}` }} />
              <span style={{ fontSize: 15, color: G.text, fontWeight: 800 }}>{sec.category}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${isLogistics ? 2 : isThreeCols ? 3 : 4}, 1fr)`, gap: 8, padding: "0 20px" }}>
              {sec.items.map((item, i) => (
                <div key={i} className="card fade" onClick={() => setServiceDetail(item)}
                  style={{ 
                    background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 14, padding: "12px 6px", 
                    textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 90 
                  }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, margin: "0 auto 8px" }}>{item.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: G.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: 8, color: item.color, fontWeight: 700 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      <FinancialGrid 
          balance={balance} 
          onSelectService={(id: string) => {
            const svc = SERVICES_DATA[4].items.find(i => i.id === id);
            if (svc) setServiceDetail(svc);
          }} 
      />
    </div>
  );
}

function AIChatBot({ addNotification }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "أهلاً بك! أنا مساعد القائد 🫡، كيف يمكنني مساعدتك اليوم؟ يمكنني شرح كل أقسام البرنامج وكيفية الشراء." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `أنت "مساعد القائد"، خبير في تطبيق "القائد برو". مهمتك هي مساعدة المستخدمين وشرح كيفية استخدام التطبيق وشراء الخدمات. 
          قواعد عامة:
          1. اسمك دائماً "مساعد القائد".
          2. كن ودوداً ومحترفاً وتحدث باللغة العربية.
          3. التطبيق يقدم خدمات: 
             - سوشيال ميديا (متابعين، لايكات، مشاهدات لإنستجرام، تيك توك، يوتيوب، إلخ).
             - خدمات لوجستية (شراء من تيمو، علي إكسبريس، أمازون بخصومات تصل لـ 85%).
             - شحن ألعاب (ببجي، فري فاير، روبلوكس بخصم 30%).
             - خدمات مالية (شحن بايبال، بايننس، بايونير، وايز بخصم 30%).
             - أدوات ذكاء اصطناعي (ChatGPT Plus، Midjourney، Gemini Advanced بخصم 85%).
             - سحب الرصيد لكاش (فودافون كاش، إلخ).
          4. كيفية الشراء:
             - اذهب للقسم المطلوب من القائمة الجانبية أو الصفحة الرئيسية.
             - اختر الخدمة، ادخل البيانات المطلوبة (مثل الرابط أو الـ ID).
             - اضغط "شراء مباشر" وسيخصم المبلغ من رصيد المحفظة.
          5. شحن الرصيد: من صفحة المحفظة -> شحن الرصيد -> أدخل المبلغ وانسخ رقم المحطة وحول عليه ثم ارفع صورة الإيصال.
          6. إذا سأل المستخدم عن شيء غير متوفر، أخبره أننا نسعى لإضافته قريباً وجهه للتحدث مع الدعم الفني من صفحة التذاكر.`,
        }
      });

      // Simple implementation using generateContent since sendMessage might need full history sync
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: "user", parts: [{ text: userMsg }] }
        ]
      });

      const aiResponse = result.text;
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، واجهت مشكلة في الاتصال. يرجى المحاولة لاحقاً." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Target Icon */}
      <div 
        onClick={() => setIsOpen(true)}
        className="glow float" 
        style={{ 
          position: "fixed", bottom: 100, right: 20, width: 56, height: 56, 
          borderRadius: "50%", background: `linear-gradient(135deg, ${G.blue}, ${G.pink})`, color: "#fff", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: 28, boxShadow: "0 8px 24px rgba(79,142,247,0.4)", zIndex: 999, cursor: "pointer",
          border: "2px solid rgba(255,255,255,0.2)"
        }}
      >
        <div style={{ position: "relative" }}>
          👑
          <div style={{ position: "absolute", top: -5, right: -5, width: 12, height: 12, background: G.green, borderRadius: "50%", border: "2px solid #fff", animation: "pulse 2s infinite" }} />
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(4, 7, 15, 0.9)", zIndex: 3000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)"
        }}>
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            style={{ 
              width: "100%", maxWidth: 400, height: "80vh", maxHeight: 650,
              background: G.bg, borderRadius: 24, display: "flex", flexDirection: "column",
              border: `1px solid ${G.cardBorder}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", background: G.card, borderBottom: `1px solid ${G.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${G.blue}30, ${G.pink}30)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👑</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: G.text }}>مساعد القائد</div>
                  <div style={{ fontSize: 10, color: G.green, fontWeight: 700 }}>• نشط الآن بالذكاء الاصطناعي</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: G.sub, padding: 8, borderRadius: 10, cursor: "pointer" }}>✖</button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}
            >
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
                  maxWidth: "85%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "assistant" ? "flex-start" : "flex-end"
                }}>
                  <div style={{ 
                    padding: "12px 16px",
                    borderRadius: m.role === "assistant" ? "4px 16px 16px 16px" : "16px 16px 4px 16px",
                    background: m.role === "assistant" ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${G.blue}, ${G.blue}DD)`,
                    color: "#fff",
                    fontSize: 13,
                    lineHeight: 1.6,
                    border: m.role === "assistant" ? `1px solid ${G.cardBorder}` : "none"
                  }}>
                    {m.content}
                  </div>
                  <span style={{ fontSize: 9, color: G.sub2, marginTop: 4 }}>{m.role === "assistant" ? "مساعد القائد" : "أنت"}</span>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", padding: "10px 16px", borderRadius: 12, display: "flex", gap: 4 }}>
                  <div className="dot" style={{ width: 6, height: 6, background: G.sub, borderRadius: "50%" }}></div>
                  <div className="dot" style={{ width: 6, height: 6, background: G.sub, borderRadius: "50%", animationDelay: "0.2s" }}></div>
                  <div className="dot" style={{ width: 6, height: 6, background: G.sub, borderRadius: "50%", animationDelay: "0.4s" }}></div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: 20, borderTop: `1px solid ${G.cardBorder}`, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="اسأل القائد عن أي شيء..."
                  style={{ 
                    flex: 1, background: G.card, border: `1px solid ${G.cardBorder}`,
                    borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 13, outline: "none"
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  style={{ 
                    width: 44, height: 44, borderRadius: 12, background: G.blue, color: "#fff",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: !input.trim() || loading ? 0.5 : 1, transition: "0.2s"
                  }}
                >
                  🚀
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function FAQItem({ q, a }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${G.cardBorder}`, padding: "12px 0" }}>
      <div 
        onClick={() => setOpen(!open)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{q}</span>
        <span style={{ fontSize: 10, color: G.sub2, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </div>
      {open && (
        <div className="fadeIn" style={{ fontSize: 12, color: G.sub, marginTop: 8, lineHeight: 1.6 }}>{a}</div>
      )}
    </div>
  );
}

function MaintenanceNotice({ onClose }: any) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(4, 7, 15, 0.85)", zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)"
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: "100%", maxWidth: 340 }}
      >
        <GlassCard style={{ padding: 32, textAlign: "center", border: `1px solid ${G.blue}40`, background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(79,142,247,0.05))" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 16 }}>تحديثات هامة</h2>
          <p style={{ fontSize: 14, color: G.sub2, lineHeight: 1.8, marginBottom: 24 }}>
            التطبيق في تحديثات برجاء الانتظار قليلاً. نحن نعمل على إطلاق ميزات جديدة كلياً لتحسين تجربتكم.
          </p>
          <Btn full label="حسناً، فهمت" onClick={onClose} />
        </GlassCard>
      </motion.div>
    </div>
  );
}

function OrderConfirmModal({ isOpen, onClose, onConfirm, service, quantity, total, loading, title = "تأكيد الطلب", confirmLabel = "تأكيد الطلب", note = "💰 سيتم خصم المبلغ من رصيد محفظتك" }: any) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(4, 7, 15, 0.9)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)"
    }}>
      <GlassCard className="fadeIn" style={{ width: "100%", maxWidth: 360, padding: 28, border: `1px solid ${G.cardBorder}` }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `${service.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>
            {service.icon}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: G.text }}>{title}</h3>
          <p style={{ fontSize: 13, color: G.sub, marginTop: 4 }}>يرجى مراجعة التفاصيل قبل المتابعة</p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 16, border: `1px solid ${G.cardBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 13, color: G.sub2 }}>الخدمة:</span>
            <span style={{ fontSize: 13, color: G.text, fontWeight: 700, textAlign: "left" }}>{service.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: G.sub2 }}>{service.note === "FINANCIAL" ? "المبلغ بالدولار:" : service.type === "subscription" ? "مدة الاشتراك:" : "الكمية:"}</span>
            <span style={{ fontSize: 14, color: G.blue, fontWeight: 800 }}>
              {service.note === "FINANCIAL" ? `$${quantity}` : service.type === "subscription" ? (service.duration || "شهر واحد") : quantity.toLocaleString()}
            </span>
          </div>
          {service.note === "FINANCIAL" && (
             <div style={{ display: "flex", justifyContent: "space-between", marginTop: -8 }}>
               <span style={{ fontSize: 11, color: G.sub2 }}>سعر الصرف:</span>
               <span style={{ fontSize: 11, color: G.blue, fontWeight: 700 }}>1$ = 54.40 ج.م</span>
             </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${G.cardBorder}`, paddingTop: 14 }}>
            <span style={{ fontSize: 13, color: G.sub2 }}>المبلغ الإجمالي:</span>
            <span style={{ fontSize: 18, color: G.yellow, fontWeight: 900 }}>£{total} <span style={{ fontSize: 10 }}>ج.م</span></span>
          </div>
          <div style={{ background: note.includes("خصم") ? "rgba(34, 197, 94, 0.1)" : "rgba(79, 142, 247, 0.1)", padding: "8px 12px", borderRadius: 10, border: note.includes("خصم") ? "1px dashed rgba(34, 197, 94, 0.3)" : "1px dashed rgba(79, 142, 247, 0.3)", textAlign: "center" }}>
             <div style={{ fontSize: 10, color: note.includes("خصم") ? G.green : G.blue, fontWeight: 700 }}>{note}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Btn full label="إلغاء" variant="ghost" onClick={onClose} disabled={loading} />
          <Btn full label={loading ? "⏳ جاري..." : confirmLabel} onClick={onConfirm} color={service.color} disabled={loading} />
        </div>
      </GlassCard>
    </div>
  );
}

function ServiceDetailScreen({ service, onBack, addToCart, setTab, addOrder, addPriceAlert, balance, setBalance, addNotification }: any) {
  const [vals, setVals] = useState({} as any);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [shippingMethod, setShippingMethod] = useState(service.shippingMethods ? service.shippingMethods[0] : null);
  const [selectedPkg, setSelectedPkg] = useState(service.packages ? service.packages[0] : null);
  const [topupAmt, setTopupAmt] = useState(100);
  const [quantity, setQuantity] = useState(
    service.type === "logistics_link" || service.type === "subscription" ? 1 : (service.minQuantity || 100)
  );
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cartConfirmOpen, setCartConfirmOpen] = useState(false);
  const [ showAlertInput, setShowAlertInput ] = useState(false);
  
  if (service.note === "FINANCIAL" || service.note === "WITHDRAWAL") {
    return (
      <div className="fade" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0d0d12", zIndex: 2000, overflowY: "auto" }}>
        <FinancialServicePage 
          serviceId={service.id} 
          balance={balance} 
          onConfirmOrder={async (orderData: any) => {
             // Use the standard addOrder function which handles transactions and balance
             const resId = await addOrder({
               ...service,
               ...orderData.details,
               total: orderData.total,
               quantity: orderData.quantity,
               productName: service.name,
               // addOrder adds status, createdAt, userId, etc.
             });
             
             if (!resId) throw new Error("فشل إتمام الطلب، يرجى التحقق من الرصيد");
             
             // Successfully placed
             setBalance((prev: number) => prev - orderData.total);
          }}
          onBack={onBack}
        />
      </div>
    );
  }

  // Logistics Specific State (Manual)
  const [productData, setProductData] = useState({
    name: "",
    sourcePrice: 0,
    url: ""
  });
  
  const isFinancial = service.note === "FINANCIAL";
  
  const isLogistics = service.type === "logistics_link" || 
                     service.type === "amazon_balance" || 
                     ["customs", "broker", "shipping", "topup"].includes(service.id);

  const isAITool = service.type === "ai_tool";

  const isSubscription = service.type === "subscription" || service.id?.includes("ai") || service.id?.includes("netflix");

  const discount = service.discount || 0.85;
  const ownerPrice = Math.round(productData.sourcePrice * (1 - discount));
  
  const faqs = service.faqs || DEFAULT_FAQS;

  const validateFields = () => {
    // 1. First validate generic fields defined in service.fields
    for (const field of service.fields || []) {
      const val = vals[field];
      if (!val || !val.trim()) {
        addNotification("بيانات ناقصة", `يرجى ملء حقل: ${field}`, "❌");
        return false;
      }
      if (field.includes("البريد") && !validateEmail(val)) {
        addNotification("خطأ في البريد", `البريد المدخل في ${field} غير صالح`, "⚠️");
        return false;
      }
      if ((field.includes("الهاتف") || field.includes("الموبايل") || field.includes("الكاش")) && !validatePhone(val)) {
        addNotification("رقم هاتف خاطئ", `يرجى إدخال رقم هاتف مصري صحيح في حقل ${field}`, "⚠️");
        return false;
      }
    }

    // 2. Specific logic for non-generic types
    if (service.type === "logistics_link") {
      if (!productData.name || !productData.url || !productData.sourcePrice) {
        addNotification("نقص في البيانات", "يرجى إكمال بيانات المنتج أولاً", "❌");
        return false;
      }
    }
    
    if (service.type === "amazon_balance") {
      if (!quantity || quantity <= 0) {
        addNotification("خطأ", "يرجى إدخال مبلغ الشحن", "⚠️");
        return false;
      }
    }

    if (service.note === "FINANCIAL") {
      const idVal = vals["ID"] || "";
      const emailVal = vals["البريد"] || "";
      if (!idVal.trim()) {
        addNotification("تنبيه 🆔", "يرجى إدخال الـ ID الخاص بالمستلم", "⚠️");
        return false;
      }
      if (!emailVal.trim()) {
        addNotification("تنبيه ✉️", "يرجى إدخال البريد الإلكتروني للمتابعة", "⚠️");
        return false;
      }
      if (!validateEmail(emailVal)) {
        addNotification("خطأ في البريد", "البريد الإلكتروني المدخل غير صالح", "⚠️");
        return false;
      }
      if (!quantity || quantity <= 0) {
        addNotification("تنبيه 💰", "يرجى إدخال المبلغ المراد تحويله بالدولار", "⚠️");
        return false;
      }
      if (quantity < (service.minQuantity || 5)) {
        addNotification("المبلغ غير كافٍ", `الحد الأدنى للتحويل هو $${service.minQuantity || 5}`, "❌");
        return false;
      }
    }

    return true;
  };

  const calculateTotal = () => {
    let total = 0;
    if (service.type === "logistics_link") {
      total = ownerPrice * (quantity || 1);
    } else if (service.type === "amazon_balance") {
      total = Number(quantity) || 0;
    } else if (service.note === "GAMING CHARGE" || service.note === "FINANCIAL") {
      const dollarAmt = Number(selectedPkg ? selectedPkg.price : (quantity || 0));
      total = dollarAmt * 54.4;
    } else if (service.type === "subscription") {
      const disc = service.discount || 0.85;
      const durationMultiplier = duration === DURATIONS[0] ? 1 : 
                                 duration === DURATIONS[1] ? 2.8 : 
                                 duration === DURATIONS[2] ? 5.2 : 9;
      total = service.price * (1 - disc) * durationMultiplier;
    } else if (service.price) {
      total = (service.price / 1000) * quantity;
    }
    return total;
  };

  const displayTotal = () => {
    const t = calculateTotal();
    return t.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const prepareOrderData = () => {
    const totalEGP = Number(calculateTotal());
    const baseData = {
      ...service,
      total: totalEGP,
      details: Object.entries(vals).map(([k,v]) => `${k}: ${v}`).join(", ") + (shippingMethod ? `, Method: ${shippingMethod}` : "")
    };

    if (service.type === "logistics_link") {
      return {
        ...baseData,
        productName: productData.name,
        originalPrice: productData.sourcePrice,
        price: ownerPrice,
        quantity,
        link: productData.url
      };
    }
    
    if (service.type === "amazon_balance") {
      return {
        ...baseData,
        amazonValue: Math.round(quantity * 2.1),
        quantity
      };
    }

    if (service.type === "subscription") {
      return {
        ...baseData,
        duration
      };
    }

    return {
      ...baseData,
      quantity: selectedPkg ? 1 : quantity,
      productName: selectedPkg ? `${service.name} (${selectedPkg.name})` : service.name,
      shippingMethod,
      id: Math.floor(Math.random() * 1000000).toString()
    };
  };

  const handleEditResult = (field: string, val: any) => {
    setProductData({ ...productData, [field]: val });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^01[0125][0-9]{8}$/.test(phone);

  const handleAIRun = async () => {
    if (!validateFields()) return;
    
    setAiLoading(true);
    setAiResult(null);
    
    try {
      if (service.tool_type === "image") {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ text: vals["صف الصورة (Prompt)"] }],
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            setAiResult(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      } else if (service.tool_type === "summary") {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Please summarize the following text in Arabic: ${vals["النص المراد تلخيصه"]}`,
        });
        setAiResult(response.text);
      } else if (service.tool_type === "content") {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Create ${vals["نوع المحتوى"]} content in Arabic based on this idea: ${vals["فكرة المحتوى"]}. Make it engaging and professional.`,
        });
        setAiResult(response.text);
      }
      
      addNotification("تمت العملية بنجاح! ✨", "الذكاء الاصطناعي أكمل المهمة المطلوبة بنجاح.", "🚀");
    } catch (err: any) {
      console.error(err);
      addNotification("خطأ في المعالجة ❌", "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.", "⚠️");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!validateFields()) return;
    setCartConfirmOpen(true);
  };

  const confirmAddToCart = () => {
    const orderData = prepareOrderData();
    addToCart(orderData);
    addNotification("🛒 تم الإضافة للسلة", `تم إضافة ${orderData.productName || orderData.name} بنجاح.`, "✨");
    setCartConfirmOpen(false);
    onBack();
  };

  const handleSubmit = () => {
    if (!validateFields()) return;
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      const orderData = prepareOrderData();
      const totalEGP = Number(orderData.total);
      
      if (isNaN(totalEGP) || totalEGP < 0) return;

      if (balance < totalEGP) {
        addNotification("عذراً، الرصيد غير كافٍ ❌", `رصيدك الحالي (£${balance}) أقل من تكلفة الطلب (£${totalEGP}). يرجى شحن رصيدك للمتابعة.`, "💰");
        setConfirmOpen(false);
        return;
      }

      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));

      const successId = await addOrder(orderData);
      if (successId) {
        setBalance((prev: number) => prev - totalEGP);
        addNotification("تمت عملية الشراء بنجاح ⚡", `تم خصم £${totalEGP} من رصيدك.`, "✅");
        setLoading(false); 
        setConfirmOpen(false);
        setSubmitted(true); 
      }
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: G.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 24, boxShadow: `0 0 40px ${G.green}40` }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 8 }}>تم إرسال الطلب بنجاح!</h2>
        <Btn full label="🔙 العودة للرئيسية" onClick={onBack} />
      </div>
    );
  }

  if (isFinancial) {
    const egpTotal = calculateTotal();
    const canBuy = balance >= egpTotal && egpTotal > 0 && (vals["ID"] || "").trim() && (vals["البريد"] || "").trim();

    return (
      <div dir="rtl" style={{ fontFamily: G.font, background: G.fin.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", paddingBottom: 120 }}>
        <style>{`
          .inp-fin:focus { border-color: ${G.fin.yellow} !important; outline: none; }
        `}</style>
        
        <OrderConfirmModal 
          isOpen={confirmOpen} 
          onClose={() => setConfirmOpen(false)} 
          onConfirm={confirmSubmit}
          service={{ ...service, duration }}
          quantity={quantity}
          total={displayTotal()}
          loading={loading}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 16px" }}>
          <div onClick={() => { setTab("history"); onBack(); }} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
            <span style={{ fontSize: 14 }}>🕐</span>
            <span style={{ fontSize: 12, color: G.fin.sub }}>سجل الطلبات</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: G.fin.text, lineHeight: 1.3 }}>{service.name}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.fin.sub }}>(USD)</div>
          </div>
          <div onClick={onBack} style={{ cursor: "pointer", color: G.fin.sub }}>←</div>
        </div>

        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: G.fin.card, border: `1px solid ${G.fin.border}`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: G.fin.sub2, marginBottom: 5 }}>السعر لكل 1 دولار</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: G.fin.yellow }}>£ 54.40 <span style={{ fontSize: 13, color: G.fin.sub }}>ج.م</span></div>
          </div>

          <Input label="الـ ID" value={vals["ID"] || ""} onChange={(e: any) => setVals({...vals, "ID": e.target.value})} placeholder="أدخل ID الحساب" dir="ltr" />
          <Input label="البريد الإلكتروني" value={vals["البريد"] || ""} onChange={(e: any) => setVals({...vals, "البريد": e.target.value})} placeholder="email@example.com" dir="ltr" />
          
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 12, color: G.fin.sub, fontWeight: 700, display: "block", marginBottom: 8 }}>المبلغ بالدولار</label>
            <input 
              className="inp-fin" 
              type="number"
              value={vals["المبلغ"] || ""} 
              onChange={e => setVals({ ...vals, "المبلغ": e.target.value, "quantity": Number(e.target.value) })} 
              placeholder="0.00" 
              dir="ltr" 
              style={{ width: "100%", background: G.fin.input, border: `1px solid ${G.fin.border}`, borderRadius: 12, color: G.fin.text, fontSize: 14, padding: "14px 16px", outline: "none" }}
            />
            <span style={{ position: "absolute", right: 16, top: 40, color: G.fin.yellow }}>$</span>
          </div>

          <Btn full label={loading ? "جاري المعالجة..." : "🚀 تأكيد وتحويل"} onClick={handleSubmit} disabled={!canBuy || loading} style={{ background: G.fin.yellow, color: "#000", marginTop: 10 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fade" style={{ paddingBottom: 120 }}>
      {/* HEADER */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, background: G.card, border: `1px solid ${G.cardBorder}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>←</button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: G.text }}>{service.name}</h1>
            <div style={{ fontSize: 12, color: G.sub }}>{service.type === "subscription" ? "اشتراك" : "خدمة شحن"}</div>
          </div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${service.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${service.color}30` }}>{service.icon}</div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>
         <GlassCard style={{ padding: 20 }}>
           <p style={{ fontSize: 13, color: G.sub, lineHeight: 1.7 }}>{service.desc}</p>
         </GlassCard>

         {service.fields && service.fields.length > 0 && (
           <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
             {service.fields.map((f: string) => (
                <div key={f}>
                   <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 700 }}>{f}</label>
                   <input 
                    value={vals[f] || ""} 
                    onChange={(e: any) => setVals({ ...vals, [f]: e.target.value })}
                    placeholder={`أدخل ${f}...`}
                    dir={f.includes("بريد") || f.includes("ID") ? "ltr" : "rtl"}
                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${G.cardBorder}`, borderRadius: 12, color: G.text, padding: "13px 16px", fontSize: 14, outline: "none" }}
                   />
                </div>
             ))}
           </div>
         )}

         <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
           <Btn full label="🛒 إضافة للسلة" onClick={handleAddToCart} variant="ghost" />
           <Btn full label="⚡ شراء مباشر" onClick={handleSubmit} />
         </div>
      </div>
      
      <OrderConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={confirmSubmit}
        service={{ ...service, duration }}
        quantity={quantity}
        total={displayTotal()}
        loading={loading}
      />
    </div>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case "completed": return { label: "مكتمل", color: G.green };
    case "processing": return { label: "جاري التنفيذ", color: G.blue };
    case "approved": return { label: "مقبول", color: G.pink };
    default: return { label: "تحت المراجعة", color: G.yellow };
  }
}

function HistoryScreen({ orders }: any) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (selectedOrder) {
    return (
      <div className="fade" style={{ paddingBottom: 120 }}>
        <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>←</button>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: G.text }}>تفاصيل الطلب</h1>
        </div>
        <div style={{ padding: "0 20px" }}>
          <GlassCard style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: G.text }}>{selectedOrder.name}</div>
                <div style={{ fontSize: 12, color: G.sub, marginTop: 4 }}>ID: {selectedOrder.id}</div>
              </div>
              <Badge label={getStatusInfo(selectedOrder.status).label} color={getStatusInfo(selectedOrder.status).color} size="sm" />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 12, fontWeight: 700 }}>سير العملية:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { title: "تم استلام الطلب", date: selectedOrder.date, done: true },
                  { title: "جاري المراجعة", date: "منذ قليل", done: true },
                  { title: "تم التنفيذ", date: selectedOrder.status === "completed" ? "مكتمل" : "قيد المعالجة", done: selectedOrder.status === "completed" },
                ].map((step, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: step.done ? G.blue : G.cardBorder, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: step.done ? G.text : G.sub }}>{step.title}</div>
                      <div style={{ fontSize: 10, color: G.sub2 }}>{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text }}>سجل العمليات</h1>
        <p style={{ fontSize: 13, color: G.sub, marginTop: 4 }}>تتبع جميع طلباتك هنا</p>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {orders.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <p style={{ color: G.sub }}>لا يوجد طلبات بعد</p>
          </div>
        ) : (
          orders.map((tx: any, i: number) => {
            const s = getStatusInfo(tx.status);
            return (
              <GlassCard key={tx.id || i} style={{ padding: 16, cursor: "pointer" }} onClick={() => setSelectedOrder(tx)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{tx.name}</div>
                    <div style={{ fontSize: 10, color: s.color, marginTop: 4 }}>{s.label}</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: G.text }}>£{tx.total}</div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}


function CartScreen({ cart, setCart, onBack, addOrder, points, setPoints, balance, setBalance, addNotification }: any) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usePoints, setUsePoints] = useState(false);

  const subtotal = cart.reduce((acc: number, item: any) => acc + Number(item.total), 0);
  const pointsDiscount = usePoints ? Math.min(subtotal, points / 10) : 0;
  const total = (subtotal - pointsDiscount).toFixed(2);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const finalTotal = Number(total);
    if (balance < finalTotal) {
      addNotification("الرصيد غير كافٍ", "عذراً، رصيدك في المحفظة غير كافٍ لإتمام العملية. يرجى شحن الرصيد أولاً.", "❌");
      return;
    }

    setCheckingOut(true);
    
    if (usePoints) {
      setPoints((p: number) => p - (pointsDiscount * 10));
    }

    // Deduct from balance
    setBalance(balance - finalTotal);

    // Process each item in cart as an order sequentially
    for (const item of cart) {
      await addOrder(item);
    }

    setCheckingOut(false);
    setSuccess(true);
    setCart([]);
  };

  if (success) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32 }}>
        <div className="float" style={{ fontSize: 80, marginBottom: 24 }}>🛍️</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 8 }}>تم الشراء بنجاح!</h2>
        <p style={{ fontSize: 14, color: G.sub2, textAlign: "center", marginBottom: 32 }}>تمت عملية الشحن والشراء بنجاح وسنقوم بتحديثك بمجرد استلام الشحنة في مخازنا.</p>
        <Btn full label="العودة للتسوق" onClick={onBack} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 20px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 4 }}>حقيبة الشراء</h1>
        <p style={{ fontSize: 13, color: G.sub, marginBottom: 24 }}>لديك {cart.length} طلبات في الحقيبة</p>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
            <p style={{ color: G.sub }}>الحقيبة فارغة حالياً</p>
            <Btn label="العودة للتسوق" onClick={onBack} variant="ghost" style={{ marginTop: 24 }} />
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {cart.map((item: any, idx: number) => (
                <GlassCard key={idx} style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: G.text, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: G.sub }}>{item.amount || "طلب مخصص"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: G.blue }}>£{Number(item.total).toLocaleString()}</div>
                    <button onClick={() => setCart(cart.filter((_: any, i: number) => i !== idx))} style={{ border: "none", background: "none", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconTablerX size={20} /></button>
                  </div>
                </GlassCard>
              ))}
            </div>

            <GlassCard style={{ padding: 24, marginBottom: 20 }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: G.sub }}>المجموع:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: G.text }}>£{subtotal.toFixed(2)} ج.م</span>
               </div>
               
               {usePoints && (
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                   <span style={{ fontSize: 13, color: G.green }}>خصم النقاط:</span>
                   <span style={{ fontSize: 13, fontWeight: 700, color: G.green }}>- £{pointsDiscount.toFixed(2)} ج.م</span>
                 </div>
               )}

               <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${G.cardBorder}`, paddingTop: 16, marginBottom: 20 }}>
                 <span style={{ fontSize: 16, color: G.text, fontWeight: 800 }}>المجموع النهائي:</span>
                 <span style={{ fontSize: 22, fontWeight: 900, color: G.green }}>£{total} <span style={{ fontSize: 12 }}>ج.م</span></span>
               </div>
               <Btn full label={checkingOut ? "⏳ جاري إتمام الدفع..." : "🎉 تأكيد الشراء من المحفظة"} onClick={handleCheckout} disabled={checkingOut} size="lg" />
               <div style={{ fontSize: 10, color: G.sub, textAlign: "center", marginTop: 12 }}>يتم الخصم من الرصيد المتاح تلقائياً</div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}

function TicketsScreen({ tickets, addNotification, setTab }: any) {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const handleSubmit = async () => {
    if (!subject.trim() || !msg.trim()) {
      addNotification("خطأ", "يرجى ملء جميع الحقول", "❌");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "tickets"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        userName: auth.currentUser?.displayName || "مستخدم",
        subject,
        message: msg,
        status: "open",
        priority: "medium",
        createdAt: serverTimestamp()
      });
      addNotification("تم الإرسال", "سنتواصل معك قريباً", "✅");
      setIsCreating(false);
      setSubject("");
      setMsg("");
    } catch (err) {
      console.error(err);
      addNotification("خطأ", "فشل إرسال التذكرة", "❌");
    } finally {
      setLoading(false);
    }
  };

  if (selectedTicket) {
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSelectedTicket(null)} style={{ border: "none", background: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconArrowRight size={24} /></button>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: G.text }}>تفاصيل التذكرة</h1>
        </div>
        <div style={{ padding: "0 20px" }}>
          <GlassCard style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: G.text }}>{selectedTicket.subject}</h3>
              <Badge label={selectedTicket.status === 'open' ? "مفتوحة" : "مغلقة"} color={selectedTicket.status === 'open' ? G.yellow : G.sub} size="xs" />
            </div>
            <p style={{ fontSize: 13, color: G.sub, lineHeight: 1.6, marginBottom: 20 }}>{selectedTicket.message}</p>
            
            {selectedTicket.reply ? (
              <div style={{ background: "rgba(16,217,160,0.1)", border: `1px solid ${G.green}40`, padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: G.green, fontWeight: 900, marginBottom: 6 }}>الرد من الدعم:</div>
                <div style={{ fontSize: 13, color: G.text, lineHeight: 1.6 }}>{selectedTicket.reply}</div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: G.yellow, fontStyle: "italic" }}>بانتظار رد الدعم...</div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setIsCreating(false)} style={{ width: 40, height: 40, borderRadius: 12, background: G.card, border: `1px solid ${G.cardBorder}`, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text }}>فتح تذكرة جديدة</h1>
            <p style={{ fontSize: 12, color: G.sub, marginTop: 2 }}>أخبرنا بما يواجهك وسنرد عليك فوراً</p>
          </div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="موضوع التذكرة" value={subject} onChange={(e: any) => setSubject(e.target.value)} placeholder="مثال: مشكلة في تنفيذ الطلب" icon="🎫" />
          <div>
            <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 600 }}>تفاصيل المشكلة</label>
            <textarea
              value={msg}
              onChange={(e: any) => setMsg(e.target.value)}
              placeholder="اشرح المشكلة بالتفصيل هنا..."
              style={{
                width: "100%", height: 160, background: "rgba(0,0,0,0.35)", border: `1px solid ${G.cardBorder}`,
                borderRadius: 12, padding: 14, color: G.text, fontSize: 13, outline: "none",
                fontFamily: "inherit", resize: "none"
              }}
            />
          </div>
          <Btn full label={loading ? "جاري الإرسال..." : "إرسال التذكرة"} onClick={handleSubmit} size="lg" disabled={loading} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>تذاكر الدعم</h1>
          <p style={{ fontSize: 13, color: G.sub, marginTop: 4 }}>تابع حالات طلبات الدعم الخاصة بك</p>
        </div>
        <button onClick={() => setIsCreating(true)} style={{ width: 44, height: 44, borderRadius: 14, background: G.blue, border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconPlus size={24} />
        </button>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {tickets.map((t: any) => (
          <GlassCard key={t.id} onClick={() => setSelectedTicket(t)} style={{ padding: 16, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{t.subject}</div>
                <div style={{ fontSize: 10, color: G.sub, marginTop: 2 }}>
                  {t.status === 'open' ? "مفتوحة" : "مغلقة"} · {t.createdAt ? (t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "قيد الإرسال") : ""}
                </div>
              </div>
              <Badge label={t.status === 'open' ? "قيد الانتظار" : "تم الرد"} color={t.status === 'open' ? G.yellow : G.green} size="xs" />
            </div>
          </GlassCard>
        ))}
        {tickets.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: G.sub }}>لا توجد لديك تذاكر دعم حالياً</div>
        )}
      </div>
    </div>
  );
}


function AIToolsScreen({ setServiceDetail }: any) {
  const aiCategory = SERVICES_DATA[5];
  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>أدوات الذكاء الاصطناعي ✨</h1>
          <p style={{ fontSize: 13, color: G.sub, marginTop: 4 }}>استخدم أحدث موديلات الذكاء الاصطناعي بشكل مباشر وفوري.</p>
        </div>
      </div>
      
      <div style={{ padding: "0 20px" }}>
         <SectionGrid title="الأدوات الذكية المتاحة" items={aiCategory.items} onItem={setServiceDetail} accent="#F472B6" />
         
         <GlassCard style={{ padding: 20, marginTop: 10, border: `1px solid ${G.blue}40`, background: `${G.blue}05` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: `${G.blue}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
               <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: G.text }}>تحتاج اشتراكات بريميوم؟</div>
                  <div style={{ fontSize: 11, color: G.sub, marginTop: 2 }}>تتوفر اشتراكات ChatGPT Plus و Midjourney بخصم 85%.</div>
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}

function ForgotPasswordScreen({ onBack, addNotification }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      addNotification("خطأ", "يرجى إدخال البريد الإلكتروني", "❌");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      addNotification("تم الإرسال", "تم إرسال رابط استعادة كلمة المرور إلى بريدك", "✉️");
      onBack();
    } catch (error) {
      addNotification("خطأ", "فشل في إرسال البريد الإلكتروني", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade" style={{ maxWidth: 400, margin: "0 auto", padding: "80px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>استعادة كلمة المرور</h2>
        <p style={{ fontSize: 13, color: G.sub, marginTop: 8 }}>أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة الكلمة</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="البريد الإلكتروني" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" icon="✉️" dir="ltr" />
        <Btn full label={loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"} onClick={handleReset} disabled={loading} />
        <button onClick={onBack} style={{ background: "none", border: "none", color: G.sub, fontSize: 13, cursor: "pointer", marginTop: 8 }}>العودة لتسجيل الدخول</button>
      </div>
    </div>
  );
}

function SettingsScreen({ user, onLogout, onUpdateProfile, isAdmin, setTab, addNotification }: any) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setCountry(user?.country || "");
    setPhotoURL(user?.photoURL || "");
  }, [user]);

  const handleUpdatePhoto = async () => {
    const url = prompt("يرجى إدخال رابط الصورة الجديدة:");
    if (url) {
      setIsSaving(true);
      try {
        await onUpdateProfile({ photoURL: url });
        setPhotoURL(url);
        addNotification("تم التحديث", "تم تحديث الصورة الشخصية بنجاح", "🖼️");
      } catch (err) {
        addNotification("خطأ", "فشل تحديث الصورة", "❌");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fade" style={{ paddingBottom: 120 }}>
      {/* Header with Profile Vibe */}
      <div style={{ 
        padding: "60px 20px 40px", 
        background: "linear-gradient(180deg, rgba(79, 142, 247, 0.1) 0%, transparent 100%)",
        textAlign: "center"
      }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
          <div className="glow" style={{ 
            width: 90, height: 90, borderRadius: "50%", 
            background: photoURL ? `url(${photoURL}) center/cover no-repeat` : "linear-gradient(135deg,#4F8EF7,#1E54C4)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: photoURL ? 0 : 40, border: "3px solid rgba(255,255,255,0.1)",
            overflow: "hidden"
          }}>
            {!photoURL && (user?.name?.charAt(0) || "👤")}
          </div>
          <button 
            onClick={handleUpdatePhoto}
            style={{ 
              position: "absolute", bottom: 0, right: 0, 
              width: 32, height: 32, borderRadius: "50%", 
              background: G.blue, border: "3px solid #04070f",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              cursor: "pointer", color: "white"
            }}
          >📸</button>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 4 }}>{user?.name || "المستخدم"}</h1>
        <p style={{ fontSize: 13, color: G.sub2 }}>{user?.email}</p>
        
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: 12, border: `1px solid ${G.cardBorder}` }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 2 }}>الرصيد</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: G.yellow }}>£{user?.balance?.toLocaleString() || 0}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: 12, border: `1px solid ${G.cardBorder}` }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 2 }}>الحالة</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: G.blue }}>نشط</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <SectionHeader title="بيانات الحساب" accent={G.blue} />
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: G.sub, display: "block", marginBottom: 6 }}>الاسم الكامل</label>
              <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, color: G.text, fontSize: 14, border: `1px solid ${G.cardBorder}` }}>
                {name || "غير محدد"}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: G.sub, display: "block", marginBottom: 6 }}>رقم الهاتف</label>
              <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, color: G.text, fontSize: 14, border: `1px solid ${G.cardBorder}`, direction: "ltr", textAlign: "right" }}>
                {phone || "غير محدد"}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: G.sub, display: "block", marginBottom: 6 }}>الدولة</label>
              <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, color: G.text, fontSize: 14, border: `1px solid ${G.cardBorder}` }}>
                {country || "غير محدد"}
              </div>
            </div>
            
            <p style={{ fontSize: 10, color: G.sub, fontStyle: "italic", textAlign: "center" }}>يتم تعديل البيانات حصراً عبر الدعم الفني</p>
          </div>
        </GlassCard>

        <SectionHeader title="عام" accent={G.pink} />
        <GlassCard style={{ padding: 8, marginBottom: 20 }}>
           {[
             { label: "تغيير كلمة المرور", icon: "🔒" },
             { label: "إعدادات الإشعارات", icon: "🔔" },
             { label: "سجل الطلبات", icon: "🕐", action: () => setTab("history") },
             { label: "الدعم الفني", icon: "🎧", action: () => setTab("tickets") },
           ].map((item, i) => (
             <div 
               key={i} 
               onClick={() => item.action && item.action()}
               style={{ 
                 padding: "14px 16px", 
                 borderBottom: i < 3 ? `1px solid ${G.cardBorder}` : "none", 
                 color: G.text, fontSize: 14,
                 display: "flex", justifyContent: "space-between", alignItems: "center",
                 cursor: item.action ? "pointer" : "default"
               }}
             >
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 <span style={{ fontSize: 18 }}>{item.icon}</span>
                 <span>{item.label}</span>
               </div>
               <span style={{ color: G.sub, fontSize: 12 }}>←</span>
             </div>
           ))}
        </GlassCard>

        {isAdmin && (
          <>
            <SectionHeader title="لوحة التحكم" accent={G.yellow} />
            <GlassCard 
              style={{ padding: 16, marginBottom: 20, border: `1px solid ${G.yellow}30`, background: "rgba(251, 191, 36, 0.05)" }} 
              onClick={() => setTab("admin")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🛠️</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: G.yellow }}>إدارة النظام</div>
                    <div style={{ fontSize: 11, color: G.sub2 }}>فتح واجهة التحكم الكاملة</div>
                  </div>
                </div>
                <div style={{ background: G.yellow, color: "#000", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>دخول</div>
              </div>
            </GlassCard>
          </>
        )}

        <div style={{ padding: "10px 0 40px" }}>
          <Btn full label="🚪 تسجيل الخروج" onClick={onLogout} variant="ghost" color="#EF4444" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const isAdmin = currentUser?.email === "loerd04@gmail.com";
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [tab, setTab] = useState("home");
  const [appConfig, setAppConfig] = useState<any>({ maintenanceMode: false, autoApproveOrders: false });
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [showMaintenanceNotice, setShowMaintenanceNotice] = useState(false);
  const [serviceDetail, setServiceDetail] = useState(null as any);
  const [socialPlatform, setSocialPlatform] = useState(null as any);
  const [cart, setCart] = useState([] as any[]);
  const [orders, setOrders] = useState([] as any[]);
  const [recharges, setRecharges] = useState([] as any[]);
  const [notifications, setNotifications] = useState([] as any[]);
  const [priceAlerts, setPriceAlerts] = useState([] as any[]);
  const [points, setPoints] = useState(0); 
  const [balance, setBalance] = useState(0); 
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [tickets, setTickets] = useState([] as any[]);

  const [syncedPrices, setSyncedPrices] = useState(marketSync.getCachedPrices() || {});
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoggedIn(!!user);
      if (user) {
        // Ensure user document exists
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName || user.email?.split("@")[0],
            balance: 0,
            points: 0,
            createdAt: serverTimestamp()
          });
        }
        
        // Listen to user data
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserData(data);
            setBalance(data.balance || 0);
            setPoints(data.points || 0);
          }
        });

        // Listen to orders
        const isUserAdmin = user.email === "loerd04@gmail.com";
        const q = isUserAdmin 
          ? query(collection(db, "orders"), orderBy("createdAt", "desc"))
          : query(collection(db, "orders"), where("userId", "==", user.uid));

        onSnapshot(q, (snap) => {
          const sorted = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          // Note: If sorting in JS for mixed cases where orderBy might not be present or needed
          if (!isAdmin) {
             sorted.sort((a: any, b: any) => {
               const dateA = a.createdAt?.toMillis?.() || 0;
               const dateB = b.createdAt?.toMillis?.() || 0;
               return dateB - dateA;
             });
          }
          setOrders(sorted);
        });

        // Listen to recharges
        const rq = query(collection(db, "recharge_requests"), where("userId", "==", user.uid));
        onSnapshot(rq, (snap) => {
          const sorted = snap.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .sort((a: any, b: any) => {
              const dateA = a.createdAt?.toMillis?.() || 0;
              const dateB = b.createdAt?.toMillis?.() || 0;
              return dateB - dateA;
            });
          setRecharges(sorted);
        });

        // Listen to my tickets
        const tq = query(collection(db, "tickets"), where("userId", "==", user.uid));
        onSnapshot(tq, (snap) => {
          const sorted = snap.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .sort((a: any, b: any) => {
              const dateA = a.createdAt?.toMillis?.() || 0;
              const dateB = b.createdAt?.toMillis?.() || 0;
              return dateB - dateA;
            });
          setTickets(sorted);
        });
      } else {
        setUserData(null);
        setBalance(0);
        setOrders([]);
        setRecharges([]);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      const shown = sessionStorage.getItem("maintenance_notice_shown");
      if (!shown) {
        setShowMaintenanceNotice(true);
        sessionStorage.setItem("maintenance_notice_shown", "true");
      }
    }
  }, [loggedIn]);

  useEffect(() => {
    // Listen to global config
    onSnapshot(doc(db, "config", "global"), (doc) => {
      if (doc.exists()) setAppConfig(doc.data());
    });
    // Listen to ticker
    onSnapshot(query(collection(db, "ticker")), (snap) => {
      setTickerItems(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
  }, []);

  const onLogout = () => {
    signOut(auth);
    setTab("home");
    sessionStorage.removeItem("maintenance_notice_shown");
  };

  const updateProfile = async (data: any) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, data);
      addNotification("تم التحديث", "تم تحديث بيانات الملف الشخصي بنجاح", "✅");
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, "users");
    }
  };

  const addNotification = (title: string, message: string, icon: string = "🔔") => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [{ id, title, message, icon }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const addPriceAlert = (serviceId: string, threshold: number, serviceName: string) => {
    setPriceAlerts(prev => [...prev, { serviceId, threshold, serviceName, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
    addNotification("تم تفعيل تنبيه السعر", `سنخطرك عندما ينخفض سعر ${serviceName} عن £${threshold}`, "🔔");
  };

  const addOrder = async (order: any) => {
    if (!currentUser) return;
    
    try {
      const resultId = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error("تم حذف حساب المستخدم");
        
        const currentBalance = Number(userSnap.data()?.balance || 0);
        const currentPoints = Number(userSnap.data()?.points || 0);
        const orderTotal = Number(order.total) || 0;
        const earnedPoints = Math.floor(orderTotal / 10);
        
        if (currentBalance < orderTotal) {
          throw new Error("عذراً، رصيدك غير كافٍ لإتمام هذه العملية");
        }

        // 1. Deduct Balance & Add Points
        transaction.update(userRef, { 
          balance: currentBalance - orderTotal,
          points: currentPoints + earnedPoints
        });

        // 2. Create Order
        const orderRef = doc(collection(db, "orders"));
        
        // Remove undefined values from order object to prevent Firestore errors
        const sanitizedData = Object.fromEntries(
          Object.entries(order).filter(([_, v]) => v !== undefined)
        );

        transaction.set(orderRef, {
          ...sanitizedData,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          userName: userData?.name || currentUser.displayName || currentUser.email,
          userPhone: userData?.phone || "",
          status: "pending",
          createdAt: serverTimestamp(),
          date: new Date().toLocaleDateString("ar-EG"),
          amount: `£${orderTotal.toFixed(2)}`,
          name: order.productName || order.name || "طلب خدمة"
        });

        return orderRef.id;
      });

      const title = order.id === "shipping" ? "تم إنشاء طلب الشحن" : "تم استلام الطلب";
      const msg = order.id === "shipping" ? "تم إنشاء طلبك بنجاح وجاري المراجعة" : `تم خصم £${order.total} وإضافة طلبك بنجاح`;
      addNotification(title, msg, "📋");

      const earnedPoints = Math.floor((Number(order.total) || 0) / 10);
      if (earnedPoints > 0) {
        addNotification("نقاط مكافأة! 🌟", `حصلت على ${earnedPoints} نقطة.`, "🏆");
      }
      return resultId;
    } catch (err: any) {
      if (err.message.includes("رصيدك غير كافٍ")) {
        addNotification("فشل الطلب", err.message, "❌");
      } else {
        handleFirestoreError(err, OperationType.CREATE, "orders_transaction");
      }
    }
  };

  useEffect(() => {
    const runSync = async () => {
      setIsSyncing(true);
      try {
        await marketSync.syncPrices((marketData) => {
          setSyncedPrices(marketData.prices);
          
          // Check price alerts
          setPriceAlerts(prevAlerts => {
            const triggered: any[] = [];
            const remaining = prevAlerts.filter(alert => {
              const currentPrice = marketData.prices[alert.serviceId];
              if (currentPrice && currentPrice <= alert.threshold) {
                triggered.push(alert);
                return false;
              }
              return true;
            });
            
            triggered.forEach(t => {
              addNotification("انخفاض السعر! 📉", `وصل سعر ${t.serviceName} إلى £${marketData.prices[t.serviceId]}`, "🎁");
            });
            
            return remaining;
          });
        });
      } catch (e) {
        console.error("Price sync error:", e);
      } finally {
        setIsSyncing(false);
      }
    };

    // Sync if no cache or if cache is older than 30 mins
    const lastSync = marketSync.getLastSyncTime();
    const shouldSync = !lastSync || (Date.now() - new Date(lastSync).getTime() > 30 * 60 * 1000);
    
    if (shouldSync) {
      runSync();
    }
  }, []);

  const handleSetTab = (t: string) => {
    setTab(t);
    setServiceDetail(null);
  };

  const renderScreen = () => {
    if (serviceDetail) {
      const serviceWithPrice = {
        ...serviceDetail,
        price: syncedPrices[serviceDetail.id] || serviceDetail.price
      };
      return <ServiceDetailScreen 
        service={serviceWithPrice} 
        onBack={() => setServiceDetail(null)} 
        addToCart={(item: any) => setCart([...cart, { ...item, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }])}
        setTab={handleSetTab}
        addOrder={addOrder}
        addPriceAlert={addPriceAlert}
        balance={balance}
        setBalance={setBalance}
        addNotification={addNotification}
      />;
    }
    switch (tab) {
      case "home": return <HomeScreen setTab={handleSetTab} setServiceDetail={setServiceDetail} setSocialPlatform={setSocialPlatform} syncedPrices={syncedPrices} isSyncing={isSyncing} balance={balance} cart={cart} orders={orders} />;
      case "services": return <ServicesScreen setServiceDetail={setServiceDetail} setTab={handleSetTab} balance={balance} />;
      case "social": return <SocialMediaScreen initialPlatform={socialPlatform} setServiceDetail={setServiceDetail} syncedPrices={syncedPrices} />;
      case "ai_tools": return <AIToolsScreen setServiceDetail={setServiceDetail} />;
      case "tickets": return <TicketsScreen tickets={tickets} addNotification={addNotification} setTab={setTab} />;
      case "wallet": return <WalletPageV2 points={points} setPoints={setPoints} balance={balance} setBalance={setBalance} addOrder={addOrder} addNotification={addNotification} orders={orders} recharges={recharges} />;
      case "cart": return <CartScreen cart={cart} setCart={setCart} onBack={() => setTab("home")} addOrder={addOrder} points={points} setPoints={setPoints} balance={balance} addNotification={addNotification} />;
      case "history": 
        if (selectedOrder) return <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrder(null)} addNotification={addNotification} setTab={setTab} />;
        return <OrdersHistoryScreen orders={orders} isAdmin={isAdmin} setTab={handleSetTab} onSelectOrder={setSelectedOrder} />;
      case "settings": return <SettingsScreen user={userData} onLogout={onLogout} onUpdateProfile={updateProfile} isAdmin={isAdmin} setTab={setTab} addNotification={addNotification} />;
      case "admin": return isAdmin ? <AdminDashboard onBack={() => setTab("settings")} addNotification={addNotification} /> : <HomeScreen setTab={handleSetTab} setServiceDetail={setServiceDetail} setSocialPlatform={setSocialPlatform} syncedPrices={syncedPrices} isSyncing={isSyncing} balance={balance} cart={cart} orders={orders} />;
      default: return <HomeScreen setTab={handleSetTab} setServiceDetail={setServiceDetail} setSocialPlatform={setSocialPlatform} syncedPrices={syncedPrices} isSyncing={isSyncing} balance={balance} cart={cart} tickerItems={tickerItems} orders={orders} />;
    }
  };

  const navTabs = [
    { id: "home", icon: <IconHome2 size={22} />, label: "الرئيسية" },
    { id: "wallet", icon: <IconWallet size={22} />, label: "محفظة" },
    { id: "services", icon: <IconGridDots size={24} />, label: "خدمات", center: true },
    { id: "history", icon: <IconDots size={22} />, label: "سجل الطلبات" },
    { id: "settings", icon: <IconUser size={22} />, label: "الإعدادات" },
  ];

  return (
    <div dir="rtl" style={{ background: G.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: "-5%", right: "-20%", width: 500, height: 500, background: "radial-gradient(circle,rgba(79,142,247,0.06),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-15%", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,217,160,0.04),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence>
        {appConfig.maintenanceMode && !isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 10000, background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <GlassCard style={{ padding: 40, maxWidth: 400 }}>
              <div style={{ fontSize: 60, marginBottom: 20 }}>🔧</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 12 }}>وضع الصيانة</h1>
              <p style={{ color: G.sub, lineHeight: 1.6 }}>نحن نقوم ببعض التحسينات الآن. سنعود للعمل قريباً جداً. شكراً لصبركم.</p>
              {loggedIn && <Btn full label="تسجيل الخروج" onClick={onLogout} style={{ marginTop: 24 }} />}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {!loggedIn ? (
          isRegistering ? (
            <RegisterPage onBack={() => setIsRegistering(false)} addNotification={addNotification} />
          ) : isForgotPass ? (
            <ForgotPasswordScreen onBack={() => setIsForgotPass(false)} addNotification={addNotification} />
          ) : (
            <LoginScreen onRegister={() => setIsRegistering(true)} onForgotPass={() => setIsForgotPass(true)} addNotification={addNotification} />
          )
        ) : (
          <>
            <AnimatePresence>
              {showMaintenanceNotice && (
                <MaintenanceNotice onClose={() => setShowMaintenanceNotice(false)} />
              )}
            </AnimatePresence>
            {renderScreen()}
            {!serviceDetail && <AIChatBot addNotification={addNotification} />}
            
            {/* Notifications Overlay */}
            <div style={{ position: "fixed", top: 20, left: 20, right: 20, zIndex: 3000, pointerEvents: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              <AnimatePresence>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ x: 50, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: -20, opacity: 0, scale: 0.9 }}
                    style={{
                      pointerEvents: "auto",
                      background: "rgba(15, 23, 42, 0.95)",
                      border: `1px solid ${G.blue}40`,
                      borderRadius: 16,
                      padding: "12px 16px",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79, 142, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      {notif.icon || "🔔"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: G.text }}>{notif.title}</div>
                      <div style={{ fontSize: 11, color: G.sub, marginTop: 1 }}>{notif.message}</div>
                    </div>
                    <button style={{ background: "none", border: "none", color: G.sub2, padding: 4, cursor: "pointer" }}>✕</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {!serviceDetail && (
              <div style={{
                position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: "100%", maxWidth: 430,
                background: "rgba(4,7,15,0.92)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "8px 16px 28px",
                zIndex: 200,
                display: "flex", justifyContent: "space-around", alignItems: "center",
              }}>
                {navTabs.map(t => t.center ? (
                  <button key="center" onClick={() => handleSetTab(t.id)} style={{ border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "linear-gradient(135deg,#4F8EF7,#1E54C4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, marginTop: -32,
                      boxShadow: "0 6px 28px rgba(79,142,247,0.45)", color: "#fff"
                    }}>{t.icon}</div>
                    <span style={{ fontSize: 10, color: tab === t.id ? G.blue : G.sub, marginTop: 4 }}>{t.label}</span>
                  </button>
                ) : (
                  <button key={t.id} onClick={() => handleSetTab(t.id)}
                    style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, background: "none", border: "none" }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: tab === t.id ? "rgba(79,142,247,0.12)" : "transparent",
                      color: tab === t.id ? G.blue : G.sub,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    }}>{t.icon}</div>
                    {(t as any).badge && cart.length > 0 && (
                      <div style={{ position: "absolute", top: 4, right: "20%", background: G.blue, color: "#fff", fontSize: 8, fontWeight: 900, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #000" }}>
                        {cart.length}
                      </div>
                    )}
                    <span style={{ fontSize: 10, color: tab === t.id ? G.blue : G.sub }}>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REGISTRATION SYSTEM
 ═══════════════════════════════════════════════════════════════════ */

const calcStrength = (p: string) => {
  let s = 0;
  if (!p) return 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const strengthLabel = [
  { label: "", color: "#475569" },
  { label: "ضعيفة جداً", color: "#ef4444" },
  { label: "ضعيفة", color: "#f97316" },
  { label: "متوسطة", color: "#eab308" },
  { label: "قوية 💪", color: "#10b981" },
];

const COUNTRIES = [
  "مصر 🇪🇬", "السعودية 🇸🇦", "الإمارات 🇦🇪", "الكويت 🇰🇼",
  "قطر 🇶🇦", "البحرين 🇧🇭", "الأردن 🇯🇴", "العراق 🇮🇶",
  "سوريا 🇸🇾", "لبنان 🇱🇧", "ليبيا 🇱🇾", "تونس 🇹🇳",
  "المغرب 🇲🇦", "الجزائر 🇩🇿", "السودان 🇸🇩", "اليمن 🇾🇪", "أخرى 🌍",
];

function LogoIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4F8EF7"/><stop offset="100%" stopColor="#0ED9A0"/></linearGradient>
        <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#4F8EF7"/></linearGradient>
      </defs>
      <rect x="10" y="58" width="80" height="14" rx="7" fill="url(#rg1)"/>
      <polygon points="18,58 28,28 38,48 50,18 62,48 72,28 82,58" fill="url(#rg2)" opacity=".95"/>
      <circle cx="50" cy="18" r="7" fill="#FBBF24"/>
      <circle cx="50" cy="18" r="3.5" fill="white" opacity=".8"/>
      <circle cx="18" cy="58" r="4.5" fill="#4F8EF7"/>
      <circle cx="82" cy="58" r="4.5" fill="#10D9A0"/>
    </svg>
  );
}

function StrengthBar({ password }: any) {
  const s = calcStrength(password);
  const info = strengthLabel[s];
  if (!password) return null;
  return (
    <div className="fadeIn" style={{ marginTop: 4 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 8, background: i <= s ? info.color : "rgba(255,255,255,.06)", transition: "background .3s" }}/>
        ))}
      </div>
      <div style={{ fontSize: 10, color: info.color, fontWeight: 700 }}>{info.label}</div>
    </div>
  );
}

function StepDots({ step }: any) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 6, width: step === i ? 24 : 6, borderRadius: 10, background: step === i ? G.blue : step > i ? G.green : "rgba(255,255,255,0.1)", transition: "all 0.3s ease" }}/>
      ))}
    </div>
  );
}

function RegisterPage({ onBack, addNotification }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("مصر 🇪🇬");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pin, setPin] = useState("");
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({} as any);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const passStr = calcStrength(pass);
  const passOk = passStr >= 3;
  const matchOk = confirm && pass === confirm;
  const pinOk = /^\d{4}$/.test(pin);
  const nameOk = name.trim().length >= 3;

  const validate1 = () => {
    const e = {} as any;
    if (!nameOk) e.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    if (!emailOk) e.email = "البريد الإلكتروني غير صحيح";
    if (!phoneOk) e.phone = "رقم الهاتف غير صحيح";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e = {} as any;
    if (!passOk) e.pass = "كلمة المرور ضعيفة — استخدم 8+ أحرف وأرقام ورمز";
    if (!matchOk) e.confirm = "كلمتا المرور غير متطابقتين";
    if (!pinOk) e.pin = "PIN يجب أن يكون 4 أرقام بالضبط";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validate1()) { setErrors({}); setStep(2); }
      else { addNotification("بيانات غير مكتملة", "يرجى مراجعة الحقول المطلوبة في هذه الخطوة", "⚠️"); }
    }
    else if (step === 2) {
      if (validate2()) { setErrors({}); setStep(3); }
      else { addNotification("خطأ في البيانات", "كلمة المرور ضعيفة أو PIN غير صحيح", "🔒"); }
    }
  };

    const submit = async () => {
    if (!agree) {
      addNotification("تنبيه", "يرجى الموافقة على الشروط والأحكام للمتابعة", "⚠️");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, pass, name);
      // Create user document with extra fields
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await setDoc(userRef, {
        email,
        name,
        phone,
        country,
        pin,
        balance: 50, // Starting bonus
        createdAt: serverTimestamp()
      });
      setDone(true);
      addNotification("مرحباً بك!", "تم إنشاء حسابك بنجاح. استمتع بخدماتنا!", "🎉");
    } catch (error: any) {
      addNotification("فشل التسجيل", error.message || "حدث خطأ غير متوقع", "❌");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div dir="rtl" className="fade" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32 }}>
      <div className="float" style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(16,217,160,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, marginBottom: 22, border: `2px solid ${G.green}40` }}>🎉</div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: G.text, marginBottom: 8 }}>تم إنشاء الحساب!</h2>
      <p style={{ fontSize: 13, color: G.sub2, textAlign: "center", marginBottom: 28 }}>مرحباً {name}! رصيد ترحيبي £50 أُضيف لمحفظتك 🎁</p>
      <Btn full label="🚀 دخول المنصة" onClick={onBack} />
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", paddingBottom: 60, position: "relative" }}>
      <div style={{ padding: "50px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: G.blue, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 20 }}>← العودة</button>
        
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <LogoIcon size={64}/>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginTop: 12 }}>إنشاء حساب جديد</h1>
        </div>

        <StepDots step={step}/>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="الاسم الكامل" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="محمد أحمد" icon="👤" />
            <Input label="البريد الإلكتروني" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" icon="✉️" dir="ltr" />
            <Input label="رقم الهاتف" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="010XXXXXXXX" icon="📱" />
            <div>
              <label style={{ fontSize: 11, color: G.sub2, fontWeight: 700, marginBottom: 7, display: "block" }}>الدولة</label>
              <select value={country} onChange={(e: any) => setCountry(e.target.value)} dir="rtl"
                style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: `1px solid ${G.cardBorder}`, borderRadius: G.radiusSm, color: G.text, fontSize: 14, padding: "13px 16px", fontFamily: G.font, appearance: "none" }}>
                {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#0d1425" }}>{c}</option>)}
              </select>
            </div>
            <Btn full label="التالي" onClick={nextStep} size="lg" />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
             <Input label="كلمة المرور" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="8+ أحرف" type="password" icon="🔒" />
             <StrengthBar password={pass}/>
             <Input label="تأكيد كلمة المرور" value={confirm} onChange={(e: any) => setConfirm(e.target.value)} placeholder="أعد الكتابة" type="password" icon="🔒" />
             <Input label="PIN الأمان (4 أرقام)" value={pin} onChange={(e: any) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" type="password" icon="🔐" dir="ltr" />
             <div style={{ display: "flex", gap: 10 }}>
               <Btn full label="رجوع" variant="ghost" onClick={() => setStep(1)} />
               <Btn full label="التالي" onClick={nextStep} />
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <GlassCard style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: G.sub2, marginBottom: 12 }}>مراجعة البيانات:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: G.sub }}>الاسم:</span><span style={{ color: G.text }}>{name}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: G.sub }}>البريد:</span><span style={{ color: G.text }}>{email}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: G.sub }}>الهاتف:</span><span style={{ color: G.text }}>{phone}</span></div>
              </div>
            </GlassCard>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => setAgree(!agree)}>
               <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agree ? G.blue : G.cardBorder}`, background: agree ? G.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 {agree && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
               </div>
               <span style={{ fontSize: 12, color: G.sub2 }}>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
               <Btn full label="رجوع" variant="ghost" onClick={() => setStep(2)} />
               <Btn full label={loading ? "جاري الإنشاء..." : "إنشاء الحساب"} onClick={submit} disabled={loading || !agree} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
