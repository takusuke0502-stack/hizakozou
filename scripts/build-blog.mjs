import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  individualizedVisitFrequency,
  symptomDirectoryDiagnosisItems,
  symptomDirectoryMovementItems,
  symptomMetadataDescriptions,
  symptomTrustGuidance
} from "./symptom-page-guidance.mjs";
import { buildPractitionerQualification, CLINIC_FACTS } from "./clinic-facts.mjs";

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "data", "blog-posts.json");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const templatesDir = path.join(rootDir, "templates");
const blogDir = path.join(rootDir, "blog");
const postsDir = path.join(blogDir, "posts");
const symptomsDir = path.join(rootDir, "symptoms");
const FOOT_WAIST_FOOTER_SYMPTOMS =
  "腰痛／ぎっくり腰／坐骨神経痛／脊柱管狭窄症／椎間板ヘルニア／股関節痛／変形性股関節症／膝の痛み／変形性膝関節症／足首・足裏の不調";
const FOOTER_CLINIC_LABEL = "柏市の足腰専門整体院 整体院ひざこぞう";
const FOOTER_CLINIC_DESCRIPTION = "千葉県柏市｜腰痛・坐骨神経痛・股関節痛・膝痛など足腰の慢性痛相談";
const NOINDEX_SYMPTOM_FILES = new Set();
const BLOG_INDEX_HIDDEN_CATEGORIES = new Set(["neck-shoulder-hand"]);
const NOINDEX_POST_CATEGORIES = new Set(["neck-shoulder-hand"]);
const ARTICLE_LAYOUT_READABLE = "readable-v2";
const ARTICLE_LAYOUT_READABLES = new Set(["readable-v2", "readable-v3"]);
const ARTICLE_REVIEWER = {
  name: CLINIC_FACTS.practitioner.name,
  qualification: buildPractitionerQualification(),
  profileUrl: CLINIC_FACTS.profileUrl
};
const FIRST_VISIT = CLINIC_FACTS.firstVisit;
const ARTICLE_OVERVIEW_PRESETS = {
  "chronic-pain": {
    points: [
      "痛みが長引くと、膝そのものだけでなく歩き方・不安・生活動作も関係しやすくなります。",
      "階段や歩き始めで不安がある場合は、膝だけでなく股関節・足首・腰の使い方も確認します。",
      "強い腫れや熱感などがあるときは、整体の前に医療機関で状態を確認することが大切です。"
    ],
    medicalHeading: "先に医療機関へ相談したい目安",
    medicalItems: [
      "急に痛みが強くなった、または日ごとに悪化している",
      "膝が大きく腫れている、熱感がある、体重をかけにくい",
      "転倒や事故のあとから痛みが続いている"
    ]
  }
};
const ARTICLE_REFERENCE_PRESETS = {
  "elbow-pain": [
    {
      label: "日本整形外科学会 テニス肘（上腕骨外側上顆炎）",
      url: "https://www.joa.or.jp/public/sick/condition/lateral_epicondylitis.html"
    },
    {
      label: "日本整形外科学会 肘関節の症状一覧",
      url: "https://www.joa.or.jp/public/sick/body/elbow.html"
    }
  ],
  "tmj": [
    {
      label: "日本顎関節学会 顎関節症とは",
      url: "https://kokuhoken.net/jstmj/general/about_tmd.html"
    },
    {
      label: "日本顎関節学会 一般の方へ",
      url: "https://kokuhoken.net/jstmj/"
    }
  ],
  "frozen-shoulder": [
    {
      label: "日本整形外科学会 五十肩（肩関節周囲炎）",
      url: "https://www.joa.or.jp/public/sick/condition/frozen_shoulder.html"
    },
    {
      label: "日本整形外科学会 肩腱板断裂",
      url: "https://www.joa.or.jp/public/sick/condition/rotator_cuff_tear.html"
    }
  ],
  "shoulder-stiffness": [
    {
      label: "日本整形外科学会 肩こり",
      url: "https://www.joa.or.jp/public/sick/condition/stiffed_neck.html"
    },
    {
      label: "日本整形外科学会 頚椎症性神経根症",
      url: "https://www.joa.or.jp/public/sick/condition/cervical_radiculopathy.html"
    }
  ],
  "chronic-pain": [
    {
      label: "厚生労働省 慢性疼痛対策",
      url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/manseitoutsuu/index.html"
    },
    {
      label: "厚生労働省 慢性疼痛治療ガイドライン",
      url: "https://www.mhlw.go.jp/content/000350363.pdf"
    },
    {
      label: "日本ペインクリニック学会 治療指針・ガイドライン",
      url: "https://www.jspc.gr.jp/Contents/public/kaiin_guideline.html"
    }
  ],
  "low-back-knee": [
    {
      label: "日本整形外科学会 腰痛",
      url: "https://www.joa.or.jp/public/sick/condition/lumbago.html"
    },
    {
      label: "厚生労働省 腰痛対策",
      url: "https://www.mhlw.go.jp/new-info/kobetu/roudou/gyousei/anzen/dl/1911-1_2d_0001.pdf"
    },
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    }
  ],
  "knee-pain": [
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    },
    {
      label: "日本整形外科学会 変形性ひざ関節症の運動療法",
      url: "https://www.joa.or.jp/public/pdf/knee_osteoarthritis.pdf"
    },
    {
      label: "厚生労働省 変形性ひざ関節症の人を対象にした運動プログラム",
      url: "https://www.mhlw.go.jp/content/000656473.pdf"
    }
  ],
  "foot-pain": [
    {
      label: "日本整形外科学会 足の慢性障害",
      url: "https://www.joa.or.jp/public/sick/condition/chronic_problem_with_foot.html"
    },
    {
      label: "日本足の外科学会 足底腱膜炎",
      url: "https://www.jssf.jp/general/download/pamphlet_pla.pdf"
    },
    {
      label: "日本臨床整形外科学会 足底腱膜炎",
      url: "https://jcoa.gr.jp/%E8%B6%B3%E5%BA%95%E8%85%B1%E8%86%9C%E7%82%8E/"
    }
  ],
  "exercise-therapy": [
    {
      label: "日本整形外科学会 腰痛",
      url: "https://www.joa.or.jp/public/sick/condition/lumbago.html"
    },
    {
      label: "日本整形外科学会 変形性ひざ関節症の運動療法",
      url: "https://www.joa.or.jp/public/pdf/knee_osteoarthritis.pdf"
    },
    {
      label: "厚生労働省 慢性疼痛治療ガイドライン",
      url: "https://www.mhlw.go.jp/content/000350363.pdf"
    }
  ],
  "lateral-femoral-cutaneous-nerve": [
    {
      label: "米国国立神経疾患・脳卒中研究所（NINDS）末梢神経障害",
      url: "https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy"
    },
    {
      label: "米国整形外科学会（AAOS）Meralgia Paresthetica",
      url: "https://orthoinfo.aaos.org/en/diseases--conditions/burning-thigh-pain-meralgia-paresthetica/"
    },
    {
      label: "Johns Hopkins Medicine Meralgia Paresthetica",
      url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/meralgia-paresthetica"
    }
  ],
  "femoral-neuralgia": [
    {
      label: "MedlinePlus 大腿神経機能不全",
      url: "https://medlineplus.gov/ency/article/000687.htm"
    },
    {
      label: "Cleveland Clinic Femoral Nerve",
      url: "https://my.clevelandclinic.org/health/body/21786-femoral-nerve"
    },
    {
      label: "MedlinePlus 筋電図・神経伝導検査",
      url: "https://medlineplus.gov/lab-tests/electromyography-emg-and-nerve-conduction-studies/"
    }
  ],
  "common-peroneal-nerve": [
    {
      label: "日本整形外科学会 腓骨神経麻痺",
      url: "https://www.joa.or.jp/public/sick/condition/peroneal_nerve_palsy.html"
    },
    {
      label: "日本整形外科学会 しびれ（病気によるもの）",
      url: "https://www.joa.or.jp/public/sick/condition/paralysis.html"
    },
    {
      label: "Cleveland Clinic Peroneal Nerve Injury",
      url: "https://my.clevelandclinic.org/health/diseases/24263-peroneal-nerve-injury"
    }
  ],
  "lumbar-spinal-stenosis": [
    {
      label: "日本整形外科学会 腰部脊柱管狭窄症",
      url: "https://www.joa.or.jp/public/sick/condition/lumbar_spinal_stenosis.html"
    },
    {
      label: "日本整形外科学会 整形外科シリーズ8 腰部脊柱管狭窄症",
      url: "https://www.joa.or.jp/public/publication/pdf/joa_008.pdf"
    },
    {
      label: "日本整形外科学会 腰痛",
      url: "https://www.joa.or.jp/public/sick/condition/lumbago.html"
    }
  ],
  "sciatica": [
    {
      label: "日本整形外科学会 整形外科シリーズ29 坐骨神経痛",
      url: "https://www.joa.or.jp/public/pdf/joa_029.pdf"
    },
    {
      label: "日本整形外科学会 腰椎椎間板ヘルニア",
      url: "https://www.joa.or.jp/public/sick/condition/lumbar_disc_herniation.html"
    },
    {
      label: "日本整形外科学会 変形性股関節症",
      url: "https://www.joa.or.jp/public/sick/condition/hip_osteoarthritis.html"
    }
  ],
  "knee-osteoarthritis": [
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    },
    {
      label: "日本整形外科学会 変形性ひざ関節症の運動療法",
      url: "https://www.joa.or.jp/public/pdf/knee_osteoarthritis.pdf"
    },
    {
      label: "日本整形外科学会 変形性膝関節症診療ガイドライン",
      url: "https://www.joa.or.jp/topics/2023/files/guideline.pdf"
    }
  ],
  "hip-osteoarthritis": [
    {
      label: "日本整形外科学会 変形性股関節症",
      url: "https://www.joa.or.jp/public/sick/condition/hip_osteoarthritis.html"
    },
    {
      label: "日本整形外科学会 変形性股関節症診療ガイドライン",
      url: "https://www.joa.or.jp/topics/2023/files/osteoarthritis_treatment/guideline.pdf"
    },
    {
      label: "日本整形外科学会 変形性関節症",
      url: "https://www.joa.or.jp/public/sick/condition/osteoarthritis.html"
    }
  ],
  "lumbar-disc-herniation": [
    {
      label: "日本整形外科学会 腰椎椎間板ヘルニア",
      url: "https://www.joa.or.jp/public/sick/condition/lumbar_disc_herniation.html"
    },
    {
      label: "日本整形外科学会 整形外科シリーズ2 腰椎椎間板ヘルニア",
      url: "https://www.joa.or.jp/public/sick/pdf/MO0007DKA.pdf"
    },
    {
      label: "日本整形外科学会 腰痛",
      url: "https://www.joa.or.jp/public/sick/condition/lumbago.html"
    }
  ],
  "tarsal-tunnel": [
    {
      label: "日本脊髄外科学会 足根管症候群",
      url: "https://www.nsj-official.jp/general/diseasename/06_limbs/sokkonkan.html"
    },
    {
      label: "Cleveland Clinic Tarsal Tunnel Syndrome",
      url: "https://my.clevelandclinic.org/health/diseases/22200-tarsal-tunnel-syndrome"
    },
    {
      label: "Cleveland Clinic Tibial Nerve",
      url: "https://my.clevelandclinic.org/health/body/21962-tibial-nerve"
    }
  ],
  "plantar-fasciitis": [
    {
      label: "日本整形外科学会 足の慢性障害",
      url: "https://www.joa.or.jp/public/sick/condition/chronic_problem_with_foot.html"
    },
    {
      label: "日本足の外科学会 足底腱膜炎",
      url: "https://www.jssf.jp/medical/download/pamphlet_sokuteiken_dr.pdf"
    },
    {
      label: "Berkshire Healthcare NHS Foundation Trust Plantar Heel Pain",
      url: "https://www.berkshirehealthcare.nhs.uk/advice/plantar-heel-pain"
    }
  ],
  "gluteus-medius": [
    {
      label: "Cleveland Clinic Gluteal Muscles",
      url: "https://my.clevelandclinic.org/health/body/gluteal-muscles-glutes"
    },
    {
      label: "Cleveland Clinic Gluteal Tendinopathy",
      url: "https://my.clevelandclinic.org/health/diseases/22960-gluteal-tendinopathy"
    },
    {
      label: "日本整形外科学会 股関節の症状一覧",
      url: "https://www.joa.or.jp/public/sick/body/articulatio_coxae.html"
    }
  ],
  "iliopsoas": [
    {
      label: "Cleveland Clinic Psoas Muscle",
      url: "https://my.clevelandclinic.org/health/body/psoas-muscle"
    },
    {
      label: "Cleveland Clinic Psoas Syndrome",
      url: "https://my.clevelandclinic.org/health/diseases/15721-psoas-syndrome"
    },
    {
      label: "日本整形外科学会 変形性股関節症",
      url: "https://www.joa.or.jp/public/sick/condition/hip_osteoarthritis.html"
    }
  ],
  "morning-low-back-stiffness": [
    {
      label: "University Hospitals Coventry and Warwickshire NHS Trust Back pain self-care",
      url: "https://www.uhcw.nhs.uk/self-care/back/"
    },
    {
      label: "NHS Ankylosing spondylitis - Symptoms",
      url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/symptoms/"
    },
    {
      label: "Mayo Clinic Back pain - Symptoms and causes",
      url: "https://www.mayoclinic.org/diseases-conditions/back-pain/symptoms-causes/syc-20369906"
    }
  ],
  "sacroiliac-joint": [
    {
      label: "Tyneside Integrated Musculoskeletal Services Sacroiliac joint pain",
      url: "https://www.tims.nhs.uk/wp-content/uploads/2024/08/tims-sacroiliac-joint-pain.pdf"
    },
    {
      label: "American Family Physician Sacroiliac Joint Dysfunction: Diagnosis and Treatment",
      url: "https://www.aafp.org/pubs/afp/issues/2022/0300/p239.html"
    },
    {
      label: "日本整形外科学会 強直性脊椎炎",
      url: "https://www.joa.or.jp/public/sick/condition/ankylosing_spondylitis.html"
    }
  ],
  "piriformis-deep-buttock": [
    {
      label: "Cleveland Clinic Piriformis Syndrome",
      url: "https://my.clevelandclinic.org/health/diseases/23495-piriformis-syndrome"
    },
    {
      label: "日本整形外科学会 坐骨神経痛",
      url: "https://www.joa.or.jp/public/pdf/joa_029.pdf"
    },
    {
      label: "NHS Sciatica",
      url: "https://www.nhs.uk/conditions/sciatica/"
    }
  ],
  "greater-trochanteric-pain": [
    {
      label: "Royal National Orthopaedic Hospital Gluteal tendinopathy",
      url: "https://www.rnoh.nhs.uk/patients-and-visitors/patient-information-guides/patients-guide-gluteal-tendinopathy"
    },
    {
      label: "日本整形外科学会 股関節の症状",
      url: "https://www.joa.or.jp/public/sick/body/articulatio_coxae.html"
    },
    {
      label: "NHS Hip pain in adults",
      url: "https://www.nhs.uk/conditions/hip-pain/"
    }
  ],
  "patellofemoral-pain": [
    {
      label: "AAOS OrthoInfo Patellofemoral Pain Syndrome",
      url: "https://www.orthoinfo.org/diseases--conditions/patellofemoral-pain-syndrome/"
    },
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    }
  ],
  "pes-anserine": [
    {
      label: "Cleveland Clinic Pes Anserine Bursitis",
      url: "https://my.clevelandclinic.org/health/diseases/pes-anserine-bursitis"
    },
    {
      label: "AAOS OrthoInfo Pes Anserine Bursitis",
      url: "https://orthoinfo.aaos.org/en/diseases--conditions/pes-anserine-knee-tendon-bursitis"
    },
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    },
    {
      label: "NHS Knee pain",
      url: "https://www.nhs.uk/conditions/knee-pain/"
    }
  ],
  "bakers-cyst": [
    {
      label: "AAOS OrthoInfo Baker's Cyst",
      url: "https://www.orthoinfo.org/diseases--conditions/bakers-cyst-popliteal-cyst/"
    },
    {
      label: "NHS Baker's cyst",
      url: "https://www.nhs.uk/conditions/bakers-cyst/"
    }
  ],
  "achilles-tendon": [
    {
      label: "AAOS OrthoInfo Achilles Tendinitis",
      url: "https://www.orthoinfo.org/diseases--conditions/achilles-tendinitis/"
    },
    {
      label: "AAOS OrthoInfo Achilles Tendon Rupture",
      url: "https://orthoinfo.aaos.org/en/diseases--conditions/achilles-tendon-rupture-tear"
    }
  ],
  "mortons-neuroma": [
    {
      label: "AAOS OrthoInfo Morton's Neuroma",
      url: "https://www.orthoinfo.org/diseases--conditions/mortons-neuroma"
    },
    {
      label: "NHS Morton's neuroma",
      url: "https://www.nhs.uk/conditions/mortons-neuroma/"
    }
  ],
  "nocturnal-calf-cramps": [
    {
      label: "NHS Leg cramps",
      url: "https://www.nhs.uk/conditions/leg-cramps/"
    },
    {
      label: "NHS Deep vein thrombosis (DVT)",
      url: "https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/"
    },
    {
      label: "Mayo Clinic Night leg cramps",
      url: "https://www.mayoclinic.org/symptoms/night-leg-cramps/basics/causes/sym-20050813"
    }
  ],
  "gait-upper-body": [
    {
      label: "日本整形外科学会 肩こり",
      url: "https://www.joa.or.jp/public/sick/condition/stiffed_neck.html"
    },
    {
      label: "PubMed 高齢者の腕振りと歩行中の体幹安定性",
      url: "https://pubmed.ncbi.nlm.nih.gov/25022593/"
    },
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    }
  ],
  "cane-use": [
    {
      label: "東京都福祉局 福ナビ 杖の選び方",
      url: "https://www.fukunavi.or.jp/fukunavi/kiki/tsue/tsue_02.html"
    },
    {
      label: "MSDマニュアル 正しい杖の高さ",
      url: "https://www.msdmanuals.com/ja-jp/professional/multimedia/image/%E6%AD%A3%E3%81%97%E3%81%84%E6%9D%96%E3%81%AE%E9%AB%98%E3%81%95"
    },
    {
      label: "日本整形外科学会 肩こり",
      url: "https://www.joa.or.jp/public/sick/condition/stiffed_neck.html"
    }
  ],
  "body-tilt-gait": [
    {
      label: "PubMed 股関節外転筋と歩行中の体幹・骨盤運動",
      url: "https://pubmed.ncbi.nlm.nih.gov/23396196/"
    },
    {
      label: "日本整形外科学会 変形性股関節症",
      url: "https://www.joa.or.jp/public/sick/condition/hip_osteoarthritis.html"
    },
    {
      label: "日本整形外科学会 脊柱側弯症",
      url: "https://www.joa.or.jp/public/sick/condition/scoliosis.html"
    }
  ],
  "ankle-posture": [
    {
      label: "日本整形外科学会 足の慢性障害",
      url: "https://www.joa.or.jp/public/sick/condition/chronic_problem_with_foot.html"
    },
    {
      label: "日本整形外科学会 肩こり",
      url: "https://www.joa.or.jp/public/sick/condition/stiffed_neck.html"
    },
    {
      label: "PubMed 腕振りと歩行中の体幹安定性",
      url: "https://pubmed.ncbi.nlm.nih.gov/25022593/"
    }
  ],
  "arm-swing-gait": [
    {
      label: "PubMed 腕振りが歩行安定性へ与える影響",
      url: "https://pubmed.ncbi.nlm.nih.gov/21075935/"
    },
    {
      label: "PubMed 高齢者の腕振りと体幹安定性",
      url: "https://pubmed.ncbi.nlm.nih.gov/25022593/"
    },
    {
      label: "PubMed 腕振りと腰椎・股関節への力",
      url: "https://pubmed.ncbi.nlm.nih.gov/28941955/"
    }
  ],
  "protein-older-adults": [
    {
      label: "厚生労働省 日本人の食事摂取基準（2025年版）",
      url: "https://www.mhlw.go.jp/stf/newpage_44138.html"
    },
    {
      label: "厚生労働省 e-ヘルスネット 高齢者の低栄養予防",
      url: "https://kennet.mhlw.go.jp/information/information/food/e-02-014.html"
    },
    {
      label: "日本整形外科学会 ロコモONLINE 食生活でロコモ対策",
      url: "https://locomo-joa.jp/check/food"
    }
  ],
  "appetite-undernutrition": [
    {
      label: "国立長寿医療研究センター 高齢者の食欲低下",
      url: "https://www.ncgg.go.jp/hospital/navi/33.html"
    },
    {
      label: "国立長寿医療研究センター 低栄養を回避する",
      url: "https://www.ncgg.go.jp/ri/advice/36.html"
    },
    {
      label: "国立長寿医療研究センター バランスのよい食事とは",
      url: "https://www.ncgg.go.jp/hospital/navi/66.html"
    }
  ],
  "bone-nutrition": [
    {
      label: "厚生労働省 e-ヘルスネット 骨粗鬆症予防の食生活",
      url: "https://kennet.mhlw.go.jp/information/information/food/e-02-007.html"
    },
    {
      label: "厚生労働省 e-ヘルスネット カルシウム",
      url: "https://kennet.mhlw.go.jp/information/information/dictionary/food/ye-042.html"
    },
    {
      label: "厚生労働省 日本人の食事摂取基準（2025年版）",
      url: "https://www.mhlw.go.jp/stf/newpage_44138.html"
    }
  ],
  "magnesium-cramps": [
    {
      label: "Cochrane 筋痙攣に対するマグネシウム",
      url: "https://www.cochrane.org/ja/evidence/CD009402_magnesium-muscle-cramps"
    },
    {
      label: "NIH Office of Dietary Supplements Magnesium Fact Sheet",
      url: "https://ods.od.nih.gov/factsheets/Magnesium-Consumer/"
    },
    {
      label: "厚生労働省 日本人の食事摂取基準（2025年版）",
      url: "https://www.mhlw.go.jp/stf/newpage_44138.html"
    }
  ],
  "knee-weight-nutrition": [
    {
      label: "日本整形外科学会 変形性膝関節症",
      url: "https://www.joa.or.jp/public/sick/condition/knee_osteoarthritis.html"
    },
    {
      label: "日本整形外科学会 変形性膝関節症診療ガイドライン",
      url: "https://www.joa.or.jp/topics/2023/files/guideline.pdf"
    },
    {
      label: "国立長寿医療研究センター 低栄養を回避する",
      url: "https://www.ncgg.go.jp/ri/advice/36.html"
    }
  ]
};

