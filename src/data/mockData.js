// 14 قسم رئيسي شاملاً المفروشات، الحيوانات، والمصوغات الذهبية
export const CATEGORIES = [
  { id: 'real_estate', name: 'عقارات', icon: 'Home', emoji: '🏠', color: '#1877F2' },
  { id: 'cars', name: 'سيارات', icon: 'Car', emoji: '🚗', color: '#E41E3F' },
  { id: 'motorcycles', name: 'دراجات', icon: 'Bike', emoji: '🏍️', color: '#F59E0B' },
  { id: 'electrical', name: 'أجهزة كهربائية', icon: 'Zap', emoji: '⚡', color: '#10B981' },
  { id: 'electronics', name: 'أجهزة إلكترونية', icon: 'Smartphone', emoji: '📱', color: '#8B5CF6' },
  { id: 'furnishings', name: 'المفروشات', icon: 'Bed', emoji: '🛋️', color: '#10B981' },
  { id: 'animals', name: 'الحيوانات', icon: 'Dog', emoji: '🐕', color: '#F59E0B' },
  { id: 'gold_jewelry', name: 'المصوغات الذهبية', icon: 'Gem', emoji: '💎', color: '#EAB308' },
  { id: 'construction', name: 'مواد بناء', icon: 'Hammer', emoji: '🏗️', color: '#6B7280' },
  { id: 'craftsmen', name: 'حرفيين', icon: 'Wrench', emoji: '🛠️', color: '#EC4899' },
  { id: 'clothing', name: 'ملابس', icon: 'ShoppingBag', emoji: '👕', color: '#06B6D4' },
  { id: 'cosmetics', name: 'كوزمتك', icon: 'Sparkles', emoji: '✨', color: '#F43F5E' },
  { id: 'furniture', name: 'أثاث', icon: 'Armchair', emoji: '🪑', color: '#84CC16' },
  { id: 'food', name: 'مواد غذائية', icon: 'Utensils', emoji: '🍕', color: '#D97706' },
  { id: 'other', name: 'أخرى', icon: 'MoreHorizontal', emoji: '📦', color: '#64748B' },
];

export const GOVERNORATES = [
  'بغداد',
  'البصرة',
  'أربيل',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'نينوى',
  'كركوك',
  'السليمانية',
  'دهوك',
  'بابل',
  'ذي قار',
  'ديالى',
  'الأنبار',
  'القادسية',
  'صلاح الدين',
  'ميسان',
  'المثنى',
  'واسط'
];

// صورة افتراضية SVG للمستخدمين - مجانية وخالية من حقوق الملكية
const makeAvatar = (name, bg = '1877F2', fg = 'ffffff') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${fg}&size=200&bold=true&font-size=0.4`;

// استخدام encodeURIComponent بدلاً من btoa لدعم UTF-8 بالكامل
const makeSvgUrl = (svgStr) =>
  `data:image/svg+xml,${encodeURIComponent(svgStr)}`;

const DEFAULT_COVER = makeSvgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1877F2"/><stop offset="50%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/><text x="600" y="220" text-anchor="middle" fill="white" font-size="42" font-family="Arial" opacity="0.35">Global Market IQ</text></svg>`
);

const OWNER_COVER = makeSvgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f0c29"/><stop offset="50%" stop-color="#302b63"/><stop offset="100%" stop-color="#24243e"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/><text x="600" y="220" text-anchor="middle" fill="white" font-size="42" font-family="Arial" opacity="0.4">Admin Dashboard</text></svg>`
);

// ─── مستخدم الضيف الافتراضي — لا يحتوي على أي بيانات شخصية حقيقية ───
// هذا الكائن يُعرض فقط للزوار غير المسجّلين (placeholder فارغ)
export const INITIAL_USER = {
  id: null,         // null = غير مسجّل
  name: 'زائر',
  avatar: makeAvatar('زائر', '94A3B8', 'ffffff'),
  cover: DEFAULT_COVER,
  governorate: '',
  area: '',
  birthDate: '',
  education: '',
  phone: '',
  gender: '',
  bio: '',
  role: 'GUEST',
  joinedDate: '',
};


export const MOCK_APP_OWNER = {
  id: 'app_owner_admin',
  name: 'مالك التطبيق (إدارة)',
  avatar: makeAvatar('مالك التطبيق', '1877F2', 'ffffff'),
  cover: OWNER_COVER,
  governorate: 'بغداد',
  area: 'الكرادة',
  birthDate: '1988-03-20',
  education: 'ماجستير إدارة أعمال',
  phone: '07800000000',
  gender: 'ذكر',
  bio: 'الحساب الرسمي لمالك التطبيق والمسؤول العام عن كافة العمليات.',
  role: 'APP_OWNER',
  joinedDate: '2022-01-01',
};

