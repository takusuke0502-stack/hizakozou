import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "data", "blog-posts.json");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const templatesDir = path.join(rootDir, "templates");
const blogDir = path.join(rootDir, "blog");
const postsDir = path.join(blogDir, "posts");
const symptomsDir = path.join(rootDir, "symptoms");

const symptomNavigationItems = [
  { href: "knee-osteoarthritis.html", label: "変形性膝関節症", description: "階段や歩き始めの膝痛、膝のこわばりが気になる方へ。" },
  { href: "knee-effusion.html", label: "膝の水（関節水腫）", description: "膝の腫れや水が溜まる不安を整理したい方へ。" },
  { href: "pes-anserine-bursitis.html", label: "膝の内側の痛み", description: "鵞足炎や内側の違和感が続く方へ。" },
  { href: "knee-lateral-pain.html", label: "膝の外側の痛み", description: "腸脛靭帯炎や外側半月板まわりが気になる方へ。" },
  { href: "knee-posterior-pain.html", label: "膝の裏側の痛み", description: "ベーカー嚢腫や膝裏の張りが気になる方へ。" },
  { href: "knee-front-pain.html", label: "膝の前側の痛み", description: "階段や立ち上がりでお皿まわりが気になる方へ。" },
  { href: "meniscus-knee-pain.html", label: "半月板損傷・膝の引っかかり", description: "曲げ伸ばしや引っかかり感が気になる方へ。" },
  { href: "bowlegs-knee-pain.html", label: "O脚・膝のゆがみ", description: "膝の内側や脚のゆがみが気になる方へ。" },
  { href: "knee-hyperextension.html", label: "反張膝・膝が伸びすぎる", description: "立つと膝が後ろへ入りやすい方へ。" },
  { href: "ankle-stiffness-knee-pain.html", label: "足首の硬さと膝痛", description: "足首や足裏の使いにくさが膝に響く方へ。" },
  { href: "hip-osteoarthritis.html", label: "股関節の痛み", description: "歩き方や膝への負担と股関節の関係を知りたい方へ。" },
  { href: "lower-back-pain.html", label: "腰痛", description: "膝をかばう姿勢や歩き方と腰痛の関係が気になる方へ。" },
  { href: "sciatica.html", label: "坐骨神経痛", description: "お尻から脚のしびれや痛みが続く方へ。" },
  { href: "spinal-stenosis.html", label: "脊柱管狭窄症", description: "歩くと脚がつらい、休むと楽になる症状がある方へ。" },
  { href: "lumbar-disc-herniation.html", label: "腰椎椎間板ヘルニア", description: "腰からお尻、脚への痛みやしびれが気になる方へ。" },
  { href: "scoliosis.html", label: "側弯症", description: "背骨のカーブや姿勢の左右差、背中や腰の張りが気になる方へ。" },
  { href: "shoulder-stiffness.html", label: "肩こり", description: "首肩の重さや姿勢の崩れが気になる方へ。" },
  { href: "frozen-shoulder.html", label: "五十肩", description: "腕が上がらない、夜に肩が痛む方へ。" },
  { href: "tmj.html", label: "顎関節症", description: "あごの痛みや口の開けづらさ、首肩との関係が気になる方へ。" }
];

const relatedKneeConcernTargetFiles = new Set([
  "knee-osteoarthritis.html",
  "knee-effusion.html",
  "pes-anserine-bursitis.html",
  "knee-lateral-pain.html",
  "knee-posterior-pain.html",
  "knee-front-pain.html",
  "meniscus-knee-pain.html",
  "bowlegs-knee-pain.html",
  "knee-hyperextension.html",
  "ankle-stiffness-knee-pain.html",
  "plantar-fasciitis.html",
  "lower-back-pain.html",
  "sciatica.html"
]);

const relatedKneeConcernItems = [
  { href: "knee-osteoarthritis.html", label: "変形性膝関節症でお悩みの方へ", description: "歩き始めや階段で膝痛が続く方へ。" },
  { href: "knee-effusion.html", label: "膝に水がたまる・腫れぼったい方へ", description: "膝の腫れや重さが気になる方へ。" },
  { href: "pes-anserine-bursitis.html", label: "膝の内側が痛い・鵞足炎が気になる方へ", description: "内側やや下の痛みを整理したい方へ。" },
  { href: "knee-lateral-pain.html", label: "膝の外側が痛い方へ", description: "歩くと外側が張る、違和感が出る方へ。" },
  { href: "knee-posterior-pain.html", label: "膝の裏が痛い・腫れる方へ", description: "膝裏の張りや曲げ伸ばしの重さが気になる方へ。" },
  { href: "knee-front-pain.html", label: "膝の前側・お皿まわりが痛い方へ", description: "階段や立ち上がりで前側が気になる方へ。" },
  { href: "meniscus-knee-pain.html", label: "半月板損傷・膝の引っかかりが気になる方へ", description: "曲げ伸ばしの違和感や不安がある方へ。" },
  { href: "bowlegs-knee-pain.html", label: "O脚・膝のゆがみが気になる方へ", description: "膝の内側に負担が集まりやすい方へ。" },
  { href: "knee-hyperextension.html", label: "反張膝・膝が伸びすぎる方へ", description: "立つと膝が後ろへ入りやすい方へ。" },
  { href: "ankle-stiffness-knee-pain.html", label: "足首の硬さと膝痛が気になる方へ", description: "足元から膝の負担を整理したい方へ。" },
  { href: "../blog/posts/walking-start-knee-pain-cause/", label: "歩き始めに膝が痛い方へ", description: "立ち上がりや一歩目の痛みを整理した記事です。" },
  { href: "../blog/posts/knee-pain-daily-care/", label: "しゃがむ・正座で膝が痛い方へ", description: "日常動作で膝に負担が集まる理由を整理します。" },
  { href: "../blog/posts/hip-stiffness-knee-low-back-pain-relation/", label: "股関節や足首の硬さと膝痛の関係", description: "膝だけでなく周辺の動きも確認したい方へ。" }
];