const symptomDirectoryGroups = [
  {
    id: "waist-leg",
    title: "腰・お尻・脚",
    description: "腰の重さや、お尻から脚にかけての痛み・しびれが気になる方へ。",
    items: [
      { href: "lower-back-pain.html", label: "腰痛", description: "立ち上がりや長時間同じ姿勢で腰がつらい方へ。" },
      { href: "sciatica.html", label: "坐骨神経痛", description: "お尻から脚にかけて痛みやしびれがある方へ。" },
      { href: "spinal-stenosis.html", label: "脊柱管狭窄症", description: "歩くと脚がつらく、休むと少し楽になる方へ。" },
      { href: "lumbar-disc-herniation.html", label: "腰椎椎間板ヘルニア", description: "腰からお尻、脚へ広がる症状が気になる方へ。" }
    ]
  },
  {
    id: "hip",
    title: "股関節",
    description: "歩き始めや立ち上がりで、足の付け根やお尻が痛む方へ。",
    items: [
      { href: "hip-osteoarthritis.html", label: "股関節痛・変形性股関節症", description: "歩行や体重をかけた時の股関節痛が気になる方へ。" }
    ]
  },
  {
    id: "knee",
    title: "膝",
    description: "痛む場所や動作、腫れ・引っかかりなどから近いページを探せます。",
    items: [
      { href: "knee-osteoarthritis.html", label: "変形性膝関節症", description: "医療機関で変形性膝関節症と言われた方へ。" },
      { href: "knee-effusion.html", label: "膝に水がたまる・腫れる", description: "膝の腫れや重さが気になる方へ。" },
      { href: "pes-anserine-bursitis.html", label: "膝の内側の痛み", description: "膝の内側やや下の痛みが気になる方へ。" },
      { href: "knee-lateral-pain.html", label: "膝の外側の痛み", description: "歩くと膝の外側が張る、痛む方へ。" },
      { href: "knee-posterior-pain.html", label: "膝の裏側の痛み", description: "膝裏の張りや曲げ伸ばしの重さがある方へ。" },
      { href: "knee-front-pain.html", label: "膝の前側・お皿まわりの痛み", description: "階段や立ち上がりで前側が痛む方へ。" },
      { href: "meniscus-knee-pain.html", label: "半月板・膝の引っかかり", description: "曲げ伸ばしで引っかかりや不安がある方へ。" },
      { href: "bowlegs-knee-pain.html", label: "O脚・膝のゆがみ", description: "脚の形や膝内側への負担が気になる方へ。" },
      { href: "knee-hyperextension.html", label: "反張膝・膝が伸びすぎる", description: "立つと膝が後ろへ入りやすい方へ。" },
      { href: "ankle-stiffness-knee-pain.html", label: "足首の硬さと膝痛", description: "足元の使いにくさが膝に響く方へ。" }
    ]
  },
  {
    id: "foot",
    title: "足首・足裏",
    description: "歩き始めの足裏やかかとの痛みが気になる方へ。",
    items: [
      { href: "plantar-fasciitis.html", label: "足底筋膜炎・足裏の痛み", description: "朝の一歩目や歩行時に足裏が痛む方へ。" }
    ]
  },
  {
    id: "upper-body",
    title: "首・肩・腕・手",
    description: "首肩のこり、腕や手のしびれ、肩や肘の動かしづらさがある方へ。",
    items: [
      { href: "shoulder-stiffness.html", label: "肩こり", description: "首肩の重さや頭痛を伴うこりが気になる方へ。" },
      { href: "frozen-shoulder.html", label: "五十肩・肩が上がらない", description: "腕を上げる、後ろへ回す動作がつらい方へ。" },
      { href: "cervical-spondylosis.html", label: "頚椎症・首の痛み", description: "首の痛みや腕へのしびれが続く方へ。" },
      { href: "thoracic-outlet.html", label: "胸郭出口症候群", description: "首肩から腕にかけてしびれやだるさがある方へ。" },
      { href: "carpal-tunnel.html", label: "手根管症候群・手のしびれ", description: "手指のしびれや細かな作業のしにくさがある方へ。" },
      { href: "elbow-tendinopathy.html", label: "肘の痛み・テニス肘", description: "物を持つ、ひねる動作で肘が痛む方へ。" }
    ]
  },
  {
    id: "posture-jaw",
    title: "背骨・姿勢・顎",
    description: "姿勢の左右差や背骨のカーブ、顎の動かしづらさが気になる方へ。",
    items: [
      { href: "scoliosis.html", label: "側弯症・姿勢の左右差", description: "背骨のカーブや肩・骨盤の左右差が気になる方へ。" },
      { href: "tmj.html", label: "顎関節症・あごの痛み", description: "口を開けると痛む、音が鳴る方へ。" }
    ]
  }
];

const symptomNavigationItems = symptomDirectoryGroups.flatMap((group) => group.items);
const symptomNavigationByFile = new Map(symptomNavigationItems.map((item) => [item.href, item]));

const relatedSymptomFiles = {
  "lower-back-pain.html": ["sciatica.html", "spinal-stenosis.html", "lumbar-disc-herniation.html", "hip-osteoarthritis.html"],
  "sciatica.html": ["lower-back-pain.html", "lumbar-disc-herniation.html", "spinal-stenosis.html", "hip-osteoarthritis.html"],
  "spinal-stenosis.html": ["lower-back-pain.html", "sciatica.html", "lumbar-disc-herniation.html"],
  "lumbar-disc-herniation.html": ["lower-back-pain.html", "sciatica.html", "spinal-stenosis.html"],
  "hip-osteoarthritis.html": ["lower-back-pain.html", "sciatica.html", "knee-pain.html", "plantar-fasciitis.html"],
  "knee-pain.html": ["knee-osteoarthritis.html", "knee-effusion.html", "pes-anserine-bursitis.html", "knee-front-pain.html"],
  "knee-osteoarthritis.html": ["knee-pain.html", "knee-effusion.html", "pes-anserine-bursitis.html", "knee-front-pain.html"],
  "knee-effusion.html": ["knee-pain.html", "knee-osteoarthritis.html", "pes-anserine-bursitis.html", "knee-posterior-pain.html"],
  "pes-anserine-bursitis.html": ["knee-pain.html", "knee-osteoarthritis.html", "knee-front-pain.html", "bowlegs-knee-pain.html"],
  "knee-lateral-pain.html": ["knee-pain.html", "knee-osteoarthritis.html", "meniscus-knee-pain.html", "ankle-stiffness-knee-pain.html"],
  "knee-posterior-pain.html": ["knee-pain.html", "knee-osteoarthritis.html", "meniscus-knee-pain.html", "knee-effusion.html"],
  "knee-front-pain.html": ["knee-pain.html", "knee-osteoarthritis.html", "meniscus-knee-pain.html", "ankle-stiffness-knee-pain.html"],
  "meniscus-knee-pain.html": ["knee-pain.html", "knee-osteoarthritis.html", "knee-front-pain.html", "knee-lateral-pain.html"],
  "bowlegs-knee-pain.html": ["knee-pain.html", "knee-osteoarthritis.html", "pes-anserine-bursitis.html", "ankle-stiffness-knee-pain.html"],
  "knee-hyperextension.html": ["knee-pain.html", "knee-osteoarthritis.html", "knee-posterior-pain.html", "ankle-stiffness-knee-pain.html"],
  "ankle-stiffness-knee-pain.html": ["knee-pain.html", "knee-osteoarthritis.html", "knee-front-pain.html", "plantar-fasciitis.html"],
  "plantar-fasciitis.html": ["ankle-stiffness-knee-pain.html", "knee-pain.html", "hip-osteoarthritis.html", "lower-back-pain.html"],
  "shoulder-stiffness.html": ["frozen-shoulder.html", "cervical-spondylosis.html", "thoracic-outlet.html", "tmj.html"],
  "frozen-shoulder.html": ["shoulder-stiffness.html", "cervical-spondylosis.html", "thoracic-outlet.html"],
  "cervical-spondylosis.html": ["shoulder-stiffness.html", "thoracic-outlet.html", "carpal-tunnel.html", "frozen-shoulder.html"],
  "thoracic-outlet.html": ["shoulder-stiffness.html", "cervical-spondylosis.html", "carpal-tunnel.html"],
  "carpal-tunnel.html": ["thoracic-outlet.html", "cervical-spondylosis.html", "elbow-tendinopathy.html"],
  "elbow-tendinopathy.html": ["shoulder-stiffness.html", "thoracic-outlet.html", "carpal-tunnel.html"],
  "scoliosis.html": ["lower-back-pain.html", "cervical-spondylosis.html", "shoulder-stiffness.html", "hip-osteoarthritis.html"],
  "tmj.html": ["shoulder-stiffness.html", "cervical-spondylosis.html", "thoracic-outlet.html"]
};

