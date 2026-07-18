const REFERENCES = {
  orthopaedics: {
    label: "日本整形外科学会「症状・病気をしらべる」",
    url: "https://www.joa.or.jp/public/sick/"
  },
  spine: {
    label: "日本脊椎脊髄病学会「一般の皆さまへ」",
    url: "https://www.jssr.gr.jp/medical/"
  },
  hand: {
    label: "日本手外科学会「一般の皆さまへ」",
    url: "https://www.jssh.or.jp/ippan/"
  },
  oral: {
    label: "日本口腔外科学会「口腔外科相談室」",
    url: "https://www.jsoms.or.jp/public/"
  },
  care: {
    label: "厚生労働省「上手な医療のかかり方」",
    url: "https://kakarikata.mhlw.go.jp/"
  }
};

const CONSULT = [
  "医療機関で緊急性のある状態ではないことを確認している",
  "姿勢や日常動作で負担が集まる場面を整理したい",
  "医療機関と併用しながら、身体の使い方やセルフケアを見直したい"
];

const LOWER_BACK = {
  urgent: [
    "排尿・排便がしにくい、漏れてしまうなどの変化がある",
    "股のまわりの感覚が大きく低下している",
    "脚の力が急に入りにくくなった、歩きにくさが急速に進んでいる"
  ],
  prompt: [
    "発熱や強い体調不良を伴っている",
    "転倒や事故のあとから強い痛みが続いている",
    "安静時や夜間にも強い痛みが続く、または症状が急激に悪化している"
  ],
  consult: CONSULT,
  references: [REFERENCES.spine, REFERENCES.orthopaedics, REFERENCES.care]
};

const KNEE = {
  urgent: [
    "転倒や事故のあと、膝の変形がある、または体重をかけられない",
    "急に膝が大きく腫れ、発熱や強い体調不良を伴っている",
    "脚全体が急に腫れ、息苦しさや胸の痛みもある"
  ],
  prompt: [
    "赤み・熱感・強い腫れが続いている",
    "膝が動かなくなった、力が抜けて転びそうになる状態が増えている",
    "外傷後の痛みや腫れが改善せず、日常動作が難しい"
  ],
  consult: CONSULT,
  references: [REFERENCES.orthopaedics, REFERENCES.care]
};

const HIP = {
  urgent: [
    "転倒や事故のあとから強い痛みがあり、立つことができない",
    "脚の長さや向きが急に変わったように見える",
    "急な強い痛みに発熱や強い体調不良を伴っている"
  ],
  prompt: [
    "安静時や夜間も強い痛みが続いている",
    "歩きにくさや脚の力の入りにくさが急に進んでいる",
    "股関節周辺の腫れ・赤み・熱感が続いている"
  ],
  consult: CONSULT,
  references: [REFERENCES.orthopaedics, REFERENCES.care]
};

const FOOT = {
  urgent: [
    "転倒や事故のあとに変形がある、または足を着けない",
    "足全体が急に腫れ、色の変化や強いしびれがある",
    "傷や腫れに発熱・強い体調不良を伴っている"
  ],
  prompt: [
    "赤み・熱感・腫れが続いている",
    "しびれや感覚低下が広がっている",
    "糖尿病があり、足の傷や皮膚の変化が治りにくい"
  ],
  consult: CONSULT,
  references: [REFERENCES.orthopaedics, REFERENCES.care]
};

const UPPER_LIMB_NEURO = {
  urgent: [
    "突然、片側の腕や手に力が入らず、顔のゆがみや言葉の出にくさもある",
    "胸の痛み・息苦しさ・冷や汗とともに腕の痛みやしびれがある",
    "大きな外傷後から首の痛みや手足の力の入りにくさがある"
  ],
  prompt: [
    "手指の力が入りにくい、物を落とすなどの変化が進んでいる",
    "しびれの範囲が広がる、または安静時や夜間にも強く続く",
    "発熱、強い腫れ、赤み、熱感を伴っている"
  ],
  consult: CONSULT,
  references: [REFERENCES.hand, REFERENCES.orthopaedics, REFERENCES.care]
};

