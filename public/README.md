# Football Results Site

موقع نتائج مباريات كرة القدم باستخدام API-Football مع Backend لحماية API Key.

## التشغيل محليًا

1. ثبّت Node.js 18 أو أحدث.
2. انسخ `.env.example` إلى `.env`.
3. ضع مفتاح API-Football داخل `.env`:
   `API_FOOTBALL_KEY=...`
4. شغّل:
   `npm install`
   ثم:
   `npm start`
5. افتح:
   `http://localhost:3000`

## لماذا يوجد Backend؟

لا تضع API Key داخل `public/app.js` أو `index.html`. الزائر يستطيع رؤية JavaScript في المتصفح، وبالتالي يمكنه استخراج المفتاح.

## حماية الخطة المجانية

المشروع يحتوي على:
- Cache للمباريات.
- Cache للمباريات المباشرة.
- عداد يومي للطلبات.
- ميزانية افتراضية 90 طلبًا يوميًا بدل استهلاك الـ100 كلها.

يمكن تعديل القيم في `.env`.

## API endpoints

- `GET /api/fixtures?date=YYYY-MM-DD`
- `GET /api/live`
- `GET /api/fixture/:id`
- `GET /api/quota`
- `GET /api/health`

## ملاحظة

الخطة المجانية مناسبة جدًا لاختبار المشروع وبناء النسخة الأولى. قبل فتح الموقع لعدد كبير من الزوار، نحتاج تحسين الكاش/قاعدة البيانات أو زيادة حصة API.