const symptomConfigs = {
  "knee-pain.html": {
    symptomKey: "knee-pain",
    label: "膝の痛み",
    keywords: ["膝の痛み", "膝痛", "歩くと膝が痛い", "階段", "立ち上がり", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: [
      "kashiwa-knee-pain-clinic-or-seitai",
      "knee-pain-stairs-guide",
      "walking-start-knee-pain-cause",
      "knee-medial-pain-difference"
    ]
  },
  "knee-osteoarthritis.html": {
    symptomKey: "knee-osteoarthritis",
    label: "変形性膝関節症",
    keywords: ["変形性膝関節症", "膝痛", "階段", "歩き始め", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: [
      "knee-osteoarthritis-daily-movement",
      "knee-osteoarthritis-before-surgery-walking",
      "knee-effusion-walking-guide",
      "patellofemoral-anterior-knee-pain"
    ]
  },
  "knee-effusion.html": {
    symptomKey: "knee-effusion",
    label: "膝に水がたまる",
    keywords: ["膝に水がたまる", "膝の腫れ", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: [
      "bakers-cyst-posterior-knee-fullness",
      "knee-effusion-water-in-knee",
      "knee-effusion-walking-guide",
      "knee-pain-daily-care"
    ]
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
    categoryHints: ["knee-pain", "exercise-therapy"],
    pinnedSlugs: [
      "bakers-cyst-posterior-knee-fullness",
      "knee-back-pain-baker-cyst-hamstring",
      "knee-effusion-water-in-knee",
      "knee-effusion-walking-guide"
    ]
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
    categoryHints: ["foot-walking", "knee-pain", "exercise-therapy"],
    pinnedSlugs: ["lumbricals-knee-low-back-pain-relation", "plantar-fasciitis-arch-walking"]
  },
  "lower-back-pain.html": {
    symptomKey: "lower-back-pain",
    label: "腰痛",
    keywords: ["腰痛", "腰", "立ち上がり", "歩行不安"],
    categoryHints: ["lower-back-pain", "hip-pain", "foot-walking", "exercise-therapy", "knee-pain"],
    pinnedSlugs: [
      "morning-low-back-stiffness",
      "morning-low-back-pain-causes-multifidus",
      "low-back-pain-hip-stiffness-relation",
      "lumbar-disc-herniation-leg-symptoms",
      "lumbar-spinal-stenosis-walking"
    ]
  },
  "sciatica.html": {
    symptomKey: "sciatica",
    label: "坐骨神経痛",
    keywords: ["坐骨神経痛", "お尻", "脚のしびれ", "しびれ"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"],
    pinnedSlugs: [
      "sciatica-buttock-leg",
      "sciatica-root-cause",
      "lumbar-disc-herniation-leg-symptoms",
      "lumbar-spinal-stenosis-walking",
      "leg-numbness-causes-lower-back-knee"
    ]
  },
  "spinal-stenosis.html": {
    symptomKey: "spinal-stenosis",
    label: "脊柱管狭窄症",
    keywords: ["脊柱管狭窄症", "椎間板ヘルニア", "間欠性跛行", "腰", "脚のしびれ"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"],
    pinnedSlugs: [
      "lumbar-spinal-stenosis-walking",
      "spinal-stenosis-exercise-before-surgery",
      "leg-numbness-causes-lower-back-knee",
      "lumbar-disc-herniation-leg-symptoms",
      "sciatica-root-cause"
    ]
  },
  "lumbar-disc-herniation.html": {
    symptomKey: "lumbar-disc-herniation",
    label: "腰椎椎間板ヘルニア",
    keywords: ["腰椎椎間板ヘルニア", "椎間板ヘルニア", "腰", "脚のしびれ", "坐骨神経痛"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"],
    pinnedSlugs: [
      "lumbar-disc-herniation-leg-symptoms",
      "sciatica-root-cause",
      "leg-numbness-causes-lower-back-knee",
      "spinal-stenosis-exercise-before-surgery",
      "lumbar-spinal-stenosis-walking"
    ]
  },
  "scoliosis.html": {
    symptomKey: "scoliosis",
    label: "側弯症",
    keywords: ["側弯症", "脊柱側弯症", "背骨", "姿勢", "腰", "背中"],
    categoryHints: ["lower-back-pain", "exercise-therapy", "neck-shoulder-hand"],
    excludedSlugs: ["lumbar-disc-herniation-leg-symptoms"]
  },
  "hip-osteoarthritis.html": {
    symptomKey: "hip-osteoarthritis",
    label: "変形性股関節症",
    keywords: ["変形性股関節症", "股関節", "歩きづらい", "膝をかばう"],
    categoryHints: ["hip-pain", "lower-back-pain", "foot-walking", "exercise-therapy", "knee-pain"],
    pinnedSlugs: [
      "hip-osteoarthritis-groin-pain",
      "iliopsoas-anterior-hip-stiffness",
      "gluteus-medius-pelvic-stability",
      "hip-pain-while-walking",
      "hip-pain-weight-bearing"
    ]
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
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"],
    pinnedSlugs: ["hand-numbness-causes-treatment", "shoulder-stiffness-posture-breathing", "frozen-shoulder-safe-movement"]
  },
  "thoracic-outlet.html": {
    symptomKey: "thoracic-outlet",
    label: "胸郭出口症候群",
    keywords: ["胸郭出口症候群", "腕のしびれ", "首肩", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"],
    pinnedSlugs: ["hand-numbness-causes-treatment", "shoulder-stiffness-posture-breathing", "frozen-shoulder-safe-movement"]
  },
  "carpal-tunnel.html": {
    symptomKey: "carpal-tunnel",
    label: "手根管症候群",
    keywords: ["手根管症候群", "手のしびれ", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"],
    pinnedSlugs: ["hand-numbness-causes-treatment", "elbow-pain-grip-shoulder", "shoulder-stiffness-posture-breathing"]
  },
  "elbow-tendinopathy.html": {
    symptomKey: "elbow-tendinopathy",
    label: "肘の痛み",
    keywords: ["肘の痛み", "肘", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"],
    pinnedSlugs: ["elbow-pain-grip-shoulder", "shoulder-stiffness-posture-breathing", "hand-numbness-causes-treatment"]
  },
  "plantar-fasciitis.html": {
    symptomKey: "plantar-fasciitis",
    label: "足底筋膜炎",
    keywords: ["足底筋膜炎", "足裏", "歩行", "慢性痛"],
    categoryHints: ["foot-walking", "exercise-therapy", "knee-pain"]
  },
  "tmj.html": {
    symptomKey: "tmj",
    label: "顎関節症",
    keywords: ["顎関節症", "顎", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  }
};

const relatedArticleSliderFiles = new Set([
  "lower-back-pain.html",
  "sciatica.html",
  "spinal-stenosis.html",
  "lumbar-disc-herniation.html",
  "hip-osteoarthritis.html"
]);

const patientVoices = [
  {
    name: "K.K様",
    concern: "坐骨神経痛・膝の痛み・腰の痛み",
    change: "施術後は身体が軽くなり、痛みのポイントを丁寧に見てもらえる安心感がありました。",
    comment: "誠実で信頼できる先生です。日々勉強されている姿勢にも安心できます。",
    image: "../image/patient-voice-kk-anonymized.webp",
    imageWidth: 1086,
    imageHeight: 1448,
    alt: "K.K様の写真付き直筆アンケート。坐骨神経痛、膝の痛み、腰の痛みなどで来院されたお声",
    symptomKeys: ["knee-osteoarthritis", "lower-back-pain", "sciatica"]
  },
  {
    name: "K.T様",
    concern: "強い腰痛と長年の膝痛",
    change: "施術とセルフトレーニングを続けることで、歩くつらさや刺すような膝の痛みが軽くなりました。",
    comment: "穏やかで相談しやすい先生なので、身体の悩みを気軽に話せました。",
    image: "../image/patient-voice-kt.webp",
    imageWidth: 1086,
    imageHeight: 1448,
    alt: "K.T様の写真付き直筆アンケート。腰痛と膝痛のお悩みで来院されたお声",
    symptomKeys: ["knee-osteoarthritis", "lower-back-pain"]
  },
  {
    name: "Y.O様",
    concern: "整形外科に通っても続く膝関節痛",
    change: "自宅でのストレッチと週1回の施術を続ける中で、階段の昇り降りや歩行が楽になったと感じられました。",
    comment: "痛み止めや注射に抵抗がある方も、まずは身体の状態を相談してみてください。",
    image: "../image/patient-voice-yo-knee-optimized.webp",
    originalImage: "../image/patient-voice-yo-knee.png",
    imageWidth: 760,
    imageHeight: 1013,
    alt: "Y.Oさん 膝痛・膝関節痛で来院された患者様の声",
    symptomKeys: ["knee-osteoarthritis"]
  },
  {
    name: "Y.N様",
    concern: "腰痛・肩こり・腹部の痛み",
    change: "施術と自宅でできるストレッチに取り組むことで、身体の動きが軽くなってきました。",
    comment: "丁寧に説明しながら進めてくれるので、不安がやわらぎ、安心して通えました。",
    image: "../image/patient-voice-yn.webp",
    imageWidth: 1103,
    imageHeight: 1426,
    alt: "Y.N様の直筆アンケート。腰痛、肩こり、腹部から股関節まわりの痛みで来院されたお声",
    symptomKeys: ["lower-back-pain", "shoulder-stiffness", "hip-osteoarthritis"]
  },
  {
    name: "Y.M様",
    concern: "そけい部・前大腿部付近の痛み、膝痛、足裏の痛み",
    change: "施術後は鋭い痛みがやわらぎ、身体が軽くなったと感じられました。",
    comment: "筋肉の使い方のバランスが痛みに関わることもあり、一度相談してみることをすすめられています。",
    image: "../image/patient-voice-ym-hip-optimized.webp",
    originalImage: "../image/patient-voice-ym-hip.png",
    imageWidth: 760,
    imageHeight: 1099,
    alt: "Y.Mさん そけい部・前大腿部付近の痛みで来院された患者様の声",
    symptomKeys: ["hip-osteoarthritis"]
  },
  {
    name: "N.H様",
    concern: "ねんざ後の全身の痛みや不調",
    change: "腰・足・首肩の状態を整えることで、日常のつらさが軽くなりました。",
    comment: "原因がわからない痛みや疲れを感じたら、自分の身体と向き合うことが大事だと思いました。",
    image: "../image/patient-voice-numajiri.webp",
    imageWidth: 1055,
    imageHeight: 1491,
    alt: "N.H様の写真付き直筆アンケート。ねんざによる全身的な痛みで来院されたお声",
    symptomKeys: ["lower-back-pain", "shoulder-stiffness"]
  }
];



const relatedArticleSliderScript = `
  <!-- RELATED_ARTICLES_SLIDER_SCRIPT_START -->
  <script>
    (() => {
      const slider = document.querySelector('[data-related-article-slider]');
      if (!slider) return;

      const track = slider.querySelector('[data-related-track]');
      const prev = slider.querySelector('[data-related-prev]');
      const next = slider.querySelector('[data-related-next]');
      const dotsRoot = slider.querySelector('[data-related-dots]');
      const cards = Array.from(slider.querySelectorAll('.related-articles-slider__card'));
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!track || !cards.length) return;

      const getCardStep = () => {
        const first = cards[0];
        const second = cards[1];
        if (!first) return track.clientWidth;
        if (second) return second.offsetLeft - first.offsetLeft;
        return first.getBoundingClientRect().width;
      };

      const getActiveIndex = () => {
        const target = track.scrollLeft;
        let activeIndex = 0;
        let closest = Number.POSITIVE_INFINITY;
        cards.forEach((card, index) => {
          const distance = Math.abs(card.offsetLeft - cards[0].offsetLeft - target);
          if (distance < closest) {
            closest = distance;
            activeIndex = index;
          }
        });
        return activeIndex;
      };

      const scrollToCard = (index) => {
        const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
        if (!card) return;
        track.scrollTo({
          left: card.offsetLeft - cards[0].offsetLeft,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      };

      const dots = cards.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'related-articles-slider__dot';
        dot.setAttribute('aria-label', String(index + 1) + '番目の記事へ移動');
        dot.addEventListener('click', () => scrollToCard(index));
        dotsRoot?.appendChild(dot);
        return dot;
      });

      const updateControls = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
        const hasOverflow = maxScroll > 1;
        const activeIndex = getActiveIndex();

        if (prev) {
          prev.disabled = !hasOverflow || track.scrollLeft <= 2;
          prev.hidden = !hasOverflow;
        }
        if (next) {
          next.disabled = !hasOverflow || track.scrollLeft >= maxScroll;
          next.hidden = !hasOverflow;
        }
        if (dotsRoot) dotsRoot.hidden = !hasOverflow || cards.length < 2;
        dots.forEach((dot, index) => {
          dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
        });
      };

      let scrollFrame = 0;
      track.addEventListener('scroll', () => {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(updateControls);
      }, { passive: true });

      prev?.addEventListener('click', () => {
        track.scrollBy({ left: -getCardStep(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
      next?.addEventListener('click', () => {
        track.scrollBy({ left: getCardStep(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });

      track.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        track.scrollBy({ left: direction * getCardStep(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });

      let isDragging = false;
      let dragStartX = 0;
      let dragStartScroll = 0;
      let suppressClick = false;

      track.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch' || event.button !== 0) return;
        isDragging = true;
        suppressClick = false;
        dragStartX = event.clientX;
        dragStartScroll = track.scrollLeft;
        track.classList.add('is-dragging');
        track.setPointerCapture(event.pointerId);
      });

      track.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        const delta = event.clientX - dragStartX;
        if (Math.abs(delta) > 6) suppressClick = true;
        track.scrollLeft = dragStartScroll - delta;
      });

      const stopDragging = (event) => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');
        if (event.pointerId && track.hasPointerCapture(event.pointerId)) {
          track.releasePointerCapture(event.pointerId);
        }
        window.setTimeout(() => {
          suppressClick = false;
        }, 0);
      };

      track.addEventListener('pointerup', stopDragging);
      track.addEventListener('pointercancel', stopDragging);
      track.addEventListener('pointerleave', stopDragging);
      track.addEventListener('click', (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);

      window.addEventListener('resize', updateControls);
      updateControls();
    })();
  </script>
  <!-- RELATED_ARTICLES_SLIDER_SCRIPT_END -->
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
    HOME_PATH: "/",
    BLOG_PATH: "./",
    ACCESS_PATH: "/access.html",
    CONTACT_PATH: "/#access",
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
      const relatedPosts = selectBlogRelatedPosts(post, posts);
      const postHtml = renderTemplate(postTemplate, {
        SEO_HEAD: buildPostSeo(blogData.site, post),
        CSS_PATH: "../../assets/blog.css",
        HOME_PATH: "/",
        BLOG_PATH: "../../",
        ACCESS_PATH: "/access.html",
        CONTACT_PATH: "/#access",
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
  await updateSymptomsDirectoryPage(blogData.site);

  await fs.writeFile(path.join(rootDir, "blog.html"), cleanGeneratedText(buildBlogRedirectHtml()), "utf8");
  await fs.writeFile(path.join(rootDir, "blog-detail.html"), cleanGeneratedText(buildLegacyDetailRedirectHtml()), "utf8");
  await updateSitemap(blogData.site, posts);

  console.log(`Generated ${posts.length} static blog post(s), updated symptom related articles, and regenerated sitemap.xml.`);
}

export function selectBlogRelatedPosts(post, posts, limit = 2) {
  const candidates = posts.filter((item) => item.slug !== post.slug);
  const bySlug = new Map(candidates.map((item) => [item.slug, item]));
  const requestedSlugs = Array.isArray(post.relatedSlugs) ? [...new Set(post.relatedSlugs.filter(Boolean))] : [];
  const missingSlugs = requestedSlugs.filter((slug) => !bySlug.has(slug));
  if (missingSlugs.length) {
    throw new Error(`Unknown relatedSlugs for ${post.slug}: ${missingSlugs.join(", ")}`);
  }

  const selected = requestedSlugs.map((slug) => bySlug.get(slug));
  const selectedSlugs = new Set(requestedSlugs);
  const sameCategory = candidates.filter((item) => item.category.slug === post.category.slug && !selectedSlugs.has(item.slug));

  return [...selected, ...sameCategory].slice(0, Math.max(1, limit));
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
      if (error?.code === "ENOENT") {
        // Continue and move the staging directory into place below.
      } else if (isRenameBlocked(error)) {
        await syncDirectoryContents(stagingDir, targetDir);
        await fs.rm(stagingDir, { recursive: true, force: true });
        return;
      } else {
        throw error;
      }
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

function isRenameBlocked(error) {
  return ["EACCES", "EBUSY", "EPERM"].includes(error?.code);
}

async function syncDirectoryContents(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });

  const sourceEntries = await fs.readdir(sourceDir, { withFileTypes: true });
  const sourceNames = new Set(sourceEntries.map((entry) => entry.name));
  const targetEntries = await fs.readdir(targetDir, { withFileTypes: true }).catch((error) => {
    if (error?.code === "ENOENT") return [];
    throw error;
  });

  await Promise.all(
    targetEntries
      .filter((entry) => !sourceNames.has(entry.name))
      .map((entry) => fs.rm(path.join(targetDir, entry.name), { recursive: true, force: true }))
  );

  for (const entry of sourceEntries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await syncDirectoryContents(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

const symptomGoogleFontUrl = "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap";
const symptomPerformanceStylesheet = "site-performance.css";
const symptomPerformanceStylesheetVersion = "20260726";
const symptomPerformanceStylesheetSources = [
  "site-pricing.css",
  "site-content-figures.css",
  "site-consultation-sections.css",
  "site-header.css",
  "site-footer.css",
  "site-flow.css",
  "site-faq.css",
  "site-discovery.css",
  "site-cycle-flow.css"
];
const symptomMobileHeroSources = [
  { fileName: "坐骨神経痛-sp.webp", width: 1086, height: 1448 },
  { fileName: "変形性股関節症-sp.webp", width: 1024, height: 1536 },
  { fileName: "変形性膝関節症-sp.webp", width: 1023, height: 1537 },
  { fileName: "椎間板ヘルニア-sp.webp", width: 1024, height: 1536 },
  { fileName: "脊柱菅狭窄症-sp.webp", width: 941, height: 1672 },
  { fileName: "腰痛・ギックリ腰-sp.webp", width: 1024, height: 1536 }
];

async function writeSymptomPerformanceStylesheet() {
  const stylesheets = await Promise.all(
    symptomPerformanceStylesheetSources.map(async (fileName) => {
      const css = await fs.readFile(path.join(symptomsDir, fileName), "utf8");
      return `/* ${fileName} */\n${css.trim()}`;
    })
  );
  await fs.writeFile(
    path.join(symptomsDir, symptomPerformanceStylesheet),
    `/* Generated by scripts/build-blog.mjs. Do not edit directly. */\n${stylesheets.join("\n\n")}\n`,
    "utf8"
  );
}

function optimizeSymptomStylesheets(html) {
  const stylesheetNames = [...symptomPerformanceStylesheetSources, symptomPerformanceStylesheet];
  const stylesheetPattern = new RegExp(
    `\\s*<link\\s+rel="stylesheet"\\s+href="(?:${stylesheetNames.map(escapeRegExp).join("|")})(?:\\?v=\\d+)?"\\s*>`,
    "g"
  );
  const nextHtml = html.replace(stylesheetPattern, "");
  const bundleLink = `<link rel="stylesheet" href="${symptomPerformanceStylesheet}?v=${symptomPerformanceStylesheetVersion}">`;
  return nextHtml.replace(/\s*<\/head>/, `\n  ${bundleLink}\n</head>`);
}

function optimizeSymptomHeroSources(html) {
  let nextHtml = html;
  for (const source of symptomMobileHeroSources) {
    const originalPath = `../image/symptom-hero/${source.fileName}`;
    const basePath = originalPath.replace(/-sp\.webp$/, "");
    const sourcePattern = new RegExp(
      `<source\\s+media="\\(max-width:\\s*767px\\)"\\s+srcset="${escapeRegExp(originalPath)}"[^>]*>`,
      "g"
    );
    const responsiveSource = [
      '<source media="(max-width: 767px)"',
      `srcset="${basePath}-sp-480.webp 480w, ${basePath}-sp-768.webp 768w, ${originalPath} ${source.width}w"`,
      'sizes="100vw"',
      `width="${source.width}"`,
      `height="${source.height}">`
    ].join(" ");
    nextHtml = nextHtml.replace(sourcePattern, responsiveSource);
  }
  return nextHtml;
}

function upsertSymptomSocialMetadata(html, site) {
  const getContent = (pattern) => html.match(pattern)?.[1]?.trim() || "";
  const title = getContent(/<meta property="og:title" content="([^"]*)">/i)
    || getContent(/<title>([\s\S]*?)<\/title>/i);
  const description = getContent(/<meta property="og:description" content="([^"]*)">/i)
    || getContent(/<meta name="description" content="([^"]*)">/i);
  const canonical = getContent(/<meta property="og:url" content="([^"]*)">/i)
    || getContent(/<link rel="canonical" href="([^"]*)">/i);
  const image = getContent(/<meta property="og:image" content="([^"]*)">/i)
    || absoluteUrl(site.url, site.ogImage);
  const type = getContent(/<meta property="og:type" content="([^"]*)">/i) || "website";
  const socialProperties = ["og:locale", "og:type", "og:title", "og:description", "og:url", "og:site_name", "og:image"];
  const socialNames = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  let nextHtml = html;

  for (const property of socialProperties) {
    nextHtml = nextHtml.replace(
      new RegExp(`\\s*<meta\\s+property="${escapeRegExp(property)}"\\s+content="[^"]*"\\s*>`, "gi"),
      ""
    );
  }
  for (const name of socialNames) {
    nextHtml = nextHtml.replace(
      new RegExp(`\\s*<meta\\s+name="${escapeRegExp(name)}"\\s+content="[^"]*"\\s*>`, "gi"),
      ""
    );
  }

  const socialTags = [
    '<meta property="og:locale" content="ja_JP">',
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${image}">`
  ].join("\n  ");

  return nextHtml.replace(/\s*<\/head>/, `\n  ${socialTags}\n</head>`);
}

export function optimizeSymptomPageAssets(html) {
  let nextHtml = html
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, "")
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g, "")
    .replace(
      new RegExp(`<link\\s+rel="preload"\\s+as="style"\\s+href="${escapeRegExp(symptomGoogleFontUrl)}"[^>]*>\\s*`, "g"),
      ""
    )
    .replace(
      new RegExp(`<noscript><link\\s+rel="stylesheet"\\s+href="${escapeRegExp(symptomGoogleFontUrl)}"></noscript>\\s*`, "g"),
      ""
    )
    .replace(
      new RegExp(`<link\\s+href="${escapeRegExp(symptomGoogleFontUrl)}"\\s+rel="stylesheet"\\s*>\\s*`, "g"),
      ""
    );

  nextHtml = nextHtml.replace(
    /<script src="\.\.\/scripts\/vendor\/lucide\.min\.js"><\/script>/g,
    '<script src="../scripts/vendor/lucide.min.js" defer></script>'
  );
  nextHtml = nextHtml.replace(/<script>\s*lucide\.createIcons\(\);\s*<\/script>\s*/g, "");
  nextHtml = nextHtml.replace(
    /<script src="site-header\.js"><\/script>/g,
    '<script src="site-header.js" defer></script>'
  );
  nextHtml = optimizeSymptomHeroSources(nextHtml);
  nextHtml = optimizeSymptomStylesheets(nextHtml);

  return nextHtml;
}

async function updateSymptomPages(site, posts) {
  await writeSymptomPerformanceStylesheet();
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
    html = upsertSymptomTrustGuidance(html, config);
    html = upsertSymptomReviewerStructuredData(html);
    html = normalizeSymptomSafetyCopy(html, fileName);
    html = upsertSymptomMidCta(html, site);
    if (NOINDEX_SYMPTOM_FILES.has(fileName)) {
      html = ensureNoindexFollow(html);
    } else {
      html = removeNoindexFollow(html);
    }

    const relatedPostLimit = isRelatedArticleSliderPage(fileName) ? 5 : 4;
    const matchedPosts = selectRelatedPosts(config, posts).slice(0, relatedPostLimit);
    const sectionHtml = matchedPosts.length ? buildRelatedArticlesSection(site, config, matchedPosts) : "";
    html = replaceRelatedSection(html, sectionHtml);
    html = upsertRelatedArticleSliderScript(html, config);
    html = upsertSymptomPageToc(html);
    html = normalizeSymptomPageDesign(html, site, config);
    html = optimizeSymptomPageAssets(html);
    html = upsertSymptomSocialMetadata(html, site);

    await fs.writeFile(fullPath, cleanGeneratedText(html), "utf8");
  }
}

const symptomsDirectoryStyles = `
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: "BIZ UDPGothic", "Noto Sans JP", system-ui, sans-serif; line-height: 1.8; color: #263b34; background: #fff; }
    a { color: inherit; }
    .page { min-height: 100vh; padding: 88px 18px 72px; background: #fff; }
    .symptom-directory-hero { width: min(960px, 100%); margin: 0 auto; padding: clamp(34px, 6vw, 64px) 0 clamp(48px, 7vw, 76px); border-bottom: 1px solid #dfe4dc; }
    .symptom-directory-hero__label { margin: 0 0 12px; color: #356b2f; font-size: .82rem; font-weight: 900; letter-spacing: .08em; }
    .symptom-directory-hero h1 { position: relative; margin: 0 0 26px; padding-bottom: 18px; color: #223b2d; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.35; letter-spacing: 0; }
    .symptom-directory-hero h1::after { content: ""; position: absolute; left: 0; bottom: 0; width: 52px; height: 3px; background: #356b2f; }
    .symptom-directory-hero__lead { max-width: 720px; margin: 0; color: #59635d; font-size: clamp(1rem, 2vw, 1.12rem); font-weight: 700; line-height: 1.9; }
    .symptom-directory-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    .symptom-directory-hero__button { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 11px 18px; border: 1px solid #356b2f; border-radius: 8px; background: #356b2f; color: #fff; font-size: .94rem; font-weight: 900; text-decoration: none; }
    .symptom-directory-hero__button--secondary { background: #fff; color: #234d24; }
    .symptom-directory-hero__button:hover, .symptom-directory-hero__button:focus-visible { outline: 3px solid rgba(53,107,47,.18); outline-offset: 3px; }
    .symptom-directory { width: min(960px, 100%); margin: 0 auto; padding: clamp(58px, 8vw, 92px) 0 0; }
    .symptom-directory__heading { margin-bottom: clamp(34px, 5vw, 52px); }
    .symptom-directory__heading h2 { position: relative; margin: 0 0 18px; padding-bottom: 15px; color: #223b2d; font-size: clamp(1.65rem, 3vw, 2.2rem); line-height: 1.45; letter-spacing: 0; }
    .symptom-directory__heading h2::after { content: ""; position: absolute; left: 0; bottom: 0; width: 46px; height: 3px; background: #356b2f; }
    .symptom-directory__heading p { margin: 0; color: #59635d; font-size: .98rem; font-weight: 700; line-height: 1.85; }
    .symptom-directory__modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 0 0 clamp(34px, 5vw, 52px); }
    .symptom-directory__mode { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: center; min-height: 58px; padding: 10px 14px; border: 1px solid #cbd8c6; border-radius: 8px; background: #fff; color: #365047; font: inherit; font-size: .9rem; font-weight: 900; line-height: 1.45; text-align: left; cursor: pointer; }
    .symptom-directory__mode-number { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid #aebfa8; border-radius: 50%; color: #356b2f; font-size: .78rem; }
    .symptom-directory__mode[aria-selected="true"] { border-color: #356b2f; background: #f2f7ef; color: #234d24; box-shadow: inset 0 -3px 0 #356b2f; }
    .symptom-directory__mode[aria-selected="true"] .symptom-directory__mode-number { border-color: #356b2f; background: #356b2f; color: #fff; }
    .symptom-directory__mode:hover, .symptom-directory__mode:focus-visible { outline: 3px solid rgba(53,107,47,.16); outline-offset: 2px; }
    .symptom-directory__panel[hidden] { display: none; }
    .symptom-directory__panel-heading { margin: 0 0 22px; padding-left: 14px; border-left: 4px solid #d58b40; }
    .symptom-directory__panel-heading h3 { margin: 0; color: #223b2d; font-size: clamp(1.25rem, 2.4vw, 1.6rem); line-height: 1.5; }
    .symptom-directory__panel-heading p { margin: .4rem 0 0; color: #69736c; font-size: .86rem; font-weight: 700; line-height: 1.7; }
    .symptom-directory__groups { columns: 2; column-gap: clamp(44px, 6vw, 72px); }
    .symptom-directory__quick-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 28px; border-top: 1px solid #e5e9e2; }
    .symptom-directory__group { display: inline-block; width: 100%; min-width: 0; margin-bottom: 34px; padding: 34px 0 6px; border-top: 1px solid #dfe4dc; break-inside: avoid; }
    .symptom-directory__group-header { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; align-items: start; margin-bottom: 19px; }
    .symptom-directory__group-icon { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid #aebfa8; border-radius: 50%; color: #356b2f; }
    .symptom-directory__group-icon svg { width: 20px; height: 20px; stroke-width: 1.8; }
    .symptom-directory__group h3 { margin: 0 0 5px; color: #223b2d; font-size: 1.24rem; line-height: 1.45; }
    .symptom-directory__group-description { margin: 0; color: #69736c; font-size: .84rem; font-weight: 700; line-height: 1.7; }
    .symptom-directory__links { display: grid; gap: 0; border-top: 1px solid #e5e9e2; }
    .symptom-directory__link { position: relative; display: grid; gap: 4px; min-height: 76px; padding: 14px 46px 14px 4px; border-bottom: 1px solid #e5e9e2; text-decoration: none; }
    .symptom-directory__link-title { color: #234d24; font-size: .98rem; font-weight: 900; line-height: 1.5; }
    .symptom-directory__link-description { color: #69736c; font-size: .79rem; font-weight: 700; line-height: 1.65; }
    .symptom-directory__link-arrow { position: absolute; right: 4px; top: 50%; display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid #cbd8c6; border-radius: 50%; color: #356b2f; font-size: 20px; font-weight: 900; line-height: 1; transform: translateY(-50%); transition: background .2s, color .2s, transform .2s; }
    .symptom-directory__link:hover, .symptom-directory__link:focus-visible { background: #fafcf8; outline: 3px solid rgba(53,107,47,.15); outline-offset: 2px; }
    .symptom-directory__link:hover .symptom-directory__link-arrow, .symptom-directory__link:focus-visible .symptom-directory__link-arrow { background: #356b2f; color: #fff; transform: translateY(-50%) translateX(2px); }
    @media (max-width: 767px) {
      .page { padding: 60px 16px 94px; }
      .symptom-directory-hero { padding-top: 30px; padding-bottom: 52px; }
      .symptom-directory-hero__actions { display: grid; }
      .symptom-directory-hero__button { width: 100%; }
      .symptom-directory__modes { grid-template-columns: 1fr; gap: 8px; }
      .symptom-directory__mode { min-height: 52px; }
      .symptom-directory__groups { columns: 1; }
      .symptom-directory__quick-links { grid-template-columns: 1fr; }
      .symptom-directory__group { margin-bottom: 24px; padding-top: 30px; }
      .symptom-directory__group-header { gap: 12px; }
      .symptom-directory__link { min-height: 72px; }
    }
`;

async function updateSymptomsDirectoryPage(site) {
  const directoryPath = path.join(symptomsDir, "index.html");
  let html = await fs.readFile(directoryPath, "utf8");

  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>症状別ページ｜整体院ひざこぞう</title>");
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    '<meta name="description" content="腰・お尻・脚、股関節、膝、足首・足裏、首・肩・腕・手、背骨・姿勢・顎の症状別ページを部位から探せます。">'
  );
  html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${symptomsDirectoryStyles}\n  </style>`);
  html = html.replace(/<main class="page">[\s\S]*?<\/main>/, buildSymptomsDirectoryMain());
  html = normalizeSymptomsDirectoryLinkLabel(html);
  html = upsertSymptomsDirectoryScript(html);
  html = optimizeSymptomPageAssets(html);
  html = upsertSymptomSocialMetadata(html, site);

  await fs.writeFile(directoryPath, cleanGeneratedText(html), "utf8");
}

function buildSymptomsDirectoryMain() {
  const iconByGroup = {
    "waist-leg": "person-standing",
    hip: "accessibility",
    knee: "activity",
    foot: "footprints",
    "upper-body": "hand",
    "posture-jaw": "scan-face"
  };
  const groups = symptomDirectoryGroups
    .map((group) => {
      const links = group.items
        .map((item) => `
            <a class="symptom-directory__link" href="${escapeHtml(item.href)}" data-tracking-content-group="symptom-directory">
              <span class="symptom-directory__link-title">${escapeHtml(item.label)}</span>
              <span class="symptom-directory__link-description">${escapeHtml(item.description)}</span>
              <span class="symptom-directory__link-arrow" aria-hidden="true">›</span>
            </a>`)
        .join("");
      return `
        <section class="symptom-directory__group" aria-labelledby="symptom-group-${escapeHtml(group.id)}">
          <div class="symptom-directory__group-header">
            <span class="symptom-directory__group-icon" aria-hidden="true"><i data-lucide="${iconByGroup[group.id]}"></i></span>
            <div>
              <h3 id="symptom-group-${escapeHtml(group.id)}">${escapeHtml(group.title)}</h3>
              <p class="symptom-directory__group-description">${escapeHtml(group.description)}</p>
            </div>
          </div>
          <div class="symptom-directory__links">
${links}
          </div>
        </section>`;
    })
    .join("");
  const movementLinks = buildSymptomsDirectoryLinkList(symptomDirectoryMovementItems);
  const diagnosisLinks = buildSymptomsDirectoryLinkList(symptomDirectoryDiagnosisItems);

  return `<main class="page">
    <span id="top" class="page-top-anchor" aria-hidden="true"></span>
    <section class="symptom-directory-hero" aria-labelledby="page-title">
      <p class="symptom-directory-hero__label">SYMPTOMS</p>
      <h1 id="page-title">症状別ページ</h1>
      <p class="symptom-directory-hero__lead">痛む場所や、つらさを感じる動作に近いページからご覧ください。病名が分からない場合も、気になる部位から探せます。</p>
      <div class="symptom-directory-hero__actions">
        <a class="symptom-directory-hero__button" href="../index.html#contact">相談・予約へ進む</a>
        <a class="symptom-directory-hero__button symptom-directory-hero__button--secondary" href="../index.html">トップページへ戻る</a>
      </div>
    </section>

    <section class="symptom-directory" aria-labelledby="symptom-directory-title">
      <div class="symptom-directory__heading">
        <h2 id="symptom-directory-title">自分に近い探し方を選んでください</h2>
        <p>病名が分からなくても大丈夫です。痛む場所、つらい動作、医療機関で言われた名前のいずれかから探せます。</p>
      </div>
      <div class="symptom-directory__modes" role="tablist" aria-label="症状ページの探し方">
        <button type="button" id="directory-tab-location" class="symptom-directory__mode" role="tab" aria-selected="true" data-directory-mode="location" aria-controls="directory-panel-location" tabindex="0">
          <span class="symptom-directory__mode-number" aria-hidden="true">1</span>
          <span>痛む場所から探す</span>
        </button>
        <button type="button" id="directory-tab-movement" class="symptom-directory__mode" role="tab" aria-selected="false" data-directory-mode="movement" aria-controls="directory-panel-movement" tabindex="-1">
          <span class="symptom-directory__mode-number" aria-hidden="true">2</span>
          <span>つらい動作から探す</span>
        </button>
        <button type="button" id="directory-tab-diagnosis" class="symptom-directory__mode" role="tab" aria-selected="false" data-directory-mode="diagnosis" aria-controls="directory-panel-diagnosis" tabindex="-1">
          <span class="symptom-directory__mode-number" aria-hidden="true">3</span>
          <span>病院で言われた名前から探す</span>
        </button>
      </div>
      <div id="directory-panel-location" class="symptom-directory__panel" role="tabpanel" aria-labelledby="directory-tab-location" data-directory-panel="location">
        <div class="symptom-directory__panel-heading">
          <h3>痛む場所から探す</h3>
          <p>同じ場所の痛みでも状態には個人差があります。近い内容が複数ある場合は、あわせてご確認ください。</p>
        </div>
        <div class="symptom-directory__groups">
${groups}
        </div>
      </div>
      <div id="directory-panel-movement" class="symptom-directory__panel" role="tabpanel" aria-labelledby="directory-tab-movement" data-directory-panel="movement" hidden>
        <div class="symptom-directory__panel-heading">
          <h3>つらい動作から探す</h3>
          <p>日常生活で困っている場面に近い項目を選んでください。</p>
        </div>
        <div class="symptom-directory__quick-links">
${movementLinks}
        </div>
      </div>
      <div id="directory-panel-diagnosis" class="symptom-directory__panel" role="tabpanel" aria-labelledby="directory-tab-diagnosis" data-directory-panel="diagnosis" hidden>
        <div class="symptom-directory__panel-heading">
          <h3>病院で言われた名前から探す</h3>
          <p>医療機関で伝えられた診断名に近いページからご確認ください。</p>
        </div>
        <div class="symptom-directory__quick-links">
${diagnosisLinks}
        </div>
      </div>
    </section>
  </main>`;
}

function buildSymptomsDirectoryLinkList(items) {
  return items.map((item) => `
          <a class="symptom-directory__link" href="${escapeHtml(item.href)}" data-tracking-content-group="symptom-directory">
            <span class="symptom-directory__link-title">${escapeHtml(item.label)}</span>
            <span class="symptom-directory__link-description">${escapeHtml(item.description)}</span>
            <span class="symptom-directory__link-arrow" aria-hidden="true">›</span>
          </a>`).join("");
}

function upsertSymptomsDirectoryScript(html) {
  const startMarker = "<!-- SYMPTOM_DIRECTORY_SCRIPT_START -->";
  const endMarker = "<!-- SYMPTOM_DIRECTORY_SCRIPT_END -->";
  const script = `${startMarker}
  <script>
    (() => {
      const root = document.querySelector('.symptom-directory');
      if (!root) return;
      const tabs = Array.from(root.querySelectorAll('[data-directory-mode]'));
      const panels = Array.from(root.querySelectorAll('[data-directory-panel]'));
      if (!tabs.length || !panels.length) return;
      root.classList.add('is-enhanced');

      const activate = (nextTab, focus = false) => {
        const mode = nextTab.dataset.directoryMode;
        tabs.forEach((tab) => {
          const selected = tab === nextTab;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.directoryPanel !== mode;
        });
        if (focus) nextTab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab));
        tab.addEventListener('keydown', (event) => {
          let nextIndex = index;
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = tabs.length - 1;
          if (nextIndex === index && !['Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          activate(tabs[nextIndex], true);
        });
      });
    })();
  </script>
  ${endMarker}`;

  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`), script);
  }
  return html.replace("</body>", `${script}\n</body>`);
}

