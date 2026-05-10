/* ═══════════════════════════════════════════════════════════════════
   SOCIAL MEDIA SERVICES — 1000+ خدمة لكل منصة
═══════════════════════════════════════════════════════════════════ */

export const SOCIAL_PLATFORMS = [
  { name: "Instagram", icon: "📷", color: "#E1306C", bg: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)" },
  { name: "TikTok", icon: "🎵", color: "#00f2ea", bg: "linear-gradient(135deg,#010101,#00f2ea,#ff0050)" },
  { name: "Twitter X", icon: "𝕏", color: "#1DA1F2", bg: "linear-gradient(135deg,#000,#1DA1F2)" },
  { name: "YouTube", icon: "▶️", color: "#FF0000", bg: "linear-gradient(135deg,#FF0000,#cc0000)" },
  { name: "Facebook", icon: "𝔽", color: "#1877F2", bg: "linear-gradient(135deg,#1877F2,#0C54B0)" },
  { name: "Telegram", icon: "✈️", color: "#0088cc", bg: "linear-gradient(135deg,#0088cc,#004d80)" },
  { name: "Snapchat", icon: "👻", color: "#FFFC00", bg: "linear-gradient(135deg,#FFFC00,#ffd700)" },
  { name: "LinkedIn", icon: "💼", color: "#0A66C2", bg: "linear-gradient(135deg,#0A66C2,#004182)" },
  { name: "Pinterest", icon: "📌", color: "#E60023", bg: "linear-gradient(135deg,#E60023,#ad081b)" },
  { name: "Twitch", icon: "🎮", color: "#9146FF", bg: "linear-gradient(135deg,#9146FF,#6441a5)" },
  { name: "Discord", icon: "🎧", color: "#5865F2", bg: "linear-gradient(135deg,#5865F2,#3a44c1)" },
  { name: "Threads", icon: "🧵", color: "#000000", bg: "linear-gradient(135deg,#101010,#444)" },
];

export const DEFAULT_FAQS = [
  { q: "متى يبدأ التنفيذ؟", a: "يبدأ التنفيذ عادة خلال 15-30 دقيقة من طلب الخدمة." },
  { q: "هل الخدمة مضمونة؟", a: "نعم، جميع خدماتنا مضمونة بضمان القائد برو الذهبي." },
  { q: "كيف يمكنني تتبع طلبي؟", a: "يمكنك تتبع حالة الطلب من صفحة السجل في التطبيق." },
];

/* ═══════════════════════════════════════════════════════════════════
   SOCIAL MEDIA SERVICES — 1000+ خدمة لجميع المنصات
═══════════════════════════════════════════════════════════════════ */

// مساعد لتوليد خدمات تلقائية لزيادة العدد لتبدو "بالآف"
const expandItems = (items: any[]) => {
  const expanded: any[] = [];
  items.forEach(item => {
    expanded.push(item);
    // إضافة تنويعات لكل خدمة (سرعات مختلفة، ضمانات مختلفة)
    if (!item.noExpand) {
      expanded.push({ ...item, name: `${item.name} [سرعة فائقة]`, price: Math.round(item.price * 1.2), badge: "سريع جداً" });
      expanded.push({ ...item, name: `${item.name} [جودة VIP]`, price: Math.round(item.price * 1.5), badge: "VIP" });
      expanded.push({ ...item, name: `${item.name} [ضمان مدي الحياة]`, price: Math.round(item.price * 2), badge: "أمان كامل" });
    }
  });
  return expanded;
};

