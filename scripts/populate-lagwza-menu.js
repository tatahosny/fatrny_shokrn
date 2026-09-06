const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

const RESTAURANT_ID = 'rest-1788726611709';
const RESTAURANT_NAME = 'لغوصة';

// 1. تعريف الأقسام المطلوبة
const CATEGORIES = [
  {
    id: 'cat-mix-hadek',
    name: 'ميكس حادق',
    slug: 'mix-hadek',
    icon: 'sandwich',
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'cat-mix-helw',
    name: 'ميكس حلو',
    slug: 'mix-helw',
    icon: 'cake',
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'cat-boxes',
    name: 'البوكسات',
    slug: 'boxes',
    icon: 'package',
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'cat-strips-meals',
    name: 'وجبات استربس',
    slug: 'strips-meals',
    icon: 'drumstick',
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'cat-meals',
    name: 'الوجبات',
    slug: 'meals',
    icon: 'utensils',
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'cat-mac-and-cheese',
    name: 'Mac & Cheese',
    slug: 'mac-cheese',
    icon: 'soup',
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'cat-loaded-fries',
    name: 'Loaded Fries',
    slug: 'loaded-fries',
    icon: 'flame',
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'cat-additions',
    name: 'الإضافات',
    slug: 'additions',
    icon: 'sparkles',
    image: '/images/batates-souri.jpg',
  },
];

