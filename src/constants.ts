export const GOVERNORATES_LIST = [
  "القاهرة", "الاسكندرية", "الجيزة", "القليوبية", "الدقهلية", "الغربية", "المنوفية", "الشرقية", "البحيرة",
  "كفر الشيخ", "دمياط", "بورسعيد", "الاسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف",
  "الفيوم", "المنيا", "اسيوط", "سوهاج", "قنا", "الاقصر", "اسوان", "البحر الاحمر", "الوادي الجديد", "مطروح"
];

export const GOVERNORATES_ENTITIES = [
  "التأمين الصحي", "التراخيص الطبية", "التكليف", "التمريض", "الرعاية الحرجة", "الصحة النفسية",
  "شكاوي مجلس الوزراء", "عدم اختصاص", "الفيروسات الكبدية", "قطاع الطب الوقائي", "قوائم انتظار",
  "المجالس الطبية", "المعامل المركزية", "المصل واللقاح", "مبادرات الصحة العامة", "تنمية الأسرة",
  ...GOVERNORATES_LIST.sort()
];

export const COMPLAINT_SUBJECTS = [
  "استشارات طبية", "استفسارات", "البان", "التأمين الصحي", "التراخيص", "التكليف",
  "تحاليل السفر", "تحاليل زواج", "تحويل قرار", "تسجيل مواليد", "تصريح دفن",
  "تطعيم الاطفال", "تطعيم السعار", "تطعيم السفر", "شكاوي", "ضد منشأة صحية",
  "طوارئ (دم - رعاية - حضانة)", "عدم اختصاص", "علاج", "الفيروسات الكبدية",
  "كارت خدمات متكاملة", "مرض نفسى او ادمان", "لقاحات وامصال", "المبادرات", "معاش تأميني"
];