const PLATFORM_SERVICES_DATA: Record<string, any[]> = {
  Instagram: [
    { cat: "متابعين انستجرام", emoji: "👥", items: expandItems([
      { name: "متابعين جودة عالية [تعويض 30 يوم]", price: 12, badge: "الأكثر مبيعاً", speed: "فوري" },
      { name: "متابعين حقيقيين متفاعلين [إعلانات]", price: 40, badge: "حقيقي", speed: "1-6 ساعات" },
      { name: "متابعين عرب حقيقيين مكس", price: 28, badge: "عربي", speed: "فوري" },
      { name: "متابعين خليجيين (سعودية/كويت/إمارات)", price: 65, badge: "خليجي", speed: "30 دقيقة" },
      { name: "متابعين مصريين حقيقيين [نشطين]", price: 50, badge: "مصر 🇪🇬", speed: "1-3 ساعات" },
      { name: "متابعين متفاعلين [بدون نقص]", price: 35, badge: "بدون نقص", speed: "فوري" },
      { name: "متابعين لبروفايلات الأعمال [أثورتي]", price: 90, badge: "Business", speed: "يدوي" },
    ])},
    { cat: "إعجابات وتفاعل", emoji: "❤️", items: expandItems([
      { name: "إعجابات حقيقية [ضمان 30 يوم]", price: 4, badge: "HQ", speed: "فوري" },
      { name: "إعجابات عربية من حسابات قديمة", price: 15, badge: "عربي", speed: "10-30 دقيقة" },
      { name: "إعجابات بروفايلات موثقة [تفاعلية]", price: 120, badge: "موثق", speed: "فوري" },
      { name: "إعجابات تلقائية (للمنشورات القادمة)", price: 25, badge: "اوتو", speed: "آلي" },
      { name: "إعجابات IGTV / ريلز سريعة", price: 3, badge: "سريع", speed: "فوري" },
    ])},
    { cat: "مشاهدات", emoji: "👁️", items: expandItems([
      { name: "مشاهدات ريلز [اكسبلور]", price: 2, badge: "Explore", speed: "فوري" },
      { name: "مشاهدات فيديو حقيقية", price: 1, badge: "رخيص", speed: "فوري" },
      { name: "مشاهدات ستوري [تفاعل كامل]", price: 8, badge: "ستوري", speed: "15 دقيقة" },
      { name: "مشاهدات بث مباشر (15-60 دقيقة)", price: 75, badge: "LIVE", speed: "فوري" },
    ])},
    { cat: "تعليقات", emoji: "💬", items: expandItems([
      { name: "تعليقات مخصصة (تكتبها أنت)", price: 55, badge: "مخصص", speed: "يدوي", type: "custom_comments" },
      { name: "تعليقات إيجابية [عشوائية]", price: 20, badge: "إيجابي", speed: "1-2 ساعة" },
      { name: "تعليقات عربية إطراء ومدح", price: 35, badge: "عربي", speed: "فوري" },
      { name: "تعليقات ايموجي فقط [سريع]", price: 10, badge: "إيموجي", speed: "فوري" },
    ])},
  ],
  Facebook: [
    { cat: "متابعين وإعجابات الصفحة", emoji: "👤", items: expandItems([
      { name: "إعجابات صفحة + متابعة [جودة عالية]", price: 35, badge: "HQ", speed: "فوري" },
      { name: "متابعين بروفايل فيسبوك [ضمان]", price: 28, badge: "بروفايل", speed: "فوري" },
      { name: "إعجابات صفحة عربية حقيقية", price: 75, badge: "عربي", speed: "1-6 ساعات" },
      { name: "عضويات جروبات فيسبوك العامة", price: 45, badge: "جروبات", speed: "30 دقيقة" },
    ])},
    { cat: "تفاعلات المنشورات", emoji: "👍", items: expandItems([
      { name: "تفاعلات مكس (لايك، قلب، هاها)", price: 12, badge: "مكس", speed: "فوري" },
      { name: "تفاعل [أحببته ❤️] - جودة VIP", price: 20, badge: "Love", speed: "فوري" },
      { name: "تفاعل [أدبره 🤗] - جودة VIP", price: 20, badge: "Care", speed: "فوري" },
      { name: "تفاعل [هاهاها 😂] - جودة VIP", price: 20, badge: "Haha", speed: "فوري" },
      { name: "تفاعل [واو 😮] - جودة VIP", price: 20, badge: "Wow", speed: "فوري" },
      { name: "تفاعل [أحزنني 😢] - جودة VIP", price: 20, badge: "Sad", speed: "فوري" },
      { name: "تفاعل [أغضبني 😡] - جودة VIP", price: 25, badge: "Angry", speed: "فوري" },
    ])},
    { cat: "مشاهدات فيسبوك", emoji: "👁️", items: expandItems([
      { name: "مشاهدات فيديو فيسبوك [جودة]", price: 5, badge: "فيديو", speed: "فوري" },
      { name: "مشاهدات بث مباشر (30-180 دقيقة)", price: 90, badge: "LIVE", speed: "فوري" },
      { name: "مشاهدات يوتيوب شورتس/ريلز فيس", price: 8, badge: "ريلز", speed: "فوري" },
    ])},
    { cat: "تعليقات فيسبوك", emoji: "💬", items: expandItems([
      { name: "تعليقات مخصصة (تكتبها أنت)", price: 65, badge: "مخصص", speed: "يدوي", type: "custom_comments" },
      { name: "تعليقات إيجابية عربية", price: 40, badge: "عربي", speed: "1-3 ساعات" },
    ])},
  ],
  TikTok: [
    { cat: "متابعين تيك توك", emoji: "👥", items: expandItems([
      { name: "متابعين تيك توك [سرعة جنونية]", price: 15, badge: "السويت", speed: "فوري" },
      { name: "متابعين حقيقيين [ضمان مدي الحياة]", price: 45, badge: "أصلي", speed: "1-6 ساعات" },
      { name: "متابعين تيك توك [حسابات موثقة]", price: 250, badge: "VIP", speed: "يدوي" },
    ])},
    { cat: "مشاهدات تيك توك", emoji: "👁️", items: expandItems([
      { name: "مشاهدات فيديو تيك توك [تريند]", price: 0.5, badge: "تريند", speed: "فوري" },
      { name: "مشاهدات بث مباشر [دعم ثابت]", price: 55, badge: "لايف", speed: "فوري" },
      { name: "مشاركات فيديو (Shares) لزيادة الانتشار", price: 3, badge: "مشاركة", speed: "فوري" },
    ])},
    { cat: "إعجابات وتفاعل", emoji: "❤️", items: expandItems([
      { name: "إعجابات تيك توك [جودة HQ]", price: 8, badge: "HQ", speed: "فوري" },
      { name: "إعجابات تيك توك [عربية]", price: 25, badge: "عربي", speed: "فوري" },
      { name: "حفظ الفيديو (Favorites)", price: 2, badge: "تفاعل", speed: "فوري" },
    ])},
  ],
  YouTube: [
    { cat: "مشتركين يوتيوب", emoji: "👥", items: expandItems([
      { name: "مشتركين يوتيوب [ضمان عدم نقص]", price: 110, badge: "أمان", speed: "بطيء/آمن" },
      { name: "مشتركين يوتيوب حقيقيين [تفاعل]", price: 280, badge: "تفاعلي", speed: "يدوي" },
    ])},
    { cat: "وقت المشاهدة (Watch Time)", emoji: "⏳", items: expandItems([
      { name: "4000 ساعة مشاهدة [تفعيل الربح]", price: 850, badge: "تفعيل", speed: "7-15 يوم" },
      { name: "1000 ساعة مشاهدة سريعة", price: 220, badge: "سريع", speed: "2-5 أيام" },
    ])},
    { cat: "مشاهدات يوتيوب", emoji: "👁️", items: expandItems([
      { name: "مشاهدات يوتيوب حقيقية [أدز]", price: 55, badge: "إعلانات", speed: "1-3 أيام" },
      { name: "مشاهدات يوتيوب شورتس [سريع]", price: 15, badge: "Shorts", speed: "فوري" },
    ])},
  ],
  Telegram: [
    { cat: "أعضاء قنوات ومجموعات", emoji: "👥", items: expandItems([
      { name: "أعضاء تيليجرام [رخيص جداً]", price: 8, badge: "توفير", speed: "فوري" },
      { name: "أعضاء تيليجرام عرب [ضمن]", price: 35, badge: "عربي", speed: "فوري" },
      { name: "أعضاء تيليجرام مستهدفين [بلد]", price: 95, badge: "مستهدف", speed: "يدوي" },
    ])},
    { cat: "مشاهدات وتفاعلات", emoji: "👁️", items: expandItems([
      { name: "مشاهدات آخر 10 بوستات تلقائية", price: 12, badge: "تلقائي", speed: "فوري" },
      { name: "تفاعلات بوستات (Reactions)", price: 5, badge: "تفاعل", speed: "فوري" },
      { name: "تصويت في استطلاعات التيليجرام", price: 15, badge: "Poll", speed: "فوري" },
    ])},
  ],
};