function normalizeSymptomsDirectoryLinkLabel(html) {
  return html.replaceAll("その他の足腰の症状", "すべての症状を見る").replaceAll("その他の慢性症状", "すべての症状を見る");
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
      .filter((fileName) => fileName.endsWith(".html") && !NOINDEX_SYMPTOM_FILES.has(fileName))
      .sort((a, b) => a.localeCompare(b, "ja"))
      .map(async (fileName) => ({
        loc: fileName === "index.html" ? `${siteRoot}/symptoms/` : `${siteRoot}/symptoms/${fileName}`,
        lastmod: await getFileLastmod(path.join(symptomsDir, fileName)),
        changefreq: "monthly",
        priority: "0.8"
      }))
  );

  const postEntries = posts
    .filter((post) => !NOINDEX_POST_CATEGORIES.has(post.category?.slug))
    .map((post) => ({
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

function ensureNoindexFollow(html) {
  if (/<meta\s+name="robots"[^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="noindex,follow">');
  }
  return html.replace(/(<meta name="viewport"[^>]*>\s*)/i, '$1\n  <meta name="robots" content="noindex,follow">');
}

function removeNoindexFollow(html) {
  return html.replace(/\s*<meta\s+name="robots"\s+content="noindex,follow"\s*>\s*/i, "\n");
}

export function upsertRelatedStyles(html) {
  const sharedStylesheet = '<link rel="stylesheet" href="site-discovery.css">';
  let nextHtml = html;

  if (html.includes("BLOG_RELATED_ARTICLES_STYLES_START")) {
    const relatedStylesPattern = /\/\* BLOG_RELATED_ARTICLES_STYLES_START \*\/[\s\S]*?\/\* BLOG_RELATED_ARTICLES_STYLES_END \*\//;
    const currentRelatedStyles = html.match(relatedStylesPattern)?.[0] ?? "";
    const educationStyles = currentRelatedStyles.match(/\/\* [A-Z0-9_]+_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* [A-Z0-9_]+_EDUCATION_STYLES_END \*\//g) ?? [];
    nextHtml = html.replace(relatedStylesPattern, educationStyles.join("\n"));
  }

  if (!nextHtml.includes(sharedStylesheet)) {
    nextHtml = nextHtml.replace("</head>", `  ${sharedStylesheet}\n</head>`);
  }
  return nextHtml;
}

function upsertSymptomPageToc(html) {
  const startMarker = "<!-- SYMPTOM_PAGE_TOC_START -->";
  const endMarker = "<!-- SYMPTOM_PAGE_TOC_END -->";
  const existingPattern = new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`);
  let nextHtml = html.replace(existingPattern, "");
  const educationMarker = nextHtml.match(/<!-- [A-Z0-9_]+_EDUCATION_START -->/)?.[0];
  if (!educationMarker) return nextHtml;

  const educationStart = nextHtml.indexOf(educationMarker);
  const educationHtml = nextHtml.slice(educationStart);
  const headings = [...educationHtml.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => ({
      id: match[1],
      text: match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    }));
  const preferredSuffixes = ["cause-title", "factors-title", "medical-title", "assessment-title", "approach-title"];
  const items = preferredSuffixes
    .map((suffix) => headings.find((heading) => heading.id.endsWith(suffix)))
    .filter(Boolean);
  if (items.length < 5) return nextHtml;

  const links = items
    .map((item) => `<li><a class="symptom-page-toc__link" href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>`)
    .join("\n          ");
  const tocHtml = `${startMarker}
    <nav class="symptom-page-toc" aria-label="ページの内容">
      <div class="container max-w-4xl symptom-page-toc__inner">
        <p class="symptom-page-toc__heading">このページで分かること</p>
        <ol class="symptom-page-toc__list">
          ${links}
        </ol>
      </div>
    </nav>
${endMarker}

`;
  return nextHtml.replace(educationMarker, `${tocHtml}${educationMarker}`);
}

function upsertRelatedArticleSliderScript(html, config = {}) {
  const markerPattern = /\s*<!-- RELATED_ARTICLES_SLIDER_SCRIPT_START -->[\s\S]*?<!-- RELATED_ARTICLES_SLIDER_SCRIPT_END -->\s*/;
  let nextHtml = html.replace(markerPattern, "\n");
  nextHtml = nextHtml.replace(/\s*<script>\s*\(\(\) => \{\s*const slider = document\.querySelector\('\[data-related-article-slider\]'\);[\s\S]*?\}\)\(\);\s*<\/script>\s*/, "\n");

  if (!isRelatedArticleSliderPage(config.fileName)) {
    return nextHtml;
  }

  const lucidePattern = /(\s*<script>\s*lucide\.createIcons\(\);\s*<\/script>)/;
  if (lucidePattern.test(nextHtml)) {
    return nextHtml.replace(lucidePattern, `\n  ${relatedArticleSliderScript}$1`);
  }

  return nextHtml.replace("</body>", `\n  ${relatedArticleSliderScript}\n</body>`);
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
    ? `${escapeHtml(config.label)}と関わりやすいお悩みで来院された方の内容を掲載しています。症状や経過には個人差があるため、初回は状態を確認しながら方針をご説明します。`
    : "関連するお悩みで来院された方の内容を掲載しています。症状や経過には個人差があるため、初回は状態を確認しながら方針をご説明します。";
  const title = config.symptomKey === "knee-osteoarthritis"
    ? "膝や歩き方のお悩みでご相談いただいた方の声"
    : "この症状に関連するお声";

  const cards = voices.map((voice) => `
          <article class="symptom-voice-card">
            <a class="symptom-voice-card__image-link" href="${escapeHtml(voice.originalImage || voice.image)}" target="_blank" rel="noopener noreferrer">
              <img class="symptom-voice-card__image" src="${escapeHtml(voice.image)}" alt="${escapeHtml(voice.alt)}" loading="lazy" decoding="async" width="${voice.imageWidth}" height="${voice.imageHeight}">
            </a>
            <div class="symptom-voice-card__body">
              <p class="symptom-voice-card__label">${escapeHtml(voice.name)}</p>
              <div class="symptom-voice-card__rows">
                <div class="symptom-voice-card__row">
                  <span class="symptom-voice-card__key">お悩み</span>
                  <span class="symptom-voice-card__value">${escapeHtml(voice.concern)}</span>
                </div>
                <div class="symptom-voice-card__row">
                  <span class="symptom-voice-card__key">変化</span>
                  <span class="symptom-voice-card__value">${escapeHtml(voice.change)}</span>
                </div>
                <div class="symptom-voice-card__row">
                  <span class="symptom-voice-card__key">ひとこと</span>
                  <span class="symptom-voice-card__value">${escapeHtml(voice.comment)}</span>
                </div>
              </div>
            </div>
          </article>`).join("");

  return `<section class="symptom-voices">
      <div class="container max-w-4xl">
        <p class="symptom-voices__eyebrow">PATIENT VOICE</p>
        <h2 class="symptom-voices__title">${escapeHtml(title)}</h2>
        <p class="symptom-voices__lead">${lead}</p>
        <div class="symptom-voices__grid">
${cards}
        </div>
        <p class="symptom-voices__note">※効果には個人差があります。掲載しているお声は掲載許可をいただいた方の個人の感想であり、成果を保証するものではありません。</p>
      </div>
    </section>`;
}

function upsertSymptomTrustGuidance(html, config = {}) {
  const startMarker = "<!-- SYMPTOM_TRUST_GUIDANCE_START -->";
  const endMarker = "<!-- SYMPTOM_TRUST_GUIDANCE_END -->";
  const guidance = symptomTrustGuidance[config.fileName];
  if (!guidance) return html;

  const wrapped = `${startMarker}
${buildSymptomTrustGuidance(config, guidance)}
${endMarker}

`;
  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), wrapped);
  }

  if (html.includes("<!-- SYMPTOM_PATIENT_VOICES_START -->")) {
    return html.replace("<!-- SYMPTOM_PATIENT_VOICES_START -->", `${wrapped}<!-- SYMPTOM_PATIENT_VOICES_START -->`);
  }
  if (/<section\b[^>]*\bid="flow"[^>]*>/.test(html)) {
    return html.replace(/<section\b[^>]*\bid="flow"[^>]*>/, (match) => `${wrapped}${match}`);
  }
  if (/<section\b[^>]*class="[^"]*\bfaq\b[^"]*"[^>]*>/.test(html)) {
    return html.replace(/<section\b[^>]*class="[^"]*\bfaq\b[^"]*"[^>]*>/, (match) => `${wrapped}${match}`);
  }
  return html;
}

function buildSymptomTrustGuidance(config, guidance) {
  const majorGuide = guidance.majorGuide
    ? `<section class="symptom-major-guide" data-major-symptom-guide="${escapeHtml(config.symptomKey)}" aria-labelledby="${escapeHtml(config.symptomKey)}-major-guide-title">
          <p class="symptom-major-guide__eyebrow">このページの役割</p>
          <h2 id="${escapeHtml(config.symptomKey)}-major-guide-title">${escapeHtml(guidance.majorGuide.title)}</h2>
          <p>${escapeHtml(guidance.majorGuide.lead)}</p>
          <ul>
${guidance.majorGuide.boundaries.map((item) => `            <li>${escapeHtml(item)}</li>`).join("\n")}
          </ul>
        </section>`
    : "";
  const guidanceColumns = [
    {
      modifier: "urgent",
      icon: "triangle-alert",
      title: "早急に医療機関へ",
      lead: "次のような場合は、整体の予約より医療機関への相談を優先してください。",
      items: guidance.urgent
    },
    {
      modifier: "prompt",
      icon: "stethoscope",
      title: "早めに医療機関へ",
      lead: "緊急ではなくても、早めの検査や診察が大切な状態があります。",
      items: guidance.prompt
    },
    {
      modifier: "consult",
      icon: "clipboard-check",
      title: "整体での相談を検討できる状態",
      lead: "医療機関との役割を分けながら、次のような相談に対応します。",
      items: guidance.consult
    }
  ].map((column) => `
          <section class="symptom-trust__level symptom-trust__level--${column.modifier}">
            <div class="symptom-trust__level-heading">
              <span class="symptom-trust__level-icon" aria-hidden="true"><i data-lucide="${column.icon}"></i></span>
              <div>
                <h3>${column.title}</h3>
                <p>${column.lead}</p>
              </div>
            </div>
            <ul>
${column.items.map((item) => `              <li>${escapeHtml(item)}</li>`).join("\n")}
            </ul>
          </section>`).join("");
  const references = guidance.references.map((reference) => `
              <li>
                <a class="symptom-trust__reference" data-tracking-content-group="medical-reference" href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(reference.label)} <span aria-hidden="true">↗</span>
                </a>
              </li>`).join("");

  return `<section class="symptom-trust" aria-labelledby="${escapeHtml(config.symptomKey)}-trust-title">
      <div class="container max-w-4xl symptom-trust__inner">
        ${majorGuide}
        <div class="symptom-trust__heading">
          <p class="symptom-trust__eyebrow">MEDICAL GUIDANCE</p>
          <h2 id="${escapeHtml(config.symptomKey)}-trust-title">受診の目安と、このページの確認情報</h2>
          <p>症状の出方には個人差があります。迷う場合や症状が強い場合は、まず医療機関へご相談ください。</p>
        </div>
        <div class="symptom-trust__levels">
${guidanceColumns}
        </div>
        <div class="symptom-trust__review">
          <div class="symptom-trust__reviewer">
            <p class="symptom-trust__review-label">執筆・内容確認</p>
            <p class="symptom-trust__review-name">${escapeHtml(ARTICLE_REVIEWER.name)} <span>${escapeHtml(ARTICLE_REVIEWER.qualification)}</span></p>
            <p class="symptom-trust__review-date">内容確認日：2026年6月23日</p>
            <a class="symptom-trust__reviewer-link" data-tracking-content-group="reviewer-profile" href="../staff.html">代表の経歴・資格を見る <span aria-hidden="true">›</span></a>
          </div>
          <div class="symptom-trust__references">
            <p class="symptom-trust__review-label">参考情報</p>
            <ul>
${references}
            </ul>
          </div>
        </div>
        <p class="symptom-trust__disclaimer">このページは一般的な情報提供であり、診断を目的とするものではありません。症状や状態は一人ひとり異なるため、必要に応じて医療機関へご相談ください。</p>
      </div>
    </section>`;
}

function upsertSymptomReviewerStructuredData(html) {
  const startMarker = "<!-- SYMPTOM_REVIEWER_SCHEMA_START -->";
  const endMarker = "<!-- SYMPTOM_REVIEWER_SCHEMA_END -->";
  const schema = `${startMarker}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "author": {
      "@type": "Person",
      "name": "川上卓哉",
      "jobTitle": "柔道整復師",
      "url": "https://hizakozou.jp/staff.html"
    },
    "reviewedBy": {
      "@type": "Person",
      "name": "川上卓哉",
      "jobTitle": "柔道整復師"
    },
    "dateModified": "2026-06-23"
  }
  </script>
  ${endMarker}`;

  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`), schema);
  }
  return html.replace("</head>", `${schema}\n</head>`);
}