export const CABINET_CITIES_MAP: Record<string, string[]> = {
  "القاهرة": ["مصر الجديدة", "مدينة نصر", "المعادي", "حلوان", "شبرا", "المرج", "الزيتون", "المقطم", "السيدة زينب", "البساتين", "عين شمس", "الوايلي", "عابدين", "منشأة ناصر", "وسط القاهرة", "التجمع الخامس"],
  "الجيزة": ["الجيزة", "الدقي", "العجوزة", "الهرم", "الوراق", "إمبابة", "كرداسة", "أوسيم", "أبو النمرس", "البدرشين", "العياط", "الصف", "أطفيح", "الواحات البحرية", "الحوامدية", "منشأة القناطر", "الشيخ زايد", "6 أكتوبر"],
  "الاسكندرية": ["المنتزه", "شرق", "وسط", "الجمرك", "غرب", "العجمي", "العامرية", "برج العرب"],
  "القليوبية": ["بنها", "قليوب", "القناطر الخيرية", "شبرا الخيمة", "الخانكة", "كفر شكر", "طوخ", "شبين القناطر", "العبور", "قها"],
  "الدقهلية": ["المنصورة", "ميت غمر", "طلخا", "أجا", "السنبلاوين", "دكرنس", "بلقاس", "منية النصر", "شربين", "المطرية", "الجمالية", "تمي الأمديد", "بني عبيد", "محلة دمنة", "الكردي", "نبروه", "المنزلة"],
  "الشرقية": ["الزقازيق", "العاشر من رمضان", "بلبيس", "فاقوس", "أبو كبير", "منيا القمح", "ديرب نجم", "مشتول السوق", "الإبراهيمية", "ههيا", "أبو حماد", "كفر صقر", "أولاد صقر", "الحسينية", "الصالحية الجديدة", "القرين", "القنايات"],
  "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "قطور", "بسيون", "سمنود"],
  "المنوفية": ["شبين الكوم", "منوف", "مدينة السادات", "أشمون", "الباجور", "قويسنا", "بركة السبع", "تلا", "الشهداء", "سرس الليان"],
  "البحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو المطامير", "أبو حمص", "الدلنجات", "المحمودية", "إيتاي البارود", "حوش عيسى", "كوم حمادة", "شبراخيت", "بدر", "وادي النطرون", "غرب النوبارية"],
  "كفر الشيخ": ["كفر الشيخ", "دسوق", "فوه", "مطوبس", "بيلا", "الحامول", "سيدي سالم", "الرياض", "بلطيم", "قلين", "مسير", "سيدي غازي"],
  "دمياط": ["دمياط", "رأس البر", "عزبة البرج", "فارسكور", "الزرقا", "كفر سعد", "كفر البطيخ", "السرو", "ميت أبو غالب", "الروضة"],
  "الاسماعيلية": ["الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير", "أبو صوير", "القصاصين"],
  "بورسعيد": ["حي الشرق", "حي العرب", "حي المناخ", "حي الضواحي", "حي الجنوب", "حي الزهور", "بور فؤاد"],
  "السويس": ["السويس", "الأربعين", "عتاقة", "الجناين", "فيصل"],
  "الفيوم": ["الفيوم", "سنورس", "إطسا", "طامية", "أبشواي", "يوسف الصديق"],
  "بني سويف": ["بني سويف", "الواسطى", "ناصر", "ببا", "الفشن", "سمسطا", "إهناسيا"],
  "المنيا": ["المنيا", "المنيا الجديدة", "مغاغة", "بني مزار", "مطاي", "سمالوط", "أبو قرقاص", "ملوي", "دير مواس", "العدوة"],
  "اسيوط": ["أسيوط", "ديروط", "القوصية", "أبنوب", "منفلوط", "أبو تيج", "الغنايم", "ساحل سليم", "البداري", "صدفا", "الفتح"],
  "سوهاج": ["سوهاج", "أخميم", "البلينا", "المراغة", "المنشأة", "دار السلام", "جرجا", "جهينة", "ساقلتة", "طما", "طهطا"],
  "قنا": ["قنا", "أبو تشت", "نجع حمادي", "دشنا", "الوقف", "قفط", "نقادة", "قوص", "فرشوط"],
  "الاقصر": ["الأقصر", "الزينية", "البياضية", "القرنة", "أرمنت", "إسنا", "الطود", "طيبة"],
  "اسوان": ["أسوان", "دراو", "كوم أمبو", "إدفو", "نصر النوبة", "أبو سمبل", "كلابشة", "الرديسية", "البصيلية", "السباعية"],
  "مطروح": ["مرسى مطروح", "الحمام", "العلمين", "الضبعة", "النجيلة", "براني", "السلوم", "سيوة"],
  "البحر الاحمر": ["الغردقة", "رأس غارب", "سفاجا", "القصير", "مرسى علم", "الشلاتين", "حلايب"],
  "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة", "باريس", "بلاط"],
  "شمال سيناء": ["العريش", "الشيخ زويد", "رفح", "بئر العبد", "الحسنة", "نخل"],
  "جنوب سيناء": ["الطور", "شرم الشيخ", "دهب", "نويبع", "طابا", "سانت كاترين", "أبو رديس", "أبو زنيمة"]
};

export const EMPLOYEE_MAP: Record<string, string> = {
  "omarkhaledfadel@gmail.com": "عمر خالد فاضل",
  "karimelzayat.1997@gmail.com": "كريم سامى محمد الزيات",
  "mohamedshauki81@gmail.com": "محمد شوقى احمد",
  "ahmed.elshahat.eru2016@gmail.com": "احمد عبدالمنعم السيد",
  "mo.majeed26@gmail.com": "محمد عبدالمجيد محمد",
  "samehabdelsalam017@gmail.com": "سامح عبدالسلام عبدالسلام",
  "mostafa.ramadan1072@gmail.com": "مصطفى رمضان عبد الحكيم",
  "ehabebrahiem95@gmail.com": "ايهاب ابراهيم عبد العظيم",
  "fesalsherif064@gmail.com": "فيصل شريف سالم",
  "bmm24000@gmail.com": "محمود محمد احمد حسن",
  "mahmoudabdmomen@gmail.com": "محمود ابراهيم عبدالمؤمن",
  "khaledbibo567@gmail.com": "خالد عبدالغفور احمد",
  "asmaagemy12345@icloud.com": "اسماء جمال السيد",
  "karimsaidmohmedgad22@gmail.com": "كريم سعيد محمد جاد",
  "alaamosman8@gmail.com": "الاء محمد عثمان",
  "karimelzayat3@gmail.com": "كريم سامي محمد الزيات",
  "lm719975@gmail.com": "علي محمد حسن",
  "adagher1996@gmail.com": "احمد محمد عبدالفتاح داغر",
  "ghad28780@gmail.com": "جهاد احمد جمعة",
  "mohamedsameh2228@gmail.com": "محمد سامح ابوذكري",
  "fakhr.moh2025@gmail.com": "محمد احمد ربيع الفخراني",
  "aelsehety1234@gmail.com": "احمد محمد عبدالرحمن السحيتي",
  "hassan.madian.1070@gmail.com": "أ/حسن مدين",
  "hm.hm.labtop@gmail.com": "أ/حسن مدين",
  "nada96001@gmail.com": "ندى جمال على",
  "shiry4996@gmail.com": "شيرين نعيم حافظ",
  "lailaabdelsalam1919@gmail.com": "ليلى عبد السلام ابراهيم",
  "azzasalam.1977@gmail.com": "عزة عبد السلام ابراهيم",
  "ztb395999@gmail.com": "عزة عبد السلام ابراهيم",
  "ahmedamany035@gmail.com": "اماني احمد ابوالمعاطي",
  "halaahmed126y@gmail.com": "هالة احمد سلطان",
  "omeresraa11@gmail.com": "اسراء عمر عبد الحميد",
  "amalalomar71@gmail.com": "امال ابراهيم عبدالعال",
  "fadiamyy@gmail.com": "فادية صالح ماضي",
  "mohanabih86@gmail.com": "مها محب",
  "aya.alaa.qased@gmail.com": "ايه علاء",
  "safaaallam2000@gmail.com": "أ/صفاء علام"
};