const GENERIC_CATEGORIES = [
  { 
    cat: "متابعين", 
    emoji: "👥", 
    items: expandItems([
      { name: "جودة عالية [ضمان 30 يوم]", price: 15, badge: "الأكثر طلباً", speed: "10-30 دقيقة" },
      { name: "حقيقيين متفاعلين [إعلانات]", price: 45, badge: "ممتاز", speed: "1-6 ساعات" },
      { name: "عرب حقيقيين مكس (بدون ضمان)", price: 25, badge: "عربي", speed: "30-60 دقيقة" },
    ]) 
  },
  { 
    cat: "إعجابات وتفاعل", 
    emoji: "❤️", 
    items: expandItems([
      { name: "إعجابات حقيقية [سرعة فائقة]", price: 5, badge: "لحظي", speed: "فوري" },
      { name: "إعجابات مكس جودة HQ", price: 3, badge: "توفير", speed: "5-15 دقيقة" },
    ])
  },
  { 
    cat: "مشاهدات", 
    emoji: "👁️", 
    items: expandItems([
      { name: "مشاهدات فيديو حقيقية", price: 2, badge: "حقيقي", speed: "فوري" },
      { name: "مشاهدات تلقائية يومية", price: 15, badge: "توفير", speed: "تلقائي" },
    ])
  },
];