function normalizeSymptomSafetyCopy(html, fileName) {
  let output = html;
  const description = symptomMetadataDescriptions[fileName];
  if (description) {
    output = output.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`);
    output = output.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(description)}">`);
    output = output.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(description)}">`);
  }

  const fixedFrequencyPatterns = [
    /最初の1〜2ヶ月は週1〜2回程度をおすすめしています。炎症が落ち着いてきたら2週に1回、月1回と間隔を空けていきます。「自分でケアできる」状態を目指しますので、通い続けなければいけないということはありません。/g,
    /慢性的な肩こりの場合、まずは週1〜2回を1〜2ヶ月続けていただき、姿勢と体の使い方を定着させていきます。セルフケアをしっかり実践される方は早い段階で効果を実感されることが多いです。/g
  ];
  for (const pattern of fixedFrequencyPatterns) {
    output = output.replace(pattern, individualizedVisitFrequency);
  }

  return output
    .replace(/アンバランスを解消し手術回避を目指します。/g, "筋肉の働き方や日常動作を確認し、医療機関と相談しながら負担の軽減を目指します。")
    .replace(/神経の通り道を広げます。/g, "首・肩・胸郭・腕の動きと、神経周辺へ負担が集まりやすい場面を確認します。")
    .replace(/顎関節症の根本原因となる/g, "顎の負担に関係することがある")
    .replace(/再発しにくい体づくりをサポートします。/g, "腰へ負担が集中しにくい身体の使い方を一緒に確認します。");
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
  output = normalizeSymptomTreatmentFlow(output, config);
  output = normalizeSymptomKneeNavigation(output);
  output = normalizeSymptomsDirectoryLinkLabel(output);
  output = replaceSymptomFooter(output, site);
  return output;
}

