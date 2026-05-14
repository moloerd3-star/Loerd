import { useState } from "react";
import { GlassCard as AppGlassCard } from "../App"; // If needed, but let's keep it self-contained for now as provided

const T = {
  bg: "#050810",
  surface: "rgba(255,255,255,0.032)",
  border: "rgba(255,255,255,0.07)",
  blue: "#4F8EF7",
  green: "#0ED9A0",
  yellow: "#FBBF24",
  red: "#F87171",
  purple: "#A78BFA",
  text: "#EFF4FF",
  sub: "rgba(210,225,255,0.38)",
  sub2: "rgba(210,225,255,0.6)",
  font: "'Cairo','Tajawal',sans-serif",
  r: 18, rSm: 12,
};

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../App";

const PAYMENT_METHODS = [
  { id: "vodafone",  name: "فودافون كاش",      icon: "📱", color: "#EF4444", fields: ["رقم الهاتف","الاسم الكامل"],                        fee: 0,   note: "مراجعة 24/7", transferTo: "01001900618" },
  { id: "etisalat", name: "اتصالات كاش",       icon: "📶", color: "#F97316", fields: ["رقم الهاتف","الاسم الكامل"],                        fee: 0,   note: "مراجعة 24/7" },
  { id: "orange",   name: "أورانج كاش",         icon: "🟠", color: "#FB923C", fields: ["رقم الهاتف","الاسم الكامل"],                        fee: 0,   note: "مراجعة 24/7", transferTo: "01270666075" },
  { id: "we",       name: "WE Pay",             icon: "🔵", color: "#3B82F6", fields: ["رقم الهاتف","الاسم الكامل"],                        fee: 0,   note: "مراجعة سريعة" },
  { id: "instapay", name: "InstaPay",           icon: "⚡", color: "#8B5CF6", fields: ["رقم IPA أو الهاتف","الاسم الكامل"],                 fee: 0,   note: "مراجعة سريعة", transferTo: "Loerd04" },
  { id: "meeza",    name: "Meeza",              icon: "🟩", color: "#16A34A", fields: ["رقم بطاقة ميزة","الاسم"],                           fee: 0,   note: "مراجعة سريعة" },
  { id: "fawry",    name: "فوري",               icon: "🟡", color: "#EAB308", fields: ["رقم الهاتف"],                                       fee: 1,   note: "رسوم 1%" },
  { id: "aman",     name: "أمان / مصاري",       icon: "🏪", color: "#10B981", fields: ["رقم الهاتف","كود المتجر"],                          fee: 0,   note: "نقاط البيع" },
  { id: "bank",     name: "تحويل بنكي",         icon: "🏦", color: "#0EA5E9", fields: ["رقم IBAN أو الحساب","اسم البنك","اسم صاحب الحساب"],fee: 0,   note: "1-3 ساعات" },
  { id: "visa",     name: "Visa / Mastercard",  icon: "💳", color: "#1D4ED8", fields: ["رقم البطاقة","تاريخ الانتهاء (MM/YY)","CVV"],      fee: 2.5, note: "رسوم 2.5%" },
  { id: "crypto",   name: "USDT (TRC20)",       icon: "🪙", color: "#FBBF24", fields: ["عنوان محفظة TRC20"],                               fee: 0,   note: "شبكة ترون" },
  { id: "paypal",   name: "PayPal",             icon: "🅿️", color: "#003087", fields: ["البريد الإلكتروني للـ PayPal"],                    fee: 3,   note: "رسوم 3%" },
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

function Logo({ size = 44 }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4F8EF7"/><stop offset="100%" stopColor="#0ED9A0"/></linearGradient>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#4F8EF7"/></linearGradient>
      </defs>
      <rect x="10" y="58" width="80" height="14" rx="7" fill="url(#wg1)"/>
      <polygon points="18,58 28,28 38,48 50,18 62,48 72,28 82,58" fill="url(#wg2)" opacity=".95"/>
      <circle cx="50" cy="18" r="7" fill="#FBBF24"/>
      <circle cx="50" cy="18" r="3.5" fill="white" opacity=".8"/>
      <circle cx="18" cy="58" r="4.5" fill="#4F8EF7"/>
      <circle cx="82" cy="58" r="4.5" fill="#0ED9A0"/>
    </svg>
  );
}