export const INITIAL_LISTINGS = [];
/*
    title: 'فيلا مودرن للبيع في الجادرية',
    description: 'فيلا فاخرة بمساحة 400 متر مربع، تشطيب سوبر ديلوكس، تحتوي على 5 غرف نوم، كراج يتسع لـ 3 سيارات، ومسبح خاص.',
    price: 350000,
    currency: 'USD',
    category: 'عقارات',
    governorate: 'بغداد',
    area: 'الجادرية',
    nearestLandmark: 'قرب جامعة بغداد - المجمع العلمي',
    phone: '07701234567',
    condition: 'جديد',
    status: 'active',
    likesCount: 24,
    likedBy: ['user_200'],
    userId: 'user_101',
    userName: 'علي الفراتي',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-20T10:30:00Z',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_2',
    title: 'مرسيدس E300 موديل 2023 مكفولة',
    description: 'سيارة مرسيدس بنز E300 وارد ألماني، ماشية 15 ألف كم فقط، فول مواصفات 1/1، بانوراما، كاميرات 360.',
    price: 48000,
    currency: 'USD',
    category: 'سيارات',
    governorate: 'أربيل',
    area: 'عينكاوا',
    nearestLandmark: 'مقابل مجدي مول',
    phone: '07509876543',
    condition: 'مستخدم',
    status: 'active',
    likesCount: 57,
    likedBy: [],
    userId: 'user_202',
    userName: 'أحمد الكردي',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-21T14:15:00Z',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_3',
    title: 'آيفون 15 بروماكس 512 جيجا بايت',
    description: 'جهاز آيفون 15 بروماكس لون تيتانيوم طبيعي، نسبة البطارية 99%، ناصع ونظيف جداً مع كافة ملحقاته الكارتونة الأصلية.',
    price: 1650000,
    currency: 'IQD',
    category: 'أجهزة إلكترونية',
    governorate: 'النجف الأشرف',
    area: 'شارع الروان',
    nearestLandmark: 'قرب مجمع الكفيل التجاري',
    phone: '07801122334',
    condition: 'مستخدم',
    status: 'active',
    likesCount: 19,
    likedBy: [],
    userId: 'user_101',
    userName: 'علي الفراتي',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-22T08:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1695048133021-39efbc67664e?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_4',
    title: 'دراجة نارية ياماها R6 سبورت',
    description: 'دراجة رياضية ياماها R6 محرك 600cc بحالة ممتازة، ششة ديجيتال، عوادم أكربوفيك أصلية.',
    price: 6500,
    currency: 'USD',
    category: 'دراجات',
    governorate: 'البصرة',
    area: 'الجزائر',
    nearestLandmark: 'قرب مستشفى الموسوي',
    phone: '07718889900',
    condition: 'مستخدم',
    status: 'active',
    likesCount: 42,
    likedBy: [],
    userId: 'user_203',
    userName: 'حسين البصري',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-19T18:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_5',
    title: 'ثلاجة LG إنفرتر 24 قدم إيكونوميك',
    description: 'ثلاجة إل جي حديثة موفرة للطاقة 60% مع ضمان لمدة 10 سنوات على المكبس، لون سيلفر ستانلس ستيل.',
    price: 950000,
    currency: 'IQD',
    category: 'أجهزة كهربائية',
    governorate: 'بغداد',
    area: 'الكرادة',
    nearestLandmark: 'ساحة الواثق',
    phone: '07705554433',
    condition: 'جديد',
    status: 'active',
    likesCount: 15,
    likedBy: [],
    userId: 'user_204',
    userName: 'معرض الأمانة للأجهزة',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-21T09:20:00Z',
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_6',
    title: 'وجبة طابوق أحمر عالي الجودة ومواد بناء',
    description: 'يتوفر لدينا طابوق أحمر فخاري مفرغ ومصمت مقاوم للرطوبة والعوامل الجوية مع التوصيل لكافة المحافظات.',
    price: 180000,
    currency: 'IQD',
    category: 'مواد بناء',
    governorate: 'بابل',
    area: 'الحلة - الصناعية',
    nearestLandmark: 'قرب جسر الثورة',
    phone: '07812341234',
    condition: 'جديد',
    status: 'active',
    likesCount: 9,
    likedBy: [],
    userId: 'user_205',
    userName: 'شركة البابلية للمقاولات',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-18T11:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_7',
    title: 'خدمات كهربائي منازل وتأسيسات حديثة',
    description: 'خبير كهربائيات وتأسيس منازل بالكامل باستخدام أحدث المنظومات الذكية وربط كاميرات المراقبة والانتركم.',
    price: 50000,
    currency: 'IQD',
    category: 'حرفيين',
    governorate: 'كربلاء المقدسة',
    area: 'حي الحسين',
    nearestLandmark: 'مقابل مدرسة الإخاء',
    phone: '07709990011',
    condition: 'جديد',
    status: 'active',
    likesCount: 31,
    likedBy: [],
    userId: 'user_206',
    userName: 'الأسطى أبو فهد',
    userAvatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-17T16:45:00Z',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_8',
    title: 'طقم قاط رجالي إيطالي رسمي فاخر',
    description: 'بدلة رجالية رسمية تصميم إيطالي راقي، قماش صوف ناعم متوفر بألوان كحلي وأسود ورصاصي لكافة المقاسات.',
    price: 120000,
    currency: 'IQD',
    category: 'ملابس',
    governorate: 'بغداد',
    area: 'زيونة',
    nearestLandmark: 'مول زيونة - الطابق الثاني',
    phone: '07712223344',
    condition: 'جديد',
    status: 'active',
    likesCount: 28,
    likedBy: [],
    userId: 'user_207',
    userName: 'بوتيك الأناقة',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-22T11:20:00Z',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_9',
    title: 'مجموعة عناية بالبشرة وكوزمتك فرنسية أصلية',
    description: 'باكج عناية متكامل يشمل سيروم هيلارونيك أسيد، كريم مرطب يومي، وواقي شمس 50+ ماركة أصلية 100%.',
    price: 75000,
    currency: 'IQD',
    category: 'كوزمتك',
    governorate: 'أربيل',
    area: 'الإسكان',
    nearestLandmark: 'قرب صيدلية فارما',
    phone: '07501112233',
    condition: 'جديد',
    status: 'active',
    likesCount: 64,
    likedBy: [],
    userId: 'user_208',
    userName: 'روز كوزمتكس',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-21T20:10:00Z',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_10',
    title: 'قنفة (أريكة) تركية حديثة تتسع لـ 8 أشخاص',
    description: 'أثاث صالة استقبال راقي، قماش مخمل مقاوم للبقع، هيكل خشب زان عالي التحمل مع 6 وسائد إضافية.',
    price: 1250000,
    currency: 'IQD',
    category: 'أثاث',
    governorate: 'بغداد',
    area: 'شارع فلسطين',
    nearestLandmark: 'قرب النادي العربي',
    phone: '07707778899',
    condition: 'جديد',
    status: 'active',
    likesCount: 39,
    likedBy: [],
    userId: 'user_101',
    userName: 'علي الفراتي',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-16T15:30:00Z',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_11',
    title: 'عسل سدر طبيعي 100% مناحل أصلية',
    description: 'عسل سدر طبيعي مفحوص مختبرياً، خالي من أي إضافات سكرية، طعم فاخر وفائدة صحية مضمونة.',
    price: 45000,
    currency: 'IQD',
    category: 'مواد غذائية',
    governorate: 'النجف الأشرف',
    area: 'حي الأكيدر',
    nearestLandmark: 'مقابل أسواق الخير',
    phone: '07804445566',
    condition: 'جديد',
    status: 'active',
    likesCount: 51,
    likedBy: [],
    userId: 'user_209',
    userName: 'مناحل الشفاء',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-20T17:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_12',
    title: 'طقم مفارش وأغطية سرير ملكية فاخرة',
    description: 'طقم مفارش 8 قطع قماش قطن عالي الجودة، مطرز بتصميم ملكي فاخر ومريح للغاية.',
    price: 185000,
    currency: 'IQD',
    category: 'المفروشات',
    governorate: 'بغداد',
    area: 'الكرادة',
    nearestLandmark: 'ساحة الواثق',
    phone: '07701122334',
    condition: 'جديد',
    status: 'active',
    likesCount: 24,
    likedBy: [],
    userId: 'user_210',
    userName: 'معرض قصر المفروشات',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-24T14:20:00Z',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_13',
    title: 'قطط هيمالايا بيور أليفة مطعمة بالكامل',
    description: 'قطط هيمالايا بلو بوينت بعمر شهرين، لعوبة وأليفة جداً مع دفتر اللقاحات الكامل والاهتمام.',
    price: 350000,
    currency: 'IQD',
    category: 'الحيوانات',
    governorate: 'أربيل',
    area: 'عنكاوا',
    nearestLandmark: 'قرب كنيسة مار يوحنا',
    phone: '07509988776',
    condition: 'جديد',
    status: 'active',
    likesCount: 42,
    likedBy: [],
    userId: 'user_211',
    userName: 'مركز أربيل للحيوانات الأليفة',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-24T18:10:00Z',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'list_14',
    title: 'قلادة ومحابس ذهب عيار 21 خليجي فاخر',
    description: 'مصوغات ذهبية عيار 21 نقش خليجي راقي، يتوفر مع وصل الشراء الرسمي وضمان الفحص والصياغة.',
    price: 2450000,
    currency: 'IQD',
    category: 'المصوغات الذهبية',
    governorate: 'النجف الأشرف',
    area: 'السوق الكبير',
    nearestLandmark: 'سوق الصاغة',
    phone: '07802233445',
    condition: 'جديد',
    status: 'active',
    likesCount: 88,
    likedBy: [],
    userId: 'user_212',
    userName: 'صياغة وجواهر النجف',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-07-25T10:00:00Z',
    ]
  }
];
*/