const symptomFlowCopy = {
  "carpal-tunnel.html": {
    consultation: "手指のしびれや夜間のつらさ、細かな作業のしにくさなど、どの場面で手に不安が出るのかを伺います。",
    assessment: "手首だけでなく、肘・肩・首の動きや姿勢も確認し、手へ負担が集まりやすい使い方を見ていきます。",
    treatment: "身体の反応を確かめながら手首・腕・肩まわりへ施術を行い、手を使う動作につながる運動も取り入れます。"
  },
  "cervical-spondylosis.html": {
    consultation: "首を向く、腕を上げる、長く座るなど、どの場面で首の痛みや腕のしびれが気になるのかを伺います。",
    assessment: "首だけでなく、肩甲骨・胸郭・腕の動きと姿勢も確認し、首へ負担が集まりやすい動作を見ていきます。",
    treatment: "身体の反応を確かめながら首・肩・背中まわりへ施術を行い、日常の姿勢や腕の動きにつながる運動も取り入れます。"
  },
  "elbow-tendinopathy.html": {
    consultation: "物を持つ、タオルを絞る、パソコンを使うなど、どの場面で肘がつらいのかを伺います。",
    assessment: "肘だけでなく、手首・肩・肩甲骨の動きや握り方も確認し、肘へ負担が集まりやすい使い方を見ていきます。",
    treatment: "身体の反応を確かめながら肘・前腕・肩まわりへ施術を行い、物を持つ動作につながる運動も取り入れます。"
  },
  "frozen-shoulder.html": {
    consultation: "腕を上げる、着替える、髪を洗う、寝返りをするなど、どの場面で肩がつらいのかを伺います。",
    assessment: "肩だけでなく、肩甲骨・胸郭・首・肘の動きも確認し、腕を上げにくくしている可能性のある動作を見ていきます。",
    treatment: "身体の反応を確かめながら肩・肩甲骨・胸郭まわりへ施術を行い、腕を使う動作につながる運動も取り入れます。"
  },
  "hip-osteoarthritis.html": {
    consultation: "歩き始め、立ち上がり、靴下の着脱など、どの場面で股関節や足の付け根がつらいのかを伺います。",
    assessment: "股関節だけでなく、腰・膝・足首・姿勢・歩き方も確認し、どこに負担が集まりやすいかを見ていきます。",
    treatment: "身体の反応を確かめながら股関節や足腰へ施術を行い、立つ・歩くなどの動作につながる運動も取り入れます。"
  },
  "lower-back-pain.html": {
    consultation: "起き上がる、立ち上がる、長く座る、荷物を持つなど、どの場面で腰がつらいのかを伺います。",
    assessment: "腰だけでなく、股関節・胸郭・体幹の支え方や姿勢も確認し、腰へ負担が集まりやすい動作を見ていきます。",
    treatment: "身体の反応を確かめながら腰・お尻・股関節まわりへ施術を行い、起き上がりや立ち上がりにつながる運動も取り入れます。"
  },
  "lumbar-disc-herniation.html": {
    consultation: "前かがみ、長く座る、立ち上がる、歩くなど、どの場面で腰の痛みや足のしびれが気になるのかを伺います。",
    assessment: "腰だけでなく、お尻・股関節・足の動きと姿勢も確認し、症状に影響する可能性のある動作を見ていきます。",
    treatment: "身体の状態を確かめながら腰・お尻・足まわりへ施術を行い、日常動作につながる運動も無理のない範囲で取り入れます。"
  },
  "plantar-fasciitis.html": {
    consultation: "朝の一歩目、長く立つ、歩く、靴を替えたときなど、どの場面で足裏やかかとがつらいのかを伺います。",
    assessment: "足裏だけでなく、足首・ふくらはぎ・膝・股関節の動きと歩き方も確認し、足元へ負担が集まりやすい動作を見ていきます。",
    treatment: "身体の反応を確かめながら足裏・足首・ふくらはぎへ施術を行い、立つ・歩く動作につながる運動も取り入れます。"
  },
  "scoliosis.html": {
    consultation: "立つ、座る、歩く、家事をするなど、どの場面で背中のつらさや左右差が気になるのかを伺います。",
    assessment: "背骨の形だけでなく、肩・胸郭・骨盤・股関節の動きと姿勢も確認し、負担が集まりやすい動作を見ていきます。",
    treatment: "身体の反応を確かめながら背中・肩・骨盤まわりへ施術を行い、姿勢や日常動作につながる運動も取り入れます。"
  },
  "shoulder-stiffness.html": {
    consultation: "デスクワーク、家事、車の運転、睡眠など、どの場面で首や肩の重さが気になるのかを伺います。",
    assessment: "首や肩だけでなく、肩甲骨・胸郭・腕の動きと姿勢も確認し、力が入り続ける場面を見ていきます。",
    treatment: "身体の反応を確かめながら首・肩・背中まわりへ施術を行い、肩甲骨や腕を動かす運動も取り入れます。"
  },
  "spinal-stenosis.html": {
    consultation: "歩ける距離、立っていられる時間、休むとどう変わるかなど、腰や脚がつらくなる場面を伺います。",
    assessment: "腰だけでなく、股関節・足首・身体を支える力や歩き方も確認し、症状に影響する可能性のある動作を見ていきます。",
    treatment: "身体の状態を確かめながら腰・お尻・足まわりへ施術を行い、立つ・歩く動作につながる運動も無理のない範囲で取り入れます。"
  },
  "thoracic-outlet.html": {
    consultation: "腕を上げる、荷物を持つ、長く座るなど、どの場面で首肩から腕のしびれやだるさが気になるのかを伺います。",
    assessment: "首や肩だけでなく、胸郭・肩甲骨・腕の動きと姿勢も確認し、腕へ負担が集まりやすい動作を見ていきます。",
    treatment: "身体の反応を確かめながら首・肩・胸郭まわりへ施術を行い、腕を使う動作につながる運動も取り入れます。"
  },
  "tmj.html": {
    consultation: "口を開ける、食事をする、あくびをするなど、どの場面であごが痛む、動かしにくいと感じるのかを伺います。",
    assessment: "あごだけでなく、首・肩・胸郭の動きと姿勢も確認し、あご周辺へ力が入りやすい場面を見ていきます。",
    treatment: "身体の反応を確かめながらあご周辺・首・肩へ施術を行い、口の開閉や姿勢に関わる動きも確認します。"
  }
};

function normalizeSymptomTreatmentFlow(html, config = {}) {
  const copy = symptomFlowCopy[config.fileName];
  if (!copy) return html;

  const flowPattern = /<section id="flow" class="flow-slider"[\s\S]*?(?=<section class="faq" id="faq">)/;
  return html.replace(flowPattern, (flowHtml) => {
    let paragraphIndex = 0;
    return flowHtml.replace(/<p class="flow-slide__text">[\s\S]*?<\/p>/g, (paragraph) => {
      const replacements = [null, copy.consultation, copy.assessment, null, copy.treatment, null];
      const replacement = replacements[paragraphIndex++];
      return replacement ? `<p class="flow-slide__text">${escapeHtml(replacement)}</p>` : paragraph;
    });
  });
}