const SHOULDER = {
  urgent: [
    "胸の痛み・息苦しさ・冷や汗とともに肩や腕が痛む",
    "転倒や事故のあとに肩の変形がある、または腕を動かせない",
    "突然、片側の腕に力が入らず、顔や言葉にも変化がある"
  ],
  prompt: [
    "発熱、赤み、熱感、強い腫れを伴っている",
    "安静時や夜間にも強い痛みが続いている",
    "腕のしびれや筋力低下が広がっている"
  ],
  consult: CONSULT,
  references: [REFERENCES.orthopaedics, REFERENCES.care]
};

const ELBOW = {
  urgent: [
    "転倒や事故のあとに肘の変形がある、または動かせない",
    "手の色が急に変わる、強いしびれや冷たさがある",
    "急な強い腫れに発熱や強い体調不良を伴っている"
  ],
  prompt: [
    "赤み・熱感・強い腫れが続いている",
    "握る力が低下し、物を落とすことが増えている",
    "外傷後の痛みや動かしにくさが改善しない"
  ],
  consult: CONSULT,
  references: [REFERENCES.hand, REFERENCES.orthopaedics, REFERENCES.care]
};

const POSTURE = {
  urgent: [
    "突然、手足に力が入らない、歩けないなどの変化がある",
    "排尿・排便の異常や股のまわりの感覚低下がある",
    "大きな外傷後から背中や首の強い痛みが続いている"
  ],
  prompt: [
    "発熱、体重減少、強い体調不良を伴っている",
    "安静時や夜間にも強い痛みが続いている",
    "しびれや筋力低下、歩きにくさが進んでいる"
  ],
  consult: CONSULT,
  references: [REFERENCES.spine, REFERENCES.orthopaedics, REFERENCES.care]
};

const TMJ = {
  urgent: [
    "顔や顎の急な強い腫れで、息がしにくい、飲み込みにくい",
    "事故や転倒のあと、口を閉じられない、噛み合わせが急に変わった",
    "顎や顔の強い痛みに発熱や強い体調不良を伴っている"
  ],
  prompt: [
    "口が開かない、または閉じにくい状態が続いている",
    "顎の痛みや腫れが悪化している",
    "食事が難しい、噛み合わせの変化が続いている"
  ],
  consult: [
    "歯科・口腔外科で緊急性や歯の問題を確認している",
    "姿勢や首肩の負担と顎の使い方をあわせて整理したい",
    "医療機関と併用しながら、日常の力みや身体の使い方を見直したい"
  ],
  references: [REFERENCES.oral, REFERENCES.care]
};