const symptomConfigs = {
  "knee-osteoarthritis.html": {
    symptomKey: "knee-osteoarthritis",
    label: "変形性膝関節症",
    keywords: ["変形性膝関節症", "膝痛", "階段", "歩き始め", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["walking-start-knee-pain-cause", "knee-pain-daily-care"]
  },
  "knee-effusion.html": {
    symptomKey: "knee-effusion",
    label: "膝に水がたまる",
    keywords: ["膝に水がたまる", "膝の腫れ", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["knee-pain-daily-care"]
  },
  "knee-lateral-pain.html": {
    symptomKey: "knee-lateral-pain",
    label: "膝の外側の痛み",
    keywords: ["膝の外側", "膝痛", "歩行", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "knee-posterior-pain.html": {
    symptomKey: "knee-posterior-pain",
    label: "膝の裏側の痛み",
    keywords: ["膝の裏側", "膝裏", "ベーカー嚢腫", "ハムストリング", "膝痛", "歩行", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "pes-anserine-bursitis.html": {
    symptomKey: "pes-anserine-bursitis",
    label: "膝の内側の痛み",
    keywords: ["膝の内側", "鵞足炎", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["knee-medial-pain-saphenous-nerve", "knee-pain-daily-care"]
  },
  "knee-front-pain.html": {
    symptomKey: "knee-front-pain",
    label: "膝の前側の痛み",
    keywords: ["膝の前側", "膝のお皿", "膝蓋骨", "階段", "立ち上がり", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["knee-pain-stairs-guide", "knee-pain-daily-care"]
  },
  "meniscus-knee-pain.html": {
    symptomKey: "meniscus-knee-pain",
    label: "半月板損傷・膝の引っかかり",
    keywords: ["半月板", "膝の引っかかり", "曲げ伸ばし", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["knee-medial-pain-difference", "kashiwa-knee-pain-clinic-or-seitai"]
  },
  "bowlegs-knee-pain.html": {
    symptomKey: "bowlegs-knee-pain",
    label: "O脚・膝のゆがみ",
    keywords: ["O脚", "膝のゆがみ", "膝の内側", "変形性膝関節症", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["knee-osteoarthritis-before-surgery-walking", "swayback-posture-knee-pain"]
  },
  "knee-hyperextension.html": {
    symptomKey: "knee-hyperextension",
    label: "反張膝・膝が伸びすぎる",
    keywords: ["反張膝", "膝が伸びすぎる", "スウェイバック", "姿勢", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["swayback-posture-knee-pain", "seven-checkpoints-for-knee-pain-improvement"]
  },
  "ankle-stiffness-knee-pain.html": {
    symptomKey: "ankle-stiffness-knee-pain",
    label: "足首の硬さと膝痛",
    keywords: ["足首", "足首の硬さ", "足裏", "歩き方", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: ["lumbricals-knee-low-back-pain-relation", "plantar-fasciitis-arch-walking"]
  },
  "lower-back-pain.html": {
    symptomKey: "lower-back-pain",
    label: "腰痛",
    keywords: ["腰痛", "腰", "立ち上がり", "歩行不安"],
    categoryHints: ["lower-back-pain", "exercise-therapy", "knee-pain"]
  },
  "sciatica.html": {
    symptomKey: "sciatica",
    label: "坐骨神経痛",
    keywords: ["坐骨神経痛", "お尻", "脚のしびれ", "しびれ"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"]
  },
  "spinal-stenosis.html": {
    symptomKey: "spinal-stenosis",
    label: "脊柱管狭窄症",
    keywords: ["脊柱管狭窄症", "椎間板ヘルニア", "間欠性跛行", "腰", "脚のしびれ"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"]
  },
  "lumbar-disc-herniation.html": {
    symptomKey: "lumbar-disc-herniation",
    label: "腰椎椎間板ヘルニア",
    keywords: ["腰椎椎間板ヘルニア", "椎間板ヘルニア", "腰", "脚のしびれ", "坐骨神経痛"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"]
  },
  "scoliosis.html": {
    symptomKey: "scoliosis",
    label: "側弯症",
    keywords: ["側弯症", "脊柱側弯症", "背骨", "姿勢", "腰", "背中"],
    categoryHints: ["lower-back-pain", "exercise-therapy", "neck-shoulder-hand"]
  },
  "hip-osteoarthritis.html": {
    symptomKey: "hip-osteoarthritis",
    label: "変形性股関節症",
    keywords: ["変形性股関節症", "股関節", "歩きづらい", "膝をかばう"],
    categoryHints: ["hip-pain", "lower-back-pain", "exercise-therapy", "knee-pain"]
  },
  "shoulder-stiffness.html": {
    symptomKey: "shoulder-stiffness",
    label: "肩こり",
    keywords: ["肩こり", "首こり", "姿勢", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  },
  "frozen-shoulder.html": {
    symptomKey: "frozen-shoulder",
    label: "五十肩",
    keywords: ["五十肩", "肩", "腕が上がらない", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  },
  "cervical-spondylosis.html": {
    symptomKey: "cervical-spondylosis",
    label: "頚椎症",
    keywords: ["頚椎症", "首の痛み", "しびれ", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"]
  },
  "thoracic-outlet.html": {
    symptomKey: "thoracic-outlet",
    label: "胸郭出口症候群",
    keywords: ["胸郭出口症候群", "腕のしびれ", "首肩", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"]
  },
  "carpal-tunnel.html": {
    symptomKey: "carpal-tunnel",
    label: "手根管症候群",
    keywords: ["手根管症候群", "手のしびれ", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"]
  },
  "elbow-tendinopathy.html": {
    symptomKey: "elbow-tendinopathy",
    label: "肘の痛み",
    keywords: ["肘の痛み", "肘", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  },
  "plantar-fasciitis.html": {
    symptomKey: "plantar-fasciitis",
    label: "足底筋膜炎",
    keywords: ["足底筋膜炎", "足裏", "歩行", "慢性痛"],
    categoryHints: ["exercise-therapy", "knee-pain"]
  },
  "tmj.html": {
    symptomKey: "tmj",
    label: "顎関節症",
    keywords: ["顎関節症", "顎", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  }
};

const patientVoices = [
  {
    name: "K.K様",
    title: "膝・腰・坐骨神経痛など、複数のお悩みで来院されたお声",
    quote: "施術後は体が軽くなります",
    summary: "膝の痛みだけでなく、腰や坐骨神経痛など複数のお悩みがある方のお声です。痛みの場所を一つに決めつけず、体全体のつながりを見ていく当院の方針が伝わる内容です。",
    image: "../image/patient-voice-kk-anonymized.jpg",
    alt: "K.K様の写真付き直筆アンケート。坐骨神経痛、膝の痛み、腰の痛みなどで来院されたお声",
    symptomKeys: ["knee-osteoarthritis", "lower-back-pain", "sciatica"]
  },
  {
    name: "沼尻ひろみ様",
    title: "腰や足の状態まで見てもらえた方のお声",
    quote: "体と向き合うことが大事だと思います",
    summary: "そり腰や腰痛、足の筋肉の状態など、膝以外の負担にも触れられているお声です。今の痛みだけでなく、体の使い方や日常の負担を整理する大切さが伝わります。",
    image: "../image/patient-voice-numajiri.jpg",
    alt: "沼尻ひろみ様の写真付き直筆アンケート。ねんざによる全身的な痛みで来院されたお声",
    symptomKeys: ["lower-back-pain", "shoulder-stiffness"]
  }
];

const relatedArticlesStyles = `
/* BLOG_RELATED_ARTICLES_STYLES_START */
.related-articles{padding:3.25rem 1rem;background:#f8fbff;border-top:1px solid #dbeafe}
.related-articles__eyebrow{text-align:center;font-size:13px;font-weight:900;color:#2563eb;letter-spacing:.08em;margin-bottom:.75rem}
.related-articles__title{text-align:center;font-size:1.5rem;font-weight:900;color:#1e3a8a;margin-bottom:.75rem}
.related-articles__lead{text-align:center;font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0 auto 2rem;max-width:42rem}
.related-articles__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.related-article-card{display:flex;flex-direction:column;gap:.75rem;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.25rem;text-decoration:none;box-shadow:0 2px 10px rgba(37,99,235,.06);transition:transform .2s,border-color .2s,box-shadow .2s}
.related-article-card:hover,.related-article-card:focus-visible{transform:translateY(-2px);border-color:#93c5fd;box-shadow:0 10px 20px rgba(37,99,235,.12);outline:none}
.related-article-card__meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.related-article-card__pill{display:inline-flex;align-items:center;border-radius:9999px;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:900;padding:.25rem .625rem}
.related-article-card__time{font-size:11px;font-weight:700;color:#64748b}
.related-article-card__title{font-size:1rem;font-weight:900;color:#1e3a8a;line-height:1.5}
.related-article-card__desc{font-size:13px;font-weight:700;color:#475569;line-height:1.8}
.related-article-card__link{display:inline-flex;align-items:center;gap:.35rem;font-size:13px;font-weight:900;color:#2563eb}
.related-symptoms{padding:3.25rem 1rem;background:#fff;border-top:1px solid #e2e8f0}
.related-symptoms__eyebrow{text-align:center;font-size:12px;font-weight:900;color:#2563eb;letter-spacing:.1em;margin:0 0 .7rem}
.related-symptoms__title{text-align:center;font-size:1.45rem;font-weight:900;color:#1e3a8a;line-height:1.55;margin:0 0 .75rem}
.related-symptoms__lead{text-align:center;font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0 auto 2rem;max-width:42rem}
.related-symptoms__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.9rem}
.related-symptom-card{display:flex;flex-direction:column;gap:.55rem;min-height:126px;background:#f8fbff;border:1px solid #dbeafe;border-radius:8px;padding:1rem;text-decoration:none;transition:transform .2s,border-color .2s,background .2s,box-shadow .2s}
.related-symptom-card:hover,.related-symptom-card:focus-visible{transform:translateY(-2px);background:#fff;border-color:#93c5fd;box-shadow:0 8px 18px rgba(37,99,235,.1);outline:none}
.related-symptom-card__label{font-size:1rem;font-weight:900;color:#1e3a8a;line-height:1.5}
.related-symptom-card__description{font-size:13px;font-weight:700;color:#475569;line-height:1.75}
.symptom-mid-cta{padding:2.75rem 1rem;background:#fff;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
.symptom-mid-cta__inner{display:grid;gap:1.25rem;align-items:center;background:#f8fbff;border:1px solid #bfdbfe;border-radius:8px;padding:1.5rem}
.symptom-mid-cta__eyebrow{font-size:12px;font-weight:900;color:#2563eb;letter-spacing:.08em;margin:0 0 .5rem}
.symptom-mid-cta__title{font-size:1.25rem;font-weight:900;color:#1e3a8a;line-height:1.55;margin:0 0 .5rem}
.symptom-mid-cta__text{font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0}
.symptom-mid-cta__actions{display:flex;flex-wrap:wrap;gap:.75rem}
.symptom-mid-cta__btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;border-radius:8px;padding:.85rem 1.15rem;font-size:14px;font-weight:900;text-decoration:none;transition:transform .2s,background .2s,border-color .2s}
.symptom-mid-cta__btn--line{background:#06C755;color:#fff}
.symptom-mid-cta__btn--tel{background:#fff;color:#1e3a8a;border:1px solid #bfdbfe}
.symptom-mid-cta__btn:hover,.symptom-mid-cta__btn:focus-visible{transform:translateY(-1px);outline:2px solid #93c5fd;outline-offset:3px}
.symptom-voices{padding:3.25rem 1rem;background:#f8fafc;border-top:1px solid #e2e8f0}
.symptom-voices__eyebrow{text-align:center;font-size:12px;font-weight:900;color:#2563eb;letter-spacing:.1em;margin:0 0 .7rem}
.symptom-voices__title{text-align:center;font-size:1.45rem;font-weight:900;color:#1e3a8a;line-height:1.55;margin:0 0 .75rem}
.symptom-voices__lead{text-align:center;font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0 auto 2rem;max-width:42rem}
.symptom-voices__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),600px));justify-content:center;gap:2rem}
.symptom-voice-card{background:#fff;border:1px solid #dbeafe;border-radius:8px;overflow:hidden;box-shadow:0 16px 36px rgba(15,23,42,.09)}
.symptom-voice-card__image-link{display:block;background:#f1f5f9}
.symptom-voice-card__image{display:block;width:100%;height:auto}
.symptom-voice-card__body{padding:1.25rem}
.symptom-voice-card__label{font-size:11px;font-weight:900;color:#2563eb;letter-spacing:.08em;margin:0 0 .5rem}
.symptom-voice-card__title{font-size:1.05rem;font-weight:900;color:#1e3a8a;line-height:1.55;margin:0 0 .65rem}
.symptom-voice-card__quote{font-size:15px;font-weight:900;color:#0f172a;line-height:1.75;margin:0 0 .65rem}
.symptom-voice-card__summary{font-size:14px;font-weight:700;color:#475569;line-height:1.8;margin:0}
.symptom-voices__note{font-size:11px;font-weight:700;color:#64748b;line-height:1.8;text-align:right;margin:1rem 0 0}
.symptom-footer{background:#0f172a;color:#cbd5e1;padding:3rem 1rem 2rem;text-align:center}
.symptom-footer__inner{max-width:860px;margin:0 auto}
.symptom-footer__logo{display:inline-block;background:#fff;border-radius:8px;padding:.7rem 1.35rem;margin-bottom:.8rem}
.symptom-footer__logo span{font-size:1.2rem;font-weight:900;color:#1e293b}
.symptom-footer__tagline{font-size:14px;font-weight:700;line-height:1.8;margin:0 0 1.4rem}
.symptom-footer__links{display:flex;flex-wrap:wrap;justify-content:center;gap:.65rem 1rem;list-style:none;margin:0 0 1.4rem;padding:0}
.symptom-footer__links a{font-size:13px;font-weight:700;color:#94a3b8;text-decoration:none;transition:color .2s}
.symptom-footer__links a:hover,.symptom-footer__links a:focus-visible{color:#60a5fa;outline:none;text-decoration:underline;text-underline-offset:4px}
.symptom-footer__note{font-size:10px;color:#64748b;font-weight:700;line-height:2;margin:0}
@media(min-width:768px){.related-articles__title{font-size:1.75rem}}
@media(min-width:768px){.symptom-mid-cta__inner{grid-template-columns:minmax(0,1fr) auto;padding:1.75rem 2rem}.symptom-mid-cta__title{font-size:1.45rem}}
@media(max-width:640px){.symptom-mid-cta__actions{flex-direction:column}.symptom-mid-cta__btn{width:100%}.symptom-voices__grid{gap:1rem}.symptom-voice-card__body{padding:1rem}.symptom-voices__note{text-align:left}}
/* BLOG_RELATED_ARTICLES_STYLES_END */
`.trim();

export async function buildBlog() {
  const [rawData, indexTemplate, postTemplate] = await Promise.all([
    fs.readFile(dataPath, "utf8"),
    fs.readFile(path.join(templatesDir, "blog-index-template.html"), "utf8"),
    fs.readFile(path.join(templatesDir, "blog-post-template.html"), "utf8")
  ]);

  const blogData = JSON.parse(rawData);
  validateBlogData(blogData);

  const categoryMap = new Map(blogData.categories.map((category) => [category.slug, category]));
  const posts = [...blogData.posts]
    .map((post) => normalizePost(post, blogData.site, categoryMap))
    .sort((a, b) => b.date.localeCompare(a.date));

  const indexHtml = renderTemplate(indexTemplate, {
    SEO_HEAD: buildIndexSeo(blogData.site),
    CSS_PATH: "assets/blog.css",
    HOME_PATH: "../index.html",
    BLOG_PATH: "./",
    CONTACT_PATH: "../index.html#access",
    PHONE: blogData.site.phone,
    PHONE_HREF: `tel:${blogData.site.phone.replace(/-/g, "")}`,
    SITE_NAME: blogData.site.name,
    SITE_SUBTITLE: blogData.site.subtitle,
    PAGE_CONTENT: buildIndexContent(blogData.site, posts, categoryMap)
  });

  await replaceDirectoryAtomically(postsDir, async (stagingDir) => {
    await fs.writeFile(path.join(stagingDir, ".gitkeep"), "", "utf8");

    for (const post of posts) {
      const postDir = path.join(stagingDir, post.slug);
      await fs.mkdir(postDir, { recursive: true });
      const relatedPosts = posts.filter((item) => item.slug !== post.slug && item.category.slug === post.category.slug).slice(0, 2);
      const postHtml = renderTemplate(postTemplate, {
        SEO_HEAD: buildPostSeo(blogData.site, post),
        CSS_PATH: "../../assets/blog.css",
        HOME_PATH: "../../../index.html",
        BLOG_PATH: "../../",
        CONTACT_PATH: "../../../index.html#access",
        PHONE: blogData.site.phone,
        PHONE_HREF: `tel:${blogData.site.phone.replace(/-/g, "")}`,
        SITE_NAME: blogData.site.name,
        SITE_SUBTITLE: blogData.site.subtitle,
        PAGE_CONTENT: buildPostContent(blogData.site, post, relatedPosts)
      });
      await fs.writeFile(path.join(postDir, "index.html"), cleanGeneratedText(postHtml), "utf8");
    }
  });

  await fs.writeFile(path.join(blogDir, "index.html"), cleanGeneratedText(indexHtml), "utf8");

  await updateSymptomPages(blogData.site, posts);

  await fs.writeFile(path.join(rootDir, "blog.html"), cleanGeneratedText(buildBlogRedirectHtml()), "utf8");
  await fs.writeFile(path.join(rootDir, "blog-detail.html"), cleanGeneratedText(buildLegacyDetailRedirectHtml()), "utf8");
  await updateSitemap(blogData.site, posts);

  console.log(`Generated ${posts.length} static blog post(s), updated symptom related articles, and regenerated sitemap.xml.`);
}

export async function replaceDirectoryAtomically(targetDir, populateDirectory) {
  const parentDir = path.dirname(targetDir);
  const dirName = path.basename(targetDir);
  const nonce = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const stagingDir = path.join(parentDir, `${dirName}.__staging__${nonce}`);
  const backupDir = path.join(parentDir, `${dirName}.__backup__${nonce}`);
  let backupCreated = false;

  await fs.mkdir(parentDir, { recursive: true });

  try {
    await fs.mkdir(stagingDir, { recursive: true });
    await populateDirectory(stagingDir);

    try {
      await fs.rename(targetDir, backupDir);
      backupCreated = true;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }

    try {
      await fs.rename(stagingDir, targetDir);
    } catch (error) {
      if (backupCreated) {
        try {
          await fs.rename(backupDir, targetDir);
          backupCreated = false;
        } catch {
          // Preserve the backup directory on disk if rollback fails.
        }
      }
      throw error;
    }

    if (backupCreated) {
      await fs.rm(backupDir, { recursive: true, force: true });
      backupCreated = false;
    }
  } catch (error) {
    await fs.rm(stagingDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

async function updateSymptomPages(site, posts) {
  const symptomFiles = await fs.readdir(symptomsDir);
  for (const fileName of symptomFiles) {
    if (!fileName.endsWith(".html")) continue;
    const baseConfig = symptomConfigs[fileName];
    const config = baseConfig ? { ...baseConfig, fileName } : null;
    if (!config) continue;

    const fullPath = path.join(symptomsDir, fileName);
    let html = await fs.readFile(fullPath, "utf8");
    html = upsertRelatedStyles(html);
    html = upsertDetailedSymptomContent(html, config);
    html = upsertSymptomPatientVoices(html, config);
    html = upsertSymptomMidCta(html, site);

    const matchedPosts = selectRelatedPosts(config, posts).slice(0, 4);
    const sectionHtml = matchedPosts.length ? buildRelatedArticlesSection(site, config, matchedPosts) : "";
    html = replaceRelatedSection(html, sectionHtml);
    html = normalizeSymptomPageDesign(html, site, config);

    await fs.writeFile(fullPath, cleanGeneratedText(html), "utf8");
  }
}

const detailedSymptomContent = {
  "knee-front-pain.html": {
    title: "膝の前側の痛みで確認したいこと",
    lead: [
      "膝の前側の痛みは、膝のお皿だけが悪いように感じやすい症状です。実際には、階段を降りる、椅子から立ち上がる、しゃがむ、正座から戻るといった動作の中で、太ももの前側に力が入り続けていることがあります。",
      "お皿のまわりは圧迫やこすれに敏感です。股関節が後ろへ引けない、足首が十分に曲がらない、体重がつま先側へ乗り続けると、膝が前に出すぎて前側へ負担が集まりやすくなります。痛む場所だけを揉むよりも、どの動作で負担が集まるかを整理することが大切です。"
    ],
    checkTitle: "来院時に見ていくポイント",
    checks: [
      "階段の上りと下りで痛み方が違うか",
      "立ち上がる時に膝が前へ突っ込みやすいか",
      "太ももの前側ばかり張り、裏側やお尻を使えている感覚が少ないか",
      "足首が硬く、しゃがむ時にかかとが浮きやすいか",
      "膝のお皿の上下左右の動きに左右差があるか"
    ],
    careTitle: "日常で気をつけたい動き",
    care: [
      "階段では痛い側の膝だけで体を受け止めようとせず、手すりを使いながら一段ずつ確認します。痛みを我慢して何度も反復すると、太ももの前側の緊張がさらに強くなることがあります。",
      "椅子から立つ時は、膝を前へ押し出すよりも、少しだけお辞儀をして足裏全体で床を押す感覚を作ります。股関節とお尻が働くと、膝前面の圧迫を減らしやすくなります。",
      "ストレッチは強く伸ばすほど良いわけではありません。膝のお皿の下が熱っぽい、押すと鋭く痛い、腫れがある時は無理に曲げ伸ばしを続けず、炎症を強めない範囲で調整します。"
    ],
    planTitle: "当院での進め方",
    plan: [
      "初回は膝蓋骨まわりの触診だけでなく、階段動作や立ち上がりに近い動きを確認します。痛む角度、体重を乗せた時の不安感、太ももの前側に力が入りすぎる癖を整理し、無理に膝を曲げる施術は避けます。",
      "施術では、膝蓋骨の動きに関わる太もも前面、膝裏、股関節、足首を順番に見ていきます。痛みが強い場所を強く押すのではなく、膝前面へ圧が集まりにくい体重移動を作ることを重視します。",
      "最後に、階段や椅子からの立ち上がりをその場で確認します。施術を受けた直後だけ楽にするのではなく、家で再現しやすい動き方まで落とし込むことで、日常の負担軽減につなげます。"
    ],
    point: "膝前側の痛みは、膝蓋骨・太もも・股関節・足首の連動を見直すと整理しやすくなります。痛い場所だけで判断せず、動作の癖まで確認します。"
  },
  "meniscus-knee-pain.html": {
    title: "半月板まわりの不安で確認したいこと",
    lead: [
      "半月板損傷や膝の引っかかり感は、自己判断で無理に動かすと不安が大きくなりやすい症状です。膝が完全に伸びない、ロックして動かない、外傷後に腫れた場合は、まず整形外科での確認が優先です。",
      "一方で、画像上の変化があっても、すべての痛みが半月板だけで説明できるとは限りません。股関節が硬くて体をひねれない、足首が使いにくい、歩く時に膝が内外へぶれると、半月板まわりへ圧迫やねじれが集まりやすくなります。"
    ],
    checkTitle: "安全に進めるための確認ポイント",
    checks: [
      "膝が途中で引っかかり、完全に伸びない状態があるか",
      "方向転換やしゃがみ込みでズキッとするか",
      "膝が抜けそうな不安感があるか",
      "腫れや熱感が強く、日ごとに悪化していないか",
      "股関節や足首を動かした時に膝の負担が変わるか"
    ],
    careTitle: "避けたいことと、まず整えたいこと",
    care: [
      "痛みを確認するために、深くしゃがむ、膝をひねる、正座を繰り返すことは避けます。半月板まわりに不安がある時は、曲げ伸ばしの量よりも、膝にねじれを集めないことが大切です。",
      "立ち上がりや歩行では、つま先と膝の向きが大きくずれていないかを確認します。股関節から向きを変えられると、膝関節だけで方向転換する負担を減らしやすくなります。",
      "整体では診断を行うのではなく、医療機関で確認すべきサインを分けたうえで、膝に圧や回旋ストレスが集中しにくい体の使い方を一緒に整理します。"
    ],
    planTitle: "当院での進め方",
    plan: [
      "初回は、ロック感、腫れ、外傷歴、膝が抜ける感覚の有無を丁寧に確認します。整体で進めてよい状態か、先に医療機関で確認した方がよい状態かを分けることを大切にしています。",
      "施術では、膝を直接ひねるような強い操作は行いません。股関節や足首の可動性、太もも内外の緊張、立った時の膝の向きを見ながら、半月板まわりに回旋ストレスが集まりにくい状態を目指します。",
      "動作練習では、深いしゃがみ込みから始めず、浅い曲げ伸ばし、椅子からの立ち座り、歩き出しの順に確認します。怖さを残したまま頑張るのではなく、安全な範囲を共有しながら進めます。"
    ],
    point: "強いロック感や外傷後の腫れは医療機関の領域です。そのうえで、歩き方や体重移動の癖を整えることが、膝への不安を減らす助けになります。"
  },
  "bowlegs-knee-pain.html": {
    title: "O脚・膝のゆがみで確認したいこと",
    lead: [
      "O脚や膝のゆがみが気になる方は、見た目の問題だけでなく、膝の内側へ負担が集まりやすいことがあります。立っている時に膝の内側が重い、歩くと内側が痛い、靴の外側ばかり減る方は、脚全体の使い方を整理する必要があります。",
      "膝だけをまっすぐにしようとしても、股関節・足首・骨盤の動きが変わらなければ、歩くたびに同じ負担が戻りやすくなります。膝の向きだけでなく、足裏の接地、股関節の支え、お尻の筋肉の働きまで確認します。"
    ],
    checkTitle: "O脚傾向で見ていくポイント",
    checks: [
      "立った時に体重が足の外側へ乗りやすいか",
      "歩く時に膝の内側へ痛みや張りが出るか",
      "股関節が外へ開きにくく、お尻を使う感覚が少ないか",
      "足首が内外へ傾きやすく、足裏の接地が不安定か",
      "膝の見た目よりも、日常動作で痛みが増えていないか"
    ],
    careTitle: "日常で負担を増やさない工夫",
    care: [
      "立っている時は、膝を無理に閉じるよりも、足裏全体で床を感じることから始めます。外側だけに体重が寄ると、膝の内側へ圧が集まりやすくなります。",
      "歩く時は歩幅を広げすぎず、足を前へ投げ出さないようにします。大股で急いで歩くと、膝が外へ逃げやすく、内側の負担が増えることがあります。",
      "O脚を短期間で形だけ変えようとする強い矯正は、痛みがある膝には負担になる場合があります。当院では、膝の見た目だけでなく、痛みが出る動作と支え方を優先して整えます。"
    ],
    planTitle: "当院での進め方",
    plan: [
      "初回は、立った時の膝の向きだけでなく、足裏の接地、骨盤の傾き、歩いた時の体重移動を確認します。見た目を無理に変えるのではなく、膝の内側へ負担が集まる場面を見つけます。",
      "施術では、股関節の外側やお尻、足首まわりの動きを整え、膝が外へ逃げすぎない支え方を作ります。膝だけを押し込む矯正ではなく、脚全体で体重を受け止められる状態を目指します。",
      "動作練習では、立ち上がりや歩き出しで足裏のどこに体重が乗るかを一緒に確認します。自宅では短い時間でも再現しやすいように、立ち方や歩幅の調整まで具体的にお伝えします。"
    ],
    point: "O脚傾向の膝痛は、膝だけを寄せるよりも、股関節・足首・足裏で体重を分散できる状態を作ることが大切です。"
  },
  "knee-hyperextension.html": {
    title: "反張膝・膝が伸びすぎる時に確認したいこと",
    lead: [
      "反張膝は、立っている時に膝が後ろへ入り、関節で体重を支えてしまう状態です。筋肉を使って支える感覚が少ないため、一見まっすぐ立てているようでも、膝裏や前側、腰に負担が広がることがあります。",
      "膝が伸びすぎる背景には、スウェイバック姿勢、足首の硬さ、お尻や太もも裏の働きにくさが関係することがあります。膝だけを少し曲げようとしても長続きしないため、重心の位置と股関節の支えを一緒に整えることが必要です。"
    ],
    checkTitle: "反張膝で見ていくポイント",
    checks: [
      "立つと膝が後ろへ入り、膝裏が張りやすいか",
      "長く立つと腰やふくらはぎが疲れやすいか",
      "お腹やお尻で支える感覚が少なく、関節に寄りかかっているか",
      "足首が硬く、重心が前後どちらかへ偏りやすいか",
      "歩く時に膝がカクンと入る感覚があるか"
    ],
    careTitle: "立ち方を変える時の注意点",
    care: [
      "膝を曲げ続けようと意識しすぎると、太ももの前側が疲れて長続きしません。まずは足裏の接地と骨盤の位置を整え、関節に寄りかかりすぎない感覚を作ります。",
      "長時間立つ時は、片足に体重を預け続けないようにします。左右どちらかの膝だけが後ろへ入りやすい場合、骨盤や足首の左右差も確認が必要です。",
      "反張膝は姿勢の癖として長く続いていることが多いため、施術だけで完結させず、立ち上がり、歩き出し、台所仕事など日常場面で使える練習へつなげます。"
    ],
    planTitle: "当院での進め方",
    plan: [
      "初回は、立った姿勢で膝がどの程度後ろへ入るか、骨盤が前へ出ていないか、足裏のどこに体重が乗っているかを確認します。膝だけでなく、腰やふくらはぎの張りも合わせて整理します。",
      "施術では、膝裏を強く伸ばすのではなく、股関節と足首の動き、体幹の支え、お尻や太もも裏の働きを引き出します。関節に寄りかかる立ち方から、筋肉で支える立ち方へ少しずつ移行します。",
      "動作練習では、鏡や感覚だけに頼らず、実際の立ち上がりや歩き出しで膝が後ろへ入りすぎない位置を確認します。日常で意識しやすい言葉に置き換えて、続けやすいセルフケアにします。"
    ],
    point: "反張膝は膝を曲げる意識だけでは戻りやすい症状です。足裏、股関節、体幹で支える感覚を少しずつ作ることが大切です。"
  },
  "ankle-stiffness-knee-pain.html": {
    title: "足首の硬さと膝痛で確認したいこと",
    lead: [
      "膝が痛いのに足首を確認するのは意外に感じるかもしれません。しかし、階段、しゃがむ、歩き始めでは足首がしっかり曲がることで膝への負担を分散しています。足首が硬いと、膝が前へ出すぎたり、内側へ入ったりして痛みにつながることがあります。",
      "足首の硬さは、ふくらはぎだけでなく足裏、足指、すね、股関節の使い方とも関係します。湿布や膝サポーターで一時的に楽になっても、歩き方が変わらないと同じ場所に負担が戻りやすくなります。"
    ],
    checkTitle: "足首由来の膝負担で見ていくポイント",
    checks: [
      "しゃがむ時にかかとが浮きやすいか",
      "階段で膝が内側へ入りやすいか",
      "ふくらはぎがいつも張っているか",
      "足指で床をつかむ感覚が少ないか",
      "足首を動かすと膝の痛み方が変わるか"
    ],
    careTitle: "足元から膝を守るための工夫",
    care: [
      "足首を無理に強く伸ばすよりも、足裏全体で床を感じながら小さく動かすことから始めます。痛みを我慢したストレッチは、ふくらはぎの緊張を強めることがあります。",
      "歩く時は、つま先だけで蹴るよりも、かかとから足裏、親指側へ自然に体重が移るかを確認します。足指や足裏が使えると、膝だけで衝撃を受け止めにくくなります。",
      "足首の硬さが強い方は、膝だけでなく腰や股関節にも負担が出ていることがあります。当院では足首、足裏、股関節をつなげて確認し、日常の歩き方へ落とし込みます。"
    ],
    planTitle: "当院での進め方",
    plan: [
      "初回は、足首がどれくらい曲がるかだけでなく、しゃがむ時のかかとの浮き方、足指の使い方、膝が内側へ入る癖を確認します。膝の痛みが足元の使いにくさで変わるかを見ていきます。",
      "施術では、ふくらはぎを強く揉むだけでなく、足裏、すね、股関節の動きも合わせて整えます。足首が少し動きやすくなると、膝の曲げ伸ばしや階段での負担が変わることがあります。",
      "動作練習では、歩き出し、階段、立ち上がりで足裏に体重が流れる感覚を確認します。膝だけを守るのではなく、足首と足裏を使って衝撃を分散できる状態を目指します。"
    ],
    point: "足首は膝の下で衝撃を逃がす大切な関節です。膝痛が続く時ほど、足首と足裏の働きを見直す価値があります。"
  }
};

function upsertDetailedSymptomContent(html, config = {}) {
  const detail = detailedSymptomContent[config.fileName];
  if (!detail) return html;

  const startMarker = "<!-- SYMPTOM_DETAIL_START -->";
  const endMarker = "<!-- SYMPTOM_DETAIL_END -->";
  const sectionHtml = buildDetailedSymptomContent(detail);
  const wrapped = `${startMarker}\n${sectionHtml}\n${endMarker}\n\n`;

  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), wrapped);
  }

  if (html.includes("<!-- SYMPTOM_MID_CTA_START -->")) {
    return html.replace("<!-- SYMPTOM_MID_CTA_START -->", `${wrapped}<!-- SYMPTOM_MID_CTA_START -->`);
  }

  return html.replace(/<section class="approach">/, `${wrapped}<section class="approach">`);
}

function buildDetailedSymptomContent(detail) {
  const leadHtml = detail.lead.map((text) => `<p>${escapeHtml(text)}</p>`).join("");
  const checks = detail.checks.map((text) => `
          <div class="concern-item">
            <div class="concern-item__icon">
              <i data-lucide="check" style="width:1rem;height:1rem;color:#2563eb;" aria-hidden="true"></i>
            </div>
            <p class="concern-item__text">${escapeHtml(text)}</p>
          </div>`).join("");
  const careHtml = detail.care.map((text) => `<p>${escapeHtml(text)}</p>`).join("");
  const planHtml = detail.plan?.length
    ? `<h3 class="section-title" style="font-size:1.45rem;margin-top:2.5rem;">${escapeHtml(detail.planTitle || "当院での進め方")}</h3>
        <div class="prose">${detail.plan.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}</div>`
    : "";

  return `<section class="cause">
      <div class="container max-w-4xl">
        <h2 class="section-title">${escapeHtml(detail.title)}</h2>
        <div class="prose">${leadHtml}</div>
        <div class="mechanism">
          <p class="mechanism__title">${escapeHtml(detail.checkTitle)}</p>
          <div class="concerns__list">${checks}
          </div>
        </div>
        <div class="vicious-cycle">
          <p class="vicious-cycle__title">
            <i data-lucide="alert-triangle" style="width:1.125rem;height:1.125rem;" aria-hidden="true"></i>
            放置すると起こりやすい流れ
          </p>
          <div class="cycle-flow"><span class="cycle-item">痛む動作を避ける</span><span class="cycle-arrow">→</span><span class="cycle-item">使える筋肉が減る</span><span class="cycle-arrow">→</span><span class="cycle-item">膝へ負担が集中</span><span class="cycle-arrow">→</span><span class="cycle-item">不安が強くなる</span></div>
        </div>
        <h3 class="section-title" style="font-size:1.45rem;margin-top:2.5rem;">${escapeHtml(detail.careTitle)}</h3>
        <div class="prose">${careHtml}</div>
        ${planHtml}
        <div class="key-point">
          <p class="key-point__label">✦ ポイント</p>
          <p class="key-point__text">${escapeHtml(detail.point)}</p>
        </div>
      </div>
    </section>`;
}

async function updateSitemap(site, posts) {
  const siteRoot = trimTrailingSlash(site.url);
  const latestBlogDate = posts.reduce((latest, post) => {
    const candidate = formatSitemapDate(post.updatedDate || post.date);
    return !latest || candidate > latest ? candidate : latest;
  }, null);

  const symptomEntries = await Promise.all(
    (await fs.readdir(symptomsDir))
      .filter((fileName) => fileName.endsWith(".html"))
      .sort((a, b) => a.localeCompare(b, "ja"))
      .map(async (fileName) => ({
        loc: `${siteRoot}/symptoms/${fileName}`,
        lastmod: await getFileLastmod(path.join(symptomsDir, fileName)),
        changefreq: "monthly",
        priority: "0.8"
      }))
  );

  const postEntries = posts.map((post) => ({
    loc: `${siteRoot}${post.url}`,
    lastmod: formatSitemapDate(post.updatedDate || post.date),
    changefreq: "monthly",
    priority: "0.7"
  }));

  const entries = [
    {
      loc: `${siteRoot}/`,
      lastmod: await getFileLastmod(path.join(rootDir, "index.html")),
      changefreq: "weekly",
      priority: "1.0"
    },
    {
      loc: `${siteRoot}/blog/`,
      lastmod: latestBlogDate || await getFileLastmod(path.join(blogDir, "index.html")),
      changefreq: "weekly",
      priority: "0.9"
    },
    ...postEntries,
    ...symptomEntries
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => [
      "  <url>",
      `    <loc>${escapeHtml(entry.loc)}</loc>`,
      `    <lastmod>${entry.lastmod}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      "  </url>"
    ].join("\n")),
    "</urlset>",
    ""
  ].join("\n");

  await fs.writeFile(sitemapPath, cleanGeneratedText(xml), "utf8");
}

function upsertRelatedStyles(html) {
  if (html.includes("BLOG_RELATED_ARTICLES_STYLES_START")) {
    return html.replace(/\/\* BLOG_RELATED_ARTICLES_STYLES_START \*\/[\s\S]*?\/\* BLOG_RELATED_ARTICLES_STYLES_END \*\//, relatedArticlesStyles);
  }
  return html.replace("</style>", `\n    ${relatedArticlesStyles}\n  </style>`);
}

function upsertSymptomPatientVoices(html, config = {}) {
  const startMarker = "<!-- SYMPTOM_PATIENT_VOICES_START -->";
  const endMarker = "<!-- SYMPTOM_PATIENT_VOICES_END -->";
  const sectionHtml = buildSymptomPatientVoicesSection(config);
  const wrapped = sectionHtml ? `${startMarker}\n${sectionHtml}\n${endMarker}\n\n` : "";

  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), wrapped);
  }

  if (!sectionHtml) {
    return html;
  }

  const faqMarker = "<section class=\"faq\">";
  if (html.includes(faqMarker)) {
    return html.replace(faqMarker, `${wrapped}${faqMarker}`);
  }

  if (html.includes("<!-- RELATED_SYMPTOMS_NAV_START -->")) {
    return html.replace("<!-- RELATED_SYMPTOMS_NAV_START -->", `${wrapped}<!-- RELATED_SYMPTOMS_NAV_START -->`);
  }

  return html;
}

function buildSymptomPatientVoicesSection(config = {}) {
  const voices = patientVoices.filter((voice) => voice.symptomKeys.includes(config.symptomKey));
  if (!voices.length) return "";

  const lead = config.label
    ? `${escapeHtml(config.label)}と関わりやすいお悩みで来院された方のお声です。症状や経過には個人差があるため、初回は状態を確認しながら方針をご説明します。`
    : "関連するお悩みで来院された方のお声です。症状や経過には個人差があるため、初回は状態を確認しながら方針をご説明します。";

  const cards = voices.map((voice) => `
          <article class="symptom-voice-card">
            <a class="symptom-voice-card__image-link" href="${escapeHtml(voice.image)}" target="_blank" rel="noopener noreferrer">
              <img class="symptom-voice-card__image" src="${escapeHtml(voice.image)}" alt="${escapeHtml(voice.alt)}" loading="lazy" decoding="async">
            </a>
            <div class="symptom-voice-card__body">
              <p class="symptom-voice-card__label">${escapeHtml(voice.name)}</p>
              <h3 class="symptom-voice-card__title">${escapeHtml(voice.title)}</h3>
              <p class="symptom-voice-card__quote">「${escapeHtml(voice.quote)}」</p>
              <p class="symptom-voice-card__summary">${escapeHtml(voice.summary)}</p>
            </div>
          </article>`).join("");

  return `<section class="symptom-voices">
      <div class="container max-w-4xl">
        <p class="symptom-voices__eyebrow">PATIENT VOICE</p>
        <h2 class="symptom-voices__title">この症状に関連するお声</h2>
        <p class="symptom-voices__lead">${lead}</p>
        <div class="symptom-voices__grid">
${cards}
        </div>
        <p class="symptom-voices__note">※掲載しているお声は掲載許可をいただいた方のものです。個人の感想であり、成果を保証するものではありません。</p>
      </div>
    </section>`;
}

function replaceRelatedSection(html, sectionHtml) {
  const startMarker = "<!-- BLOG_RELATED_ARTICLES_START -->";
  const endMarker = "<!-- BLOG_RELATED_ARTICLES_END -->";
  const wrapped = sectionHtml ? `${startMarker}\n${sectionHtml}\n${endMarker}\n\n` : "";

  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\n*`, "m"), wrapped);
  }

  if (!sectionHtml) {
    return html;
  }

  return html.replace(/<section class="cta">/, `${wrapped}<section class="cta">`);
}

function upsertSymptomMidCta(html, site) {
  const startMarker = "<!-- SYMPTOM_MID_CTA_START -->";
  const endMarker = "<!-- SYMPTOM_MID_CTA_END -->";
  const ctaHtml = `${startMarker}
${buildSymptomMidCta(site)}
${endMarker}

`;

  if (html.includes(startMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), ctaHtml);
  }

  const approachMarker = "<section class=\"approach\">";
  if (html.includes(approachMarker)) {
    return html.replace(approachMarker, `${ctaHtml}${approachMarker}`);
  }

  return html;
}

function buildSymptomMidCta(site) {
  const lineUrl = site.lineUrl || site.cta?.href || "https://lin.ee/X01F2mP";
  const telHref = `tel:${String(site.phone || "0471143274").replace(/-/g, "")}`;
  return `<section class="symptom-mid-cta">
      <div class="container max-w-4xl symptom-mid-cta__inner">
        <div>
          <p class="symptom-mid-cta__eyebrow">相談の目安</p>
          <h2 class="symptom-mid-cta__title">原因を知るだけでなく、今の状態に合う進め方を確認しませんか？</h2>
          <p class="symptom-mid-cta__text">痛み方や生活で困っている場面は人によって違います。読みながら「自分も近いかも」と感じた方は、来院前にLINEで状況を送っていただいて大丈夫です。</p>
        </div>
        <div class="symptom-mid-cta__actions">
          <a class="symptom-mid-cta__btn symptom-mid-cta__btn--line" href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener noreferrer">LINEで相談する</a>
          <a class="symptom-mid-cta__btn symptom-mid-cta__btn--tel" href="${escapeHtml(telHref)}">電話で相談する</a>
        </div>
      </div>
    </section>`;
}

export function normalizeSymptomPageDesign(html, site = {}, config = {}) {
  let output = upsertRelatedSymptomsNavigation(html, config);
  output = replaceSymptomFooter(output, site);
  return output;
}

function upsertRelatedSymptomsNavigation(html, config = {}) {
  const startMarker = "<!-- RELATED_SYMPTOMS_NAV_START -->";
  const endMarker = "<!-- RELATED_SYMPTOMS_NAV_END -->";
  const sectionHtml = `${startMarker}
${buildRelatedSymptomsNavigation(config)}
${endMarker}

`;

  if (html.includes(startMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), sectionHtml);
  }

  const oldInlinePattern = /<section style="padding:3rem 1rem;background:#f8fafc;border-top:1px solid #e2e8f0;">[\s\S]*?<\/section>\s*(?=<!-- BLOG_RELATED_ARTICLES_START -->)/;
  if (oldInlinePattern.test(html)) {
    return html.replace(oldInlinePattern, sectionHtml);
  }

  if (html.includes("<!-- BLOG_RELATED_ARTICLES_START -->")) {
    return html.replace("<!-- BLOG_RELATED_ARTICLES_START -->", `${sectionHtml}<!-- BLOG_RELATED_ARTICLES_START -->`);
  }

  return html;
}

function buildRelatedSymptomsNavigation(config = {}) {
  const currentFileName = config.fileName || config.page || "";
  const isKneeConcernTarget = relatedKneeConcernTargetFiles.has(currentFileName);
  const navigationItems = isKneeConcernTarget ? relatedKneeConcernItems : symptomNavigationItems;
  const sectionTitle = isKneeConcernTarget ? "関連する膝の悩み" : "ほかの症状も確認できます";
  const sectionLead = isKneeConcernTarget
    ? "膝の痛みは、痛む場所や動作によって原因の見方が変わることがあります。気になる症状があれば、あわせてご覧ください。"
    : "痛みをかばう姿勢が続くと、別の部位にも負担がかかりやすくなります。気になる症状があれば、あわせて確認してみてください。";
  const cards = navigationItems
    .filter((item) => item.href !== currentFileName)
    .slice(0, isKneeConcernTarget ? 8 : 6)
    .map((item) => `
          <a class="related-symptom-card" href="${escapeHtml(item.href)}">
            <span class="related-symptom-card__label">${escapeHtml(item.label)}</span>
            <span class="related-symptom-card__description">${escapeHtml(item.description)}</span>
          </a>`)
    .join("");

  return `<section class="related-symptoms">
      <div class="container max-w-4xl">
        <p class="related-symptoms__eyebrow">RELATED SYMPTOMS</p>
        <h2 class="related-symptoms__title">${sectionTitle}</h2>
        <p class="related-symptoms__lead">${sectionLead}</p>
        <div class="related-symptoms__grid">
${cards}
        </div>
      </div>
    </section>`;
}

function replaceSymptomFooter(html, site = {}) {
  const footerPattern = /<footer[\s\S]*?<\/footer>/;
  if (!footerPattern.test(html)) {
    return html;
  }
  return html.replace(footerPattern, buildSymptomFooter(site));
}

function buildSymptomFooter(site = {}) {
  const siteName = site.name || "整体院ひざこぞう";
  const siteSubtitle = site.subtitle || "柏市の整体院";
  const links = symptomNavigationItems.map((item) => `
          <li><a href="../symptoms/${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join("");

  return `<footer class="symptom-footer">
    <div class="symptom-footer__inner">
      <div class="symptom-footer__logo">
        <span>${escapeHtml(siteName)}</span>
      </div>
      <p class="symptom-footer__tagline">${escapeHtml(siteSubtitle)}。膝痛を中心に、歩行や姿勢の影響を受けやすい慢性痛までご相談いただけます。</p>
      <ul class="symptom-footer__links">
${links}
      </ul>
      <p class="symptom-footer__note">※個人の感想であり、成果を保証するものではありません。<br>&copy; 2026 整体院ひざこぞう All Rights Reserved.</p>
    </div>
  </footer>`;
}

function selectRelatedPosts(config, posts) {
  const pinnedSlugs = Array.isArray(config.pinnedSlugs) ? config.pinnedSlugs : [];
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const pinnedPosts = pinnedSlugs.map((slug) => postsBySlug.get(slug)).filter(Boolean);
  const pinnedSet = new Set(pinnedPosts.map((post) => post.slug));

  const scoredPosts = posts
    .filter((post) => !pinnedSet.has(post.slug))
    .map((post) => ({ post, score: scorePostForSymptom(post, config) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .map((entry) => entry.post);

  return [...pinnedPosts, ...scoredPosts];
}

function scorePostForSymptom(post, config) {
  let score = 0;
  const haystacks = [
    post.title,
    post.description,
    post.lead,
    ...post.tags
  ].join(" ");

  for (const item of post.relatedSymptoms) {
    const itemHref = normalizePath(item.href || "");
    const expectedHref = normalizePath(`/symptoms/${config.fileName}`);
    const itemLabel = normalize(item.label || "");
    const configLabel = normalize(config.label);

    if (itemHref === expectedHref) {
      score += 180;
    }
    if (itemHref.endsWith(`/${config.fileName}`)) {
      score += 120;
    }
    if (itemLabel === configLabel) {
      score += 120;
    } else if (itemLabel && (itemLabel.includes(configLabel) || configLabel.includes(itemLabel))) {
      score += 80;
    }
    for (const keyword of config.keywords) {
      if (itemLabel.includes(normalize(keyword))) score += 40;
      if (normalize(item.description || "").includes(normalize(keyword))) score += 18;
    }
  }

  if (config.categoryHints.includes(post.category.slug)) {
    score += 18;
  }

  for (const keyword of config.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;
    if (post.tags.some((tag) => normalize(tag).includes(normalizedKeyword))) score += 16;
    if (normalize(post.title).includes(normalizedKeyword)) score += 14;
    if (normalize(post.description).includes(normalizedKeyword)) score += 8;
    if (normalize(post.lead || "").includes(normalizedKeyword)) score += 6;
    if (normalize(haystacks).includes(normalizedKeyword)) score += 2;
  }

  return score;
}

function normalizePath(value) {
  return String(value || "").replace(/^https?:\/\/[^/]+/i, "").replace(/\/index\.html$/i, "/");
}

function buildRelatedArticlesSection(site, config, posts) {
  const cards = posts.map((post) => `
          <a class="related-article-card" href="../blog/posts/${post.slug}/">
            <div class="related-article-card__meta">
              <span class="related-article-card__pill">${escapeHtml(post.category.name)}</span>
            </div>
            <div class="related-article-card__title">${escapeHtml(post.title)}</div>
            <p class="related-article-card__desc">${escapeHtml(trimText(post.description, 78))}</p>
            <span class="related-article-card__link">記事を読む <i data-lucide="arrow-right" style="width:.875rem;height:.875rem;" aria-hidden="true"></i></span>
          </a>
  `).join("");

  return `
    <section class="related-articles">
      <div class="container max-w-4xl">
        <p class="related-articles__eyebrow">RELATED BLOG</p>
        <h2 class="related-articles__title">${escapeHtml(config.label)}に関連する記事</h2>
        <p class="related-articles__lead">症状ページとあわせて、考え方やセルフケアの整理に役立つ記事をまとめています。気になる内容から無理なく読み進めてみてください。</p>
        <div class="related-articles__grid">
${cards}
        </div>
      </div>
    </section>
  `.trim();
}

function validateBlogData(data) {
  if (!data?.site || !Array.isArray(data?.categories) || !Array.isArray(data?.posts)) {
    throw new Error("blog-posts.json must include site, categories, and posts.");
  }
}

function normalizePost(post, site, categoryMap) {
  const category = categoryMap.get(post.category);
  if (!category) {
    throw new Error(`Unknown category: ${post.category}`);
  }

  return {
    ...post,
    category,
    updatedDate: post.updatedDate || post.date,
    eyecatch: post.eyecatch || site.defaultEyecatch,
    tags: Array.isArray(post.tags) ? post.tags : [],
    sections: enrichSections(Array.isArray(post.sections) ? post.sections : []),
    faq: Array.isArray(post.faq) ? post.faq : [],
    relatedSymptoms: Array.isArray(post.relatedSymptoms) ? post.relatedSymptoms : [],
    cta: post.cta || site.cta,
    url: `/blog/posts/${post.slug}/`
  };
}

function enrichSections(sections) {
  return sections.map((section) => ({
    ...section,
    boxType: section.boxType || inferBoxType(section.heading, section.listStyle, "section"),
    subsections: Array.isArray(section.subsections)
      ? section.subsections.map((item) => ({
          ...item,
          boxType: item.boxType || inferBoxType(item.heading, undefined, "subsection")
        }))
      : section.subsections
  }));
}

const BOX_TYPE_RULES = {
  section: {
    base: {
      point: /3つの柱|3ステップ|改善ステップ|ポイント|できること/,
      caution: /受診|目安|注意|我慢/,
      note: /まとめ|おわりに|補足/,
      pointOnCheckList: true
    },
    enhanced: {
      point: /3つの柱|3ステップ|改善ステップ|戻らない体/,
      caution: /注意|受診|検討していただきたい目安|こんな時は我慢せず/,
      note: /まとめ|補足|希望|おわりに/,
      pointOnCheckList: true
    }
  },
  subsection: {
    base: {
      point: /^STEP|^\d+\./,
      caution: /注意|受診|我慢/
    },
    enhanced: {
      point: /^STEP|^\d+\./,
      caution: /注意|受診|検討|目安/,
      note: /まとめ|補足/
    }
  }
};

function inferBoxType(heading, listStyle, level) {
  const value = String(heading || "");
  const rules = BOX_TYPE_RULES[level];
  return inferBoxTypeFromRuleSet(value, listStyle, rules?.enhanced)
    || inferBoxTypeFromRuleSet(value, listStyle, rules?.base);
}

function inferBoxTypeFromRuleSet(value, listStyle, ruleSet) {
  if (!ruleSet) return "";
  if (ruleSet.pointOnCheckList && listStyle === "check") {
    return "point-box";
  }
  if (ruleSet.point?.test(value)) {
    return "point-box";
  }
  if (ruleSet.caution?.test(value)) {
    return "caution-box";
  }
  if (ruleSet.note?.test(value)) {
    return "note-box";
  }
  return "";
}

function buildIndexSeo(site) {
  const canonical = `${trimTrailingSlash(site.url)}/blog/`;
  return [
    `<title>${escapeHtml(site.blogTitle)} | ${escapeHtml(site.name)}</title>`,
    `<meta name="description" content="${escapeHtml(site.blogDescription)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(site.blogTitle)} | ${escapeHtml(site.name)}">`,
    `<meta property="og:description" content="${escapeHtml(site.blogDescription)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${absoluteUrl(site.url, site.ogImage)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(site.blogTitle)} | ${escapeHtml(site.name)}">`,
    `<meta name="twitter:description" content="${escapeHtml(site.blogDescription)}">`,
    `<meta name="twitter:image" content="${absoluteUrl(site.url, site.ogImage)}">`
  ].join("\n  ");
}

function buildPostSeo(site, post) {
  const canonical = `${trimTrailingSlash(site.url)}${post.url}`;
  const schemas = [
    buildArticleSchema(site, post),
    buildBreadcrumbSchema(site, post),
    post.faq.length ? buildFaqSchema(post.faq) : ""
  ].filter(Boolean).join("\n  ");

  return [
    `<title>${escapeHtml(post.title)} | ${escapeHtml(site.name)}</title>`,
    `<meta name="description" content="${escapeHtml(post.description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${escapeHtml(post.title)} | ${escapeHtml(site.name)}">`,
    `<meta property="og:description" content="${escapeHtml(post.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${absoluteUrl(site.url, post.eyecatch)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(post.title)} | ${escapeHtml(site.name)}">`,
    `<meta name="twitter:description" content="${escapeHtml(post.description)}">`,
    `<meta name="twitter:image" content="${absoluteUrl(site.url, post.eyecatch)}">`,
    schemas
  ].join("\n  ");
}

export function buildIndexContent(site, posts, categoryMap) {
  const categories = [...categoryMap.values()];
  const recentPosts = posts.slice(0, 8);
  const recommendedSlugs = [
    "knee-pain-not-healing-honest-answer",
    "knee-effusion-water-in-knee",
    "seven-checkpoints-for-knee-pain-improvement"
  ];
  const recommendedPosts = recommendedSlugs
    .map((slug) => posts.find((post) => post.slug === slug))
    .filter(Boolean);
  const renderListItem = (post) => `
    <article class="article-list-item">
      <a class="article-list-item__link" href="posts/${post.slug}/">
        <div class="article-list-item__thumb">
          <img src="..${post.eyecatch}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async" width="320" height="220">
        </div>
        <div class="article-list-item__body">
          <div class="article-list-item__meta">
            <span class="article-list-item__category">${escapeHtml(post.category.name)}</span>
          </div>
          <h3 class="article-list-item__title">${escapeHtml(post.title)}</h3>
          <p class="article-list-item__excerpt">${escapeHtml(trimText(post.description, 90))}</p>
        </div>
        <div class="article-list-item__side">
          <time class="article-list-item__date" datetime="${escapeHtml(post.updatedDate || post.date)}">${escapeHtml(formatDotDate(post.updatedDate || post.date))}</time>
          <span class="article-list-item__arrow" aria-hidden="true">›</span>
        </div>
      </a>
    </article>
  `;

  const recentList = recentPosts.map(renderListItem).join("");
  const recommendedList = recommendedPosts.map(renderListItem).join("");
  const recommendedSection = recommendedPosts.length ? `
        <section class="category-section category-section--list category-section--recommended">
          <div class="category-section__header category-section__header--list">
            <div>
              <p class="eyebrow">Start Here</p>
              <h3>まず読む3本</h3>
            </div>
            <p class="category-section__description">来院前の不安を短時間で整理しやすい記事を選びました。膝の状態、施術の見立て、相談の目安を先に確認できます。</p>
          </div>
          <div class="article-list">${recommendedList}</div>
        </section>
  ` : "";

  const categoryChips = categories.map((category) => `
    <a class="category-chip" href="#category-${escapeHtml(category.slug)}">${escapeHtml(category.name)}</a>
  `).join("");
  const categorySections = categories.map((category) => `
    <section class="category-section category-section--list" id="category-${escapeHtml(category.slug)}">
      <div class="category-section__header category-section__header--list">
        <div>
          <p class="eyebrow">Category</p>
          <h3>${escapeHtml(category.name)}</h3>
        </div>
        <p class="category-section__description">${escapeHtml(category.description)}</p>
      </div>
      <div class="article-list">
        ${posts
          .filter((post) => post.category.slug === category.slug)
          .map(renderListItem).join("")}
      </div>
    </section>
  `).join("");

  return `
    <section class="hero-block hero-block--compact">
      <div class="shell hero-block__inner">
        <div class="hero-copy hero-copy--compact">
          <p class="eyebrow">Blog</p>
          <h1>${escapeHtml(site.blogTitle)}</h1>
          <p class="hero-copy__lead">${escapeHtml(site.blogDescription)}</p>
          <div class="hero-actions">
            <a class="button button--primary" href="../index.html#access">LINEで相談する</a>
            <a class="button button--soft" href="../index.html#symptoms">症状ページを見る</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section-block">
      <div class="shell">
        <div class="section-heading">
          <p class="eyebrow">Guide</p>
          <h2>症状やテーマから探せる読みもの一覧</h2>
          <p>膝痛を中心に、腰痛や坐骨神経痛、運動療法の考え方まで、必要な記事を一覧で探しやすい形にまとめています。</p>
        </div>
        <nav class="category-chip-list category-nav" aria-label="ブログカテゴリ">
          ${categoryChips}
        </nav>
        <div class="blog-index-sequence">
          ${recommendedSection}
          <section class="category-section category-section--list category-section--recent">
          <div class="category-section__header category-section__header--list">
            <div>
              <p class="eyebrow">Recent</p>
              <h3>新着記事</h3>
            </div>
            <p class="category-section__description">まずは最近追加した記事から確認したい方のために、新しい順でまとめています。</p>
          </div>
          <div class="article-list">${recentList}</div>
          </section>
          <div class="category-sections">${categorySections}</div>
        </div>
      </div>
    </section>
    <section class="cta-band">
      <div class="shell cta-band__inner">
        <div>
          <p class="eyebrow">Contact</p>
          <h2>記事を読んで気になったら、相談からでも大丈夫です</h2>
          <p>${escapeHtml(site.cta.subtext)}</p>
        </div>
        <div class="cta-band__actions">
          <a class="button button--primary" href="${escapeHtml(site.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.cta.label)}</a>
          <a class="button button--soft" href="../index.html#price">初回案内を見る</a>
        </div>
      </div>
    </section>
  `;
}

export function buildPostContent(site, post, relatedPosts) {
  const articleSections = enrichSections(Array.isArray(post.sections) ? post.sections : []).map((section, index) => ({
    ...section,
    id: `section-${index + 1}`
  }));
  const renderedSections = articleSections.map((section) => renderSection(section));
  const midCtaIndex = Math.min(2, renderedSections.length);
  const sectionsHtml = [
    ...renderedSections.slice(0, midCtaIndex),
    buildArticleMidCta(site, post),
    ...renderedSections.slice(midCtaIndex)
  ].join("");
  const tocHtml = buildArticleToc(articleSections, "inline");
  const sideTocHtml = buildArticleToc(articleSections, "side");
  const takeawaysHtml = buildArticleTakeaways(post);
  const faqHtml = post.faq.length ? `
    <section class="article-section faq-block faq-section">
      <div class="faq-section__intro">
        <p class="eyebrow">FAQ</p>
        <h2>よくあるご質問と回答</h2>
      </div>
      <div class="faq-list">
        ${post.faq.map((item) => `
          <div class="faq-item">
            <div class="faq-item__question" aria-label="質問">
              <span class="faq-item__label">Q</span>
              <p>${escapeHtml(item.question)}</p>
            </div>
            <div class="faq-item__answer" aria-label="回答">
              <span class="faq-item__label">A</span>
              <p>${escapeHtml(item.answer)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  ` : "";

  const symptomsHtml = post.relatedSymptoms.length ? `
    <section class="article-section article-section--symptoms">
      <div class="article-section__heading">
        <p class="eyebrow">Symptoms</p>
        <h2>関連する症状ページ</h2>
      </div>
      <div class="symptom-grid">
        ${post.relatedSymptoms.map((item) => `
          <a class="symptom-card symptom-card--article" href="../../..${item.href}">
            <span class="symptom-card__label">${escapeHtml(item.label)}</span>
            <span class="symptom-card__description">${escapeHtml(item.description || "")}</span>
          </a>
        `).join("")}
      </div>
    </section>
  ` : "";

  const relatedArticlesHtml = relatedPosts.length ? `
    <section class="section-block article-related">
      <div class="shell">
        <div class="section-heading">
          <p class="eyebrow">Related</p>
          <h2>あわせて読みたい記事</h2>
        </div>
        <div class="related-posts">
          ${relatedPosts.map((item) => `
            <a class="related-post-card" href="../${item.slug}/">
              <span class="pill">${escapeHtml(item.category.name)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.description)}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  ` : "";

  return `
    <section class="article-hero-wrap">
      <div class="shell">
        <nav class="breadcrumb" aria-label="パンくず">
          <a href="../../../index.html">トップ</a>
          <span>/</span>
          <a href="../../">ブログ</a>
          <span>/</span>
          <span>${escapeHtml(post.title)}</span>
        </nav>
        <article class="article-card">
          <div class="article-card__hero">
            <img src="../../..${post.eyecatch}" alt="${escapeHtml(post.title)}" loading="eager" decoding="async" width="1200" height="630">
          </div>
          <div class="article-card__body article-card__body--post">
            <div class="article-meta">
              <span class="pill">${escapeHtml(post.category.name)}</span>
              <time class="article-meta__date" datetime="${escapeHtml(post.updatedDate || post.date)}">${escapeHtml(formatJapaneseDate(post.updatedDate || post.date))}</time>
            </div>
            <h1>${escapeHtml(post.title)}</h1>
            <p class="article-lead">${escapeHtml(post.lead || post.description)}</p>
            <div class="tag-list">${post.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>
          </div>
        </article>
      </div>
    </section>
    <section class="article-main">
      <div class="shell article-layout">
        <div class="article-content card-surface prose-surface">
          ${tocHtml}
          ${takeawaysHtml}
          ${sectionsHtml}
          ${faqHtml}
          ${symptomsHtml}
        </div>
        <aside class="article-side">
          ${sideTocHtml}
          <div class="side-card">
            <p class="side-card__eyebrow">相談先</p>
            <h2>${escapeHtml(site.name)}</h2>
            <p>${escapeHtml(site.subtitle)}で膝痛を中心に、腰痛や坐骨神経痛など慢性痛にも対応しています。</p>
            <a class="button button--primary button--full" href="${escapeHtml(post.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.cta.label)}</a>
            <p class="side-card__note">${escapeHtml(post.cta.note || site.cta.subtext)}</p>
          </div>
          <div class="side-card">
            <p class="side-card__eyebrow">一覧へ</p>
            <a class="text-link text-link--block" href="../../">ブログ一覧に戻る</a>
            <a class="text-link text-link--block" href="../../../index.html#symptoms">症状ページを見る</a>
          </div>
        </aside>
      </div>
    </section>
    <section class="pricing-cta">
      <div class="shell">
        <div class="pricing-cta__card">
          <p class="pricing-cta__badge">LINEからのご相談・ご予約受付中</p>
          <h2 class="pricing-cta__title">初回 カウンセリング＋全身整体</h2>
          <p class="pricing-cta__duration">約60分（カウンセリング・状態確認・施術）</p>
          <div class="pricing-cta__price-box">
            <div class="pricing-cta__price-row">
              <div class="pricing-cta__before">
                <span class="pricing-cta__before-label">通常料金</span>
                <span class="pricing-cta__before-price">10,000円</span>
              </div>
              <span class="pricing-cta__arrow" aria-hidden="true">→</span>
              <div class="pricing-cta__after">
                <span class="pricing-cta__after-label">初回特別価格</span>
                <span class="pricing-cta__after-price">1,980<small>円（税込）</small></span>
              </div>
            </div>
          </div>
          <div class="pricing-cta__note-box">
            <p class="pricing-cta__note-title">2回目以降の料金について</p>
            <p class="pricing-cta__note-text">2回目以降は1回 10,000円（税込）です。継続される方向けのプランは、初回カウンセリング時にお体の状態を確認したうえでご案内いたします。</p>
          </div>
          <p class="pricing-cta__reassurance">初回はカウンセリングと状態確認を含めて、無理のない内容で進めます。</p>
          <p class="pricing-cta__sub">まず相談してみたいという方も、LINEから気軽にご連絡ください。</p>
          <div class="pricing-cta__actions">
            <a class="button button--primary" href="${escapeHtml(post.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.cta.label)}</a>
            <a class="button button--phone" href="tel:${site.phone.replace(/-/g, '')}">電話で相談する</a>
          </div>
        </div>
      </div>
    </section>
    ${relatedArticlesHtml}
  `;
}

function buildArticleToc(sections, variant = "inline") {
  const items = sections
    .filter((section) => section.heading && section.id)
    .map((section, index) => `
            <li>
              <a href="#${escapeHtml(section.id)}">
                <span class="article-toc__number">${String(index + 1).padStart(2, "0")}</span>
                <span>${escapeHtml(section.heading)}</span>
              </a>
            </li>`)
    .join("");

  if (!items) return "";

  const className = variant === "side" ? "article-toc article-toc--side" : "article-toc article-toc--inline";
  const label = variant === "side" ? "記事の目次" : "この記事の目次";

  return `<nav class="${className}" aria-label="${label}">
            <p class="eyebrow">Contents</p>
            <h2>${label}</h2>
            <ol>
${items}
            </ol>
          </nav>`;
}

function buildArticleTakeaways(post) {
  const headings = post.sections
    .map((section) => section.heading)
    .filter(Boolean)
    .slice(0, 4);
  if (!headings.length) return "";

  const items = headings.map((heading) => `
            <li>${escapeHtml(heading)}</li>`).join("");

  return `<section class="article-takeaways" aria-labelledby="article-takeaways-title">
            <p class="eyebrow">Guide</p>
            <h2 id="article-takeaways-title">この記事でわかること</h2>
            <ul>
${items}
            </ul>
          </section>`;
}

function buildArticleMidCta(site, post) {
  const ctaHref = post.cta?.href || site.cta?.href || site.lineUrl || "https://lin.ee/X01F2mP";
  const ctaLabel = post.cta?.label || site.cta?.label || "LINEで相談する";
  return `<section class="article-mid-cta">
            <div>
              <p class="article-mid-cta__eyebrow">相談の目安</p>
              <h2>読んでいて自分も近いと感じたら、来院前に相談できます</h2>
              <p>痛み方や困っている動作は人によって違います。記事の内容に近い不安があれば、LINEで今の状態を送っていただいて大丈夫です。</p>
            </div>
            <a class="article-mid-cta__button" href="${escapeHtml(ctaHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ctaLabel)}</a>
          </section>`;
}

function renderSection(section) {
  const heading = section.heading
    ? `<h2${section.id ? ` id="${escapeHtml(section.id)}"` : ""}>${escapeHtml(section.heading)}</h2>`
    : "";
  const body = renderBody(section);
  const classNames = ["article-section", section.className, section.boxType].filter(Boolean).join(" ");
  const subsections = Array.isArray(section.subsections)
    ? section.subsections.map((item) => `
        <section class="${["article-subsection", item.className, item.boxType].filter(Boolean).join(" ")}">
          ${item.heading ? `<h3>${escapeHtml(item.heading)}</h3>` : ""}
          ${renderBody(item)}
        </section>
      `).join("")
    : "";

  return `<section class="${classNames}">${heading}${body}${subsections}</section>`;
}

export function renderBody(block) {
  const items = Array.isArray(block.body) ? block.body : [];
  if (items.length === 0) {
    return "";
  }
  if (block.listStyle === "check") {
    return `<ul class="check-list">${items.map((item) => `<li>${renderInlineText(item)}</li>`).join("")}</ul>`;
  }

  const chunks = [];
  let bulletItems = [];
  const flushBullets = () => {
    if (!bulletItems.length) return;
    chunks.push(`<ul class="check-list">${bulletItems.map((item) => `<li>${renderInlineText(item)}</li>`).join("")}</ul>`);
    bulletItems = [];
  };

  for (const item of items) {
    const bulletMatch = String(item).match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      bulletItems.push(bulletMatch[1].trim());
      continue;
    }
    flushBullets();
    chunks.push(`<p>${renderInlineText(item)}</p>`);
  }
  flushBullets();

  return chunks.join("");
}

function buildArticleSchema(site, post) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedDate,
    image: [absoluteUrl(site.url, post.eyecatch)],
    about: [
      post.region,
      post.category?.name,
      ...(Array.isArray(post.tags) ? post.tags : [])
    ].filter(Boolean),
    author: { "@type": "Organization", name: site.author },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl(site.url, "#medicalbusiness"),
      name: site.publisherName,
      logo: { "@type": "ImageObject", url: absoluteUrl(site.url, site.ogImage) }
    },
    mainEntityOfPage: `${trimTrailingSlash(site.url)}${post.url}`
  })}</script>`;
}

function buildBreadcrumbSchema(site, post) {
  const siteUrl = trimTrailingSlash(site.url);

  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: site.name,
        item: `${siteUrl}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ブログ",
        item: `${siteUrl}/blog/`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteUrl}${post.url}`
      }
    ]
  })}</script>`;
}

function buildFaqSchema(faq) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  })}</script>`;
}

function buildBlogRedirectHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ一覧へ移動します | 整体院ひざこぞう</title>
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url=./blog/">
  <link rel="canonical" href="https://hizakozou.jp/blog/">
</head>
<body>
  <p>ブログ一覧へ移動しています。表示が切り替わらない場合は <a href="./blog/">こちら</a> をご利用ください。</p>
</body>
</html>`;
}

function buildLegacyDetailRedirectHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>記事ページへ移動します | 整体院ひざこぞう</title>
  <meta name="robots" content="noindex,follow">
  <script>
    (async function () {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("id");
      if (!slug) {
        window.location.replace("./blog/");
        return;
      }
      try {
        const res = await fetch("./data/blog-posts.json", { cache: "no-store" });
        const data = await res.json();
        const match = Array.isArray(data.posts) ? data.posts.find((post) => post.slug === slug) : null;
        window.location.replace(match ? "./blog/posts/" + match.slug + "/" : "./blog/");
      } catch (error) {
        window.location.replace("./blog/");
      }
    })();
  </script>
</head>
<body>
  <p>記事ページへ移動しています。表示が切り替わらない場合は <a href="./blog/">ブログ一覧</a> から記事をお選びください。</p>
</body>
</html>`;
}

function renderTemplate(template, values) {
  return Object.entries(values).reduce((output, [key, value]) => output.replaceAll(`{{${key}}}`, value), template);
}

function cleanGeneratedText(value) {
  return String(value).replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
}

function formatDotDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatJapaneseDate(value) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

async function getFileLastmod(filePath) {
  const stats = await fs.stat(filePath);
  return formatSitemapDate(stats.mtime);
}

function formatSitemapDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid sitemap date: ${value}`);
  }

  return date.toISOString().slice(0, 10);
}

function absoluteUrl(siteUrl, assetPath) {
  if (/^https?:\/\//.test(assetPath)) return assetPath;
  return `${trimTrailingSlash(siteUrl)}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function trimText(value, maxLength) {
  const text = String(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineText(value) {
  let text = escapeHtml(value);

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|\.\.?\/[^)\s]+|#[^)\s]+)\)/g,
    (_match, label, href) => `<a href="${href}">${label}</a>`
  );

  const quotedPhrases = Array.from(text.matchAll(/「([^」]{2,24})」/g)).map((match) => match[1]);
  for (const phrase of quotedPhrases) {
    text = text.replaceAll(`「${phrase}」`, `「<strong class="article-emphasis">${phrase}</strong>」`);
  }

  const emphasisPhrases = [
    "Joint by Joint Theory",
    "Mobility",
    "Stability",
    "Movement",
    "Deep Front Line",
    "多裂筋",
    "大腰筋",
    "梨状筋",
    "スウェイバック姿勢",
    "反張膝",
    "運動療法",
    "徒手療法",
    "日常動作の指導",
    "3つの柱",
    "3つのステップ",
    "痛みの悪循環",
    "防衛反応",
    "被害者",
    "可動性",
    "安定性"
  ];

  for (const phrase of emphasisPhrases) {
    const escapedPhrase = escapeHtml(phrase);
    const safePattern = escapedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`(?<![\\w>])${safePattern}(?![^<]*>|[\\w])`, "g"), `<strong class="article-emphasis">${escapedPhrase}</strong>`);
  }

  text = text.replace(/(STEP\s*[1-3])/g, '<strong class="article-emphasis">$1</strong>');
  return text;
}

for (const [fileName, config] of Object.entries(symptomConfigs)) {
  config.fileName = fileName;
  config.page = fileName;
}

const isCliRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCliRun) {
  await buildBlog();
}