function normalizeSymptomKneeNavigation(html) {
  return html
    .replaceAll('href="./knee-pain.html" class="site-nav__dropdown-link">膝痛</a>', 'href="./knee-osteoarthritis.html" class="site-nav__dropdown-link">変形性膝関節症</a>')
    .replaceAll('href="./knee-pain.html" class="site-mobile-nav__subitem">膝痛</a>', 'href="./knee-osteoarthritis.html" class="site-mobile-nav__subitem">変形性膝関節症</a>')
    .replaceAll('href="./knee-osteoarthritis.html" class="site-nav__dropdown-link">膝痛</a>', 'href="./knee-osteoarthritis.html" class="site-nav__dropdown-link">変形性膝関節症</a>')
    .replaceAll('href="./knee-osteoarthritis.html" class="site-mobile-nav__subitem">膝痛</a>', 'href="./knee-osteoarthritis.html" class="site-mobile-nav__subitem">変形性膝関節症</a>');
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
  const relatedFiles = relatedSymptomFiles[currentFileName] || [];
  const navigationItems = relatedFiles
    .map((fileName) => symptomNavigationByFile.get(fileName))
    .filter(Boolean);
  const cards = navigationItems
    .map((item) => `
          <a class="related-symptom-card" href="${escapeHtml(item.href)}">
            <span class="related-symptom-card__label">${escapeHtml(item.label)}</span>
            <span class="related-symptom-card__description">${escapeHtml(item.description)}</span>
            <span class="related-symptom-card__arrow" aria-hidden="true">›</span>
          </a>`)
    .join("");

  return `<section class="related-symptoms">
      <div class="container max-w-4xl">
        <p class="related-symptoms__eyebrow">RELATED SYMPTOMS</p>
        <h2 class="related-symptoms__title">この症状に関連するページ</h2>
        <p class="related-symptoms__lead">痛む場所や動作が近い症状ページも、あわせてご確認いただけます。</p>
        <div class="related-symptoms__grid">
${cards}
        </div>
        <div class="related-symptoms__all">
          <a class="related-symptoms__all-link" href="index.html">すべての症状を見る <span aria-hidden="true">›</span></a>
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
  return `<footer class="hk-footer-section">
    <div class="hk-footer-line" aria-hidden="true"></div>
    <div class="hk-footer-inner">
      <div class="hk-footer-top">
        <a href="../index.html#top" class="hk-footer-brand" aria-label="整体院ひざこぞう トップページへ">
          <img src="../image/hizakozou-logo-option2-mark.webp" alt="整体院ひざこぞう" class="hk-footer-brand-mark" width="160" height="160" loading="lazy" decoding="async">
          <span class="hk-footer-brand-text" aria-hidden="true">
            <span class="hk-footer-brand-eyebrow">柏市の足腰専門整体院</span>
            <span class="hk-footer-brand-name">整体院ひざこぞう</span>
            <span class="hk-footer-brand-note">国家資格者による整体</span>
          </span>
        </a>

        <address class="hk-footer-info">
          <strong>${FOOTER_CLINIC_LABEL}</strong>
          <span>千葉県柏市あけぼの4-4-3 BoaSorte柏 305</span>
          <span>${FOOTER_CLINIC_DESCRIPTION}</span>
          <span>完全予約制／受付時間：9:00〜19:00／定休日：日曜</span>
          <a href="tel:0471143274">TEL：04-7114-3274</a>
        </address>
      </div>

      <nav class="hk-footer-nav" aria-label="フッターナビゲーション">
        <a href="../index.html#top">ホーム</a>
        <a href="../index.html#troubles">お悩み</a>
        <a href="../index.html#seo-guide">当院の考え方</a>
        <a href="../index.html#flow">施術の流れ</a>
        <a href="../index.html#profile">院長紹介</a>
        <a href="../index.html#price">料金</a>
        <a href="../blog/">コラム</a>
        <a href="../faq.html">よくある質問</a>
        <a href="../access.html">アクセス</a>
        <a href="../index.html#contact">ご予約・お問合せ</a>
      </nav>

      <div class="hk-footer-symptoms">
        <p class="hk-footer-symptoms-label">対応している主な症状</p>
        <p>${FOOT_WAIST_FOOTER_SYMPTOMS}</p>
      </div>

      <p class="hk-footer-review">
        施術を受けた方のご感想をお待ちしています。
        <a href="https://g.page/r/CblTNpd2gz_7EBM" target="_blank" rel="noopener noreferrer">Google口コミを書く</a>
      </p>

      <p class="hk-footer-note">※当サイトに掲載されているお客様の声は個人の感想であり、成果を保証するものではありません。</p>
    </div>

    <div class="hk-footer-copy">Copyright © 2026 整体院ひざこぞう All Rights Reserved.</div>
  </footer>`;
}

function selectRelatedPosts(config, posts) {
  const pinnedSlugs = Array.isArray(config.pinnedSlugs) ? config.pinnedSlugs : [];
  const excludedSlugs = new Set(Array.isArray(config.excludedSlugs) ? config.excludedSlugs : []);
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const pinnedPosts = pinnedSlugs.map((slug) => postsBySlug.get(slug)).filter(Boolean);
  const pinnedSet = new Set(pinnedPosts.map((post) => post.slug));

  const scoredPosts = posts
    .filter((post) => !pinnedSet.has(post.slug) && !excludedSlugs.has(post.slug))
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

function isRelatedArticleSliderPage(fileName) {
  return relatedArticleSliderFiles.has(fileName);
}

function toSymptomPageAssetPath(value) {
  const assetPath = String(value || "/ogp.webp");
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) return assetPath;
  if (assetPath.startsWith("../")) return assetPath;
  if (assetPath.startsWith("/")) return `..${assetPath}`;
  return `../${assetPath}`;
}

function buildRelatedArticlesSection(site, config, posts) {
  if (isRelatedArticleSliderPage(config.fileName)) {
    return buildRelatedArticlesSliderSection(config, posts);
  }

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

const relatedArticleImageDimensions = new Map([
  ["../image/hizakozou-3step-pc.webp", [1536, 1024]],
  ["../image/イラスト/膝/歩行中に膝の痛みを感じる女性.webp", [800, 1146]],
  ["../image/hand-symptom.webp", [1200, 675]],
  ["../image/spinal-stenosis-diagram.webp", [1200, 1200]],
  ["../image/イラスト/腰・神経/椅子で骨盤を動かす姿勢改善運動.webp", [800, 603]],
  ["../image/ago.webp", [1200, 675]],
  ["../image/initial-visit-what-we-do.webp", [1536, 1024]],
  ["../image/knee-symptom-close.webp", [1600, 1600]],
  ["../image/knee-symptom-wide.webp", [1600, 1067]],
  ["../image/hip-osteoarthritis-symptom.webp", [1600, 1600]],
  ["../image/lower-back-symptom.webp", [1200, 675]],
  ["../image/sciatica-symptom.webp", [1600, 1600]],
  ["../image/medical-interview.webp", [800, 600]],
  ["../image/hip-massage-scene.webp", [1600, 1600]],
  ["../image/blog/iliopsoas-anterior-hip-stiffness/iliopsoas-anterior-hip-stiffness-hero-1200.webp", [1200, 800]],
  ["../image/blog/lumbar-spinal-stenosis-walking/lumbar-spinal-stenosis-walking-hero-1200.webp", [1200, 800]],
  ["../image/blog/lateral-thigh-pain-lateral-femoral-cutaneous-nerve/lateral-thigh-pain-lateral-femoral-cutaneous-nerve-hero-1200.webp", [1200, 800]],
  ["../image/blog/femoral-neuralgia/femoral-neuralgia-hero-1200.webp", [1200, 800]],
  ["../image/blog/hip-osteoarthritis-groin-pain/hip-osteoarthritis-groin-pain-hero-1200.webp", [1200, 800]],
  ["../image/blog/gluteus-medius-pelvic-stability/gluteus-medius-pelvic-stability-hero-1200.webp", [1200, 800]],
  ["../image/blog/lumbar-disc-herniation-leg-symptoms/lumbar-disc-herniation-leg-symptoms-hero-1200.webp", [1200, 800]],
  ["../image/blog/sciatica-buttock-leg/sciatica-buttock-leg-hero-1200.webp", [1200, 800]],
  ["../image/blog/morning-low-back-stiffness/morning-low-back-stiffness-hero-1200.webp", [1200, 800]],
  ["../image/blog/sacroiliac-joint-buttock-pain/sacroiliac-joint-buttock-pain-hero-1200.webp", [1200, 800]],
  ["../image/blog/piriformis-deep-buttock-pain/piriformis-deep-buttock-pain-hero-1200.webp", [1200, 800]],
  ["../image/blog/greater-trochanteric-pain-side-hip/greater-trochanteric-pain-side-hip-hero-1200.webp", [1200, 800]],
  ["../image/blog/patellofemoral-anterior-knee-pain/patellofemoral-anterior-knee-pain-hero-1200.webp", [1200, 800]],
  ["../image/blog/pes-anserine-medial-knee-pain/pes-anserine-medial-knee-pain-hero-1200.webp", [1200, 800]],
  ["../image/blog/bakers-cyst-posterior-knee-fullness/bakers-cyst-posterior-knee-fullness-hero-1200.webp", [1200, 800]],
  ["../image/blog/achilles-tendon-heel-back-pain/achilles-tendon-heel-back-pain-hero-1200.webp", [1200, 800]],
  ["../image/blog/mortons-neuroma-forefoot-numbness/mortons-neuroma-forefoot-numbness-hero-1200.webp", [1200, 800]],
  ["../image/blog/nocturnal-calf-cramps/nocturnal-calf-cramps-hero-1200.webp", [1200, 800]]
]);

function buildRelatedArticlesSliderSection(config, posts) {
  const title = `${config.label}でお悩みの方におすすめの記事`;
  const cards = posts.map((post) => {
    const dateValue = post.updatedDate || post.date;
    const thumbSrc = toSymptomPageAssetPath(post.eyecatch);
    const [thumbWidth, thumbHeight] = relatedArticleImageDimensions.get(thumbSrc) || [];
    const sizeAttributes = thumbWidth && thumbHeight
      ? ` width="${thumbWidth}" height="${thumbHeight}"`
      : "";
    return `
            <a class="related-articles-slider__card" href="../blog/posts/${escapeHtml(post.slug)}/" role="listitem">
              <span class="related-articles-slider__thumb">
                <img src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(post.title)}のイメージ" loading="lazy" decoding="async"${sizeAttributes}>
              </span>
              <span class="related-articles-slider__body">
                <span class="related-articles-slider__meta">
                  <span class="related-articles-slider__category">${escapeHtml(post.category.name)}</span>
                  <time class="related-articles-slider__date" datetime="${escapeHtml(dateValue)}">${escapeHtml(formatDotDate(dateValue))}</time>
                </span>
                <span class="related-articles-slider__card-title">${escapeHtml(post.title)}</span>
              </span>
            </a>`;
  }).join("");

  return `
    <section id="related-articles" class="related-articles-slider" aria-labelledby="related-articles-title" data-related-article-slider>
      <div class="container max-w-4xl related-articles-slider__inner">
        <div class="related-articles-slider__header">
          <h2 id="related-articles-title" class="related-articles-slider__title">${escapeHtml(title)}</h2>
          <a class="related-articles-slider__all" href="../blog/">すべての記事を見る <span aria-hidden="true">›</span></a>
        </div>

        <div class="related-articles-slider__viewport">
          <button class="related-articles-slider__arrow related-articles-slider__arrow--prev" type="button" aria-label="前の記事を見る" data-related-prev>
            <i data-lucide="chevron-left" style="width:1.35rem;height:1.35rem;" aria-hidden="true"></i>
          </button>

          <div class="related-articles-slider__track" role="list" tabindex="0" aria-label="${escapeHtml(config.label)}に関連する記事" data-related-track>
${cards}
          </div>

          <button class="related-articles-slider__arrow related-articles-slider__arrow--next" type="button" aria-label="次の記事を見る" data-related-next>
            <i data-lucide="chevron-right" style="width:1.35rem;height:1.35rem;" aria-hidden="true"></i>
          </button>
        </div>

        <div class="related-articles-slider__footer">
          <div class="related-articles-slider__dots" aria-label="関連記事のページ送り" data-related-dots></div>
          <p class="related-articles-slider__hint">
            <i data-lucide="move-horizontal" aria-hidden="true"></i>
            左右にスワイプして記事を見られます
          </p>
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

function normalizeArticleLayoutForRendering(post) {
  return post.layout || ARTICLE_LAYOUT_READABLE;
}

function isReadableArticle(post) {
  return ARTICLE_LAYOUT_READABLES.has(normalizeArticleLayoutForRendering(post));
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
    heroAlt: post.heroAlt || post.title,
    layout: normalizeArticleLayoutForRendering(post),
    author: post.author || "",
    reviewer: post.reviewer || ARTICLE_REVIEWER.name,
    reviewedDate: post.reviewedDate || post.updatedDate || post.date,
    referencePreset: post.referencePreset || "",
    parentSymptom: post.parentSymptom || "",
    relatedSlugs: Array.isArray(post.relatedSlugs) ? post.relatedSlugs : [],
    searchIntent: post.searchIntent || "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    sections: enrichSections(Array.isArray(post.sections) ? post.sections : []),
    faq: Array.isArray(post.faq) ? post.faq : [],
    relatedSymptoms: Array.isArray(post.relatedSymptoms) ? post.relatedSymptoms.filter(isIndexableRelatedSymptom) : [],
    cta: post.cta || site.cta,
    url: `/blog/posts/${post.slug}/`
  };
}

