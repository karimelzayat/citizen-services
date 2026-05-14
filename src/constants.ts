import { UserCapabilities, UserRole } from './types';

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

export const DEFAULT_CAPABILITIES: UserCapabilities = {
  showHotlineSection: false,
  showAdminSection: false,
  showHelpCenterSection: true,
  showSettingsSection: false,
  canViewDashboard: false,
  canRegisterHotline: false,
  canSearchHotline: false,
  canFollowUpHotline: false,
  canRegisterAdminWork: false,
  canRegisterOngoing: false,
  canRegisterWrongDirection: false,
  canRegisterUnregistered: false,
  canViewDirectorAssignments: false,
  canViewSchedules: false,
  canViewReports: false,
  canViewInquiry: true,
  canViewPhonebook: true,
  canViewFAQ: true,
  canEditAny: false,
  canApproveSwaps: false,
  canManageUsers: false
};

export const INITIAL_EMPLOYEES: any[] = [
  { name: "احمد محمد عبدالفتاح داغر", status: "انتداب", jobTitle: "فني تسجيل طبي واحصاء", phone: "01001520515", nationalId: "29605192101091", address: "قرية وردان - منشية القناطر - الجيزة", code: "21967", email: "adagher1996@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "اسراء عمر عبد الحميد", status: "قوة أساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01208474705", nationalId: "29507162102903", address: "15 ش علي خلف - روض الفرج - القاهرة", code: "9248", email: "omeresraa11@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "انثى" },
  { name: "اسماء جمال السيد", status: "تعديل تكليف", jobTitle: "تمريض", phone: "01014483058", nationalId: "30009101200541", address: "16 م جزيرة بدران - روض الفرج - القاهرة", code: "103460", email: "asmaagemy12345@icloud.com", startDate: "", assignmentStatus: "انتهاء تاريخ التكليف 28/1/2026", annualLeave: 15, casualLeave: 7, gender: "انثى" },
  { name: "امال ابراهيم عبدالعال", status: "انتداب", jobTitle: "كاتب", phone: "00116639904", nationalId: "28211040103828", address: "منشية الجبل الاصفر - الخانكة - القليوبية", code: "SEED_004", email: "amalalomar71@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "اماني احمد ابوالمعاطي", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01009010879", nationalId: "28611082100169", address: "82 مساكن ساقية مكي - الجيزة", code: "5032", email: "ahmedamany035@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "ايهاب ابراهيم عبد العظيم", status: "قوة أساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01066172966", nationalId: "29510151401292", address: "السفانية - طوخ - القليوبية", code: "15737", email: "ehabebrahiem95@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "جهاد احمد جمعة", status: "تكليف", jobTitle: "فني تسجيل طبي واحصاء", phone: "01128628780", nationalId: "30302252104381", address: "الناصرية - العياط - الجيزة", code: "107823", email: "ghad28780@gmail.com", startDate: "", assignmentStatus: "انتهاء تاريخ التكليف 15/4/2027", annualLeave: 15, casualLeave: 7, gender: "انثى" },
  { name: "خالد عبدالغفور احمد", status: "قوة اساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01150280786", nationalId: "30001280100359", address: "15 شارع الصحة - المرج - القاهرة", code: "20927", email: "khaledbibo567@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 45, casualLeave: 7, gender: "ذكر" },
  { name: "زينب محمد عبد العال", status: "قوة أساسية", jobTitle: "كاتب", phone: "01146600668", nationalId: "29002072100648", address: "ش ابو الصياد - الطلبية - الجيزة", code: "85031", email: "zeinabbbb1982@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "سامح عبدالسلام عبدالسلام", status: "انتداب", jobTitle: "باحث تنمية ادارية", phone: "01009074178", nationalId: "28411290101277", address: "المحمد جمال عبدالحافظية - القاهرة", code: "101740", email: "samehabdelsalam017@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "ذكر" },
  { name: "شيرين نعيم حافظ", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01140570470", nationalId: "28204051400747", address: "24 ش حسن رضوان - حدائق القبة - القاهرة", code: "4722", email: "shiry4996@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "صفاء محمد حافظ", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01005542636", nationalId: "27305290101287", address: "عمارة 15 مجاورة 3 حي 13 - الشيخ زايد - الجيزة", code: "68", email: "safaaallam2000@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 45, casualLeave: 7, gender: "انثى" },
  { name: "عزة عبد السلام ابراهيم", status: "قوة أساسية", jobTitle: "اخصائي تمويل ومحاسبة", phone: "01123842899", nationalId: "27703110103266", address: "المجاورة الثالثة - بدر - القاهرة", code: "79", email: "azzasalam.1977@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "علي محمد حسن", status: "تكليف", jobTitle: "فني تسجيل طبي واحصاء", phone: "01063815754", nationalId: "30401102405357", address: "طحا الاعمدة - سمالوط - المنيا", code: "SEED_014", email: "lm719975@gmail.com", startDate: "2025/04/09", assignmentStatus: "انتهاء تاريخ التكليف 9/4/2027", annualLeave: 15, casualLeave: 7, gender: "ذكر" },
  { name: "عمر خالد فاضل", status: "قوة أساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01095125339", nationalId: "29601281400099", address: "17 ش الجامع الاحمر - الموسكي - القاهرة", code: "16803", email: "omarkhaledfadel@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "فادية صالح ماضي", status: "قوة اساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01287941928", nationalId: "28103030101382", address: "76ش السلام - عزب العرب - مدينة نصر ثان - القاهرة", code: "SEED_016", email: "fadiamyy@gmail.com", startDate: "2025/07/02", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "فيصل شريف سالم", status: "قوة أساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01128922037", nationalId: "30107142101835", address: "26 عرب النمايرة بجوار الجمعية الخيرية - الصف - الجيزة", code: "76115", email: "fesalsherif064@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "كريم سامى محمد الزيات", status: "قوة اساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01005529089", nationalId: "29701071402352", address: "ا ش شعبان عثمان - بنها الجديدة - بنها - القليوبية", code: "11688", email: "karimelzayat.1997@gmail.com", startDate: "2024/10/30", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "كريم سعيد محمد جاد", status: "انتداب", jobTitle: "فني تسجيل طبي واحصاء", phone: "01060763807", nationalId: "30107301401691", address: "منشأة الكرام - شبين القناطر - القليوبية", code: "SEED_019", email: "karimsaidmohmedgad22@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "ليلى عبد السلام ابراهيم", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01063395273", nationalId: "27510060108366", address: "2 الصعيد ج بلوك مدخل 1 أول - السلام - القاهرة", code: "5031", email: "lailaabdelsalam1919@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "محمد شوقى احمد", status: "أنتداب", jobTitle: "كاتب", phone: "01127666953", nationalId: "28106052500433", address: "المعصرة - حلوان - القاهرة", code: "16912", email: "mohamedshauki81@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "ذكر" },
  { name: "محمود محمد احمد حسن", status: "تعديل تكليف", jobTitle: "فني تسجيل طبي واحصاء", phone: "01123341342", nationalId: "30103291400599", address: "ابوالغيط - القناطر الخيرية - القلوبية", code: "90522", email: "bmm24000@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "مصطفى رمضان عبد الحكيم", status: "قوة أساسية", jobTitle: "فني تسجيل طبي واحصاء", phone: "01022095965", nationalId: "29703152101112", residence: "قرية الصف - الصف - الجيزة", address: "قرية الصف - الصف - الجيزة", code: "15989", email: "mostafa.ramadan1072@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 21, casualLeave: 7, gender: "ذكر" },
  { name: "معتز فتحى مختار", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01001505648", nationalId: "26603010105751", address: "11 ش علي ابراهيم الحلمية الجديدة - الدرب الاحمر - القاهرة", code: "4723", email: "moataz_placeholder@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 45, casualLeave: 7, gender: "ذكر" },
  { name: "مها محب", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01066716968", nationalId: "28611130103507", address: "5 ش عمربن الخطاب - ح زكي عبدالعاطي - عين شمس - القاهرة", code: "5033", email: "mohanabih86@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "ندى جمال على", status: "قوة أساسية", jobTitle: "كاتب", phone: "01157466679", nationalId: "29403290102983", address: "43 ش الرضوان - الفردوس - الجيزة", code: "9190", email: "nada96001@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 30, casualLeave: 7, gender: "انثى" },
  { name: "هالة احمد سلطان", status: "قوة أساسية", jobTitle: "اخصائى اول خدمة اجتماعية", phone: "01095654581", nationalId: "27105140102146", address: "الحي الثالث - المجاورة الرابعة - بدر - القاهرة", code: "5035", email: "halaahmed126y@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 45, casualLeave: 7, gender: "انثى" },
  { name: "هدى احمد محمد", status: "إعارة", jobTitle: "اخصائي اول تمويل ومحاسبة", phone: "01063969259", nationalId: "26512211303726", address: "الف مسكن - جسر السويس - القاهرة", code: "11298", email: "hoda_placeholder@gmail.com", startDate: "", assignmentStatus: "", annualLeave: 45, casualLeave: 7, gender: "انثى" }
];

export const ROLE_CAPABILITIES: Record<UserRole, UserCapabilities> = {
  "Admin": { 
    ...DEFAULT_CAPABILITIES,
    showHotlineSection: true, showAdminSection: true, showSettingsSection: true,
    canViewDashboard: true, canRegisterHotline: true, canSearchHotline: true, canFollowUpHotline: true,
    canRegisterAdminWork: true, canRegisterOngoing: true, canRegisterWrongDirection: true, canRegisterUnregistered: true,
    canViewDirectorAssignments: true, canViewSchedules: true, canViewReports: true,
    canEditAny: true, canApproveSwaps: true, canManageUsers: true
  },
  "Supervisor": { 
    ...DEFAULT_CAPABILITIES,
    showHotlineSection: true, showAdminSection: true,
    canViewDashboard: true, canRegisterHotline: true, canSearchHotline: true,
    canRegisterAdminWork: true, canRegisterOngoing: true, canRegisterWrongDirection: true, canRegisterUnregistered: true,
    canViewDirectorAssignments: true, canViewSchedules: true,
    canEditAny: true, canApproveSwaps: true
  }, 
  "Employee": { 
    ...DEFAULT_CAPABILITIES,
    showHotlineSection: true,
    canViewDashboard: true, canRegisterHotline: true, canSearchHotline: true,
    canViewSchedules: true
  },
  "FollowUpSpecialist": { 
    ...DEFAULT_CAPABILITIES,
    showHotlineSection: true,
    canViewDashboard: true, canRegisterHotline: true, canSearchHotline: true, canFollowUpHotline: true,
    canViewSchedules: true, canViewReports: true,
    canEditAny: true
  },
  "AdminOnly": { 
    ...DEFAULT_CAPABILITIES,
    showAdminSection: true,
    canRegisterAdminWork: true, canRegisterOngoing: true, canRegisterWrongDirection: true, canRegisterUnregistered: true,
    canViewDirectorAssignments: true, canViewSchedules: true, canViewReports: true
  },
  "HotlineAndLimitedAdmin": { 
    ...DEFAULT_CAPABILITIES,
    showHotlineSection: true, showAdminSection: true,
    canViewDashboard: true, canRegisterHotline: true, canSearchHotline: true,
    canRegisterAdminWork: true, canRegisterOngoing: true, canViewSchedules: true
  },
  "Guest": { 
    ...DEFAULT_CAPABILITIES,
    showHelpCenterSection: false, canViewInquiry: false, canViewPhonebook: false, canViewFAQ: false
  }
};
