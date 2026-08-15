/* Dark Arabic Console / Privacy page: transparent, plain-language policy for the current static app. */

export default function Privacy() {
  const homeUrl = import.meta.env.BASE_URL;
  return (
    <div className="dark-app" dir="rtl">
      <header className="dark-header"><a className="dark-brand" href={homeUrl} aria-label="GGUF Finder الرئيسية"><span className="dark-logo">↓</span><span><strong>GGUF</strong> Finder</span></a><span className="dark-header-note">سياسة الخصوصية</span></header>
      <main className="dark-policy">
        <a className="dark-back" href={homeUrl}>← رجوع للموقع</a>
        <p className="dark-eyebrow">Privacy Policy</p>
        <h1>سياسة الخصوصية</h1>
        <p className="dark-policy-lead">هاد السياسة كتشرح شنو كيدير GGUF Finder بالمعلومات ملي كتستعمل الموقع.</p>
        <div className="dark-policy-note"><strong>مهم قبل النشر:</strong> بدّل خانة التواصل التالية بمعلوماتك الحقيقية: <span>[حط الإيميل ديالك هنا]</span>. هاد الصفحة مسودة عملية وماشي استشارة قانونية؛ راجعها مع مختص إذا كان الموقع غادي يستقبل زوار من دول عندها متطلبات خاصة.</div>
        <section><h2>1. شنو هو GGUF Finder؟</h2><p>GGUF Finder أداة بسيطة كتعاونك تلقى ملفات نماذج GGUF فـHugging Face. الموقع ما كيطلبش منك حساب، password، أو معلومات شخصية باش تستعمل البحث.</p></section>
        <section><h2>2. المعلومات اللي كتدخل</h2><p>ملي كتلسّق رابط مستودع أو اسم owner، كيتستعمل هاد النص غير باش يطلب معلومات عامة من Hugging Face API. ما كنخزّنش هاد النص فقاعدة بيانات ديالنا، وما كنبيعوش لأي جهة.</p></section>
        <section><h2>3. التخزين المؤقت</h2><p>الموقع يقدر يستعمل التخزين المؤقت المؤقت داخل المتصفح باش يعاود يجيب نفس نتائج البحث بسرعة. هاد التخزين مرتبط بالجلسة ديال المتصفح وماشي قاعدة بيانات دائمة عندنا.</p></section>
        <section><h2>4. Hugging Face والروابط الخارجية</h2><p>نتائج الملفات وروابط التحميل جايين من Hugging Face. ملي كتفتح رابط أو كتبدأ تحميل، كتولي خاضع لسياسة الخصوصية والشروط ديال الموقع الخارجي. قرا <a href="https://huggingface.co/privacy" target="_blank" rel="noreferrer">سياسة Hugging Face</a> قبل الاستعمال.</p></section>
        <section><h2>5. الإعلانات</h2><p>حالياً ما كاين حتى كود إعلانات مركّب فهاد النسخة. إذا زدنا شبكة إعلانات من بعد، غادي نحدّث هاد الصفحة باسم الشبكة، نوع البيانات اللي كتستعملها، واش كتستعمل cookies، وكيفاش تقدر ترفض الإعلانات المخصصة. غادي نحاولو نستعملو إعلانات تقنية خفيفة بلا قمار، بلا محتوى للبالغين، وبلا redirects مزعجين.</p></section>
        <section><h2>6. التحليلات والكوكيز</h2><p>ما خاصكش تفترض أن كل نسخة من الموقع عندها نفس أدوات القياس. أي analytics أو cookies إضافية غادي نصرّحو بها هنا قبل تفعيلها. النسخة الحالية كتحتاج فقط وظائف الموقع الأساسية والبحث العام.</p></section>
        <section><h2>7. التواصل</h2><p>إلى عندك سؤال على الخصوصية، تواصل معنا عبر: <strong>[حط الإيميل ديالك هنا]</strong>.</p></section>
        <section><h2>8. تاريخ التحديث</h2><p>آخر تحديث: 15 غشت 2026.</p></section>
      </main>
      <footer className="dark-footer">GGUF Finder · سياسة الخصوصية</footer>
    </div>
  );
}
