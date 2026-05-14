import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ═══════════════════════════════════════════════
   EXACT COLORS FROM APP SCREENSHOT
═══════════════════════════════════════════════ */
const C = {
  bg:        "#0d0d12",
  card:      "#13141a",
  cardHov:   "#16181f",
  border:    "#1e2028",
  borderAlt: "#191b22",
  text:      "#e8eaf0",
  sub:       "#6b7280",
  sub2:      "#4b5563",
  blue:      "#3b8fd4",
  teal:      "#2ec4b6",
  green:     "#22c55e",
  greenDark: "#0d2a18",
  greenBdr:  "#1a4a28",
  yellow:    "#d4a017",
  yellowBg:  "rgba(212,160,23,.07)",
  yellowBdr: "rgba(212,160,23,.3)",
  red:       "#ef4444",
  redBg:     "rgba(239,68,68,.07)",
  orange:    "#f97316",
  purple:    "#8b5cf6",
  input:     "#0c0d12",
  font:      "'Cairo','Tajawal',sans-serif",
};

const USD_RATE = 54.4;

/* ═══════════════════════════════════════════════
   SHARED UI PRIMITIVES
═══════════════════════════════════════════════ */
function Header({ title, subtitle, icon, onBack }: any) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
        <span style={{ fontSize:13 }}>🕐</span>
        <span style={{ fontSize:11, color:C.sub }}>سجل الطلبات</span>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:900, color:C.text, lineHeight:1.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, fontWeight:700, color:C.sub }}>{subtitle}</div>}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
        <div onClick={onBack} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <span style={{ color:C.sub, fontSize:15 }}>←</span>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ badge, badgeColor, speed, priceLabel, price, priceUnit }: any) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ marginBottom:8 }}>
            <span style={{ background:C.greenDark, color:C.green, fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.greenBdr}` }}>{badge}</span>
          </div>
          <div style={{ fontSize:12, color:C.sub, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ color:C.yellow }}>⚡</span><span>{speed}</span>
          </div>
        </div>
        <div style={{ textAlign:"left" }}>
          <div style={{ fontSize:11, color:C.sub2, marginBottom:4 }}>{priceLabel}</div>
          <div style={{ fontSize:22, fontWeight:900, color:C.yellow, direction:"ltr" }}>
            {price} <span style={{ fontSize:12, color:C.sub }}>{priceUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DescCard({ text }: any) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.borderAlt}`, borderRadius:14, padding:"12px 16px" }}>
      <p style={{ fontSize:13, color:C.sub, lineHeight:1.85, textAlign:"right" }}>{text}</p>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, dir="ltr", type="text", hint, prefix, suffix }: any) {
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
        <label style={{ fontSize:12, color:C.sub, fontWeight:700 }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:C.yellow }}>{hint}</span>}
      </div>
      <div style={{ position:"relative" }}>
        <input className="inp-fin" value={value} onChange={onChange} placeholder={placeholder} dir={dir} type={type}
          style={{ width:"100%", background:C.input, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, fontFamily:C.font, padding:`13px ${suffix?48:16}px 13px ${prefix?50:16}px`, outline: "none" }}/>
        {prefix && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.sub2, fontWeight:700, pointerEvents:"none" }}>{prefix}</span>}
        {suffix && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.sub2, fontWeight:700, pointerEvents:"none" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function EgpDisplay({ egpAmt }: any) {
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
        <label style={{ fontSize:12, color:C.sub, fontWeight:700 }}>المبلغ بالجنيه المصري</label>
        <span style={{ fontSize:10, color:C.sub2 }}>يحسب تلقائياً</span>
      </div>
      <div style={{ background: egpAmt>0 ? C.yellowBg : C.input, border:`1px solid ${egpAmt>0 ? C.yellowBdr : C.border}`, borderRadius:12, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", minHeight:50, transition:"all .3s" }}>
        <span style={{ fontSize:12, color:C.sub2 }}>ج.م</span>
        <span style={{ fontSize: egpAmt>0?21:14, fontWeight:900, color: egpAmt>0?C.yellow:C.sub2, direction:"ltr", transition:"all .3s" }}>
          {egpAmt>0 ? `£ ${egpAmt.toLocaleString()}` : "يظهر تلقائياً..."}
        </span>
      </div>
    </div>
  );
}

function BalanceStatus({ canBuy, balance, required }: any) {
  if (!required) return null;
  return (
    <div style={{ background: canBuy?"rgba(34,197,94,.05)":"rgba(239,68,68,.05)", border:`1px solid ${canBuy?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`, borderRadius:10, padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:12, color: canBuy?C.green:C.red, fontWeight:700 }}>{canBuy?"✅ رصيد كافٍ":"❌ رصيد غير كافٍ"}</span>
      <span style={{ fontSize:12, color:C.sub2 }}>رصيدك: <span style={{ fontWeight:800, color: canBuy?C.green:C.red }}>£{balance.toLocaleString()}</span></span>
    </div>
  );
}

function BuyButton({ label, onClick, loading, active }: any) {
  return (
    <button className="btn-fin" onClick={onClick} disabled={loading}
      style={{ width:"100%", padding:"17px", borderRadius:14, fontSize:17, fontWeight:900, marginTop:4, background: active?`linear-gradient(135deg,${C.yellow},#b8890f)`:C.card, color: active?"#1a0f00":C.sub2, border: active?"none":`1px solid ${C.border}`, boxShadow: active?`0 4px 24px rgba(212,160,23,.28)`:"none", cursor: active ? "pointer" : "default" }}>
      {loading
        ? <span style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
            <span style={{ width:17, height:17, border:"2px solid rgba(0,0,0,.2)", borderTopColor:"#1a0f00", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }}/>
            جاري التنفيذ...
          </span>
        : label}
    </button>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(null as number | null);
  const faqs = [
    { q:"متى يبدأ التنفيذ؟",       a:"يبدأ التنفيذ فوراً بعد تأكيد الطلب وخصم الرصيد." },
    { q:"هل الخدمة مضمونة؟",       a:"نعم، مضمونة 100% أو يُرجع الرصيد كاملاً." },
    { q:"كيف أتابع طلبي؟",         a:'من "سجل الطلبات" يمكنك متابعة حالة طلبك لحظة بلحظة.' },
    { q:"هل هناك حد أدنى؟",        a:"الحد الأدنى $1 دولار أو ما يعادله." },
  ];
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
      {faqs.map((f,i) => (
        <div key={i}>
          <div onClick={()=>setOpen(open===i?null:i)} className="card-hover-fin"
            style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", cursor:"pointer", background:"transparent", borderBottom: i<faqs.length-1||open===i?`1px solid ${C.borderAlt}`:"none" }}>
            <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{f.q}</span>
            <span style={{ color:C.sub2, fontSize:10, display:"inline-block", transform:open===i?"rotate(180deg)":"none", transition:"transform .2s" }}>▼</span>
          </div>
          {open===i && (
            <div className="fadeUp" style={{ padding:"11px 16px 14px", background:C.bg, borderBottom:i<faqs.length-1?`1px solid ${C.borderAlt}`:"none" }}>
              <p style={{ fontSize:12, color:C.sub, lineHeight:1.9 }}>{f.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SupportSection() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:15 }}>🛡️</span>
        <span style={{ fontSize:13, color:C.sub, fontWeight:700 }}>الدعم والمساعدة</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[["🎟️","تذكرة دعم"],["✉️","البريد"],["💬","دردشة حية"]].map(([icon,label],i)=>(
          <div key={i} className="card-hover-fin" style={{ background:C.card, border:`1px solid ${C.borderAlt}`, borderRadius:14, padding:"15px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:7, cursor:"pointer" }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            <span style={{ fontSize:11, color:C.sub, fontWeight:700 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ rows, onReset }: any) {
  return (
    <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", padding:24, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18 }}>
      <div style={{ fontSize:64, animation:"pop .4s ease both" }}>✅</div>
      <div style={{ fontSize:20, fontWeight:900, color:C.text }}>تم الطلب بنجاح!</div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, width:"100%" }}>
        {rows.map(([l,v,c]: any,i: number,a: any[])=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<a.length-1?`1px solid ${C.borderAlt}`:"none" }}>
            <span style={{ color:C.sub, fontSize:13 }}>{l}</span>
            <span style={{ color:c, fontWeight:800, fontSize:13, direction:"ltr" }}>{v}</span>
          </div>
        ))}
      </div>
      <button className="btn-fin" onClick={onReset} style={{ width:"100%", padding:"13px", borderRadius:12, fontSize:14, fontWeight:800, background:C.card, border:`1px solid ${C.border}`, color:C.sub, cursor: "pointer" }}>+ طلب جديد</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGES
═══════════════════════════════════════════════ */

export function FinancialServicePage({ serviceId, balance, onConfirmOrder, onBack }: any) {
  const [vals, setVals] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [platform, setPlatform] = useState("PayPal");
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState("فودافون كاش");

  const usd = parseFloat(vals.usd) || 0;
  const egpRaw = parseFloat(vals.egpRaw) || 0;

  let egp = 0;
  if (serviceId === "cash") {
    egp = egpRaw;
  } else if (serviceId === "usd") {
    egp = +(usd * USD_RATE).toFixed(2);
  } else {
    egp = +(usd * USD_RATE * 0.7).toFixed(2);
  }

  const egpN = egpRaw;
  const canBuy = (balance >= egp && egp > 0) || (serviceId === "cash" && balance >= egpN && egpN >= 50);

  const handleSubmit = async () => {
    setErr("");
    
    // Validation
    if (serviceId === "paypal") {
      if (!vals.email?.trim()) return setErr("يرجى إدخال البريد الإلكتروني");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "binance") {
      if (!vals.wallet?.trim()) return setErr("يرجى إدخال عنوان المحفظة");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "usd") {
      if (!vals.id?.trim()) return setErr("يرجى إدخال الـ ID");
      if (!vals.email?.trim()) return setErr("يرجى إدخال البريد الإلكتروني");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "pyypl") {
      if (!vals.phone?.trim()) return setErr("يرجى إدخال رقم الهاتف");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "redotpay") {
      if (!vals.cardNum?.trim()) return setErr("يرجى إدخال رقم البطاقة");
      if (!vals.name?.trim()) return setErr("يرجى إدخال الاسم");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "volet") {
      if (!vals.email?.trim()) return setErr("يرجى إدخال البريد الإلكتروني");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "perfectmoney") {
      if (!vals.pmId?.trim()) return setErr("يرجى إدخال حساب Perfect Money");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "payoneer") {
      if (!vals.email?.trim()) return setErr("يرجى إدخال البريد الإلكتروني");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "wise") {
      if (!vals.email?.trim()) return setErr("يرجى إدخال البريد الإلكتروني");
      if (usd <= 0) return setErr("يرجى إدخال مبلغ صحيح");
    } else if (serviceId === "cash") {
      if (!vals.phone?.trim()) return setErr("يرجى إدخال رقم الهاتف");
      if (!vals.name?.trim()) return setErr("يرجى إدخال الاسم الكامل");
      if (egpN < 50) return setErr("الحد الأدنى للسحب £50");
    }

    if (balance < egp) return setErr("رصيد غير كافٍ");

    setLoading(true);
    try {
      const details = { ...vals };
      if (serviceId === "binance") details.network = network;
      if (serviceId === "paypal") details.platform = platform;
      if (serviceId === "wise") details.currency = currency;
      if (serviceId === "cash") details.method = method;

      await onConfirmOrder({
        serviceId,
        total: egp,
        quantity: serviceId === "cash" ? egp : usd,
        details
      });
      setDone(true);
    } catch (e: any) {
      setErr(e.message || "حدث خطأ أثناء الطلب");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setDone(false);
    setVals({});
    setErr("");
  };

  if (done) {
    const rows = [];
    if (serviceId === "paypal") {
      rows.push(["المنصة", platform, C.text]);
      rows.push(["البريد", vals.email, C.blue]);
      rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "binance") {
      rows.push(["الشبكة", network, C.text]);
      rows.push(["المحفظة", vals.wallet?.slice(0, 12) + "...", C.teal]);
      rows.push(["USDT", `$${usd}`, C.yellow]);
    } else if (serviceId === "usd") {
      rows.push(["الـ ID", vals.id, C.text]);
      rows.push(["البريد", vals.email, C.blue]);
      rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "pyypl") {
       rows.push(["رقم Pyypl", vals.phone, C.text]);
       rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "redotpay") {
       rows.push(["البطاقة", "****" + vals.cardNum?.slice(-4), C.text]);
       rows.push(["الاسم", vals.name, C.text]);
       rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "volet") {
       rows.push(["البريد", vals.email, C.blue]);
       rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "perfectmoney") {
       rows.push(["حساب PM", vals.pmId, C.text]);
       rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "payoneer") {
       rows.push(["بريد Payoneer", vals.email, C.blue]);
       rows.push(["المبلغ $", `$${usd}`, C.yellow]);
    } else if (serviceId === "wise") {
       rows.push(["بريد Wise", vals.email, C.blue]);
       rows.push(["العملة", currency, C.teal]);
       rows.push(["المبلغ", `$${usd}`, C.yellow]);
    } else if (serviceId === "cash") {
       rows.push(["طريقة السحب", method, C.text]);
       rows.push(["رقم الهاتف", vals.phone, C.text]);
       rows.push(["الاسم", vals.name, C.text]);
       rows.push(["المسحوب", `£${egpN}`, C.green]);
    }
    
    rows.push(["المخصوم", `£${egp}`, C.red]);
    return <SuccessScreen rows={rows} onReset={onReset} />;
  }

  const renderContent = () => {
    switch (serviceId) {
      case "paypal":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="شحن رصيد PayPal أو Payeer أو Skrill بخصم 30% على سعر الصرف. التحويل فوري لحسابك." />
            <div>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 700, display: "block", marginBottom: 8 }}>اختر المنصة</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["PayPal", "Payeer", "Skrill"].map(p => (
                  <button key={p} onClick={() => setPlatform(p)} className="btn-fin"
                    style={{ flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 800, background: platform === p ? "rgba(59,143,212,.15)" : C.card, border: `1px solid ${platform === p ? C.blue : C.border}`, color: platform === p ? C.blue : C.sub, cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <FieldInput label="البريد الإلكتروني" value={vals.email || ""} onChange={(e: any) => setVals({ ...vals, email: e.target.value })} placeholder={`بريد ${platform}`} dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 10" prefix="$" />
          </>
        );
      case "binance":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1 USDT" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="تحويل USDT لمحفظة Binance أو أي محفظة كريبتو بخصم 30%. يدعم TRC20 و BEP20 و ERC20." />
            <div>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 700, display: "block", marginBottom: 8 }}>الشبكة</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["TRC20", "BEP20", "ERC20"].map(n => (
                  <button key={n} onClick={() => setNetwork(n)} className="btn-fin"
                    style={{ flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 800, background: network === n ? "rgba(212,160,23,.12)" : C.card, border: `1px solid ${network === n ? C.yellow : C.border}`, color: network === n ? C.yellow : C.sub, cursor: "pointer" }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <FieldInput label="عنوان المحفظة" value={vals.wallet || ""} onChange={(e: any) => setVals({ ...vals, wallet: e.target.value })} placeholder={`عنوان ${network}`} dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USDT)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 50" prefix="$" />
          </>
        );
      case "usd":
        return (
          <>
            <PriceCard badge="الأفضل حالياً" speed="تنفيذ فوري" priceLabel="السعر لكل 1 دولار" price={`£${USD_RATE}`} priceUnit="ج.م" />
            <DescCard text="حول أي مبلغ بالدولار لأي محفظة إلكترونية أو حساب بنكي دولي. السعر شامل الرسوم." />
            <FieldInput label="الـ ID" value={vals.id || ""} onChange={(e: any) => setVals({ ...vals, id: e.target.value })} placeholder="أدخل ID الحساب" dir="ltr" />
            <FieldInput label="البريد الإلكتروني" value={vals.email || ""} onChange={(e: any) => setVals({ ...vals, email: e.target.value })} placeholder="example@email.com" dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 10" prefix="$" />
          </>
        );
      case "pyypl":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="شحن محفظة Pyypl بخصم 30%. أدخل رقم هاتفك المسجل في التطبيق والمبلغ بالدولار." />
            <FieldInput label="رقم الهاتف المسجل في Pyypl" value={vals.phone || ""} onChange={(e: any) => setVals({ ...vals, phone: e.target.value })} placeholder="+971xxxxxxxx" dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 20" prefix="$" />
          </>
        );
      case "redotpay":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="شحن بطاقة RedotPay Visa الخاصة بك بخصم 30%. أدخل رقم البطاقة والاسم والمبلغ." />
            <FieldInput label="رقم بطاقة RedotPay" value={vals.cardNum || ""} onChange={(e: any) => setVals({ ...vals, cardNum: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="XXXX XXXX XXXX XXXX" dir="ltr" />
            <FieldInput label="الاسم على البطاقة" value={vals.name || ""} onChange={(e: any) => setVals({ ...vals, name: e.target.value })} placeholder="Full Name" dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 30" prefix="$" />
          </>
        );
      case "volet":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="شحن محفظة Volet (المعروفة سابقاً بـ Advcash) بخصم 30%. أدخل البريد المسجل في المنصة." />
            <FieldInput label="البريد الإلكتروني (Volet)" value={vals.email || ""} onChange={(e: any) => setVals({ ...vals, email: e.target.value })} placeholder="email@volet.com" dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 25" prefix="$" />
          </>
        );
      case "perfectmoney":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="تحويل رصيد Perfect Money بخصم 30%. أدخل رقم حساب PM والمبلغ المطلوب بالدولار." />
            <FieldInput label="رقم حساب Perfect Money" value={vals.pmId || ""} onChange={(e: any) => setVals({ ...vals, pmId: e.target.value.toUpperCase() })} placeholder="U1234567 أو E1234567" dir="ltr" hint="مثال: U1234567" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 50" prefix="$" />
          </>
        );
      case "payoneer":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="شحن حساب Payoneer بخصم 30%. أدخل البريد الإلكتروني المسجل في Payoneer والمبلغ المطلوب." />
            <FieldInput label="البريد الإلكتروني (Payoneer)" value={vals.email || ""} onChange={(e: any) => setVals({ ...vals, email: e.target.value })} placeholder="email@payoneer.com" dir="ltr" />
            <FieldInput label="المبلغ بالدولار (USD)" value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 100" prefix="$" />
          </>
        );
      case "wise":
        return (
          <>
            <PriceCard badge="خصم 30%" speed="تنفيذ فوري" priceLabel="السعر لكل $1" price={`£${(USD_RATE * 0.7).toFixed(1)}`} priceUnit="ج.م" />
            <DescCard text="تحويل أموال عبر Wise بخصم 30%. يدعم USD و EUR و GBP. أدخل البريد المسجل في Wise." />
            <div>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 700, display: "block", marginBottom: 8 }}>العملة</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["USD", "EUR", "GBP"].map(c => (
                  <button key={c} onClick={() => setCurrency(c)} className="btn-fin"
                    style={{ flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 800, background: currency === c ? "rgba(46,196,182,.12)" : C.card, border: `1px solid ${currency === c ? C.teal : C.border}`, color: currency === c ? C.teal : C.sub, cursor: "pointer" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <FieldInput label="البريد الإلكتروني (Wise)" value={vals.email || ""} onChange={(e: any) => setVals({ ...vals, email: e.target.value })} placeholder="email@wise.com" dir="ltr" />
            <FieldInput label={`المبلغ (${currency})`} value={vals.usd || ""} onChange={(e: any) => setVals({ ...vals, usd: e.target.value.replace(/[^0-9.]/g, "") })} placeholder="مثال: 50" prefix="$" />
          </>
        );
      case "cash":
        return (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "13px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ background: C.greenDark, color: C.green, fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.greenBdr}` }}>فوري</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub }}>رصيدك المتاح</div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: C.sub2, marginBottom: 4 }}>الحد الأدنى</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>£50</div>
                </div>
              </div>
              <div style={{ marginTop: 12, background: C.bg, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                <span style={{ fontSize: 11, color: C.sub }}>رصيدك الحالي: </span>
                <span style={{ fontSize: 16, fontWeight: 900, color: C.blue }}>£{balance.toLocaleString()}</span>
              </div>
            </div>
            <DescCard text="سحب رصيد محفظتك كاش فوري عبر فودافون كاش أو اتصالات كاش أو أورانج كاش. الحد الأدنى £50." />
            <div>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 700, display: "block", marginBottom: 8 }}>طريقة الاستلام</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["فودافون كاش", "اتصالات كاش", "أورانج كاش"].map(m => (
                  <button key={m} onClick={() => setMethod(m)} className="btn-fin"
                    style={{ flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 10, fontWeight: 800, background: method === m ? "rgba(34,197,94,.12)" : C.card, border: `1px solid ${method === m ? C.green : C.border}`, color: method === m ? C.green : C.sub, cursor: "pointer" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <FieldInput label="رقم الهاتف" value={vals.phone || ""} onChange={(e: any) => setVals({ ...vals, phone: e.target.value.replace(/\D/g, "") })} placeholder="01XXXXXXXXX" dir="ltr" />
            <FieldInput label="الاسم الكامل (صاحب الخط)" value={vals.name || ""} onChange={(e: any) => setVals({ ...vals, name: e.target.value })} placeholder="محمد أحمد" dir="rtl" />
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <label style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>مبلغ السحب (جنيه)</label>
                <span style={{ fontSize: 10, color: C.sub2 }}>الحد الأدنى £50</span>
              </div>
              <input className="inp-fin" value={vals.egpRaw || ""} onChange={(e: any) => setVals({ ...vals, egpRaw: e.target.value.replace(/\D/g, "") })} placeholder="مثال: 200" dir="ltr"
                style={{ width: "100%", background: C.input, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: C.font, padding: "13px 16px", outline: "none" }} />
            </div>
          </>
        );
      default: return null;
    }
  };

  const getHeaderIcon = () => {
    switch (serviceId) {
       case "paypal": return "🅿️";
       case "binance": return "₿";
       case "usd": return "💸";
       case "pyypl": return "🌐";
       case "redotpay": return "💳";
       case "volet": return "💳";
       case "perfectmoney": return "💰";
       case "payoneer": return "🏦";
       case "wise": return "🏦";
       case "cash": return "🏧";
       default: return "💰";
    }
  };

  const getHeaderTitle = () => {
    switch (serviceId) {
      case "paypal": return "PayPal & Payeer & Skrill";
      case "binance": return "Binance & Crypto USDT";
      case "usd": return "تحويل رصيد مخصص (USD)";
      case "pyypl": return "Pyypl Recharge";
      case "redotpay": return "RedotPay Visa";
      case "volet": return "Volet (Advcash)";
      case "perfectmoney": return "Perfect Money";
      case "payoneer": return "Payoneer Funds";
      case "wise": return "Wise Transfer";
      case "cash": return "سحب الرصيد لكاش";
      default: return "الخدمات المالية";
    }
  };

  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", fontFamily: C.font, paddingBottom: 40 }}>
      <Header title={getHeaderTitle()} icon={getHeaderIcon()} onBack={onBack} />
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {renderContent()}
        <EgpDisplay egpAmt={egp} />
        <BalanceStatus canBuy={canBuy} balance={balance} required={(serviceId === "cash" ? egpN : usd) > 0} />
        {err && <div style={{ fontSize: 12, color: C.red, background: C.redBg, border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "9px 14px", textAlign: "center" }}>⚠️ {err}</div>}
        <BuyButton label={serviceId === "cash" ? "💸 سحب فوري" : "⚡ شراء مباشر"} onClick={handleSubmit} loading={loading} active={canBuy} />
        <SupportSection />
        <div style={{ marginTop: 4 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span>❓</span><span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>الأسئلة الشائعة</span></div><FaqSection /></div>
      </div>
    </div>
  );
}

export function FinancialGrid({ balance, onSelectService }: any) {
  const services = [
    { id: "paypal", label: "PayPal & Payeer & Skrill", icon: "🅿️", color: "#3b8fd4", discount: "خصم %30" },
    { id: "binance", label: "Binance & Crypto USDT", icon: "₿", color: "#d4a017", discount: "خصم %30" },
    { id: "usd", label: "تحويل رصيد مخصص (USD)", icon: "💸", color: "#22c55e", discount: "سعر صرف متفوق" },
    { id: "pyypl", label: "Pyypl Recharge", icon: "🌐", color: "#2ec4b6", discount: "خصم %30" },
    { id: "redotpay", label: "RedotPay Visa", icon: "💳", color: "#ef4444", discount: "خصم %30" },
    { id: "volet", label: "Volet (Advcash)", icon: "💳", color: "#d4a017", discount: "خصم %30" },
    { id: "perfectmoney", label: "Perfect Money", icon: "💰", color: "#ef4444", discount: "خصم %30" },
    { id: "payoneer", label: "Payoneer Funds", icon: "🏦", color: "#d4a017", discount: "خصم %30" },
    { id: "wise", label: "Wise Transfer", icon: "🏦", color: "#2ec4b6", discount: "خصم %30" },
    { id: "cash", label: "سحب الرصيد لكاش", icon: "🏧", color: "#22c55e", discount: "فوري" },
  ];

  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", fontFamily: C.font, paddingBottom: 40 }}>
      <div style={{ padding: "22px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 4, height: 18, background: C.yellow, borderRadius: 4 }} />
          <span style={{ fontSize: 16, fontWeight: 900, color: C.text }}>الخدمات المالية والبنوك</span>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: C.sub }}>رصيدك</span>
          <span style={{ fontSize: 17, fontWeight: 900, color: C.blue }}>£{balance.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {services.map(s => (
          <div key={s.id} className="card-hover-fin shimmer" onClick={() => onSelectService(s.id)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 10px 14px", display: "flex", flexDirection:"column", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${s.color}18`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.text, lineHeight: 1.35 }}>{s.label}</div>
            <div style={{ fontSize: 10, fontWeight: 900, color: s.color }}>{s.discount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