function isIndexableRelatedSymptom(item) {
  const fileName = path.basename(normalizePath(item?.href || ""));
  return !NOINDEX_SYMPTOM_FILES.has(fileName);
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

function getBlogIndexTitle(site = {}) {
  return "足腰・慢性痛の読みもの";
}

function getBlogIndexDescription(site = {}) {
  return "腰痛、坐骨神経痛、股関節痛、膝の痛みなど、足腰の不調でお悩みの方へ。来院前に知っておきたい身体の見方やセルフケアの考え方を、整体院ひざこぞうがわかりやすく整理します。";
}

function buildIndexSeo(site) {
  const canonical = `${trimTrailingSlash(site.url)}/blog/`;
  const title = getBlogIndexTitle(site);
  const description = getBlogIndexDescription(site);
  return [
    `<title>${escapeHtml(title)}｜${escapeHtml(site.name)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="index,follow">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(title)}｜${escapeHtml(site.name)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}">`,
    `<meta property="og:image" content="${absoluteUrl(site.url, site.ogImage)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}｜${escapeHtml(site.name)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${absoluteUrl(site.url, site.ogImage)}">`
  ].join("\n  ");
}

function buildPostSeo(site, post) {
  const canonical = `${trimTrailingSlash(site.url)}${post.url}`;
  const robots = NOINDEX_POST_CATEGORIES.has(post.category?.slug) ? "noindex,follow" : "index,follow";
  const schemas = [
    buildArticleSchema(site, post),
    buildBreadcrumbSchema(site, post),
    post.faq.length ? buildFaqSchema(post.faq) : ""
  ].filter(Boolean).join("\n  ");

  return [
    `<title>${escapeHtml(post.title)} | ${escapeHtml(site.name)}</title>`,
    `<meta name="description" content="${escapeHtml(post.description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${escapeHtml(post.title)} | ${escapeHtml(site.name)}">`,
    `<meta property="og:description" content="${escapeHtml(post.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}">`,
    `<meta property="og:image" content="${absoluteUrl(site.url, post.eyecatch)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(post.title)} | ${escapeHtml(site.name)}">`,
    `<meta name="twitter:description" content="${escapeHtml(post.description)}">`,
    `<meta name="twitter:image" content="${absoluteUrl(site.url, post.eyecatch)}">`,
    schemas
  ].join("\n  ");
}

export function buildIndexContent(site, posts, categoryMap) {
  const categories = [...categoryMap.values()].filter((category) => !BLOG_INDEX_HIDDEN_CATEGORIES.has(category.slug));
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const visiblePosts = posts.filter((post) => categorySlugs.has(post.category.slug));
  const symptomMap = new Map();
  for (const post of visiblePosts) {
    for (const symptom of Array.isArray(post.relatedSymptoms) ? post.relatedSymptoms : []) {
      if (symptom.href && symptom.label && !symptomMap.has(symptom.href)) {
        symptomMap.set(symptom.href, symptom.label);
      }
    }
  }
  const symptomOptions = [...symptomMap.entries()].sort((left, right) => left[1].localeCompare(right[1], "ja"));
  const renderListItem = (post, index) => {
    const relatedSymptoms = Array.isArray(post.relatedSymptoms) ? post.relatedSymptoms : [];
    const symptomValues = relatedSymptoms.map((item) => item.href).filter(Boolean);
    const searchText = [
      post.title,
      post.description,
      post.category.name,
      ...(Array.isArray(post.tags) ? post.tags : []),
      ...relatedSymptoms.map((item) => item.label)
    ].filter(Boolean).join(" ");

    return `
    <article class="article-list-item article-list-item--card">
      <a class="article-list-item__link" href="posts/${post.slug}/" data-blog-card data-category="${escapeHtml(post.category.slug)}" data-symptoms="${escapeHtml(symptomValues.join(" "))}" data-search="${escapeHtml(searchText)}">
        <div class="article-list-item__thumb">
          <img src="..${post.eyecatch}" alt="${escapeHtml(post.heroAlt || post.title)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async"${index === 0 ? ' fetchpriority="high"' : ""} width="480" height="300">
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
  };

  const categoryOptions = categories.map((category) => `
    <option value="${escapeHtml(category.slug)}">${escapeHtml(category.name)}</option>
  `).join("");
  const symptomSelectOptions = symptomOptions.map(([href, label]) => `
    <option value="${escapeHtml(href)}">${escapeHtml(label)}</option>
  `).join("");
  const articleList = visiblePosts.map(renderListItem).join("");

  return `
    <section class="section-block blog-column-index">
      <div class="shell">
        <div class="blog-index-heading">
          <p class="eyebrow">Column</p>
          <h1>足腰・慢性痛の読みもの</h1>
          <p>腰痛、坐骨神経痛、股関節痛、膝の痛みなど、足腰の不調でお悩みの方へ。来院前に知っておきたい身体の見方やセルフケアの考え方を、整体院ひざこぞうがわかりやすく整理します。</p>
        </div>
        <form class="column-search-panel blog-index-controls" role="search" data-blog-filter-form>
          <div class="column-search">
            <label class="sr-only" for="column-search-keyword">記事をキーワードで検索</label>
            <input id="column-search-keyword" class="column-search__input" type="search" name="q" placeholder="例：坐骨神経痛、歩くと痛い" autocomplete="off" data-blog-search>
            <button class="column-search__button" type="submit">検索</button>
          </div>
          <div class="blog-index-controls__filters">
            <label class="blog-index-select">
              <span>カテゴリー</span>
              <select data-blog-category>
                <option value="">すべて</option>${categoryOptions}
              </select>
            </label>
            <label class="blog-index-select">
              <span>症状・部位</span>
              <select data-blog-symptom>
                <option value="">すべて</option>${symptomSelectOptions}
              </select>
            </label>
            <button class="blog-index-controls__reset" type="reset" data-blog-filter-reset>条件をクリア</button>
          </div>
        </form>
        <div class="blog-index-sequence">
          <section class="category-section category-section--list category-section--all" aria-labelledby="all-articles-title">
            <div class="category-section__header category-section__header--list">
              <div>
                <p class="eyebrow">Articles</p>
                <h2 id="all-articles-title">すべての記事</h2>
              </div>
              <p class="blog-index-result" role="status" aria-live="polite"><span data-blog-result-count>${visiblePosts.length}</span>件の記事を表示しています</p>
            </div>
            <div class="article-list blog-card-grid" data-blog-card-list>
              ${articleList}
            </div>
            <p class="blog-index-empty" hidden data-blog-empty>条件に合う記事がありません。検索語や絞り込み条件を変えてお試しください。</p>
          </section>
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
          <a class="button button--soft" href="/#price">初回案内を見る</a>
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
  const isReadableLayout = isReadableArticle(post);
  const isReadableV3 = post.layout === "readable-v3";
  const renderedSections = articleSections.map((section) => renderSection(section));
  const midCtaIndex = Math.min(2, renderedSections.length);
  const sectionsHtml = [
    ...renderedSections.slice(0, midCtaIndex),
    buildArticleMidCta(site, post),
    ...renderedSections.slice(midCtaIndex)
  ].join("");
  const tocHtml = isReadableV3
    ? buildArticleToc(articleSections, "disclosure")
    : isReadableLayout
      ? ""
      : buildArticleToc(articleSections, "inline");
  const sideTocHtml = buildArticleToc(articleSections, "side");
  const takeawaysHtml = isReadableLayout ? "" : buildArticleTakeaways(post);
  const readableOverviewHtml = isReadableLayout ? buildArticleReadableOverview(post, articleSections) : "";
  const readableLeadHtml = isReadableLayout ? buildArticleReadableLead(post) : "";
  const articleTrustHtml = buildArticleTrustPanel(site, post);
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

  const relatedArticlesHtml = relatedPosts.length
    ? isReadableLayout
      ? buildReadableRelatedArticlesSection(relatedPosts, { textOnly: isReadableV3 })
      : `
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
  `
    : "";

  const heroClass = ["article-card", isReadableLayout ? "article-card--readable" : "", isReadableV3 ? "article-card--readable-v3" : ""].filter(Boolean).join(" ");
  const mainClass = ["article-main", isReadableLayout ? "article-main--readable" : "", isReadableV3 ? "article-main--readable-v3" : ""].filter(Boolean).join(" ");
  const layoutClass = ["shell", "article-layout", isReadableLayout ? "article-layout--readable" : "", isReadableV3 ? "article-layout--readable-v3" : ""].filter(Boolean).join(" ");
  const contentClass = ["article-content", "card-surface", "prose-surface", isReadableLayout ? "article-content--readable" : "", isReadableV3 ? "article-content--readable-v3" : ""].filter(Boolean).join(" ");
  const heroLeadText = isReadableLayout ? post.description : (post.lead || post.description);
  const contentLeadHtml = readableLeadHtml ? `\n          ${readableLeadHtml}` : "";
  const contentIntroHtml = readableOverviewHtml ? `\n          ${readableOverviewHtml}` : "";
  const contentTrustHtml = articleTrustHtml ? `\n          ${articleTrustHtml}` : "";

  return `
    <section class="article-hero-wrap">
      <div class="shell">
        <nav class="breadcrumb" aria-label="パンくず">
          <a href="/">トップ</a>
          <span>/</span>
          <a href="../../">ブログ</a>
          <span>/</span>
          <span>${escapeHtml(post.title)}</span>
        </nav>
        <article class="${heroClass}">
          <div class="article-card__hero">
            ${renderResponsivePicture({
              src: post.eyecatch,
              alt: post.heroAlt || post.title,
              loading: "eager",
              width: 1200,
              height: 630,
              fetchPriority: "high",
              fallbackPrefix: "../../.."
            })}
          </div>
          <div class="article-card__body article-card__body--post">
            <div class="article-meta">
              <span class="pill">${escapeHtml(post.category.name)}</span>
              <time class="article-meta__date" datetime="${escapeHtml(post.updatedDate || post.date)}">${escapeHtml(formatJapaneseDate(post.updatedDate || post.date))}</time>
            </div>
            <h1>${escapeHtml(post.title)}</h1>
            <p class="article-lead">${renderInlineText(heroLeadText)}</p>
            <div class="tag-list">${post.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>
          </div>
        </article>
      </div>
    </section>
    <section class="${mainClass}">
      <div class="${layoutClass}">
        <div class="${contentClass}">${contentLeadHtml}${contentIntroHtml}
          ${tocHtml}
          ${takeawaysHtml}
          ${sectionsHtml}
          ${faqHtml}
          ${symptomsHtml}${contentTrustHtml}
        </div>
        <aside class="article-side">
          ${sideTocHtml}
          <div class="side-card">
            <p class="side-card__eyebrow">相談先</p>
            <h2>${escapeHtml(site.name)}</h2>
            <p>${escapeHtml(site.subtitle)}として、腰痛・坐骨神経痛・股関節痛・膝痛など足腰の慢性痛相談に対応しています。</p>
            <a class="button button--primary button--full" href="${escapeHtml(post.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.cta.label)}</a>
            <p class="side-card__note">${escapeHtml(post.cta.note || site.cta.subtext)}</p>
          </div>
          <div class="side-card">
            <p class="side-card__eyebrow">一覧へ</p>
            <a class="text-link text-link--block" href="../../">ブログ一覧に戻る</a>
            ${post.parentSymptom ? `<a class="text-link text-link--block" href="${escapeHtml(post.parentSymptom)}">関連する症状案内を見る</a>` : ""}
            <a class="text-link text-link--block" href="/symptoms/">症状ページを見る</a>
          </div>
        </aside>
      </div>
    </section>
    <section class="pricing-cta">
      <div class="shell">
        <div class="pricing-cta__card">
          <p class="pricing-cta__badge">LINEからのご相談・ご予約受付中</p>
          <h2 class="pricing-cta__title">${escapeHtml(FIRST_VISIT.title)}</h2>
          <p class="pricing-cta__duration">${escapeHtml(FIRST_VISIT.duration)}</p>
          <div class="pricing-cta__price-box">
            <div class="pricing-cta__price-row">
              <div class="pricing-cta__after">
                <span class="pricing-cta__after-label">初回料金</span>
                <span class="pricing-cta__after-price">${escapeHtml(FIRST_VISIT.price)}<small>円（税込）</small></span>
              </div>
            </div>
          </div>
          <p class="pricing-cta__reassurance">身体の状態を確認し、施術方針を説明したうえで進めます。</p>
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

function buildArticleReadableLead(post) {
  if (!post.lead) return "";
  const paragraphs = String(post.lead)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const image = parseMarkdownImage(paragraph);
      return image ? renderArticleImage(image) : `<p>${renderInlineText(paragraph)}</p>`;
    })
    .join("\n");

  if (!paragraphs) return "";

  return `<section class="article-readable-lead" aria-label="記事の導入">
${paragraphs}
          </section>`;
}

function buildArticleReadableOverview(post, sections) {
  const preset = ARTICLE_OVERVIEW_PRESETS[post.referencePreset] || {
    points: sections.slice(0, 3).map((section) => section.heading).filter(Boolean),
    medicalHeading: "先に確認したいこと",
    medicalItems: [
      "急に痛みやしびれが強くなった場合は、医療機関での確認を優先してください。",
      "不安があるときは、無理に自己判断せず専門家へ相談してください。"
    ]
  };

  const points = preset.points
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const medicalItems = preset.medicalItems
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<section class="article-readable-overview" aria-labelledby="article-readable-overview-title">
            <div class="article-readable-overview__main">
              <p class="article-readable-overview__label">INDEX</p>
              <h2 id="article-readable-overview-title">この記事の内容</h2>
              <ul>
${points}
              </ul>
            </div>
            <div class="article-readable-overview__medical" aria-labelledby="article-readable-medical-title">
              <h3 id="article-readable-medical-title">${escapeHtml(preset.medicalHeading)}</h3>
              <ul>
${medicalItems}
              </ul>
            </div>
          </section>`;
}

function buildArticleTrustPanel(site, post) {
  const references = getArticleReferences(post);
  const referenceItems = references
    .map((reference) => `
              <li>
                <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.label)} <span aria-hidden="true">↗</span></a>
              </li>`)
    .join("");
  const reviewedDate = post.reviewedDate || post.updatedDate || post.date;
  const reviewerName = post.reviewer || ARTICLE_REVIEWER.name;
  const panelClass = ["article-trust-panel", referenceItems ? "" : "article-trust-panel--simple"].filter(Boolean).join(" ");
  const referencesHtml = referenceItems ? `
            <div class="article-trust-panel__references">
              <h3>参考情報</h3>
              <ul>
${referenceItems}
              </ul>
            </div>` : "";

  return `<section class="${panelClass}" aria-labelledby="article-trust-panel-title">
            <div class="article-trust-panel__review">
              <p class="eyebrow">Author / Review</p>
              <h2 id="article-trust-panel-title">執筆者・確認日</h2>
              <p class="article-trust-panel__name">${escapeHtml(reviewerName)} <span>${escapeHtml(ARTICLE_REVIEWER.qualification)}</span></p>
              <p class="article-trust-panel__date">内容確認日：${escapeHtml(formatJapaneseDate(reviewedDate))}</p>
              <a class="text-link text-link--block" href="${escapeHtml(ARTICLE_REVIEWER.profileUrl)}">代表の経歴・資格を見る</a>
            </div>${referencesHtml}
          </section>`;
}

function buildReadableRelatedArticlesSection(relatedPosts, { textOnly = false } = {}) {
  if (textOnly) {
    return `
    <section class="section-block article-related article-related--readable article-related--text">
      <div class="shell article-related__inner">
        <div class="section-heading">
          <p class="eyebrow">Related</p>
          <h2>関連記事</h2>
        </div>
        <ul class="readable-related-text-list">
          ${relatedPosts.map((item) => `
            <li>
              <a href="../${item.slug}/">
                <span class="readable-related-text-list__category">${escapeHtml(item.category.name)}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <span class="readable-related-text-list__arrow" aria-hidden="true">›</span>
              </a>
            </li>
          `).join("")}
        </ul>
      </div>
    </section>
  `;
  }

  return `
    <section class="section-block article-related article-related--readable">
      <div class="shell">
        <div class="section-heading">
          <p class="eyebrow">Related</p>
          <h2>あわせて読みたい記事</h2>
        </div>
        <div class="readable-related-grid">
          ${relatedPosts.map((item) => `
            <a class="readable-related-card" href="../${item.slug}/">
              <span class="readable-related-card__thumb">
                <img src="../../..${item.eyecatch}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" width="640" height="640">
              </span>
              <span class="readable-related-card__body">
                <span class="readable-related-card__meta">
                  <span>${escapeHtml(item.category.name)}</span>
                  <time datetime="${escapeHtml(item.updatedDate || item.date)}">${escapeHtml(formatDotDate(item.updatedDate || item.date))}</time>
                </span>
                <strong>${escapeHtml(item.title)}</strong>
              </span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function getArticleReferences(post) {
  return ARTICLE_REFERENCE_PRESETS[post.referencePreset] || [];
}

function buildArticleToc(sections, variant = "inline") {
  const items = sections
    .filter((section) => section.heading && section.id)
    .map((section, index) => `
            <li>
              <a href="#${escapeHtml(section.id)}" data-toc-link>
                <span class="article-toc__number">${String(index + 1).padStart(2, "0")}</span>
                <span>${escapeHtml(section.heading)}</span>
              </a>
            </li>`)
    .join("");

  if (!items) return "";

  if (variant === "disclosure") {
    return `<details class="article-toc article-toc--disclosure">
            <summary>
              <span>この記事の目次</span>
              <span class="article-toc__state article-toc__state--closed" aria-hidden="true">開く</span>
              <span class="article-toc__state article-toc__state--open" aria-hidden="true">閉じる</span>
            </summary>
            <nav aria-label="この記事の目次" data-article-toc>
              <ol>
${items}
              </ol>
            </nav>
          </details>`;
  }

  const className = variant === "side" ? "article-toc article-toc--side" : "article-toc article-toc--inline";
  const label = variant === "side" ? "記事の目次" : "この記事の目次";

  return `<nav class="${className}" aria-label="${label}" data-article-toc>
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
  if (isClinicAccessSection(section)) {
    return renderClinicAccessSection(section);
  }

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

function isClinicAccessSection(section) {
  const heading = String(section.heading || "");
  return heading.includes("店舗情報") && heading.includes("アクセス");
}

function renderClinicAccessSection(section) {
  const heading = section.heading
    ? `<h2${section.id ? ` id="${escapeHtml(section.id)}"` : ""}>${escapeHtml(section.heading)}</h2>`
    : "";
  const classNames = ["article-section", "article-clinic-access", section.className, section.boxType].filter(Boolean).join(" ");
  const rows = [
    ["店舗名", CLINIC_FACTS.clinicName],
    ["住所", CLINIC_FACTS.address],
    ["アクセス", CLINIC_FACTS.access],
    ["目印", "あけぼの通り沿い、近隣コインパーキングあり"],
    ["営業時間", CLINIC_FACTS.businessHours],
    ["受付", CLINIC_FACTS.appointment],
    ["定休日", CLINIC_FACTS.closedDay],
    ["予約方法", "電話または公式LINEからご連絡ください"]
  ];
  const rowsHtml = rows.map(([label, value]) => `
              <div class="article-clinic-access__row">
                <dt>${escapeHtml(label)}</dt>
                <dd>${renderInlineText(value)}</dd>
              </div>`).join("");

  return `<section class="${classNames}">${heading}
            <p class="article-clinic-access__lead">来院前に場所や予約方法を確認しやすいよう、店舗情報をまとめています。</p>
            <div class="article-clinic-access__panel">
              <dl class="article-clinic-access__grid">
${rowsHtml}
              </dl>
              <div class="article-clinic-access__actions" aria-label="店舗情報の確認リンク">
                <a class="article-clinic-access__button article-clinic-access__button--primary" href="/access.html">詳しいアクセスを見る</a>
                <a class="article-clinic-access__button" href="${escapeHtml(CLINIC_FACTS.phoneHref)}">電話で確認する</a>
                <a class="article-clinic-access__button article-clinic-access__button--line" href="${escapeHtml(CLINIC_FACTS.lineUrl)}" target="_blank" rel="noopener noreferrer">LINEで相談する</a>
              </div>
            </div>
          </section>`;
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
    const image = parseMarkdownImage(item);
    if (image) {
      flushBullets();
      chunks.push(renderArticleImage(image));
      continue;
    }
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

export function parseMarkdownImage(value) {
  const match = String(value || "").trim().match(/^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)$/);
  if (!match) return null;
  return {
    alt: match[1].trim(),
    src: match[2].trim(),
    caption: String(match[3] || "").trim()
  };
}

function renderArticleImage(image) {
  const caption = image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : "";
  return `<figure class="article-body-figure">
            ${renderResponsivePicture({ src: image.src, alt: image.alt, loading: "lazy", width: 1200, height: 800 })}
            ${caption}
          </figure>`;
}

function renderResponsivePicture({ src, alt, loading, width, height, fetchPriority = "", fallbackPrefix = "" }) {
  const safeAlt = escapeHtml(alt);
  const responsiveMatch = String(src).match(/^(.*)-1200\.webp$/i);
  const safeSrc = escapeHtml(responsiveMatch ? src : `${fallbackPrefix}${src}`);
  const img = `<img src="${safeSrc}" alt="${safeAlt}" loading="${escapeHtml(loading)}" decoding="async" width="${width}" height="${height}"${responsiveMatch && fetchPriority ? ` fetchpriority="${escapeHtml(fetchPriority)}"` : ""}>`;
  if (!responsiveMatch) return img;

  const base = responsiveMatch[1];
  const srcset = [480, 768, 1200].map((size) => `${base}-${size}.webp ${size}w`).join(", ");
  return `<picture>
              <source type="image/webp" srcset="${escapeHtml(srcset)}" sizes="(max-width: 767px) calc(100vw - 40px), 720px">
              ${img}
            </picture>`;
}

function buildArticleSchema(site, post) {
  const references = getArticleReferences(post);
  const hasReadableReview = isReadableArticle(post);
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
    author: post.author
      ? { "@type": "Person", name: post.author, url: absoluteUrl(site.url, ARTICLE_REVIEWER.profileUrl) }
      : { "@type": "Organization", name: site.author },
    ...(hasReadableReview ? {
      reviewedBy: {
        "@type": "Person",
        name: post.reviewer || ARTICLE_REVIEWER.name,
        jobTitle: ARTICLE_REVIEWER.qualification,
        url: absoluteUrl(site.url, ARTICLE_REVIEWER.profileUrl)
      },
      citation: references.map((reference) => reference.url)
    } : {}),
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
  <script src="/scripts/tracking-config.js" defer></script>
  <script src="/scripts/tracking.js" defer></script>

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
  <script src="/scripts/tracking-config.js" defer></script>
  <script src="/scripts/tracking.js" defer></script>

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