function GlassCard({ children, style = {}, onClick, glow = false }: any) {
  return (
    <div className="card-wallet shimmer-wallet" onClick={onClick} style={{
      background: T.surface, border: `1px solid ${glow ? "rgba(79,142,247,.35)" : T.border}`,
      borderRadius: T.r, backdropFilter: "blur(20px)", position: "relative", overflow: "hidden",
      boxShadow: glow ? "0 0 30px rgba(79,142,247,.1)" : "0 4px 24px rgba(0,0,0,.3)", cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
  );
}

function Btn({ label, onClick, color = T.blue, full = false, size = "md", variant = "solid", disabled = false, style = {} }: any) {
  const p  = size === "lg" ? "16px 28px" : size === "sm" ? "8px 14px" : "13px 22px";
  const fs = size === "lg" ? 15 : size === "sm" ? 11 : 13;
  const vs: any = { solid: { background: `linear-gradient(135deg,${color},${color}cc)`, color: "#fff", boxShadow: `0 4px 20px ${color}40` }, ghost: { background: `${color}14`, border: `1px solid ${color}30`, color }, outline: { background: "transparent", border: `1px solid ${color}50`, color } };
  return <button className="btn-wallet" onClick={onClick} disabled={disabled} style={{ width: full ? "100%" : "auto", padding: p, fontSize: fs, fontWeight: 800, borderRadius: T.rSm, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: disabled ? .5 : 1, ...vs[variant], ...style }}>{label}</button>;
}

function Input({ label, value, onChange, placeholder, type = "text", icon, dir = "ltr" }: any) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label style={{ fontSize: 11, color: T.sub2, marginBottom: 7, display: "block", fontWeight: 700 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input className="inp-wallet" value={value} onChange={onChange} placeholder={placeholder} type={type} dir={dir}
          style={{ width: "100%", background: "rgba(0,0,0,.3)", border: `1px solid ${T.border}`, borderRadius: T.rSm, color: T.text, fontSize: 14, fontFamily: T.font, padding: icon ? "13px 44px 13px 16px" : "13px 16px", transition: "border-color .2s,box-shadow .2s" }}/>
        {icon && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: .4 }}>{icon}</span>}
      </div>
    </div>
  );
}

function StepBar({ current }: any) {
  const steps = ["المبلغ", "طريقة الدفع", "التأكيد"];
  const idx = ({ amount: 0, method: 1, confirm: 2 } as any)[current] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i < idx ? T.green : i === idx ? T.blue : "rgba(255,255,255,.06)", border: `2px solid ${i <= idx ? (i < idx ? T.green : T.blue) : T.border}`, fontSize: 11, fontWeight: 900, color: i <= idx ? "#fff" : T.sub, transition: "all .3s" }}>{i < idx ? "✓" : i + 1}</div>
            <span style={{ fontSize: 9, color: i === idx ? T.blue : i < idx ? T.green : T.sub, fontWeight: 700, whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < 2 && <div style={{ flex: 1, height: 2, background: i < idx ? T.green : T.border, margin: "0 6px 14px", transition: "background .3s" }}/>}
        </div>
      ))}
    </div>
  );
}

function Badge({ label, color }: any) {
  return <span style={{ padding: "2px 8px", fontSize: 9, fontWeight: 800, borderRadius: 20, background: `${color}20`, color, border: `1px solid ${color}30`, display: "inline-block", whiteSpace: "nowrap" }}>{label}</span>;
}