// 2. تعريف جميع أصناف منيو مطعم لغوصة
const FOOD_ITEMS = [
  // ==================== 1. ميكس حادق ====================
  {
    id: 'food-lg-batates-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'بطاطس (فينو)',
    description: 'سندوتش بطاطس مقلية مقرمشة في خبز فينو طازج مع بهارات لغوصة الخاصة',
    price: 25,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-batates-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'بطاطس ملفوف (سوري)',
    description: 'سندوتش بطاطس مقلية في عيش سوري ملفوف ومحمص على الجريل مع صوص وتوابل',
    price: 40,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-batates-motz-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'بطاطس موتزاريلا (فينو)',
    description: 'سندوتش بطاطس مقلية مع جبنة موتزاريلا سايحة ومطاطية في خبز فينو',
    price: 35,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-batates-motz-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'بطاطس موتزاريلا ملفوف (سوري)',
    description: 'سندوتش بطاطس غرقانة موتزاريلا سايحة في عيش سوري ملفوف على الجريل',
    price: 50,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-gebna-makleya-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'جبنة مقلية (فينو)',
    description: 'أصابع جبنة مقلية مقرمشة وذهبية من الخارج وسايحة من الداخل في خبز فينو',
    price: 25,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-gebna-makleya-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'جبنة مقلية ملفوف (سوري)',
    description: 'جبنة مقلية كرسبي غنية في خبز سوري ملفوف ومحمص شهي ولذيذ',
    price: 55,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-fajita-chicken-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'فاهيتا فراخ (فينو)',
    description: 'صدور دجاج متبلة ومشوحة مع فلفل ألوان وبصل وتتبيلة الفاهيتا في خبز فينو',
    price: 40,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-fajita-chicken-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'فاهيتا فراخ ملفوف (سوري)',
    description: 'فاهيتا فراخ غنية بخلطة الخضار والصوص في خبز سوري ملفوف ومقرمش',
    price: 70,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-sodok-khelta-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'سدق خلطة (فينو)',
    description: 'سجق إسكندراني بلدي بالخلطة السحرية والفلفل والطماطم في خبز فينو',
    price: 35,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-sodok-khelta-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'سدق خلطة ملفوف (سوري)',
    description: 'سجق بالخلطة الإسكندراني والتوابل الشرقية في خبز سوري ملفوف محمص',
    price: 80,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-mexican-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'مكسيكي (فينو)',
    description: 'سندوتش بالخلطة المكسيكية السبايسي اللذيذة في خبز فينو',
    price: 35,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-mexican-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'مكسيكي ملفوف (سوري)',
    description: 'سندوتش مكسيكي سبايسي غني بالصوصات في خبز سوري ملفوف',
    price: 55,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-zinger-soury',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'زنجر ملفوف (سوري)',
    description: 'قطع دجاج زنجر مقرمش سبايسي مع الصوصات والجبنة في خبز سوري ملفوف فقط',
    price: 85,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-hotdog-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'هوت دوج (فينو)',
    description: 'هوت دوج مشوي مع صوصات مستردة وكاتشب ومايونيز في خبز فينو فقط',
    price: 45,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-lahma-basal-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'لحمة بصل (فينو)',
    description: 'لحمة متبلة ومتشوحة مع بصل مكرمل وتوابل لغوصة الخاصة في خبز فينو',
    price: 45,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-gambary-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'جمبري (فينو)',
    description: 'جمبري مقلي مقرمش مع صوص التارتار والطحينة والليمون في خبز فينو',
    price: 55,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-kofta-dawood-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'كفتة داوود (فينو)',
    description: 'كرات كفتة داوود باشا بتتبيلتها اللذيذة وصوصها الشهي في خبز فينو',
    price: 40,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-kiri-pastrami-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'كيري بسطرمة (فينو)',
    description: 'جبنة كيري كريمية غنية مع قطع بسطرمة بلدي في خبز فينو',
    price: 20,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-moshakal-geban-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'مشكل جبن (فينو)',
    description: 'ميكس أجبان مشكلة لذيذة وسايحة في خبز فينو',
    price: 25,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-fajita-luncheon-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'فاهيتا لانشون (فينو)',
    description: 'لانشون متبل ومتشوح بتتبيلة الفاهيتا والخضار في خبز فينو',
    price: 20,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-luncheon-turkey-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'لانشون تركي (فينو)',
    description: 'لانشون مع جبنة تركي (رومي) مبشورة ولذيذة في خبز فينو',
    price: 25,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-pastrami-turkey-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'بسطرمة تركي (فينو)',
    description: 'بسطرمة بلدي مع جبنة تركي (رومي) سايحة في خبز فينو',
    price: 30,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-egg-pastrami-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'بيض بالبسطرمة (فينو)',
    description: 'أومليت بيض طازج مع قطع البسطرمة البلدي بالزبدة في خبز فينو',
    price: 25,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-kiri-sosis-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'كيري سوسيس (فينو)',
    description: 'جبنة كيري كريمية مع قطع السوسيس اللذيذة في خبز فينو',
    price: 20,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-tuna-fino',
    categoryId: 'cat-mix-hadek',
    categoryName: 'ميكس حادق',
    name: 'تونة (فينو)',
    description: 'تونة قطع متبلة بالليمون والبهارات والخضار الطازج في خبز فينو',
    price: 30,
    image: '/images/sandwich-falafel.jpg',
  },

  // ==================== 2. ميكس حلو ====================
  {
    id: 'food-lg-krema-chocolate',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'كريمة شيكولاتة',
    description: 'سندوتش كريمة ناعمة مع صوص الشيكولاتة الفاخر (إضافات: شيكولاتة +15ج، سوداني +5ج)',
    price: 20,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-krema-oreo-chocolate',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'كريمة أوريو شيكولاتة',
    description: 'كريمة غنية مع بسكويت أوريو مكسر وصوص شيكولاتة نوتيلا اللذيذ',
    price: 25,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-moro-lotus',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'مورو / لوتس',
    description: 'سندوتش زبدة اللوتس وبسكويت اللوتس المقرمش أو شوكولاتة مورو اللذيذة',
    price: 25,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-kinder',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'كيندر',
    description: 'سندوتش شوكولاتة كيندر وبوينو بالكريمة والحليب الأصلية',
    price: 30,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-pistachio',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'بيستاشيو (فستق)',
    description: 'سندوتش زبدة البيستاشيو الفاخرة مع الكريمة والمكسرات',
    price: 35,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-saklans',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'سكلانس',
    description: 'سكلانس إسكندراني أصيل: حلاوة طحينية + قشطة بلدي + عسل نحل + مربى',
    price: 35,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-laghwasa-plus',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'لغوصة بلس',
    description: 'سندوتش سبيشيال بلص غرقان شيكولاتة وكريمة ومكسرات وتوبينج مشكل',
    price: 55,
    image: '/images/lagwza.jpg',
  },
  {
    id: 'food-lg-f16',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'F-16',
    description: 'صاروخ الحلاوة والطاقة: ميكس صوصات شيكولاتة وقشطة وحلاوة وبسكويت',
    price: 45,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-freska',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'فريسكا',
    description: 'فريسكا مقرمشة محشية عسل ومكسرات وشيكولاتة على الطريقة الإسكندراني',
    price: 20,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-freska-laghwasa',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'فريسكا لغوصة',
    description: 'فريسكا لغوصة المحملة بطبقات الشيكولاتة والمكسرات وصوص الكيندر واللوتس',
    price: 35,
    image: '/images/lagwza.jpg',
  },
  {
    id: 'food-lg-waffle-2pcs',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'وافل (2 قطعة)',
    description: 'قطعتين وافل مقرمش وذهبي محلى بالصوصات الفاخرة وشيكولاتة نوتيلا',
    price: 40,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-waffle-fourseasons',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'وافل فورسيزون',
    description: 'وافل مقسم 4 أقسام بأربع صوصات ونكهات متنوعة (نوتيلا، لوتس، كيندر، بيستاشيو)',
    price: 70,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-mini-pancake-6',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: '6 ميني بان كيك',
    description: '6 قطع ميني بان كيك هشة وطرية مغطاة بصوص الشوكولاتة اللذيذ',
    price: 35,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-mini-pancake-12',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: '12 ميني بان كيك',
    description: '12 قطعة ميني بان كيك محلاة بتشكيلة صوصات وتوبينج غني',
    price: 60,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-laghwasa-boom',
    categoryId: 'cat-mix-helw',
    categoryName: 'ميكس حلو',
    name: 'لغوصة بوم',
    description: 'قنبلة الحلويات الكبرى: تشكيلة بان كيك ووافل وصوصات غرقانة شوكولاتة ومكسرات فاخرة',
    price: 100,
    image: '/images/lagwza.jpg',
  },

  // ==================== 3. البوكسات ====================
  {
    id: 'food-lg-box-fetar',
    categoryId: 'cat-boxes',
    categoryName: 'البوكسات',
    name: 'بوكس الفطار',
    description: '2 سندوتش بيض بالبسطرمة + 1 سندوتش كيري بسطرمة + 1 سندوتش فاهيتا لانشون',
    price: 75,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-box-mezag',
    categoryId: 'cat-boxes',
    categoryName: 'البوكسات',
    name: 'بوكس المزاج',
    description: '2 سندوتش بطاطس مقلية + 2 سندوتش سدق بالخلطة الإسكندراني',
    price: 100,
    image: '/images/batates-souri.jpg',
  },

  // ==================== 4. وجبات استربس ====================
  {
    id: 'food-lg-meal-strips-3',
    categoryId: 'cat-strips-meals',
    categoryName: 'وجبات استربس',
    name: 'وجبة استربس 3 قطع',
    description: '3 قطع استربس دجاج كرسبي مقرمش + بطاطس فرايز + سلطة كولسلو + عيش طازج',
    price: 115,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-meal-strips-6',
    categoryId: 'cat-strips-meals',
    categoryName: 'وجبات استربس',
    name: 'وجبة استربس 6 قطع',
    description: '6 قطع استربس دجاج مقرمش + بطاطس فرايز + سلطة كولسلو + 2 عيش',
    price: 195,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-meal-strips-9',
    categoryId: 'cat-strips-meals',
    categoryName: 'وجبات استربس',
    name: 'وجبة استربس 9 قطع',
    description: '9 قطع استربس دجاج مقرمش + 2 بطاطس فرايز + 2 سلطة كولسلو + عيش',
    price: 280,
    image: '/images/sandwich-falafel.jpg',
  },

  // ==================== 5. الوجبات ====================
  {
    id: 'food-lg-meal-grilled-chicken',
    categoryId: 'cat-meals',
    categoryName: 'الوجبات',
    name: 'وجبة دجاج مشوي',
    description: '2 قطعة فيليه دجاج مشوي على الجريل + أرز بسمتي + بطاطس + تومية + عيش + مخلل',
    price: 130,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-meal-strips-rice',
    categoryId: 'cat-meals',
    categoryName: 'الوجبات',
    name: 'وجبة استربس (بالأرز)',
    description: '3 قطع استربس دجاج مقرمش + أرز بسمتي + بطاطس + كولسلو + تومية + عيش',
    price: 140,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-meal-shrimp',
    categoryId: 'cat-meals',
    categoryName: 'الوجبات',
    name: 'وجبة جمبري',
    description: '120 جرام جمبري مقلي كرسبي + أرز بسمتي + بطاطس + كولسلو + صوص التارتار + عيش',
    price: 200,
    image: '/images/sandwich-falafel.jpg',
  },

  // ==================== 6. Mac & Cheese ====================
  {
    id: 'food-lg-mac-original',
    categoryId: 'cat-mac-and-cheese',
    categoryName: 'Mac & Cheese',
    name: 'Original Mac & Cheese',
    description: 'مكرونة بصوص الجبنة الشيدر والموتزاريلا الكريمي الغني الكلاسيكي السايح',
    price: 45,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-mac-mexican',
    categoryId: 'cat-mac-and-cheese',
    categoryName: 'Mac & Cheese',
    name: 'Mexican Mac & Cheese',
    description: 'ماك آند تشيز بصوص الجبن مع الخلطة المكسيكية السبايسي وفلفل هالبينو',
    price: 85,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-mac-strips',
    categoryId: 'cat-mac-and-cheese',
    categoryName: 'Mac & Cheese',
    name: 'Strips Mac & Cheese',
    description: 'ماك آند تشيز مغطاة بقطع استربس دجاج مقرمشة وذهبية وصوص الجبن اللذيذ',
    price: 110,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-mac-smash',
    categoryId: 'cat-mac-and-cheese',
    categoryName: 'Mac & Cheese',
    name: 'Smash Mac & Cheese',
    description: 'ماك آند تشيز مع قطع لحم برجر سماش مشوي على الجريل مع صوصات خاصة',
    price: 115,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-lg-mac-shrimp',
    categoryId: 'cat-mac-and-cheese',
    categoryName: 'Mac & Cheese',
    name: 'Shrimp Mac & Cheese',
    description: 'ماك آند تشيز فاخرة مغطاة بقطع الجمبري المقلي المقرمش وصوص الجبن الكريمي',
    price: 160,
    image: '/images/gebna-tomatem.jpg',
  },

  // ==================== 7. Loaded Fries ====================
  {
    id: 'food-lg-fries-cheesy',
    categoryId: 'cat-loaded-fries',
    categoryName: 'Loaded Fries',
    name: 'Fries Cheesy',
    description: 'بطاطس مقلية ذهبية ومقرمشة غرقانة بصوص الجبنة الشيدر والموتزاريلا السايحة',
    price: 45,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-fries-mexican',
    categoryId: 'cat-loaded-fries',
    categoryName: 'Loaded Fries',
    name: 'Mexican Fries',
    description: 'لوديد فرايز بالخلطة المكسيكية السبايسي وصوص الجبن وهالبينو',
    price: 75,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-fries-strips',
    categoryId: 'cat-loaded-fries',
    categoryName: 'Loaded Fries',
    name: 'Strips Fries',
    description: 'لوديد فرايز محملة بقطع استربس دجاج كرسبي مع صوص الشيدر والرانش',
    price: 90,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-fries-smash',
    categoryId: 'cat-loaded-fries',
    categoryName: 'Loaded Fries',
    name: 'Smash Fries',
    description: 'لوديد فرايز مغطاة بقطع برجر سماش وصوصات لغوصة الخاصة والجبنة السايحة',
    price: 100,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-fries-tnt-strips',
    categoryId: 'cat-loaded-fries',
    categoryName: 'Loaded Fries',
    name: 'TNT Strips Fries',
    description: 'قنبلة تي إن تي: بطاطس محملة بقطع استربس مقرمش وصوص حار متفجر ولذيذ',
    price: 135,
    image: '/images/batates-souri.jpg',
  },

  // ==================== 8. الإضافات ====================
  {
    id: 'food-lg-extra-fries',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Fries (بطاطس مقلية)',
    description: 'باكت بطاطس مقلية ذهبية ومقرمشة ومبهرة',
    price: 35,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-extra-sauce',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Sauce (صوص إضافي مع اختيار النوع)',
    description: 'صوص إضافي من اختيارك: تومية، صوص جبنة شيدر، باربيكيو، رانش، تي إن تي، سويت تشيلي',
    price: 20,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-extra-rice',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Rice (طبق أرز مبهر)',
    description: 'طبق أرز بسمتي فاخر ومبهر بالخلطة اللذيذة',
    price: 30,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-extra-onion-rings',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Onion Rings - Sticks',
    description: 'حلقات بصل مقلية مقرمشة أو أصابع موتزاريلا كرسبي',
    price: 25,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-extra-chicken-rizo',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Chicken Rizo (ريزو دجاج)',
    description: 'طبق أرز ريزو مبهر مع قطع دجاج مقرمشة وصوص باربيكيو مميز',
    price: 90,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-extra-shrimp-rizo',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Shrimp Rizo (ريزو جمبري)',
    description: 'طبق أرز ريزو مبهر مع قطع جمبري كرسبي مقلي وصوص ريزو فاخر',
    price: 125,
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'food-lg-extra-coleslaw',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Coleslaw (كولسلو)',
    description: 'سلطة كولسلو طازجة بالكرنب والجزر مع دريسنج مايونيز كريمي',
    price: 25,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-lg-extra-brioche',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'Brioche (خبز بريوش)',
    description: 'قطعة خبز بريوش زبداني طري وطازج',
    price: 15,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-lg-extra-chocolate-sweet',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'إضافة صوص شوكولاتة (إضافات الحلو)',
    description: 'صوص شوكولاتة إضافي غني على أي صنف حلو',
    price: 15,
    image: '/images/feteer-meshaltet.jpg',
  },
  {
    id: 'food-lg-extra-peanuts-sweet',
    categoryId: 'cat-additions',
    categoryName: 'الإضافات',
    name: 'إضافة سوداني مجروش (إضافات الحلو)',
    description: 'سوداني محمص ومجروش إضافة زيادة على أي صنف حلو',
    price: 5,
    image: '/images/feteer-meshaltet.jpg',
  },
];