export const generateSocialServices = (platform: string, platformColor: string, platformIcon: string) => {
  const categories = PLATFORM_SERVICES_DATA[platform] || GENERIC_CATEGORIES;

  const allServices: any[] = [];
  categories.forEach(({ cat, emoji, items }) => {
    items.forEach((item: any, idx: number) => {
      allServices.push({
        id: `${platform.toLowerCase()}_${cat}_${idx}`,
        name: `${platform} — ${item.name}`,
        cat,
        emoji,
        price: item.price,
        platform,
        platformColor,
        platformIcon,
        type: item.type || "standard",
        desc: `خدمة ${item.name} لحساب ${platform}. نضمن لك الحصول على أعلى جودة وبأفضل الأسعار المنافسة في السوق العالمي.`,
        fields: item.type === "custom_comments" ? ["الرابط", "التعليقات (كل سطر تعليق)"] : ["الرابط", "الكمية المطلوبة"],
        minQuantity: item.type === "custom_comments" ? 1 : 100,
        maxQuantity: 1000000,
        badge: item.badge,
        speed: item.speed,
        color: platformColor,
        faqs: [
          { q: `متى سيبدأ تنفيذ خدمة ${item.name}؟`, a: `يبدأ التنفيذ عادة خلال ${item.speed} من تأكيد الطلب بنجاح.` },
          ...DEFAULT_FAQS
        ]
      });
    });
  });
  return allServices;
};

export const SOCIAL_CATALOG: Record<string, any[]> = {};
SOCIAL_PLATFORMS.forEach(p => {
  SOCIAL_CATALOG[p.name] = generateSocialServices(p.name, p.color, p.icon);
});

