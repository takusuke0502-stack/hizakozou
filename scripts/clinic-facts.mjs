export const CLINIC_FACTS = Object.freeze({
  clinicName: "整体院ひざこぞう",
  address: "千葉県柏市あけぼの4-4-3 BoaSorte柏305",
  access: "JR常磐線・東武アーバンパークライン「柏駅」西口より徒歩約8分",
  businessHours: "9:00〜19:00",
  closedDay: "日曜",
  appointment: "完全予約制",
  phone: "04-7114-3274",
  phoneHref: "tel:0471143274",
  lineUrl: "https://lin.ee/X01F2mP",
  profileUrl: "/staff.html",
  firstVisit: Object.freeze({
    title: "初回のご案内",
    durationMinutes: 90,
    duration: "約90分（カウンセリング・状態確認・施術・今後のご説明）",
    priceYen: 1980,
    price: "1,980"
  }),
  practitioner: Object.freeze({
    name: "川上卓哉",
    qualification: "柔道整復師（国家資格）",
    experienceYears: 15,
    treatmentCount: "約2万件"
  })
});

export function buildPractitionerQualification() {
  const practitioner = CLINIC_FACTS.practitioner;
  return `${practitioner.qualification}／施術歴${practitioner.experienceYears}年／累計施術${practitioner.treatmentCount}`;
}