const majorGuides = {
  "lower-back-pain.html": {
    title: "このページでは、一般的な腰痛を中心に整理します",
    lead: "腰の重さ・動き始め・長時間同じ姿勢でのつらさを中心に、股関節や背中、体幹の動きとの関係を確認します。",
    boundaries: [
      "お尻から脚へ広がるしびれが中心の場合は、坐骨神経痛のページもご確認ください。",
      "脚の力が入りにくい、排尿・排便の異常がある場合は、整体より医療機関への相談を優先してください。"
    ]
  },
  "sciatica.html": {
    title: "このページでは、坐骨神経痛と呼ばれる脚症状を整理します",
    lead: "お尻から脚へ広がる痛みやしびれを中心に、症状名と原因を分けて考え、医療機関で確認したい状態もご案内します。",
    boundaries: [
      "坐骨神経痛は症状の呼び方であり、腰椎や股関節周辺など背景は一人ひとり異なります。",
      "画像検査で診断名を伝えられている方は、その内容も初回にお知らせください。"
    ]
  },
  "spinal-stenosis.html": {
    title: "このページでは、脊柱管狭窄症と歩行時の脚症状を整理します",
    lead: "歩行で増える脚の症状や、休むと変化するつらさを中心に、医療機関での検査と整体で確認する日常動作の役割を分けて説明します。",
    boundaries: [
      "脊柱管の状態を整体で診断したり、狭窄そのものを解消すると表現したりはしません。",
      "医療機関での診療方針と併用しながら、歩行や立ち姿勢の負担軽減を目指します。"
    ]
  },
  "lumbar-disc-herniation.html": {
    title: "このページでは、検査所見と現在の症状を分けて整理します",
    lead: "検査で言われた診断名と現在の症状は必ずしも同じではないため、腰・お尻・脚の痛みやしびれ、検査内容、動作の変化を確認します。",
    boundaries: [
      "椎間板ヘルニアそのものを整体で治すとは表現しません。",
      "麻痺や排尿・排便の異常などがある場合は、速やかに医療機関へご相談ください。"
    ]
  },
  "hip-osteoarthritis.html": {
    title: "このページでは、股関節痛と診断名の両方を整理します",
    lead: "足の付け根やお尻の痛み、歩行、靴下を履く動作などを確認し、一般的な股関節痛と変形性股関節症の診断名を混同しないようご案内します。",
    boundaries: [
      "手術の要否は医療機関で相談する内容であり、整体で手術回避を保証するものではありません。",
      "画像検査や治療方針を踏まえ、日常動作での負担軽減を支援します。"
    ]
  },
  "knee-osteoarthritis.html": {
    title: "このページでは、診断名と日常の膝痛を結び付けて整理します",
    lead: "歩き始めや階段での膝の痛みを中心に、変形性膝関節症と言われた方が医療機関と併用しながら確認できる動作や負担を説明します。",
    boundaries: [
      "医療機関での検査や診療方針を否定せず、検査内容や現在の方針を伺います。",
      "股関節・足首・歩き方の確認は、膝へ集まる負担を整理するために行います。"
    ]
  }
};

export const symptomTrustGuidance = {
  "lower-back-pain.html": { ...LOWER_BACK, majorGuide: majorGuides["lower-back-pain.html"] },
  "sciatica.html": { ...LOWER_BACK, majorGuide: majorGuides["sciatica.html"] },
  "spinal-stenosis.html": { ...LOWER_BACK, majorGuide: majorGuides["spinal-stenosis.html"] },
  "lumbar-disc-herniation.html": { ...LOWER_BACK, majorGuide: majorGuides["lumbar-disc-herniation.html"] },
  "hip-osteoarthritis.html": { ...HIP, majorGuide: majorGuides["hip-osteoarthritis.html"] },
  "knee-osteoarthritis.html": { ...KNEE, majorGuide: majorGuides["knee-osteoarthritis.html"] },
  "knee-effusion.html": KNEE,
  "pes-anserine-bursitis.html": KNEE,
  "knee-lateral-pain.html": KNEE,
  "knee-posterior-pain.html": KNEE,
  "knee-front-pain.html": KNEE,
  "meniscus-knee-pain.html": KNEE,
  "bowlegs-knee-pain.html": KNEE,
  "knee-hyperextension.html": KNEE,
  "ankle-stiffness-knee-pain.html": KNEE,
  "plantar-fasciitis.html": FOOT,
  "shoulder-stiffness.html": SHOULDER,
  "frozen-shoulder.html": SHOULDER,
  "cervical-spondylosis.html": UPPER_LIMB_NEURO,
  "thoracic-outlet.html": UPPER_LIMB_NEURO,
  "carpal-tunnel.html": UPPER_LIMB_NEURO,
  "elbow-tendinopathy.html": ELBOW,
  "scoliosis.html": POSTURE,
  "tmj.html": TMJ
};