export const ROLE_CAPABILITIES: Record<UserRole, UserCapabilities> = {
  "Admin": { 
    canViewHotline: true, canRegisterComplaint: true, canSearchComplaints: true, canFollowUpComplaints: true, canViewStats: true,
    canViewAdmin: true, canViewDirectorAssignments: true, canViewSchedules: true, canViewReports: true, canViewSettings: true,
    canEditAny: true, showMonthlyCount: true, canApproveSwaps: true
  },
  "Supervisor": { 
    canViewHotline: true, canRegisterComplaint: true, canSearchComplaints: true, canFollowUpComplaints: false, canViewStats: true,
    canViewAdmin: true, canViewDirectorAssignments: true, canViewSchedules: true, canViewReports: false, canViewSettings: false,
    canEditAny: true, showMonthlyCount: true, canApproveSwaps: true
  }, 
  "Employee": { 
    canViewHotline: true, canRegisterComplaint: true, canSearchComplaints: true, canFollowUpComplaints: false, canViewStats: false,
    canViewAdmin: false, canViewDirectorAssignments: false, canViewSchedules: true, canViewReports: false, canViewSettings: false,
    canEditAny: false, showMonthlyCount: true, canApproveSwaps: false
  },
  "FollowUpSpecialist": { 
    canViewHotline: true, canRegisterComplaint: true, canSearchComplaints: true, canFollowUpComplaints: true, canViewStats: true,
    canViewAdmin: false, canViewDirectorAssignments: false, canViewSchedules: true, canViewReports: true, canViewSettings: false,
    canEditAny: true, showMonthlyCount: true, canApproveSwaps: false
  },
  "AdminOnly": { 
    canViewHotline: false, canRegisterComplaint: false, canSearchComplaints: false, canFollowUpComplaints: false, canViewStats: false,
    canViewAdmin: true, canViewDirectorAssignments: true, canViewSchedules: true, canViewReports: true, canViewSettings: false,
    canEditAny: false, showMonthlyCount: false, canApproveSwaps: false
  },
  "HotlineAndLimitedAdmin": { 
    canViewHotline: true, canRegisterComplaint: true, canSearchComplaints: true, canFollowUpComplaints: false, canViewStats: true,
    canViewAdmin: true, canViewDirectorAssignments: false, canViewSchedules: true, canViewReports: false, canViewSettings: false,
    canEditAny: false, showMonthlyCount: true, canApproveSwaps: false
  },
  "Guest": { 
    canViewHotline: false, canRegisterComplaint: false, canSearchComplaints: false, canFollowUpComplaints: false, canViewStats: false,
    canViewAdmin: false, canViewDirectorAssignments: false, canViewSchedules: false, canViewReports: false, canViewSettings: false,
    canEditAny: false, showMonthlyCount: false, canApproveSwaps: false
  }
};