export default function WalletPageV2({ balance, setBalance, points, setPoints, orders, recharges, addNotification }: any) {
  const [txs, setTxs]           = useState([] as any[]);

  // Merge actual site orders if they exist to history
  const combinedTxs = [...txs];
  
  if (recharges) {
    recharges.forEach((r: any) => {
      combinedTxs.push({
        name: `شحن رصيد — ${r.method}`,
        amount: r.amount,
        type: "شحن",
        status: r.status,
        date: r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "قيد المعالجة",
        icon: "💰",
        color: r.status === "approved" ? T.green : r.status === "rejected" ? T.red : T.yellow
      });
    });
  }

  if (orders) {
    orders.forEach((o: any) => {
        combinedTxs.push({
            name: o.productName || o.name || "طلب خدمة",
            amount: o.total || 0,
            type: "مدفوع",
            date: o.status === "completed" ? "منذ قليل" : "معالج",
            icon: o.icon || "📦",
            color: o.color || T.blue
        });
    });
  }

  const [step, setStep]         = useState("main");
  const [amount, setAmount]     = useState(200);
  const [custom, setCustom]     = useState("");
  const [method, setMethod]     = useState(null as any);
  const [fields, setFields]     = useState({} as any);
  const [loading, setLoading]   = useState(false);
  const [receipt, setReceipt]   = useState(null as any);
  const [filter, setFilter]     = useState("الكل");

  const finalAmt  = custom ? Number(custom) : amount;
  const currentFee = method ? +((method.fee / 100) * finalAmt).toFixed(2) : 0;
  const totalPay  = +(finalAmt + currentFee).toFixed(2);

  const reset = () => { setStep("main"); setAmount(200); setCustom(""); setMethod(null); setFields({}); };

  const confirm = async () => {
    const miss = method.fields.find((f: any) => !fields[f]?.trim());
    if (miss) { alert(`يرجى ملء: ${miss}`); return; }
    
    if (!auth.currentUser) {
      alert("يجب تسجيل الدخول أولاً");
      return;
    }

    setLoading(true);
    try {
      const id = "RCP-" + Math.random().toString(36).substr(2, 8).toUpperCase();
      
      // Create recharge request in Firestore
      await addDoc(collection(db, "recharge_requests"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0],
        amount: finalAmt,
        method: method.name,
        fields: fields,
        status: "pending",
        createdAt: serverTimestamp(),
        requestId: id
      });

      setReceipt({ amount: finalAmt, fee: currentFee, method: method.name, id, time: new Date().toLocaleTimeString("ar-EG") });
      setLoading(false);
      setStep("success");
      
      if (addNotification) {
        addNotification("تم إرسال الطلب ⏳", `طلب شحن £${finalAmt} قيد المراجعة حالياً. سيتم تحديث رصيدك فور الموافقة.`, "💰");
      }
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  const totalIn   = combinedTxs.filter(t => t.type === "شحن").reduce((a, t) => a + t.amount, 0);
  const totalOut  = combinedTxs.filter(t => t.type === "مدفوع").reduce((a, t) => a + t.amount, 0);
  const filtered  = filter === "الكل" ? combinedTxs : combinedTxs.filter(t => t.type === filter);

  if (step === "success") return (
    <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, fontFamily: T.font }}>
        <div className="float-wallet" style={{ fontSize: 86, marginBottom: 18 }}>⏳</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: T.text, marginBottom: 6 }}>تم إرسال الطلب!</h2>
        <p style={{ fontSize: 13, color: T.sub2, textAlign: "center", marginBottom: 22 }}>جاري مراجعة طلبك من قبل الإدارة، وسيتم إضافة الرصيد فور التأكد.</p>
        <GlassCard glow style={{ padding: 22, width: "100%", maxWidth: 340 }}>
          {[["المبلغ المشحون", `£${receipt?.amount}`, T.green], ["العمولة", receipt?.fee > 0 ? `£${receipt.fee}` : "مجاناً ✓", T.yellow], ["طريقة الدفع", receipt?.method, T.text], ["وقت العملية", receipt?.time, T.sub2], ["رقم الإيصال", receipt?.id, T.blue]].map(([l, v, c]: any, i, a) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ color: T.sub, fontSize: 12 }}>{l}</span>
              <span style={{ color: c, fontWeight: 800, fontSize: 13, direction: "ltr" }}>{v}</span>
            </div>
          ))}
        </GlassCard>
        <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
          <Btn label="شحن مرة أخرى" onClick={reset} color={T.blue} />
          <Btn label="رجوع للمحفظة" onClick={reset} variant="ghost" color={T.sub2} />
        </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", paddingBottom: 60, fontFamily: T.font, position: "relative", overflowX: "hidden" }}>
        
        {/* BG glows */}
        <div style={{ position: "absolute", top: "-10%", right: "-20%", width: 400, height: 400, background: "radial-gradient(circle,rgba(79,142,247,.05),transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>
        <div style={{ position: "absolute", bottom: "-10%", left: "-15%", width: 350, height: 350, background: "radial-gradient(circle,rgba(14,217,160,.04),transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ padding: "50px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: T.text }}>المحفظة الرقمية</h1>
              <p style={{ fontSize: 11, color: T.sub, marginTop: 3 }}>رصيدك ومعاملاتك</p>
            </div>
            <div className="float-wallet"><Logo size={42}/></div>
          </div>

          {/* Balance card */}
          <div style={{ padding: "16px 20px 0" }}>
            <GlassCard glow style={{ padding: 22, background: "linear-gradient(135deg,rgba(79,142,247,.08),rgba(14,217,160,.04))", border: "1px solid rgba(79,142,247,.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, color: T.sub, marginBottom: 5, letterSpacing: 1 }}>الرصيد المتاح</div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: T.text, lineHeight: 1 }}>£<span style={{ color: T.blue }}>{balance?.toLocaleString()}</span></div>
                  <div style={{ fontSize: 10, color: T.sub, marginTop: 4 }}>جنيه مصري</div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>نقاط المكافآت</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: T.yellow }}>⭐ {points?.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: T.sub }}>= £{(points / 10).toFixed(0)} خصم</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: "rgba(0,0,0,.2)", borderRadius: 12, padding: 12 }}>
                {[["إجمالي الشحن", `£${totalIn.toLocaleString()}`, "⬆️"], ["إجمالي المصروف", `£${totalOut.toLocaleString()}`, "⬇️"], ["قيمة النقاط", `£${(points/10).toFixed(0)}`, "💎"]].map(([l, v, i], idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, marginBottom: 3 }}>{i}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{v}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{l}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ══ TOPUP FLOW ══ */}
          <div style={{ padding: "20px 20px 0" }}>

            {(step === "main" || step === "method") && (
              <div className="fadeIn-wallet">
                {/* Amount Selection */}
                <div style={{ fontSize: 13, color: T.sub2, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 14, background: T.green, borderRadius: 4 }}/>
                  شحن الرصيد — أدخل المبلغ
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className="btn-wallet" style={{ padding: "14px 8px", borderRadius: 14, fontSize: 15, fontWeight: 900, background: amount === a && !custom ? "rgba(79,142,247,.2)" : T.surface, border: `1px solid ${amount === a && !custom ? T.blue : T.border}`, color: amount === a && !custom ? T.blue : T.text }}>£{a}</button>
                  ))}
                </div>
                <Input label="أو أدخل مبلغاً مخصصاً" value={custom} onChange={(e: any) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="مثال: 750 (الحد الأدنى £10)" icon="✏️"/>
                
                <div style={{ height: 20 }} />

                {/* Method Selection Grid */}
                <div style={{ fontSize: 13, color: T.sub2, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 14, background: T.blue, borderRadius: 4 }}/>
                  اختر وسيلة الدفع
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {PAYMENT_METHODS.map(m => (
                    <GlassCard key={m.id} onClick={() => setMethod(m)} style={{ 
                      padding: "16px 10px", 
                      cursor: "pointer", 
                      border: `1px solid ${method?.id === m.id ? m.color : T.border}`, 
                      background: method?.id === m.id ? `${m.color}12` : T.surface,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10
                    }}>
                      <div style={{ 
                        width: 48, height: 48, borderRadius: 16, 
                        background: `${m.color}20`, 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontSize: 24, transition: "transform .2s",
                        transform: method?.id === m.id ? "scale(1.1)" : "scale(1)"
                      }}>{m.icon}</div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{m.name}</div>
                        <div style={{ fontSize: 8, color: m.fee > 0 ? T.yellow : T.green, fontWeight: 800 }}>
                          {m.fee > 0 ? `%${m.fee}` : "مجاناً"}
                        </div>
                      </div>

                      <div style={{ 
                        position: "absolute", top: 6, right: 6,
                        width: 14, height: 14, borderRadius: "50%", 
                        background: method?.id === m.id ? m.color : "rgba(255,255,255,.06)", 
                        border: `1px solid ${method?.id === m.id ? m.color : T.border}`, 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontSize: 7, color: "#fff", transition: "all .2s" 
                      }}>
                        {method?.id === m.id && "✓"}
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <div style={{ marginTop: 24 }}>
                  <Btn 
                    full 
                    label={!method ? "اختر وسيلة دفع للمتابعة" : `شحن رصيد £${finalAmt || 0} ←`} 
                    onClick={() => finalAmt >= 10 && method && setStep("confirm")} 
                    disabled={!finalAmt || finalAmt < 10 || !method} 
                    size="lg" 
                    color={T.green} 
                  />
                  {finalAmt > 0 && finalAmt < 10 && <div style={{ fontSize: 11, color: T.red, textAlign: "center", marginTop: 8 }}>الحد الأدنى £10</div>}
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="fadeUp-wallet">
                <StepBar current="confirm"/>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setStep("method")} className="btn-wallet" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "8px 14px", borderRadius: 10, fontSize: 12 }}>← رجوع</button>
                  <div style={{ fontSize: 13, color: T.sub2, fontWeight: 700 }}>بيانات {method?.name}</div>
                </div>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: `${method.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 8px", border: `1.5px solid ${method.color}35` }}>{method.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{method.name}</div>
                  {method.fee > 0 && <div style={{ fontSize: 11, color: T.yellow, marginTop: 3 }}>عمولة {method.fee}%</div>}

                  {method.transferTo && (
                    <div style={{ 
                      margin: "12px auto", padding: 12, background: `${method.color}15`, 
                      border: `1px dashed ${method.color}40`, borderRadius: 12, maxWidth: 280 
                    }}>
                      <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>بيانات التحويل المقصودة:</div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: method.color, letterSpacing: 1 }}>{method.transferTo}</div>
                        <button 
                          className="btn-wallet" 
                          onClick={() => {
                            navigator.clipboard.writeText(method.transferTo);
                            if (addNotification) addNotification("تم النسخ 📋", "تم نسخ رقم التحويل بنجاح.", "✨");
                          }}
                          style={{ padding: "4px 8px", fontSize: 10, background: method.color, color: "#fff", borderRadius: 6, fontWeight: 700 }}
                        >نسخ</button>
                      </div>
                      <div style={{ fontSize: 9, color: T.sub, marginTop: 4 }}>* يرجى التحويل أولاً ثم تأكيد البيانات أدناه</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                  {method.fields.map((f: any) => (
                    <Input key={f} label={f} value={fields[f] || ""} onChange={(e: any) => setFields({ ...fields, [f]: e.target.value })} placeholder={`أدخل ${f}`} dir="ltr" />
                  ))}
                </div>

                <GlassCard style={{ padding: 18, background: "rgba(79,142,247,.05)", border: "1px solid rgba(79,142,247,.18)" }}>
                  {[["المبلغ المطلوب", `£${finalAmt}`, T.text], ...(currentFee > 0 ? [["العمولة", `+£${currentFee}`, T.yellow]] : []), ["الإجمالي المدفوع", `£${totalPay}`, T.green], ["يُضاف للرصيد", `£${finalAmt}`, T.blue]].map(([l, v, c]: any, i, a) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : "none", ...(i === a.length - 1 ? { borderTop: `1px solid ${T.border}` } : {}) }}>
                      <span style={{ color: T.sub, fontSize: 13 }}>{l}</span>
                      <span style={{ color: c, fontWeight: 900, fontSize: i === a.length - 1 ? 20 : 14 }}>{v}</span>
                    </div>
                  ))}
                </GlassCard>

                <div style={{ marginTop: 14 }}>
                  {loading
                    ? <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><div className="spinner-wallet" style={{ width: 24, height: 24, border: "2px solid rgba(79,142,247,.2)", borderTopColor: T.blue, borderRadius: "50%" }}/></div>
                    : <Btn full label={`✅ تأكيد الشحن — £${totalPay}`} onClick={confirm} size="lg" color={T.green} />}
                  <div style={{ fontSize: 10, color: T.sub, textAlign: "center", marginTop: 10 }}>🔒 عملية آمنة ومشفرة · تتم المراجعة خلال دقائق</div>
                </div>
              </div>
            )}
          </div>

          {step === "main" && (
            <div style={{ padding: "24px 20px 0" }}>
              <div style={{ height: 1, background: T.border, marginBottom: 20 }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 14, background: T.blue, borderRadius: 4 }}/>
                  <span style={{ fontSize: 13, color: T.sub2, fontWeight: 700 }}>سجل المعاملات</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["الكل", "شحن", "مدفوع"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className="btn-wallet" style={{ padding: "5px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: filter === f ? T.blue : T.surface, color: filter === f ? "#fff" : T.sub, border: `1px solid ${filter === f ? T.blue : T.border}` }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 30, color: T.sub }}>لا توجد معاملات بعد</div>
                ) : (
                    filtered.map((tx, i) => (
                    <GlassCard key={i} className="fadeUp-wallet" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 13, background: `${tx.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${tx.color}25`, flexShrink: 0 }}>{tx.icon}</div>
                            <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{tx.name}</div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                                <Badge label={tx.type === "شحن" ? "⬆️ شحن" : "⬇️ مدفوع"} color={tx.type === "شحن" ? T.green : T.red}/>
                                {tx.status && <Badge label={tx.status === "approved" ? "مكتمل" : tx.status === "rejected" ? "مرفوض" : "قيد المراجعة"} color={tx.status === "approved" ? T.green : tx.status === "rejected" ? T.red : T.yellow}/>}
                                <span style={{ fontSize: 9, color: T.sub }}>{tx.date}</span>
                            </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: tx.type === "شحن" ? T.green : T.text }}>{tx.type === "شحن" ? "+" : "-"}£{(tx.amount || 0).toLocaleString()}</div>
                        </div>
                    </GlassCard>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
