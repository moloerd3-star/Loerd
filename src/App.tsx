import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { AnimatePresence, motion } from "motion/react";
import { 
  SOCIAL_PLATFORMS, 
  SOCIAL_CATALOG, 
  SERVICES_DATA, 
  TRANSACTIONS, 
  DURATIONS, 
  TOPUP_AMOUNTS,
  DEFAULT_FAQS
} from "./constants";
import { marketSync } from "./services/marketSync";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/* ═══════════════════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════ */
const G = {
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
};

/* ═══════════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function GlassCard({ children, style, onClick, className = "", glow = false }: any) {
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

function Btn({ label, onClick, color = G.blue, icon, full = false, size = "md", variant = "solid", disabled = false }: any) {
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

function Input({ label, value, onChange, placeholder, type = "text", icon, dir = "rtl" }: any) {
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

function Badge({ label, color, size = "sm" }: any) {
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

function SectionHeader({ title, onMore, accent = G.blue, icon }: any) {
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

function LoginScreen({ onLogin, onRegister, addNotification }: any) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!email || !pass) {
      addNotification("نقص في البيانات", "يرجى إدخال البريد الإلكتروني وكلمة المرور للمتابعة", "❌");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addNotification("بريد غير صالح", "تنسيق البريد الإلكتروني الذي أدخلته غير صحيح", "⚠️");
      return;
    }
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      onLogin(); 
      addNotification("مرحباً بك!", "تم تسجيل الدخول بنجاح إلى القائد PRO", "⚡");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px" }}>
      <div className="fade" style={{ textAlign: "center", marginBottom: 36 }}>
        <div className="float" style={{
          width: 88, height: 88, borderRadius: 28, margin: "0 auto 18px",
          background: "linear-gradient(135deg,rgba(79,142,247,0.25),rgba(30,84,196,0.1))",
          border: "1.5px solid rgba(79,142,247,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
          boxShadow: "0 8px 32px rgba(79,142,247,0.3)",
        }}>⚡</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: G.text, marginBottom: 5 }}>القائد <span style={{ color: G.blue }}>PRO</span></h1>
        <p style={{ fontSize: 11, color: G.sub, letterSpacing: 2 }}>NEXT GEN DIGITAL SERVICES</p>
      </div>

      <div className="fade" style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 5, marginBottom: 24, border: `1px solid ${G.cardBorder}` }}>
        <button onClick={() => setTab("login")} style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: tab === "login" ? "rgba(79,142,247,0.25)" : "transparent", color: tab === "login" ? G.blue : G.sub, border: "none" }}>تسجيل دخول</button>
        <button onClick={() => onRegister()} style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "transparent", color: G.sub, border: "none" }}>إنشاء حساب</button>
      </div>

      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="البريد الإلكتروني" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" icon="✉️" dir="ltr" />
        <Input label="كلمة المرور" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="••••••••" type="password" icon="🔒" dir="ltr" />
        <Btn full label={loading ? "جاري المعالجة..." : "🚀 دخول المتجر"} onClick={handle} disabled={loading} size="lg" />
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
          <div style={{ flex: 1, height: 1, background: G.cardBorder }} />
          <span style={{ fontSize: 11, color: G.sub, fontFamily: G.font }}>أو</span>
          <div style={{ flex: 1, height: 1, background: G.cardBorder }} />
        </div>

        <button 
          onClick={onLogin}
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
            fontFamily: G.font,
            cursor: "pointer"
          }}
        >
          ✨ دخول تجريبي (زائر)
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ setTab, setServiceDetail, setSocialPlatform, syncedPrices, isSyncing, balance }: any) {
  const stats = [
    { l: "طلبات اليوم", v: "12", i: "📋", color: G.blue },
    { l: "إجمالي الطلبات", v: "248", i: "✅", color: G.green },
    { l: "توفيرك الكلى", v: "£8,420", i: "💰", color: G.yellow },
  ];

  const lastSync = marketSync.getLastSyncTime();

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 0px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: G.sub, marginBottom: 3 }}>مرحباً، 👋</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: G.text }}>القائد <span style={{ color: G.blue }}>PRO</span></div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isSyncing && (
            <div style={{ fontSize: 10, color: G.blue, display: "flex", alignItems: "center", gap: 4 }}>
              <span className="spinner" style={{ width: 12, height: 12, border: `2px solid ${G.blue}40`, borderTopColor: G.blue, borderRadius: "50%" }} />
              Updating Prices...
            </div>
          )}
          {!isSyncing && lastSync && (
            <div style={{ fontSize: 9, color: G.sub, textAlign: "left" }}>
               Synced: <br/> {new Date(lastSync).toLocaleTimeString()}
            </div>
          )}
          <div className="glow" style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#1E54C4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
        </div>
      </div>

      {/* Ticker */}
      <div style={{ margin: "14px 20px 0", background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.12)", borderRadius: 12, padding: "9px 14px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 0, whiteSpace: "nowrap", animation: "ticker 22s linear infinite", width: "max-content" }}>
          {[
            "🔥 عرض محدود: ChatGPT Plus بخصم 90%",
            "⚡ تم إضافة 1000+ خدمة سوشيال ميديا جديدة",
            "🎯 أكثر من 500 مستخدم نشط الآن",
            "💎 اشتراكات Netflix 4K بأقل سعر في مصر",
            "🚀 خدمة الوسيط الدولي متاحة الآن",
          ].map((t, i) => (
            <span key={i} style={{ fontSize: 11, color: G.sub2, marginLeft: 48 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Balance card */}
      <div style={{ margin: "14px 20px 0" }}>
        <GlassCard style={{ padding: 22, border: "1px solid rgba(79,142,247,0.2)" }}>
          <div className="shimmer-line" />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 5 }}>الرصيد المتاح</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: G.text }}>£<span style={{ color: G.blue }}>{balance.toLocaleString()}</span></div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <Btn label="+ شحن" onClick={() => setTab("wallet")} size="sm" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "rgba(0,0,0,0.25)", borderRadius: 14, padding: 12 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, marginBottom: 2 }}>{s.i}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: G.text }}>{s.v}</div>
                <div style={{ fontSize: 9, color: G.sub }}>{s.l}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Social Quick Access */}
      <div style={{ marginTop: 22 }}>
        <SectionHeader title="تطوير السوشيال ميديا" accent={G.pink} icon="📱" onMore={() => setTab("social")} />
        <div style={{ padding: "0 20px", display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
          {SOCIAL_PLATFORMS.map((p, i) => (
            <div key={i} className="card" onClick={() => { setSocialPlatform(p); setTab("social"); }}
              style={{
                minWidth: 80, background: G.card, border: `1px solid ${G.cardBorder}`,
                borderRadius: 16, padding: "14px 10px", textAlign: "center", flexShrink: 0
              }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: G.text }}>{p.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ marginTop: 12 }}>
        <SectionGrid title="الخدمات اللوجستية" items={SERVICES_DATA[0].items.slice(0, 4)} onItem={setServiceDetail} cols={2} />
        <SectionGrid title="الذكاء الاصطناعي" items={SERVICES_DATA[1].items.slice(0, 4)} onItem={setServiceDetail} accent="#8B5CF6" />
        <SectionGrid title="شحن الألعاب موبايل (خصم 30%)" items={SERVICES_DATA[3].items} onItem={setServiceDetail} accent="#F97316" cols={3} />
        <SectionGrid title="الخدمات المالية والبنوك" items={SERVICES_DATA[4].items} onItem={setServiceDetail} accent="#EAB308" cols={3} />
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
          <div key={i} className="card fade" onClick={() => onItem(item)}
            style={{
              background: G.card, 
              border: `1px solid ${G.cardBorder}`, 
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
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
            }}>
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
              {item.sub}
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

function ServicesScreen({ setServiceDetail, setTab }: any) {
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
        const isLogistics = sec.category.includes("اللوجستية");
        const isThreeCols = sec.category.includes("الألعاب") || sec.category.includes("المالية");
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
    </div>
  );
}

function FloatingSupport() {
  return (
    <div className="glow float" style={{ 
      position: "fixed", bottom: 100, right: 20, width: 56, height: 56, 
      borderRadius: "50%", background: "#25D366", color: "#fff", 
      display: "flex", alignItems: "center", justifyContent: "center", 
      fontSize: 28, boxShadow: "0 8px 24px rgba(37,211,102,0.4)", zIndex: 999, cursor: "pointer"
    }}>
      💬
    </div>
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
               <span style={{ fontSize: 11, color: G.blue, fontWeight: 700 }}>1$ = 54.00 ج.م</span>
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cartConfirmOpen, setCartConfirmOpen] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(0);
  const [showAlertInput, setShowAlertInput] = useState(false);
  
  // Logistics Specific State (Manual)
  const [productData, setProductData] = useState({
    name: "",
    sourcePrice: 0,
    url: ""
  });
  
  const isLogistics = service.type === "logistics_link" || 
                     service.type === "amazon_balance" || 
                     ["customs", "broker", "shipping", "topup"].includes(service.id);

  const isSubscription = service.type === "subscription" || service.id?.includes("ai") || service.id?.includes("netflix");

  const discount = service.discount || 0.85;
  const ownerPrice = Math.round(productData.sourcePrice * (1 - discount));
  
  const faqs = service.faqs || DEFAULT_FAQS;

  const validateFields = () => {
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
    if (service.type === "logistics_link") {
      return (ownerPrice * quantity).toFixed(2);
    }
    if (service.type === "amazon_balance") {
      return (quantity || 0).toFixed(2);
    }
    if (service.note === "GAMING CHARGE" || service.note === "FINANCIAL") {
      // If there are packages, use package price, otherwise use quantity as dollar amount
      const dollarAmt = selectedPkg ? selectedPkg.price : quantity;
      const basePrice = dollarAmt * 54;
      const appliedDiscount = service.discount !== undefined ? service.discount : 0.30;
      return (basePrice * (1 - appliedDiscount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (service.type === "subscription") {
      const disc = service.discount || 0.85;
      const durationMultiplier = duration === DURATIONS[0] ? 1 : 
                                 duration === DURATIONS[1] ? 2.8 : 
                                 duration === DURATIONS[2] ? 5.2 : 9; // Scaling discount for longer durations
      return (service.price * (1 - disc) * durationMultiplier).toFixed(2);
    }
    if (!service.price) return 0;
    const pricePerUnit = service.price / 1000;
    return (pricePerUnit * quantity).toFixed(2);
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
      
      if (isNaN(totalEGP) || totalEGP < 0) {
        alert("خطأ في حساب الملحق. يرجى المحاولة مرة أخرى.");
        return;
      }

      if (balance < totalEGP) {
        addNotification("عذراً، الرصيد غير كافٍ ❌", `رصيدك الحالي (£${balance}) أقل من تكلفة الطلب (£${totalEGP}). يرجى شحن رصيدك للمتابعة.`, "💰");
        setConfirmOpen(false);
        return;
      }

      setLoading(true);
      
      // Artificial delay for effect
      await new Promise(resolve => setTimeout(resolve, 1200));

      setBalance((prev: number) => prev - totalEGP);
      
      // Add to history
      addOrder(orderData);
      addNotification("تمت عملية الشراء بنجاح ⚡", `تم خصم £${totalEGP} من رصيدك بنجاح لتنفيذ طلب ${service.name}.`, "✅");

      setLoading(false); 
      setConfirmOpen(false);
      setSubmitted(true); 
      setTab("history"); 
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("حدث خطأ أثناء معالجة الطلب. يرجى التواصل مع الدعم.");
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32 }}>
        <div className="float" style={{ fontSize: 80, marginBottom: 24 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 8 }}>تم إرسال الطلب!</h2>
        <p style={{ fontSize: 14, color: G.sub2, textAlign: "center", marginBottom: 32 }}>سيتم مراجعة طلبك وتنفيذه خلال 15-30 دقيقة.</p>
        <Btn full label="🔙 العودة" onClick={onBack} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: G.card, border: `1px solid ${G.cardBorder}`, color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${service.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{service.icon}</div>
            <div><div style={{ fontSize: 18, fontWeight: 900, color: G.text }}>{service.name}</div></div>
          </div>
        </div>
        <div onClick={() => { setTab("history"); onBack(); }} style={{ fontSize: 11, color: G.blue, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ whiteSpace: "nowrap" }}>سجل الطلبات</span>
          <span style={{ fontSize: 14 }}>🕐</span>
        </div>
      </div>

      <OrderConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={confirmSubmit}
        service={{ ...service, duration }}
        quantity={quantity}
        total={calculateTotal()}
        loading={loading}
      />

      <OrderConfirmModal 
        isOpen={cartConfirmOpen} 
        onClose={() => setCartConfirmOpen(false)} 
        onConfirm={confirmAddToCart}
        service={{ ...service, duration }}
        quantity={quantity}
        total={calculateTotal()}
        loading={loading}
        title="إضافة إلى السلة"
        confirmLabel="إضافة للسلة"
        note="سيتم إضافة الخدمة إلى السلة، يمكنك الدفع لاحقاً"
      />

      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <GlassCard style={{ padding: 16, border: `1px solid ${service.color}40`, background: `${service.color}08` }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: G.sub, marginBottom: 2 }}>
                  {service.type === "logistics_link" ? "نظام استيراد ذكي" : 
                   service.type === "subscription" ? "السعر العالمي (بداية من)" : 
                   service.type === "amazon_balance" ? "نظام الشحن المزدوج" : 
                   service.id === "topup" ? "شحن رصيد صافي" :
                   service.id === "shipping" ? "شحن لوجستي داخلي" :
                   service.note === "GAMING CHARGE" ? "نظام الشحن المباشر" : "السعر لكل 1000"}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: G.text }}>
                   {service.type === "logistics_link" ? "تحليل جمركي آلي" : 
                    service.type === "amazon_balance" ? "هدية الضعف 2.1x" : (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        {service.discount ? (
                          <>
                            <span style={{ fontSize: 22, color: G.yellow }}>£{Math.round(service.price * (1 - service.discount))}</span>
                            <span style={{ fontSize: 13, color: G.sub, textDecoration: "line-through", opacity: 0.6 }}>£{service.price}</span>
                          </>
                        ) : (
                          `£${service.price}`
                        )}
                        <span style={{ fontSize: 12, color: G.sub2 }}>ج.م</span>
                      </div>
                    )}
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <Badge label={service.type === "logistics_link" ? "AI POWERED" : "الأفضل حالياً"} color={G.green} size="xs" />
                <div style={{ fontSize: 9, color: G.sub2, marginTop: 4 }}>⚡ {service.type === "logistics_link" ? "نظام الشراء المباشر" : "تنفيذ فوري"}</div>
              </div>
           </div>
        </GlassCard>

        <GlassCard style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: G.sub2, lineHeight: 1.7 }}>{service.desc}</div>
        </GlassCard>

        {service.shippingMethods && (
          <div style={{ marginBottom: 16 }}>
             <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 600 }}>طريقة الشحن / النوع</label>
             <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {service.shippingMethods.map((m: string) => (
                  <button 
                    key={m}
                    onClick={() => setShippingMethod(m)}
                    style={{ 
                      padding: "10px 16px", borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                      background: shippingMethod === m ? `${service.color}20` : G.card,
                      border: `1px solid ${shippingMethod === m ? service.color : G.cardBorder}`,
                      color: shippingMethod === m ? service.color : G.text,
                      cursor: "pointer", transition: "0.2s"
                    }}>
                    {m}
                  </button>
                ))}
             </div>
          </div>
        )}

        {service.type === "logistics_link" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input 
              label="اسم المنتج" 
              value={productData.name} 
              onChange={(e: any) => handleEditResult("name", e.target.value)} 
              placeholder="مثال: سماعة بلوتوث ذكية" 
              icon="📝" 
            />
            <Input 
              label="سعر المنتج في تيمو/علي (€/$/£)" 
              type="number"
              value={productData.sourcePrice} 
              onChange={(e: any) => handleEditResult("sourcePrice", Number(e.target.value))} 
              placeholder="السعر المكتوب في الموقع الأصلي" 
              icon="💰" 
            />
            <Input 
              label="رابط المنتج" 
              value={productData.url} 
              onChange={(e: any) => handleEditResult("url", e.target.value)} 
              placeholder="انسخ الرابط من تيمو أو علي اكسبريس وضعه هنا" 
              icon="🔗" 
              dir="ltr"
            />
            
            <GlassCard className="fadeIn" style={{ 
              padding: 24, 
              border: `1px solid ${G.yellow}50`, 
              background: "linear-gradient(145deg, rgba(251, 191, 36, 0.12), rgba(0,0,0,0.4))",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: G.yellow, filter: "blur(50px)", opacity: 0.15 }}></div>
              
              <div style={{ padding: "20px 18px", background: "rgba(0,0,0,0.4)", borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${G.cardBorder}`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                <div>
                  <div style={{ fontSize: 10, color: G.sub, marginBottom: 6, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>السعر الاستثنائي للقائد</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: G.yellow, textShadow: `0 0 20px ${G.yellow}40` }}>£{ownerPrice}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.yellow }}>ج.م</div>
                  </div>
                  <div style={{ fontSize: 9, color: G.green, fontWeight: 700, marginTop: 4 }}>✓ تم تطبيق خصم {Math.round(discount * 100)}%</div>
                </div>
                <div style={{ width: 100 }}>
                  <Input label="الكمية" type="number" value={quantity} onChange={(e: any) => setQuantity(Math.max(1, Number(e.target.value)))} />
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                    <span style={{ fontSize: 13, color: G.sub2, fontWeight: 600 }}>إجمالي الحساب:</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: G.text }}>£{(ownerPrice * quantity).toFixed(2)} <span style={{ fontSize: 11, color: G.sub2 }}>ج.م</span></span>
                  </div>
                  <p style={{ fontSize: 10, color: G.sub, textAlign: "center", fontStyle: "italic", marginTop: 8 }}>* سيتم تأكيد الخصم عند الدفع من المحفظة</p>
              </GlassCard>
            </div>
        ) : service.type === "amazon_balance" ? (
           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             <Input 
               label="رقم الهاتف المسجل أمان" 
               value={vals["رقم الهاتف المسجل"] || ""} 
               onChange={(e: any) => setVals({ ...vals, "رقم الهاتف المسجل": e.target.value })} 
               placeholder="010XXXXXXXX" 
               icon="📱" 
             />
             <Input 
               label="البريد الإلكتروني المسجل" 
               value={vals["البريد الإلكتروني المسجل"] || ""} 
               onChange={(e: any) => setVals({ ...vals, "البريد الإلكتروني المسجل": e.target.value })} 
               placeholder="example@amazon.com" 
               icon="✉️" 
               dir="ltr"
             />
             <Input 
               label="المبلغ المراد خصمه من رصيدك" 
               type="number"
               value={quantity} 
               onChange={(e: any) => setQuantity(Math.max(0, Number(e.target.value)))} 
               placeholder="مثال: 1000" 
               icon="💰" 
             />

             <GlassCard className="fadeIn" style={{ 
               padding: 26, 
               border: `1px solid ${G.blue}60`, 
               background: "linear-gradient(160deg, rgba(79, 142, 247, 0.15), rgba(0,0,0,0.5))",
               position: "relative",
               overflow: "hidden"
             }}>
                <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, background: G.blue, filter: "blur(60px)", opacity: 0.2 }}></div>
                
                <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 1 }}>
                   <div style={{ fontSize: 12, color: G.sub, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>رصيدك المكتسب في أمازون</div>
                   <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
                     <div style={{ fontSize: 42, fontWeight: 900, color: G.green, textShadow: `0 0 30px ${G.green}50` }}>£{Math.round(quantity * 2.1)}</div>
                     <div style={{ fontSize: 18, fontWeight: 800, color: G.green }}>ج.م +</div>
                   </div>
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     style={{ fontSize: 11, color: G.blue, marginTop: 8, fontWeight: 800, background: "rgba(79, 142, 247, 0.15)", padding: "4px 12px", borderRadius: 20, display: "inline-block" }}>
                     🎁 تم تطبيق هدية الضعف (2.1x)
                   </motion.div>
                </div>

                <div style={{ padding: 18, background: "rgba(0,0,0,0.4)", borderRadius: 20, border: `1px solid ${G.cardBorder}`, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: G.sub2, fontWeight: 600 }}>سيتم خصم:</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: G.pink }}>£{quantity} ج.م</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${G.cardBorder}` }}>
                      <span style={{ fontSize: 13, color: G.sub2, fontWeight: 600 }}>ستستلم في أمازون:</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: G.green }}>£{Math.round(quantity * 2.1)} ج.م</span>
                   </div>
                </div>

                <p style={{ fontSize: 10, color: G.sub, textAlign: "center", marginTop: 12, opacity: 0.7 }}>* يتم شحن الرصيد مباشرة بعد مراجعة العملية</p>
             </GlassCard>
           </div>
        ) : service.type === "subscription" ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             {service.fields.map((f: string) => (
                <Input 
                  key={f}
                  label={f} 
                  value={vals[f] || ""} 
                  onChange={(e: any) => setVals({ ...vals, [f]: e.target.value })} 
                  placeholder={f === "البريد الإلكتروني للتفعيل" ? "example@email.com" : "..."} 
                  icon={f.includes("بريد") ? "✉️" : "📝"}
                  dir={f.includes("بريد") ? "ltr" : "rtl"}
                />
             ))}

             <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 600 }}>مدة الاشتراك</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {DURATIONS.map(d => (
                    <button 
                      key={d}
                      onClick={() => setDuration(d)}
                      style={{ 
                        padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 700, 
                        background: duration === d ? `${service.color}20` : G.card,
                        border: `1px solid ${duration === d ? service.color : G.cardBorder}`,
                        color: duration === d ? service.color : G.text,
                        cursor: "pointer", transition: "0.2s"
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
             </div>

             <GlassCard className="fadeIn" style={{ 
               padding: 24, 
               border: `1px solid ${service.color}50`, 
               background: `linear-gradient(135deg, ${service.color}15, rgba(0,0,0,0.4))`,
               textAlign: "center"
             }}>
                <div style={{ marginBottom: 20 }}>
                   <div style={{ fontSize: 10, color: G.sub, marginBottom: 4, fontWeight: 700 }}>سعر "القائد" بعد خصم {Math.round((service.discount || 0.85) * 100)}%</div>
                   <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 5 }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: G.green }}>£{calculateTotal() || "0"}</div>
                      <div style={{ fontSize: 14, color: G.green }}>ج.م / {duration}</div>
                   </div>
                   <div style={{ fontSize: 9, color: G.sub2, textDecoration: "line-through", marginTop: 4 }}>السعر العالمي الأصلي: £{service.price} ج.م</div>
                </div>

                <div style={{ padding: 14, background: "rgba(0,0,0,0.3)", borderRadius: 16, border: `1px solid ${G.cardBorder}`, marginBottom: 20 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: G.sub }}>تفصيل الحساب:</span>
                      <span style={{ fontSize: 11, color: G.green, fontWeight: 800 }}>خصم القائد 85%</span>
                   </div>
                   <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                        <span style={{ color: G.sub2 }}>السعر الأساسي:</span>
                        <span style={{ color: G.text }}>£{service.price} ج.م</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                        <span style={{ color: G.sub2 }}>المدة المحددة:</span>
                        <span style={{ color: G.text }}>{duration}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, paddingTop: 6, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                        <span style={{ color: G.sub2 }}>إجمالي الوفر:</span>
                        <span style={{ color: G.green }}>- £{(service.price * (service.discount || 0.85) * (duration === DURATIONS[0] ? 1 : duration === DURATIONS[1] ? 2.8 : duration === DURATIONS[2] ? 5.2 : 9)).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
             </GlassCard>
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            <SectionHeader title="بيانات الطلب" accent={service.color} icon="📝" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {service.fields && service.fields.map((f: string, i: number) => {
                const isFinancialSelection = service.note === "FINANCIAL";
                const isDollarFieldSelection = f.includes("المبلغ") || f.includes("$");
                
                if (isDollarFieldSelection && !service.packages && (isFinancialSelection || service.note === "GAMING CHARGE")) {
                return (
                  <div key={i} className="fade">
                    <div style={{ background: "rgba(234, 179, 8, 0.05)", padding: 20, borderRadius: 20, border: `1px solid ${G.yellow}40`, marginBottom: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: G.yellow, marginBottom: 10, display: "block" }}>{f}</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                          <input 
                            type="number" 
                            step="0.01"
                            value={quantity} 
                            onChange={(e: any) => setQuantity(Number(e.target.value))}
                            placeholder="0.00"
                            style={{ width: "100%", background: "transparent", border: "none", fontSize: 32, fontWeight: 900, color: G.text, outline: "none" }}
                          />
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: G.sub }}>$</div>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                         <span style={{ fontSize: 11, color: G.sub2 }}>سعر الصرف اليوم:</span>
                         <span style={{ fontSize: 12, fontWeight: 800, color: G.blue }}>1$ = 54.00 ج.م</span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (f.includes("(كل سطر تعليق)")) {
                return (
                  <div key={i}>
                    <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 600 }}>{f}</label>
                    <textarea
                      value={vals[f] || ""}
                      onChange={(e: any) => {
                        const txt = e.target.value;
                        const lines = txt.split("\n").filter((l: string) => l.trim() !== "").length;
                        setVals({ ...vals, [f]: txt });
                        setQuantity(Math.max(service.minQuantity || 1, lines));
                      }}
                      placeholder="اكتب التعليقات هنا...&#10;التعليق الأول&#10;التعليق الثاني"
                      style={{
                        width: "100%", height: 150, background: "rgba(0,0,0,0.35)", border: `1px solid ${G.cardBorder}`,
                        borderRadius: G.radiusSm, padding: 14, color: G.text, fontSize: 13, outline: "none",
                        fontFamily: G.font, resize: "none"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "0 4px" }}>
                       <div style={{ fontSize: 11, color: G.sub }}>عدد التعليقات المكتشفة: <span style={{ color: G.blue, fontWeight: 800 }}>{quantity}</span></div>
                       <div style={{ fontSize: 14, fontWeight: 900, color: G.green }}>£{calculateTotal() || "0"} ج.م</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <Input 
                    label={f} 
                    value={vals[f] || ""} 
                    onChange={(e: any) => setVals({ ...vals, [f]: e.target.value })} 
                    placeholder={`أدخل ${f}...`} 
                    icon={f.includes("رابط") ? "🔗" : f.includes("ID") || f.includes("اسم") || f.includes("عنوان") ? "🆔" : "📝"}
                  />
                </div>
              );
            })}

            {!service.packages && (
              <GlassCard className="fadeIn" style={{ 
                marginTop: 4, 
                padding: 24, 
                border: `1px solid ${service.color}60`, 
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.4))",
                marginBottom: 20
              }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                   <div style={{ fontSize: 11, color: G.sub, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>المبلغ المراد خصمه من الرصيد</div>
                   <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
                     <div style={{ fontSize: 36, fontWeight: 900, color: service.color, textShadow: `0 0 20px ${service.color}40` }}>£{calculateTotal() || "0"}</div>
                     <div style={{ fontSize: 16, fontWeight: 700, color: service.color }}>ج.م</div>
                   </div>
                   {(service.note === "FINANCIAL" || service.note === "GAMING CHARGE") && (
                     <div style={{ fontSize: 10, color: G.green, marginTop: 4, fontWeight: 700 }}>
                       سيتم توفير شدات/رصيد بقيمة ${selectedPkg ? selectedPkg.price : (quantity || 0)} (أو ما يعادلها)
                     </div>
                   )}
                </div>

                <div style={{ padding: 12, background: "rgba(0,0,0,0.25)", borderRadius: 12, marginBottom: 20, border: `1px solid ${G.cardBorder}` }}>
                  <div style={{ fontSize: 10, color: G.sub, marginBottom: 10, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${G.cardBorder}`, paddingBottom: 6 }}>تفصيل الفاتورة التقديرية</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
                      <span style={{ color: G.sub2 }}>{(service.note === "FINANCIAL" || service.note === "GAMING CHARGE") ? "سعر الدولار المعتمد:" : "سعر الوحدة الأساسي:"}</span>
                      <span style={{ color: G.text }}>{(service.note === "FINANCIAL" || service.note === "GAMING CHARGE") ? "54.00" : `£${(service.price / 1000).toFixed(4)}`} ج.م</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
                      <span style={{ color: G.sub2 }}>{(service.note === "FINANCIAL" || service.note === "GAMING CHARGE") ? "المبلغ المطلوب ($):" : "إجمالي الكمية:"}</span>
                      <span style={{ color: G.blue }}>{(service.note === "FINANCIAL" || service.note === "GAMING CHARGE") ? `$${selectedPkg ? selectedPkg.price : (quantity || 0)}` : `${quantity?.toLocaleString() || 0} وحدة`}</span>
                    </div>
                    {(service.note === "GAMING CHARGE" || service.note === "FINANCIAL") && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
                         <span style={{ color: G.green }}>خصم القائد (دولي):</span>
                         <span style={{ color: G.green }}>- {Math.round((service.discount || 0.3) * 100)}%</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800, borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 6, marginTop: 4 }}>
                      <span style={{ color: G.text }}>الإجمالي بالجنيه المصري:</span>
                      <span style={{ color: G.green }}>£{calculateTotal() || "0"} ج.م</span>
                    </div>
                  </div>
                </div>
                
                <p style={{ fontSize: 10, color: G.sub, textAlign: "center", fontStyle: "italic" }}>* يتم الخصم من رصيد المحفظة فوراً</p>
              </GlassCard>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Input label="كود الخصم (اختياري)" placeholder="EX: SALE2026" icon="🎫" /></div>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
            <Btn label="تحقق" variant="ghost" size="md" />
          </div>
        </div>
      </>
    ) : null}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {isLogistics && !isSubscription && (
            <Btn 
              full 
              label={loading ? "⏳ جاري الإرسال..." : `🛒 إضافة للسلة`} 
              onClick={handleAddToCart} 
              variant="ghost"
              color={service.color} 
              disabled={loading} 
              size="lg" 
            />
          )}
          <Btn 
            full 
            label={loading ? "⏳ جاري الإرسال..." : (isLogistics && !isSubscription) ? `⚡ شراء الآن` : `⚡ شراء مباشر`} 
            onClick={handleSubmit} 
            color={service.color} 
            disabled={loading} 
            size="lg" 
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionHeader title="الدعـم والمساعدة" accent={G.blue} icon="🛡️" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <GlassCard onClick={() => window.open("https://wa.me/demo", "_blank")} style={{ padding: 12, textAlign: "center", cursor: "pointer", background: "rgba(37, 211, 102, 0.05)", border: "1px solid rgba(37, 211, 102, 0.2)" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>💬</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: G.text }}>دردشة حية</div>
            </GlassCard>
            <GlassCard onClick={() => window.location.href = "mailto:support@alqaid.com"} style={{ padding: 12, textAlign: "center", cursor: "pointer", background: "rgba(79, 142, 247, 0.05)", border: "1px solid rgba(79, 142, 247, 0.2)" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>✉️</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: G.text }}>البريد</div>
            </GlassCard>
            <GlassCard onClick={() => setTab("tickets")} style={{ padding: 12, textAlign: "center", cursor: "pointer", background: "rgba(244, 114, 182, 0.05)", border: "1px solid rgba(244, 114, 182, 0.2)" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>🎫</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: G.text }}>تذكرة دعم</div>
            </GlassCard>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionHeader title="الأسئلة الشائعة" accent={G.yellow} icon="❓" />
          <GlassCard style={{ padding: "8px 16px" }}>
            {faqs.map((faq: any, i: number) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function WalletScreen({ points, balance, setBalance, addOrder, addNotification }: any) {
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState(500);
  const [topupMethod, setTopupMethod] = useState(null as string | null);
  const [senderNumber, setSenderNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecharge = () => {
    if (topupMethod === "vodafone") {
      if (!senderNumber || senderNumber.length < 11) {
        alert("يرجى إدخال رقم الهاتف الذي تم التحويل منه بشكل صحيح");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        addNotification("تم إرسال طلب الشحن ⏳", `جاري مراجعة عملية التحويل من رقم ${senderNumber}. سيتم إضافة الرصيد خلال دقائق.`, "💳");
        setShowRecharge(false);
        setTopupMethod(null);
        setSenderNumber("");
      }, 1500);
      return;
    }

    setBalance(balance + Number(rechargeAmt));
    addOrder({
      id: Math.floor(Math.random() * 100000),
      name: "شحن رصيد المحفظة",
      type: "FINANCIAL",
      amount: `+ £${rechargeAmt}`,
      status: "completed",
      date: new Date().toLocaleDateString("ar-EG"),
      icon: "💳",
      color: G.green,
      total: 0
    });
    addNotification("تم الشحن بنجاح! ✅", `تم إضافة مبلغ £${rechargeAmt} ج.م إلى محفظتك.`, "💰");
    setShowRecharge(false);
  };

  const methods = [
    { id: "vodafone", name: "فودافون كاش", icon: "📱", color: "#e60000" },
    { id: "bank", name: "تحويل بنكي (InstaPay)", icon: "🏦", color: G.blue },
    { id: "binance", name: "Binance Pay / USDT", icon: "💎", color: G.yellow },
  ];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>المحفظة الرقمية</h1>
          <p style={{ fontSize: 13, color: G.sub, marginTop: 4 }}>إدارة رصيدك ومدفوعاتك بأمان</p>
        </div>
        <div style={{ padding: "8px 12px", background: "rgba(79,142,247,0.1)", borderRadius: 12, border: "1px solid rgba(79,142,247,0.2)" }}>
          <span style={{ fontSize: 10, color: G.blue, fontWeight: 700 }}>VIP LEVEL 1</span>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Balance Card */}
        <GlassCard style={{ padding: 26, border: "1px solid rgba(79,142,247,0.25)", position: "relative", overflow: "hidden" }}>
          <div className="shimmer-line" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: G.sub2, fontWeight: 600 }}>الرصيد المتاح حالياً</div>
              <div style={{ padding: "4px 8px", background: "rgba(16,217,160,0.1)", borderRadius: 6, fontSize: 9, color: G.green, fontWeight: 800 }}>✓ محفظة نشطة</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: G.text }}>{balance.toLocaleString()}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: G.blue }}>ج.م</span>
            </div>
            
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button 
                onClick={() => setShowRecharge(true)}
                className="btn"
                style={{ flex: 1, padding: "14px", borderRadius: G.radiusSm, background: G.blue, color: "#fff", border: "none", fontSize: 14, fontWeight: 900, boxShadow: "0 8px 24px rgba(79,142,247,0.3)" }}
              >
                ⚡ شحن فوري
              </button>
              <button 
                className="btn"
                style={{ width: 50, height: 50, borderRadius: G.radiusSm, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.cardBorder}`, color: G.text, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                🔄
              </button>
            </div>
          </div>
        </GlassCard>

        {showRecharge && (
          <GlassCard className="fadeUp" style={{ padding: 22, border: `1.5px solid ${G.blue}40`, background: "rgba(79,142,247,0.06)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
               <h3 style={{ fontSize: 16, fontWeight: 900, color: G.text }}>{topupMethod ? "إضافة رصيد" : "اختر وسيلة الشحن"}</h3>
               <button onClick={() => { setShowRecharge(false); setTopupMethod(null); }} style={{ background: "none", border: "none", color: G.sub, fontSize: 18 }}>✕</button>
             </div>

             {!topupMethod ? (
               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                 {methods.map(m => (
                   <div 
                    key={m.id} 
                    onClick={() => setTopupMethod(m.id)}
                    style={{ 
                      padding: 16, borderRadius: 16, background: "rgba(0,0,0,0.2)", 
                      border: `1px solid ${G.cardBorder}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer"
                    }}
                    className="btn"
                   >
                     <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${m.color}25` }}>{m.icon}</div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{m.name}</div>
                       <div style={{ fontSize: 10, color: G.sub }}>إيداع فوري وسريع</div>
                     </div>
                     <span style={{ color: G.sub }}>←</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="fadeIn">
                 {topupMethod === "vodafone" && (
                   <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ padding: 16, background: "rgba(230,0,0,0.08)", border: "1px dashed #e6000040", borderRadius: G.radiusSm, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: G.sub2, marginBottom: 6 }}>حول المبلغ إلى الرقم التالي:</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: 2, marginBottom: 8 }}>01001900618</div>
                        <div style={{ fontSize: 10, color: "#e60000", fontWeight: 800 }}>⚠️ يرجى التأكد من الرقم قبل التحويل</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                         {[100, 500, 1000].map(amt => (
                           <button key={amt} onClick={() => setRechargeAmt(amt)} style={{ padding: "10px 4px", borderRadius: 10, background: rechargeAmt === amt ? G.blue : "rgba(0,0,0,0.2)", border: `1px solid ${rechargeAmt === amt ? G.blue : G.cardBorder}`, color: "#fff", fontSize: 11, fontWeight: 700 }}>£{amt}</button>
                         ))}
                      </div>

                      <Input label="المبلغ المحول" type="number" value={rechargeAmt} onChange={(e: any) => setRechargeAmt(e.target.value)} icon="💰" />
                      <Input label="رقم الهاتف الذي قمت بالتحويل منه" value={senderNumber} onChange={(e: any) => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" icon="📱" />

                      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <Btn full label="رجوع" variant="ghost" onClick={() => setTopupMethod(null)} />
                        <Btn full label={loading ? "جاري الإرسال..." : "تأكيد التحويل"} onClick={handleRecharge} disabled={loading} />
                      </div>
                   </div>
                 )}

                 {topupMethod !== "vodafone" && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                       <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                       <div style={{ fontSize: 14, color: G.text, fontWeight: 700 }}>هذه الوسيلة قيد التطوير</div>
                       <div style={{ fontSize: 11, color: G.sub, marginTop: 4 }}>يرجى استخدام فودافون كاش حالياً</div>
                       <div style={{ marginTop: 20 }}><Btn label="العودة للاختيار" variant="ghost" onClick={() => setTopupMethod(null)} /></div>
                    </div>
                 )}
               </div>
             )}
          </GlassCard>
        )}

        <GlassCard style={{ 
          padding: 22, 
          border: "1px solid rgba(251,191,36,0.3)", 
          background: "linear-gradient(135deg, rgba(251,191,36,0.1), transparent)" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 4 }}>نقاط مكافآت القائد</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: G.yellow }}>{points.toLocaleString()} <span style={{ fontSize: 14 }}>نقطة</span></div>
            </div>
            <div style={{ fontSize: 32 }}>🌟</div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${G.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: G.sub2 }}>تساوي £{(points / 10).toFixed(0)} ج.م خصم مباشر</div>
            <Btn label="استبدال" variant="ghost" size="sm" color={G.yellow} />
          </div>
        </GlassCard>
      </div>
�      <div style={{ padding: "24px 20px 0" }}>
        <SectionHeader title="المعاملات الأخيرة" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TRANSACTIONS.map((tx, i) => (
            <div key={i} className="card fade" style={{ background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tx.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>{tx.icon}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{tx.name}</div></div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: tx.status === "completed" ? G.green : G.yellow }}>{tx.amount}</div>
                  <div style={{ fontSize: 9, color: G.sub }}>{tx.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ orders }: any) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text }}>سجل العمليات</h1>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((tx: any, i: number) => (
          <GlassCard key={tx.id || i} style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>{tx.icon || "🛒"}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{tx.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                    <Badge label={tx.type || "خدمة"} color={tx.color || G.blue} size="xs" />
                    {tx.duration && <span style={{ fontSize: 9, color: G.blue, background: `${G.blue}20`, padding: "1px 5px", borderRadius: 4 }}>{tx.duration}</span>}
                    {tx.id && <span style={{ fontSize: 9, color: G.sub }}>#{tx.id}</span>}
                  </div>
                  {tx.details && <div style={{ fontSize: 9, color: G.sub, marginTop: 4, fontStyle: "italic" }}>{tx.details}</div>}
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: tx.status === "completed" ? G.green : tx.status === "processing" ? G.blue : G.yellow }}>{tx.amount}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div style={{ fontSize: 10, color: tx.status === "completed" ? G.green : tx.status === "processing" ? G.blue : G.yellow }}>
                 {tx.status === "completed" ? "✅ مكتمل" : tx.status === "processing" ? "⏳ جاري التنفيذ" : "💤 في الانتظار"}
               </div>
               <div style={{ fontSize: 9, color: G.sub }}>{tx.date}</div>
            </div>
          </GlassCard>
        ))}
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

    // Process each item in cart as an order
    cart.forEach((item: any) => {
      addOrder(item);
    });

    setTimeout(() => {
      setCheckingOut(false);
      setSuccess(true);
      setCart([]);
    }, 2000);
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
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text }}>سلة المشتريات</h1>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {cart.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🛒</div>
            <div style={{ color: G.sub, fontSize: 14 }}>السلة فارغة حالياً. ابدأ بإضافة المنتجات بالذكاء الاصطناعي!</div>
            <div style={{ marginTop: 24 }}><Btn label="استكشف الخدمات" onClick={onBack} /></div>
          </div>
        ) : (
          <>
            {cart.map((item: any) => (
              <GlassCard key={item.id} className="fadeIn" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{item.productName || item.name}</div>
                      <div style={{ fontSize: 10, color: G.sub2 }}>
                        {item.provider || "Al Qaid Service"} 
                        {item.duration ? ` · المدة: ${item.duration}` : ` · الكمية: ${item.quantity}`}
                      </div>
                      {item.details && (
                        <div style={{ fontSize: 9, color: G.sub, marginTop: 2, background: "rgba(0,0,0,0.15)", padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>{item.details}</div>
                      )}
                      {item.amazonValue && (
                        <div style={{ fontSize: 10, color: G.green, fontWeight: 700, marginTop: 2 }}>قيمة الرصيد: £{item.amazonValue} ج.م</div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setCart(cart.filter((c: any) => c.id !== item.id))}
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#EF4444", width: 28, height: 28, borderRadius: 8, fontSize: 10, cursor: "pointer" }}
                  >✖</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${G.cardBorder}` }}>
                   <div style={{ fontSize: 11, color: G.sub }}>سعر المنتج بعد الخصم:</div>
                   <div style={{ fontSize: 14, fontWeight: 900, color: G.yellow }}>£{item.total} ج.م</div>
                </div>
              </GlassCard>
            ))}

            <GlassCard style={{ padding: 22, marginTop: 10, border: `1.5px solid ${G.blue}40`, background: "linear-gradient(135deg,rgba(79,142,247,0.05),transparent)" }}>
               <div style={{ padding: "0 4px 16px", borderBottom: `1px solid ${G.cardBorder}`, marginBottom: 16 }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                     <span style={{ fontSize: 18 }}>🌟</span>
                     <div>
                       <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>نقاط المكافآت</div>
                       <div style={{ fontSize: 10, color: G.sub }}>لديك {points} نقطة متاحة</div>
                     </div>
                   </div>
                   <button 
                     onClick={() => setUsePoints(!usePoints)}
                     style={{ 
                       padding: "6px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                       background: usePoints ? G.green : "rgba(255,255,255,0.05)",
                       color: usePoints ? "#fff" : G.sub,
                       border: `1px solid ${usePoints ? G.green : G.cardBorder}`,
                       cursor: "pointer", transition: "0.2s"
                     }}>
                     {usePoints ? "✓ تم التفعيل" : "استخدام النقاط"}
                   </button>
                 </div>
                 {usePoints && (
                   <div className="fadeIn" style={{ fontSize: 9, color: G.green, marginTop: 8, fontWeight: 700 }}>
                     ✨ سيتم تطبيق خصم £{pointsDiscount.toFixed(2)} ج.م من نقاطك
                   </div>
                 )}
               </div>

               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                 <span style={{ fontSize: 13, color: G.sub2 }}>المجموع الفرعي:</span>
                 <span style={{ fontSize: 13, fontWeight: 600, color: G.text }}>£{subtotal.toFixed(2)} ج.م</span>
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

function TicketsScreen({ tickets, setTickets }: any) {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = () => {
    if (!subject.trim()) {
      alert("يرجى إدخال موضوع التذكرة");
      return;
    }
    if (subject.length < 5) {
      alert("موضوع التذكرة قصير جداً (أقل من 5 أحرف)");
      return;
    }
    if (!msg.trim()) {
      alert("يرجى شرح المشكلة في خانة التفاصيل");
      return;
    }
    if (msg.length < 20) {
      alert("يرجى تقديم تفاصيل أكثر (أقل من 20 حرفاً)");
      return;
    }
    
    const newTicket = {
      id: `T${tickets.length + 1}`,
      subject,
      msg,
      status: "open",
      date: new Date().toISOString().split("T")[0],
    };
    setTickets([newTicket, ...tickets]);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsCreating(false);
      setSubject("");
      setMsg("");
    }, 2000);
  };

  if (isCreating) {
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setIsCreating(false)} style={{ width: 40, height: 40, borderRadius: 12, background: G.card, border: `1px solid ${G.cardBorder}`, color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text }}>فتح تذكرة جديدة</h1>
            <p style={{ fontSize: 12, color: G.sub, marginTop: 2 }}>أخبرنا بما يواجهك وسنرد عليك فوراً</p>
          </div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {success ? (
            <GlassCard style={{ padding: 32, textAlign: "center", border: `1px solid ${G.green}30` }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📫</div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: G.text, marginBottom: 8 }}>تم الإرسال بنجاح!</h3>
              <p style={{ fontSize: 13, color: G.sub }}>سيتم الرد عليك في غضون 24 ساعة.</p>
            </GlassCard>
          ) : (
            <>
              <Input label="موضوع التذكرة" value={subject} onChange={(e: any) => setSubject(e.target.value)} placeholder="مثال: مشكلة في تنفيذ الطلب" icon="🎫" />
              <div>
                <label style={{ fontSize: 11, color: G.sub2, marginBottom: 8, display: "block", fontWeight: 600 }}>تفاصيل المشكلة</label>
                <textarea
                  value={msg}
                  onChange={(e: any) => setMsg(e.target.value)}
                  placeholder="اشرح المشكلة بالتفصيل هنا..."
                  style={{
                    width: "100%", height: 160, background: "rgba(0,0,0,0.35)", border: `1px solid ${G.cardBorder}`,
                    borderRadius: G.radiusSm, padding: 14, color: G.text, fontSize: 13, outline: "none",
                    fontFamily: G.font, resize: "none"
                  }}
                />
              </div>
              <Btn full label="إرسال التذكرة" onClick={handle} size="lg" />
            </>
          )}
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
        <Btn label="+ تذكرة" onClick={() => setIsCreating(true)} size="sm" />
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {tickets.length === 0 ? (
          <GlassCard style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>🎫</div>
            <div style={{ fontSize: 14, color: G.sub }}>لا توجد تذاكر حالياً</div>
          </GlassCard>
        ) : (
          tickets.map((t: any) => (
            <GlassCard key={t.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{t.subject}</div>
                  <div style={{ fontSize: 10, color: G.sub, marginTop: 2 }}>{t.date} • ID: {t.id}</div>
                </div>
                <Badge 
                  label={t.status === "open" ? "قيد الانتظار" : t.status === "resolved" ? "تم الرد" : "مغلقة"} 
                  color={t.status === "open" ? G.blue : t.status === "resolved" ? G.green : G.sub} 
                  size="xs" 
                />
              </div>
              <div style={{ fontSize: 12, color: G.sub2, lineHeight: 1.5, background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8 }}>
                {t.msg}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsScreen({ onLogout }: any) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "52px 20px 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text }}>الإعدادات</h1>
      </div>
      <div style={{ padding: "0 20px" }}>
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="glow" style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#1E54C4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: G.text }}>القائد</div>
              <div style={{ fontSize: 11, color: G.sub }}>demo@alqaid.com</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard style={{ padding: 16, marginBottom: 20 }}>
           {["تغيير كلمة المرور", "إعدادات الإشعارات", "الدعم الفني", "عن التطبيق"].map((item, i) => (
             <div key={i} style={{ padding: "12px 0", borderBottom: i < 3 ? `1px solid ${G.cardBorder}` : "none", color: G.text, fontSize: 14 }}>{item}</div>
           ))}
        </GlassCard>
        <Btn full label="🚪 تسجيل الخروج" onClick={onLogout} color="#EF4444" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [tab, setTab] = useState("home");
  const [serviceDetail, setServiceDetail] = useState(null as any);
  const [socialPlatform, setSocialPlatform] = useState(null as any);
  const [cart, setCart] = useState([] as any[]);
  const [orders, setOrders] = useState([...TRANSACTIONS] as any[]);
  const [notifications, setNotifications] = useState([] as any[]);
  const [priceAlerts, setPriceAlerts] = useState([] as any[]);
  const [points, setPoints] = useState(450); // Initial points for the 'Leader'
  const [balance, setBalance] = useState(5000); // Initial balance in EGP
  const [tickets, setTickets] = useState([
    { id: "T1", subject: "مشكلة في شحن الرصيد", status: "resolved", date: "2024-05-01", msg: "حاولت شحن الرصيد ولم يظهر في المحفظة." },
    { id: "T2", subject: "تأخر في تنفيذ الطلب", status: "open", date: "2024-05-08", msg: "طلبت خدمة متابعين منذ ساعتين ولم يبدأ التنفيذ." }
  ] as any[]);

  const [syncedPrices, setSyncedPrices] = useState(marketSync.getCachedPrices() || {});
  const [isSyncing, setIsSyncing] = useState(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        let changed = false;
        const nextOrders = prevOrders.map(order => {
          if (order.status === "pending") {
            const random = Math.random();
            if (random > 0.7) {
              changed = true;
              addNotification("تحديث الطلب", `طلبك #${order.id} قيد المعالجة الآن`, "⏳");
              return { ...order, status: "processing" };
            }
          } else if (order.status === "processing") {
            const random = Math.random();
            if (random > 0.6) {
              changed = true;
              addNotification("اكتمل الطلب!", `تم تنفيذ طلبك #${order.id} بنجاح`, "✅");
              return { ...order, status: "completed" };
            }
          }
          return order;
        });
        return changed ? nextOrders : prevOrders;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addOrder = (order: any) => {
    const id = "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder = { 
      ...order, 
      id, 
      createdAt: new Date().toISOString(), 
      status: "pending",
      date: new Date().toLocaleDateString("ar-EG"),
      amount: `£${order.total || 0}`,
      name: order.productName || order.name
    };
    setOrders(prev => [newOrder, ...prev]);
    addNotification("تم استلام الطلب", `تم إضافة طلبك #${id} بنجاح`, "📋");

    // Earn points: 1 point for every 10 EGP spent
    const amountNum = Number(order.total) || 0;
    const earnedPoints = Math.floor(amountNum / 10);
    if (earnedPoints > 0) {
      setPoints(p => p + earnedPoints);
      addNotification("تم كسب نقاط مكافأة! 🌟", `لقد حصلت على ${earnedPoints} نقطة من طلبك الأخير.`, "🏆");
    }
    return id;
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
      case "home": return <HomeScreen setTab={handleSetTab} setServiceDetail={setServiceDetail} setSocialPlatform={setSocialPlatform} syncedPrices={syncedPrices} isSyncing={isSyncing} balance={balance} />;
      case "services": return <ServicesScreen setServiceDetail={setServiceDetail} setTab={handleSetTab} />;
      case "social": return <SocialMediaScreen initialPlatform={socialPlatform} setServiceDetail={setServiceDetail} syncedPrices={syncedPrices} />;
      case "tickets": return <TicketsScreen tickets={tickets} setTickets={setTickets} />;
      case "wallet": return <WalletScreen points={points} balance={balance} setBalance={setBalance} addOrder={addOrder} addNotification={addNotification} />;
      case "cart": return <CartScreen cart={cart} setCart={setCart} onBack={() => setTab("home")} addOrder={addOrder} points={points} setPoints={setPoints} balance={balance} setBalance={setBalance} addNotification={addNotification} />;
      case "history": return <HistoryScreen orders={orders} />;
      case "settings": return <SettingsScreen onLogout={() => setLoggedIn(false)} />;
      default: return <HomeScreen setTab={handleSetTab} setServiceDetail={setServiceDetail} setSocialPlatform={setSocialPlatform} syncedPrices={syncedPrices} isSyncing={isSyncing} />;
    }
  };

  const navTabs = [
    { id: "home", icon: "⊞", label: "الرئيسية" },
    { id: "cart", icon: "🛒", label: "السلة", badge: true },
    { id: "services", label: "استكشف", center: true },
    { id: "history", icon: "🕐", label: "السجل" },
    { id: "settings", icon: "⚙️", label: "إعدادات" },
  ];

  return (
    <div dir="rtl" style={{ background: G.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: "-5%", right: "-20%", width: 500, height: 500, background: "radial-gradient(circle,rgba(79,142,247,0.06),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-15%", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,217,160,0.04),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {!loggedIn ? (
          isRegistering ? (
            <RegisterPage onBack={() => setIsRegistering(false)} onDone={() => { setIsRegistering(false); setLoggedIn(true); }} addNotification={addNotification} />
          ) : (
            <LoginScreen onLogin={() => setLoggedIn(true)} onRegister={() => setIsRegistering(true)} addNotification={addNotification} />
          )
        ) : (
          <>
            {renderScreen()}
            {!serviceDetail && <FloatingSupport />}
            
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
                  <button key="center" onClick={() => handleSetTab("services")} style={{ border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "linear-gradient(135deg,#4F8EF7,#1E54C4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, marginTop: -32,
                      boxShadow: "0 6px 28px rgba(79,142,247,0.45)", color: "#fff"
                    }}>🔍</div>
                    <span style={{ fontSize: 10, color: tab === "services" ? G.blue : G.sub, marginTop: 4 }}>استكشف</span>
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
                    {t.badge && cart.length > 0 && (
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

function RegisterPage({ onBack, onDone, addNotification }: any) {
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

  const submit = () => {
    if (!agree) {
      addNotification("تنبيه", "يرجى الموافقة على الشروط والأحكام للمتابعة", "⚠️");
      return;
    }
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      setDone(true); 
      addNotification("مرحباً بك!", "تم إنشاء حسابك بنجاح. استمتع بخدماتنا!", "🎉");
    }, 2000);
  };

  if (done) return (
    <div dir="rtl" className="fade" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32 }}>
      <div className="float" style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(16,217,160,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, marginBottom: 22, border: `2px solid ${G.green}40` }}>🎉</div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: G.text, marginBottom: 8 }}>تم إنشاء الحساب!</h2>
      <p style={{ fontSize: 13, color: G.sub2, textAlign: "center", marginBottom: 28 }}>مرحباً {name}! رصيد ترحيبي £50 أُضيف لمحفظتك 🎁</p>
      <Btn full label="🚀 دخول المنصة" onClick={onDone} />
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
