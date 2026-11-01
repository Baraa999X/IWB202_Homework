/* =====================================================
   myFunctions.js : ملف الجافاسكريبت الوحيد لكل الصفحات
   الترتيب:
   1) الإعدادات
   2) دوال مساعدة
   3) دوال التحقق من الحقول
   4) قراءة السيارات المختارة
   5) التحقق من النموذج كاملاً
   6) نافذة النتيجة
   7) ربط الأحداث (jQuery)
   ===================================================== */


/* ---------- 1) الإعدادات ---------- */
var DISCOUNT_AFTER_DAYS = 7;   // الخصم إذا زادت المدة عن 7 أيام
var DISCOUNT_RATE = 0.10;      // نسبة الخصم 10%


/* ---------- 2) دوال مساعدة ---------- */

// حذف الفراغات من بداية ونهاية النص
function trimText(value) {
  return String(value).replace(/^\s+|\s+$/g, "");
}

// تنسيق الأرقام بفواصل: 1250000 تصبح 1,250,000
function formatNumber(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// تحويل نص بصيغة yyyy-mm-dd إلى تاريخ، وإرجاع null إذا كان غير صالح
function parseDate(text) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (m === null) {
    return null;
  }
  var y = parseInt(m[1], 10);
  var mo = parseInt(m[2], 10);
  var d = parseInt(m[3], 10);
  var dt = new Date(y, mo - 1, d);
  // نتأكد أن التاريخ حقيقي (مثلاً 2026-02-31 مرفوض)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

// عدد الأيام بين تاريخين
function daysBetween(start, end) {
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}


/* ---------- 3) دوال التحقق: ترجع نص الخطأ، أو "" إذا كان الإدخال صحيحاً ---------- */

// الاسم: اختياري، وإذا كُتب يجب أن يكون أحرفاً عربية فقط
function validateName(value) {
  var v = trimText(value);
  if (v === "") { return ""; }
  if (!/^[\u0621-\u064A]+( [\u0621-\u064A]+)*$/.test(v)) {
    return "الاسم يجب أن يحتوي على أحرف عربية فقط.";
  }
  return "";
}

// الرقم الوطني: إلزامي، 11 خانة، أول خانتين من 01 إلى 14
function validateNationalId(value) {
  var v = trimText(value);
  if (v === "") { return "الرقم الوطني إلزامي."; }
  if (!/^\d{11}$/.test(v)) { return "الرقم الوطني يجب أن يتكون من 11 رقماً."; }
  var governorate = parseInt(v.substring(0, 2), 10);
  if (governorate < 1 || governorate > 14) {
    return "أول خانتين يجب أن تكونا من 01 إلى 14.";
  }
  return "";
}

// التاريخ: إلزامي وبصيغة yyyy-mm-dd
function validateDateField(value) {
  var v = trimText(value);
  if (v === "") { return "هذا التاريخ إلزامي."; }
  if (parseDate(v) === null) { return "اكتب تاريخاً صحيحاً بصيغة yyyy-mm-dd."; }
  return "";
}

// الموبايل: اختياري، وإذا كُتب يجب أن يطابق Syriatel أو MTN
function validateMobile(value) {
  var v = trimText(value);
  if (v === "") { return ""; }
  // Syriatel: 093 098 099  -  MTN: 094 095 096
  if (!/^09[345689]\d{7}$/.test(v)) {
    return "رقم غير صحيح (يجب أن يطابق Syriatel أو MTN).";
  }
  return "";
}

// الإيميل: اختياري، وإذا كُتب يجب أن يكون بصيغة صحيحة
function validateEmail(value) {
  var v = trimText(value);
  if (v === "") { return ""; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return "البريد الإلكتروني غير صحيح.";
  }
  return "";
}


/* ---------- 4) قراءة السيارات المختارة من الجدول ---------- */
function getSelectedCars() {
  var cars = [];
  $(".pick-car:checked").each(function () {
    var row = $(this).closest("tr");
    cars.push({
      code: $(this).val(),
      model: trimText(row.find(".model").text()),
      price: parseInt(row.find(".price").text().replace(/\D/g, ""), 10)
    });
  });
  return cars;
}


/* ---------- 5) التحقق من النموذج كاملاً ---------- */
function validateBooking() {
  var msgName = validateName($("#fullName").val());
  var msgId = validateNationalId($("#nationalId").val());
  var msgStart = validateDateField($("#startDate").val());
  var msgEnd = validateDateField($("#endDate").val());
  var msgMobile = validateMobile($("#mobile").val());
  var msgEmail = validateEmail($("#email").val());

  // التسلسل الزمني: النهاية لاحقة للبداية
  if (msgStart === "" && msgEnd === "") {
    var start = parseDate(trimText($("#startDate").val()));
    var end = parseDate(trimText($("#endDate").val()));
    if (end <= start) {
      msgEnd = "تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية.";
    }
  }

  // عرض رسائل الخطأ (أو مسحها إذا كان الحقل صحيحاً)
  $("#errName").text(msgName);
  $("#errNationalId").text(msgId);
  $("#errStartDate").text(msgStart);
  $("#errEndDate").text(msgEnd);
  $("#errMobile").text(msgMobile);
  $("#errEmail").text(msgEmail);

  // النموذج صحيح فقط إذا كانت كل الرسائل فارغة
  return (msgName + msgId + msgStart + msgEnd + msgMobile + msgEmail) === "";
}


/* ---------- 6) نافذة النتيجة ---------- */
function showResult() {
  var cars = getSelectedCars();
  var start = parseDate(trimText($("#startDate").val()));
  var end = parseDate(trimText($("#endDate").val()));
  var days = daysBetween(start, end);

  // اسم الزبون
  var name = trimText($("#fullName").val());
  if (name === "") {
    name = "غير مذكور";
  }

  // صفوف الجدول + المجموع
  var total = 0;
  var rows = "";
  for (var i = 0; i < cars.length; i++) {
    var subtotal = cars[i].price * days;
    total += subtotal;
    rows += "<tr><td>" + cars[i].model + "</td><td>" + days + " يوم</td><td>" +
            formatNumber(subtotal) + " ل.س</td></tr>";
  }

  // الخصم
  var discount = 0;
  var discountText = "لا يوجد خصم (المدة 7 أيام أو أقل)";
  if (days > DISCOUNT_AFTER_DAYS) {
    discount = total * DISCOUNT_RATE;
    discountText = "خصم 10% (المدة أكثر من 7 أيام): " + formatNumber(discount) + " ل.س";
  }
  var finalAmount = total - discount;

  // بناء النتيجة
  var html = "<p>اسم الزبون: <b>" + name + "</b></p>";
  html += "<table><tr><th>السيارة</th><th>عدد الأيام</th><th>المبلغ</th></tr>" + rows + "</table>";
  html += "<p>المجموع قبل الخصم: " + formatNumber(total) + " ل.س</p>";
  html += "<p>" + discountText + "</p>";
  html += "<p>المبلغ النهائي: <span class=\"final-amount\">" + formatNumber(finalAmount) + " ل.س</span></p>";

  $("#resultBody").html(html);
  $("#overlay").fadeIn(250);
}


/* ---------- 7) ربط الأحداث بعد تحميل الصفحة (jQuery) ---------- */
$(document).ready(function () {

  /* ----- لكل الصفحات ----- */

  // ظهور تدريجي للصفحة
  $("#content").hide().fadeIn(500);

  // إذا رجع المستخدم للخلف نتأكد أن المحتوى ظاهر
  $(window).on("pageshow", function () {
    $("#content").show();
  });

  // القائمة العلوية: المحتوى يختفي تدريجياً ثم ننتقل للصفحة
  $("#menu a").click(function (e) {
    var link = $(this).attr("href");
    if (link === "#") { return; }
    e.preventDefault();
    $("#content").fadeOut(250, function () {
      window.location.href = link;
    });
  });

  // رابط الخروج
  $("#exitLink").click(function (e) {
    e.preventDefault();
    if (confirm("هل تريد الخروج من الموقع؟")) {
      window.location.href = "about:blank";
    }
  });

  /* ----- صفحة السيارات فقط ----- */
  if ($("#carsTable").length === 0) {
    return;
  }

  // إظهار/إخفاء التفاصيل (يمكن إظهار عدة سيارات بنفس الوقت)
  $(".show-details").change(function () {
    var num = this.id.replace("show-", "");
    if (this.checked) {
      $("#details-" + num).fadeIn(300);
    } else {
      $("#details-" + num).fadeOut(300);
    }
  });

  // زر متابعة: يظهر نموذج الحجز
  $("#continueBtn").click(function () {
    var cars = getSelectedCars();
    if (cars.length === 0) {
      $("#carsMsg").text("اختر سيارة واحدة على الأقل قبل المتابعة.");
      $("#bookingBox").slideUp(300);
      return;
    }
    $("#carsMsg").text("");
    var names = [];
    for (var i = 0; i < cars.length; i++) {
      names.push(cars[i].model);
    }
    $("#selectedCars").text("السيارات المختارة: " + names.join("، "));
    $("#bookingBox").slideDown(400);
  });

  // زر إرسال: تحقق ثم نافذة النتيجة
  $("#bookingForm").submit(function (e) {
    e.preventDefault();
    if (getSelectedCars().length === 0) {
      $("#errCars").text("اختر سيارة واحدة على الأقل من الجدول.");
      return;
    }
    $("#errCars").text("");
    if (validateBooking()) {
      showResult();
    }
  });

  // زر المسح يمسح رسائل الخطأ
  $("#bookingForm").on("reset", function () {
    $(".error").text("");
  });

  // إغلاق نافذة النتيجة
  $("#closeResult").click(function () {
    $("#overlay").fadeOut(250);
  });
});