async function seed() {
  console.log('--- بدء إدخال أقسام ومنيو مطعم لغوصة في قاعدة بيانات Neon ---');

  // 1. التحقق من وجود المطعم أو إنشاؤه
  const checkRest = await pool.query('SELECT id, name FROM restaurants WHERE id = $1', [RESTAURANT_ID]);
  if (checkRest.rows.length === 0) {
    console.log('إنشاء مطعم لغوصة...');
    await pool.query(
      `INSERT INTO restaurants (id, name, slug, image, phone, description, address, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        RESTAURANT_ID,
        RESTAURANT_NAME,
        'laghwasa',
        '/images/lagwza.jpg',
        '01555973626',
        'حلو وحادق وبرجر ووجبات سريعة وماك آند تشيز',
        'الواحة برج العرب',
        true,
      ]
    );
  } else {
    console.log(`مطعم ${RESTAURANT_NAME} موجود بالفعل.`);
  }

  // 2. إدخال وتحديث الأقسام (Categories)
  console.log('إدخال الأقسام...');
  for (const cat of CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (id, name, slug, icon, image)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         icon = EXCLUDED.icon,
         image = EXCLUDED.image`,
      [cat.id, cat.name, cat.slug, cat.icon, cat.image]
    );
  }
  console.log(`[نجاح] تم التأكد من وجود ${CATEGORIES.length} أقسام.`);

  // 3. حذف أي عناصر قديمة خاصة بمطعم لغوصة لمنع التكرار
  await pool.query('DELETE FROM food_items WHERE restaurant_id = $1', [RESTAURANT_ID]);
  console.log('تم تنظيف الأصناف القديمة لمطعم لغوصة.');

  // 4. إدخال الأصناف
  console.log(`جاري إدخال ${FOOD_ITEMS.length} صنفاً...`);
  for (const item of FOOD_ITEMS) {
    await pool.query(
      `INSERT INTO food_items (id, name, description, price, image, available, restaurant_id, restaurant_name, category_id, category_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        item.id,
        item.name,
        item.description,
        item.price,
        item.image,
        true,
        RESTAURANT_ID,
        RESTAURANT_NAME,
        item.categoryId,
        item.categoryName,
      ]
    );
  }

  console.log(`[نجاح] تم بنجاح إدخال جميع الأصناف البالغ عددها ${FOOD_ITEMS.length} صنف لمطعم لغوصة!`);

  // 5. التحقق وقراءة عدد الأصناف بعد الإدخال
  const countRes = await pool.query(
    'SELECT category_name, COUNT(*) as count FROM food_items WHERE restaurant_id = $1 GROUP BY category_name',
    [RESTAURANT_ID]
  );
  console.log('\nملخص الأصناف المدخلة حسب القسم:');
  console.table(countRes.rows);

  await pool.end();
}

seed().catch((err) => {
  console.error('فشل في إدخال بيانات منيو لغوصة:', err);
  process.exit(1);
});