export const SERVICES_DATA = [
  {
    category: "🛒 الخدمات اللوجستية والاستراتيجية",
    accent: "#3B82F6",
    icon: "📦",
    items: [
      { id: "logistics_temu", name: "شراء من تيمو (Temu) - خصم 85%", sub: "خصم 85% حصري", icon: "🛍️", color: "#F97316", badge: "خصم 85%", desc: "اطلب أي منتج من تيمو بخصم 85%. ضع الرابط وسيقوم الذكاء الاصطناعي بتحليل السعر.", fields: ["رابط المنتج"], btn: "تحليل المنتج بالذكاء الاصطناعي", note: "TEMU AI DISCOUNT", type: "logistics_link", discount: 0.85, provider: "Temu" },
      { id: "logistics_ali", name: "علي إكسبريس (AliExpress) - خصم 80%", sub: "خصم 80% حصري", icon: "🌐", color: "#3B82F6", badge: "خصم 80%", desc: "اطلب من علي إكسبريس بخصم 80%.", fields: ["رابط المنتج"], btn: "تحليل الرابط", note: "ALIEXPRESS AI", type: "logistics_link", discount: 0.80, provider: "AliExpress" },
      { id: "logistics_amazon", name: "شراء من أمازون (Amazon) - وفر 75%", sub: "خصم 75% حصري", icon: "📦", color: "#EAB308", badge: "وفر 75%", desc: "شراء منتجات أمازون بخصم 75%.", fields: ["رابط المنتج"], btn: "تحليل المنتج", note: "AMAZON EGYPT BOOST", type: "logistics_link", discount: 0.75, provider: "Amazon" },
      { id: "amazon_balance", name: "شحن رصيد أمازون (Amazon Balance)", sub: "ضعف الررصيد", icon: "💳", color: "#EAB308", badge: "210% قيمة", desc: "اشحن رصيد أمازون الخاص بك. (1000 ج.م رصيد القائد = 2100 ج.م رصيد أمازون).", fields: ["رقم الهاتف المسجل", "البريد الإلكتروني المسجل", "المبلغ المراد شحنه"], btn: "طلب شحن الرصيد", note: "AMAZON BALANCE TOPUP", type: "amazon_balance" },
      { id: "customs", name: "تخليص جمركي ذكي", sub: "تتبع ذكي", icon: "📦", color: "#10B981", badge: "تتبع", desc: "تخليص جمركي ذكي بأسرع وقت وأقل تكلفة.", fields: ["رقم الشحنة", "اسم البائع", "القيمة التقريبية"], btn: "طلب التخليص", note: "SMART CUSTOMS" },
      { id: "broker", name: "وسيط تسوق دولي", sub: "بدون حد", icon: "🌍", color: "#8B5CF6", badge: "دولي", desc: "اطلب من أي موقع حول العالم.", fields: ["رابط المنتج", "اسم المنتج", "السعر التقريبي"], btn: "إرسال طلب الوساطة", note: "GLOBAL BROKER" },
      { id: "topup", name: "شحن رصيد الشبكات", sub: "بدون ضريبة", icon: "📱", color: "#EF4444", badge: "فوري", desc: "شحن 100 جنيه رصيد صافي. القائد يتحمل الضريبة.", fields: [], btn: "تأكيد الشحن الفوري", note: "NETWORK TOPUP", isTopup: true },
      { id: "shipping", name: "شحن داخلي سريع", sub: "يوم واحد", icon: "🚚", color: "#06B6D4", badge: "سريع", desc: "شحن منتجاتك داخل مصر في 24 ساعة.", fields: ["اسم المستلم", "العنوان التفصيلي", "رقم الهاتف"], btn: "طلب الشحن", note: "EXPRESS SHIPPING" },
    ],
  },
  {
    category: "🤖 أدوات الذكاء الاصطناعي (خصم 85%)",
    accent: "#8B5CF6",
    icon: "🧠",
    items: [
      { id: "chatgpt", name: "ChatGPT Plus", sub: "خصم 85%", icon: "🤖", color: "#10B981", badge: "AI", desc: "اشتراك ChatGPT Plus الأصلي بميزات GPT-4o وDALL-E. السعر العالمي: £1000 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 1000, discount: 0.85, type: "subscription" },
      { id: "midjourney", name: "Midjourney Pro", sub: "خصم 85%", icon: "✨", color: "#8B5CF6", badge: "AI", desc: "أقوى محرك للرسم بالذكاء الاصطناعي في العالم. السعر العالمي: £1500 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 1500, discount: 0.85, type: "subscription" },
      { id: "claude", name: "Claude 3.5 Pro", sub: "خصم 85%", icon: "🧠", color: "#F97316", badge: "AI", desc: "أذكى موديل لغوي للمبرمجين والباحثين. السعر العالمي: £1000 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 1000, discount: 0.85, type: "subscription" },
      { id: "gemini", name: "Gemini Advanced", sub: "خصم 85%", icon: "💎", color: "#3B82F6", badge: "AI", desc: "ذكاء جوجل الخارق متكامل مع تطبيقات جوجل. السعر العالمي: £1000 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 1000, discount: 0.85, type: "subscription" },
      { id: "perplexity", name: "Perplexity Pro", sub: "خصم 85%", icon: "🔍", color: "#10B981", badge: "AI", desc: "محرك البحث الأسرع والأكثر دقة بالذكاء الاصطناعي. السعر العالمي: £1000 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 1000, discount: 0.85, type: "subscription" },
      { id: "capcut", name: "CapCut Pro Desktop", sub: "خصم 85%", icon: "🎬", color: "#EF4444", badge: "AI", desc: "اشتراك كاب كت برو العالمي بجميع الفلاتر. السعر العالمي: £500 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 500, discount: 0.85, type: "subscription" },
      { id: "canva", name: "Canva Enterprise", sub: "خصم 85%", icon: "🎨", color: "#06B6D4", badge: "AI", desc: "كانفا برو بلس بجميع الميزات المدفوعة. السعر العالمي: £600 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 600, discount: 0.85, type: "subscription" },
      { id: "elevenlabs", name: "ElevenLabs Creator", sub: "خصم 85%", icon: "🎙️", color: "#22C55E", badge: "AI", desc: "أفضل صوت صناعي بشري في العالم. السعر العالمي: £1200 ج.م", fields: ["البريد الإلكتروني للتفعيل"], btn: "تفعيل الاشتراك", note: "AI QUANTUM V3", hasDuration: true, price: 1200, discount: 0.85, type: "subscription" },
    ],
  },
  {
    category: "🎬 منصات الترفيه والسينما (خصم 85%)",
    accent: "#EF4444",
    icon: "📺",
    items: [
      { id: "netflix", name: "Netflix Premium 4K", sub: "خصم 85%", icon: "📺", color: "#EF4444", badge: "85%", desc: "نيتفلكس بريميوم أعلى باقة 4K. السعر العالمي: £800 ج.م", fields: ["البريد الإلكتروني للتسليم"], btn: "تأكيد الاشتراك", note: "ENTERTAINMENT", hasDuration: true, price: 800, discount: 0.85, type: "subscription" },
      { id: "spotify", name: "Spotify Premium", sub: "خصم 85%", icon: "🎵", color: "#22C55E", badge: "85%", desc: "سبوتيفاي بريميوم بدون إعلانات. السعر العالمي: £400 ج.م", fields: ["البريد الإلكتروني للتسليم"], btn: "تأكيد الاشتراك", note: "ENTERTAINMENT", hasDuration: true, price: 400, discount: 0.85, type: "subscription" },
      { id: "shahid", name: "Shahid VIP Sports", sub: "خصم 85%", icon: "▶️", color: "#3B82F6", badge: "85%", desc: "شاهد VIP شامل الباقة الرياضية. السعر العالمي: £600 ج.م", fields: ["البريد الإلكتروني للتسليم"], btn: "تأكيد الاشتراك", note: "ENTERTAINMENT", hasDuration: true, price: 600, discount: 0.85, type: "subscription" },
      { id: "disney", name: "Disney+ Global", sub: "خصم 85%", icon: "🏰", color: "#3B82F6", badge: "85%", desc: "ديزني بلس العالمية برو. السعر العالمي: £500 ج.م", fields: ["البريد الإلكتروني للتسليم"], btn: "تأكيد الاشتراك", note: "ENTERTAINMENT", hasDuration: true, price: 500, discount: 0.85, type: "subscription" },
      { id: "youtube_prem", name: "YouTube Premium", sub: "خصم 85%", icon: "▶️", color: "#EF4444", badge: "85%", desc: "يوتيوب بريميوم شامل الموسيقى. السعر العالمي: £500 ج.م", fields: ["البريد الإلكتروني للتسليم"], btn: "تأكيد الاشتراك", note: "ENTERTAINMENT", hasDuration: true, price: 500, discount: 0.85, type: "subscription" },
      { id: "crunchyroll", name: "Crunchyroll Mega Fan", sub: "خصم 85%", icon: "🍥", color: "#F97316", badge: "85%", desc: "أقوى باقة انمي في العالم. السعر العالمي: £400 ج.م", fields: ["البريد الإلكتروني للتسليم"], btn: "تأكيد الاشتراك", note: "ENTERTAINMENT", hasDuration: true, price: 400, discount: 0.85, type: "subscription" },
    ],
  },
  {
    category: "🎮 شحن الألعاب والعملات الرقمية (خصم 30%)",
    accent: "#F97316",
    icon: "🕹️",
    items: [
      { id: "pubg", name: "PUBG Mobile - شدات ببجي", sub: "دولي - فوري", icon: "🎯", color: "#EAB308", badge: "خصم 30%", desc: "شحن UC لـ PUBG Mobile.", fields: ["ID اللاعب"], shippingMethods: ["ID (فوري)", "Login (أرخص)", "Global Key"], packages: [{ name: "60 UC", price: 1 }, { name: "325 UC", price: 5 }, { name: "660 UC", price: 10 }, { name: "1800 UC", price: 25 }, { name: "3850 UC", price: 50 }, { name: "8100 UC", price: 100 }], btn: "تأكيد الشحن", note: "GAMING CHARGE", discount: 0.30 },
      { id: "freefire", name: "Free Fire - ألماس فري فاير", sub: "دولي - فوري", icon: "🔥", color: "#EF4444", badge: "خصم 30%", desc: "شحن ألماس Free Fire.", fields: ["ID اللاعب"], shippingMethods: ["ID (فوري)", "Login", "Global Code"], packages: [{ name: "110 Diamonds", price: 1 }, { name: "231 Diamonds", price: 2 }, { name: "583 Diamonds", price: 5 }, { name: "1188 Diamonds", price: 10 }, { name: "2420 Diamonds", price: 20 }], btn: "تأكيد الشحن", note: "GAMING CHARGE", discount: 0.30 },
      { id: "roblox", name: "Roblox - روبوكس", sub: "دولي - فوري", icon: "🏛️", color: "#EF4444", badge: "خصم 30%", desc: "شحن Robux لحسابك.", fields: ["اسم المستخدم"], shippingMethods: ["Direct Topup", "Gift Card"], packages: [{ name: "400 Robux", price: 5 }, { name: "800 Robux", price: 10 }, { name: "1700 Robux", price: 20 }, { name: "4500 Robux", price: 50 }], btn: "تأكيد الشحن", note: "GAMING CHARGE", discount: 0.30 },
      { id: "codm", name: "Call of Duty Mobile", sub: "شحن CP", icon: "🔫", color: "#3B82F6", badge: "-30%", desc: "شحن CP لجيم شارك كود موبايل.", fields: ["ID اللاعب"], packages: [{name:"80 CP", price:1}, {name:"400 CP", price:5}, {name:"800 CP", price:10}], btn: "طلب الشحن", note: "GAMING CHARGE", discount: 0.30 },
      { id: "valorant", name: "Valorant Points", sub: "شحن دولي", icon: "🛡️", color: "#EF4444", badge: "-30%", desc: "شحن رصيد فالورانت العالمي.", fields: ["Riot ID"], packages: [{name:"500 VP", price:5}, {name:"1000 VP", price:10}], btn: "طلب الشحن", note: "GAMING CHARGE", discount: 0.30 },
      { id: "steam", name: "Steam Gift Cards", sub: "شحن كود", icon: "🎮", color: "#1E293B", badge: "-30%", desc: "أكواد ستام عالمية.", fields: ["البريد"], packages: [{name:"$5", price:5}, {name:"$10", price:10}], btn: "طلب الكود", note: "GAMING CHARGE", discount: 0.30 },
      { id: "mlbb", name: "Mobile Legends", sub: "Diamonds", icon: "🦅", color: "#F59E0B", badge: "-30%", desc: "شحن جواهر موبايل ليجيند.", fields: ["ID", "Zone"], packages: [{name:"86 Dia", price:2}, {name:"172 Dia", price:4}], btn: "طلب الشحن", note: "GAMING CHARGE", discount: 0.30 },
      { id: "gplay", name: "Google Play Gift", sub: "US/EG", icon: "🛍️", color: "#22C55E", badge: "-30%", desc: "بطاقات جوجل بلاي.", fields: ["البريد"], packages: [{name:"$5", price:5}, {name:"$10", price:10}], btn: "طلب الكود", note: "GAMING CHARGE", discount: 0.30 },
      { id: "psn", name: "PlayStation Store", sub: "Cards", icon: "🎮", color: "#3B82F6", badge: "-30%", desc: "بطاقات ستور بلايستيشن.", fields: ["البريد"], packages: [{name:"$10", price:10}, {name:"$20", price:20}], btn: "طلب الكود", note: "GAMING CHARGE", discount: 0.30 },
    ],
  },
  {
    category: "💰 الخدمات المالية والعملات الدولية (خصم 30%)",
    accent: "#EAB308",
    icon: "💵",
    items: [
      { id: "transfer_custom", name: "تحويل رصيد مخصص (USD)", sub: "سعر صرف متفوق", icon: "💸", color: "#EAB308", badge: "مباشر", desc: "حول أي مبلغ بالدولار لأي محفظة إلكترونية أو حساب بنكي دولي. السعر شامل الرسوم.", fields: ["المبلغ بالدولار ($)", "البريد الإلكتروني للمستلم", "ID الحساب / المحفظة"], btn: "تأكيد التحويل", note: "FINANCIAL", discount: 0.30, minQuantity: 5 },
      { id: "binance", name: "Binance & Crypto USDT", sub: "خصم 30%", icon: "⇄", color: "#EAB308", badge: "30% OFF", desc: "تحويل عملات رقمية وسحب لباينانس.", fields: ["المبلغ بالدولار ($)", "عنوان المحفظة / ID"], btn: "تأكيد التحويل", note: "FINANCIAL", discount: 0.30, minQuantity: 10 },
      { id: "paypal_payeer", name: "PayPal & Payeer & Skrill", sub: "خصم 30%", icon: "🅿️", color: "#003087", badge: "30% OFF", desc: "شحن البنوك الإلكترونية.", fields: ["المبلغ بالدولار ($)", "البريد الإلكتروني / ID"], btn: "تأكيد الشحن", note: "FINANCIAL", discount: 0.30, minQuantity: 5 },
      { id: "volet", name: "Volet (Advcash)", sub: "خصم 30%", icon: "💳", color: "#F97316", badge: "-30%", desc: "شحن محفظة Volet مباشرة.", fields: ["المبلغ بالدولار ($)", "البريد"], btn: "شحن فوري", note: "FINANCIAL", discount: 0.30, minQuantity: 10 },
      { id: "redot", name: "RedotPay Visa", sub: "خصم 30%", icon: "💳", color: "#EF4444", badge: "-30%", desc: "شحن بطاقة RedotPay Visa.", fields: ["المبلغ بالدولار ($)", "ID الحساب"], btn: "شحن فوري", note: "FINANCIAL", discount: 0.30, minQuantity: 10 },
      { id: "pyypl", name: "Pyypl Recharge", sub: "خصم 30%", icon: "🌐", color: "#06B6D4", badge: "-30%", desc: "شحن محفظة Pyypl.", fields: ["المبلغ بالدولار ($)", "رقم الهاتف"], btn: "شحن فوري", note: "FINANCIAL", discount: 0.30, minQuantity: 5 },
      { id: "wise", name: "Wise Transfer", sub: "خصم 30%", icon: "🏦", color: "#22C55E", badge: "-30%", desc: "شحن وتزويد حساب وايز.", fields: ["المبلغ بالدولار ($)", "البريد"], btn: "طلب تحويل", note: "FINANCIAL", discount: 0.30, minQuantity: 50 },
      { id: "payoneer", name: "Payoneer Funds", sub: "خصم 30%", icon: "🏦", color: "#FACC15", badge: "-30%", desc: "شحن رصيد بايونير.", fields: ["المبلغ بالدولار ($)", "البريد"], btn: "طلب شحن", note: "FINANCIAL", discount: 0.30, minQuantity: 50 },
      { id: "pmoney", name: "Perfect Money", sub: "خصم 30%", icon: "💰", color: "#EF4444", badge: "-30%", desc: "شحن حساب بيرفكت موني.", fields: ["المبلغ بالدولار ($)", "رقم المحفظة"], btn: "شحن فوري", note: "FINANCIAL", discount: 0.30, minQuantity: 10 },
      { id: "withdraw_cash", name: "سحب الرصيد لكاش", sub: "فوري", icon: "🏧", color: "#EF4444", badge: "سحب فوري", desc: "سحب أرباحك أو رصيدك لخدمات الكاش المحلية.", fields: ["رقم الهاتف", "المبلغ بالجنيه"], btn: "طلب السحب", note: "WITHDRAWAL" },
    ],
  },
];

export const TRANSACTIONS = [
  { id: 1, name: "شراء Canva Pro", type: "AI_SERVICE", amount: "£100", status: "completed", date: "٢٠٢٦/٥/٨", icon: "🎨", color: "#06B6D4" },
  { id: 2, name: "شحن UC PUBG 3850", type: "GAMING", amount: "£240", status: "completed", date: "٢٠٢٦/٥/٧", icon: "🎮", color: "#F97316" },
  { id: 3, name: "ChatGPT Plus شهر", type: "AI_SERVICE", amount: "£200", status: "completed", date: "٢٠٢٦/٥/٦", icon: "🤖", color: "#10B981" },
  { id: 4, name: "شحن فودافون 100 جنيه", type: "TOPUP", amount: "£100", status: "completed", date: "٢٠٢٦/٥/٥", icon: "📱", color: "#EF4444" },
  { id: 5, name: "Netflix 4K اشتراك شهر", type: "ENTERTAINMENT", amount: "£150", status: "pending", date: "٢٠٢٦/٥/٤", icon: "📺", color: "#EF4444" },
  { id: 6, name: "Instagram متابعين 1000", type: "SOCIAL", amount: "£50", status: "completed", date: "٢٠٢٦/٥/٣", icon: "📷", color: "#E1306C" },
];

export const DURATIONS = ["شهر واحد", "3 أشهر", "6 أشهر", "سنة كاملة"];
export const NETWORKS = ["فودافون", "أورانج", "اتصالات", "WE"];
export const TOPUP_AMOUNTS = [500, 200, 100, 50];