export const symptomMetadataDescriptions = {
  "frozen-shoulder.html":
    "柏駅西口徒歩8分。五十肩で肩が上がらない・夜間痛でお悩みの方へ。肩の状態や動かせる範囲を確認し、時期に合わせて無理のない施術と運動をご提案します。",
  "hip-osteoarthritis.html":
    "柏駅西口徒歩8分。股関節の痛みや歩きづらさでお悩みの方へ。医療機関での検査内容も踏まえ、股関節・骨盤・歩き方を確認して日常動作の負担軽減を目指します。",
  "lower-back-pain.html":
    "柏駅西口徒歩8分。慢性的な腰痛やぎっくり腰でお悩みの方へ。腰だけでなく股関節や背中、体幹の動きも確認し、日常で腰へ集まる負担の軽減を目指します。",
  "thoracic-outlet.html":
    "柏駅西口徒歩8分。首肩から腕・手にかけてしびれやだるさがある方へ。医療機関での確認を大切にしながら、首・肩・胸郭・腕の動きと負担がかかる場面を整理します。",
  "tmj.html":
    "柏駅西口徒歩8分。口を開けると顎が痛む、音が鳴る、動かしにくい方へ。歯科・口腔外科への受診目安と、姿勢や首肩を含めて確認する内容をご案内します。"
};

export const individualizedVisitFrequency =
  "通院頻度は、症状の強さや続いている期間、生活環境、目指す状態によって異なります。初回に身体の状態を確認したうえで、必要な頻度と期間の目安をご説明します。無理に通院を勧めることはありませんので、ご希望や生活状況も含めてご相談ください。";

export const symptomDirectoryMovementItems = [
  { href: "plantar-fasciitis.html", label: "朝の一歩目が痛い", description: "かかと・足裏の痛みが気になる方へ。" },
  { href: "lower-back-pain.html", label: "立ち上がると腰が痛い", description: "動き始めの腰の重さや痛みが気になる方へ。" },
  { href: "knee-osteoarthritis.html", label: "立ち上がると膝が痛い", description: "椅子から立つ時の膝痛が気になる方へ。" },
  { href: "knee-front-pain.html", label: "階段で膝が痛い", description: "膝の前側やお皿まわりが気になる方へ。" },
  { href: "spinal-stenosis.html", label: "長く歩くと脚がしびれる", description: "休むと変化する脚の症状がある方へ。" },
  { href: "frozen-shoulder.html", label: "腕を上げると肩が痛い", description: "腕を上げる、後ろへ回す動作がつらい方へ。" },
  { href: "elbow-tendinopathy.html", label: "物を持つ・ひねると肘が痛い", description: "家事や仕事で肘へ負担がかかる方へ。" },
  { href: "tmj.html", label: "口を開けると顎が痛い", description: "顎の痛み、音、動かしにくさが気になる方へ。" }
];

export const symptomDirectoryDiagnosisItems = [
  { href: "knee-osteoarthritis.html", label: "変形性膝関節症", description: "歩き始めや階段で膝痛が続く方へ。" },
  { href: "hip-osteoarthritis.html", label: "変形性股関節症", description: "股関節の痛みや歩きづらさがある方へ。" },
  { href: "lumbar-disc-herniation.html", label: "腰椎椎間板ヘルニア", description: "腰から脚へ広がる症状がある方へ。" },
  { href: "spinal-stenosis.html", label: "脊柱管狭窄症", description: "歩くと脚がつらくなる方へ。" },
  { href: "cervical-spondylosis.html", label: "頚椎症", description: "首の痛みや腕のしびれが続く方へ。" },
  { href: "frozen-shoulder.html", label: "五十肩", description: "肩が上がらない、夜間も痛む方へ。" },
  { href: "thoracic-outlet.html", label: "胸郭出口症候群", description: "首肩から腕にしびれやだるさがある方へ。" },
  { href: "carpal-tunnel.html", label: "手根管症候群", description: "手指のしびれや細かな作業のしにくさがある方へ。" },
  { href: "scoliosis.html", label: "側弯症", description: "背骨のカーブや姿勢の左右差が気になる方へ。" },
  { href: "tmj.html", label: "顎関節症", description: "顎の痛み、音、動かしにくさがある方へ。" }
];
