// Hand-crafted scenario questions for a representative set of high-traffic
// competencies, demonstrating the quality bar the generated question bank aims
// for. These are asked before the generated questions for their competency.
// Each option's levelSignal reflects the sophistication of the judgement shown,
// not simply a self-rating — options are graded against the actual RM Comp
// Advanced/Expert descriptor language quoted in sourceDescriptors.
//
// Bilingual: the English and Turkish arrays below share the same question `id`s
// (a session always uses one language throughout, and ids are looked up within
// that language's array) so they represent the same logical question, localized.
import type { Lang, Question } from "../../../shared/types.js";

const flagshipQuestionsEn: Question[] = [
  {
    id: "research-project-management__flagship__risk-scenario",
    competencyId: "research-project-management",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Complexity",
    type: "scenario",
    prompt:
      "You are managing a multi-partner research project. Three months from a major deliverable, one partner tells you they will miss their milestone due to staff turnover, threatening the timeline and a funder reporting deadline. What would you most likely do?",
    why: "Tests proactive risk management and portfolio-level thinking against the Advanced and Expert descriptors for Research Project Management.",
    responseFormat: "single-select",
    options: [
      { value: "escalate", label: "Escalate immediately to my line manager and wait for instructions.", levelSignal: { Foundational: 0.7, Intermediate: 0.2 } },
      { value: "log", label: "Contact the partner to understand the issue, document it, and update the project risk log.", levelSignal: { Intermediate: 0.7, Advanced: 0.2 } },
      { value: "renegotiate", label: "Proactively renegotiate the task plan with the partner, identify mitigation options within the grant agreement's flexibility, and inform the funder before it becomes a compliance issue.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "portfolio", label: "Treat it as an input to a portfolio-level risk review, rebalancing resourcing and synergies across my whole project portfolio, and feed lessons learned into future consortium agreements.", levelSignal: { Expert: 0.85, Advanced: 0.2 } },
    ],
    sourceDescriptors: [
      { competencyId: "research-project-management", level: "Advanced", descriptorIndex: 0, text: "Identifies, assesses, and manages risks proactively, implementing strategies to mitigate potential issues." },
      { competencyId: "research-project-management", level: "Expert", descriptorIndex: 2, text: "Manages a portfolio of research projects, optimising resource allocation and project synergies." },
    ],
    origin: "flagship",
  },
  {
    id: "research-project-management__flagship__risk-followup",
    competencyId: "research-project-management",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Impact",
    type: "outcome",
    prompt: "Have you personally handled a situation like this (or a similar project risk)? If so, briefly describe what happened and what the outcome was.",
    why: "Separates a hypothetical judgement call from demonstrated real experience.",
    responseFormat: "free-text",
    sourceDescriptors: [
      { competencyId: "research-project-management", level: "Advanced", descriptorIndex: 0, text: "Identifies, assesses, and manages risks proactively, implementing strategies to mitigate potential issues." },
    ],
    origin: "flagship",
  },
  {
    id: "pre-award__flagship__competing-proposals",
    competencyId: "pre-award",
    targetLevels: ["Advanced", "Expert"],
    dimension: "StrategicInfluence",
    type: "scenario",
    prompt:
      "Two strong researchers at your organisation want to submit competing proposals to the same funding call, which allows only one submission per institution. How would you handle this?",
    why: "Tests strategic funding-portfolio judgement against the Advanced and Expert descriptors for Pre-Award.",
    responseFormat: "single-select",
    options: [
      { value: "leave-it", label: "Let the two researchers decide between themselves.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "recommend", label: "Review both concepts against the call's evaluation criteria and recommend the stronger one, explaining the reasoning.", levelSignal: { Intermediate: 0.6, Advanced: 0.3 } },
      { value: "structured-review", label: "Facilitate a structured internal review against strategic priorities, and explore whether one proposal could be strengthened by merging elements of the other rather than competing outright.", levelSignal: { Advanced: 0.7, Expert: 0.2 } },
      { value: "policy", label: "Use it as input to organisational strategy — e.g. adjusting call-eligibility policy, funding-portfolio balancing, and coaching capability so this conflict is less likely in future rounds.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "pre-award", level: "Advanced", descriptorIndex: 0, text: "Aligns organisational research opportunities and priorities with funding opportunities, develops individual plans for researchers and research teams to enable applicant grant success." },
      { competencyId: "pre-award", level: "Expert", descriptorIndex: 0, text: "Contributes to the development of institutional research funding strategies, aligning them with organisational, national and international objectives." },
    ],
    origin: "flagship",
  },
  {
    id: "post-award__flagship__overspend-scenario",
    competencyId: "post-award",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Responsibility",
    type: "scenario",
    prompt:
      "Partway through a funded multi-partner project, you discover a partner has significantly overspent their approved budget line, with a year still remaining. What is your most likely course of action?",
    why: "Tests financial and consortium risk management against the Advanced and Expert descriptors for Post-Award.",
    responseFormat: "single-select",
    options: [
      { value: "flag-later", label: "Note it for the next progress report and flag it to my manager.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "investigate", label: "Contact the partner to understand the overspend, check it against the grant agreement's budget rules, and document a corrective plan.", levelSignal: { Intermediate: 0.6, Advanced: 0.25 } },
      { value: "negotiate-amendment", label: "Lead a formal review with the partner and funder, negotiate a budget amendment within the consortium agreement, and update the risk register and financial forecast.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "process-change", label: "Treat it as a signal to review financial controls and reporting cadence across the whole project portfolio, and propose a process change to catch this earlier in future.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "post-award", level: "Advanced", descriptorIndex: 1, text: "Negotiates and finalises grant agreements with funding agencies, addressing terms, conditions, and budgetary considerations." },
      { competencyId: "post-award", level: "Expert", descriptorIndex: 2, text: "Initiates and implements processes to enhance research project outcomes and efficiency, articulates and rewards key performance indicators/metrics for managing funded research." },
    ],
    origin: "flagship",
  },
  {
    id: "people-management__flagship__missed-deadlines",
    competencyId: "people-management",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Leadership",
    type: "scenario",
    prompt:
      "A capable member of your team has started missing deadlines over the past month, and you sense something is off but they haven't said anything. What would you most likely do?",
    why: "Tests proactive people leadership against the Advanced and Expert descriptors for People Management and Managing Team Performance.",
    responseFormat: "single-select",
    options: [
      { value: "wait", label: "Wait to see if it resolves itself, and address it only if it continues.", levelSignal: { Foundational: 0.5, Intermediate: 0.2 } },
      { value: "checkin", label: "Have a private conversation to check in, understand what's going on, and agree next steps together.", levelSignal: { Intermediate: 0.7, Advanced: 0.2 } },
      { value: "pattern", label: "Have that conversation, and also look for wider patterns (workload, unclear expectations) that might be contributing, adjusting how the team operates if needed.", levelSignal: { Advanced: 0.7, Expert: 0.2 } },
      { value: "systemic", label: "Use it as a prompt to review team-wide workload and wellbeing systems, and mentor other leads in the organisation on spotting this early.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "people-management", level: "Advanced", descriptorIndex: 0, text: "Anticipates and plans for future challenges within the team." },
      { competencyId: "people-management", level: "Expert", descriptorIndex: 2, text: "Demonstrates resilience and adaptability in challenging team and or organisational circumstances." },
    ],
    origin: "flagship",
  },
  {
    id: "strategic-planning__flagship__five-year-strategy",
    competencyId: "strategic-planning",
    targetLevels: ["Advanced", "Expert"],
    dimension: "StrategicInfluence",
    type: "scenario",
    prompt: "Your organisation is reviewing its research strategy for the next five years. What role would you most likely play?",
    why: "Tests strategic contribution against the Advanced and Expert descriptors for Strategic Planning.",
    responseFormat: "single-select",
    options: [
      { value: "input-only", label: "I would contribute input if asked, e.g. data about my own projects.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "analysis", label: "I would help gather and analyse relevant trends and threats to inform the plan.", levelSignal: { Intermediate: 0.6, Advanced: 0.25 } },
      { value: "formulate", label: "I would help formulate the strategic initiatives myself, connecting with national/international networks and building implementation plans aligned to organisational goals.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "drive", label: "I would be a recognised driver of the strategy, integrating global trend analysis and guiding senior leadership through the decision process.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "strategic-planning", level: "Advanced", descriptorIndex: 0, text: "Demonstrates the ability to formulate comprehensive and forward-thinking strategic initiatives." },
      { competencyId: "strategic-planning", level: "Expert", descriptorIndex: 0, text: "Demonstrates the capacity to integrate insight, analyse global trends, and anticipate emerging challenges, resulting in the creation of agile and adaptive strategic plans." },
    ],
    origin: "flagship",
  },
  {
    id: "key-stakeholder-engagement__flagship__difficult-stakeholder",
    competencyId: "key-stakeholder-engagement",
    targetLevels: ["Advanced", "Expert"],
    dimension: "StakeholderInfluence",
    type: "scenario",
    prompt:
      "You need buy-in from a senior stakeholder (a funder, industry partner, or policymaker) who has been difficult to engage and has conflicting priorities with your project. What is closest to how you would approach it?",
    why: "Tests sophistication of stakeholder strategy against the Advanced and Expert descriptors for Engagement with Key Stakeholders.",
    responseFormat: "single-select",
    options: [
      { value: "delegate", label: "I'd ask a more senior colleague to make the approach instead.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "map", label: "I'd map out their interests and concerns, then set up a conversation to find common ground.", levelSignal: { Intermediate: 0.65, Advanced: 0.2 } },
      { value: "strategy", label: "I'd build a tailored engagement strategy, understanding their power and influence and negotiating an approach that works for both sides.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "network", label: "I'd treat this as part of a broader stakeholder strategy, leveraging existing network and relationship capital to align them with the organisation's mission long-term.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "key-stakeholder-engagement", level: "Advanced", descriptorIndex: 0, text: "Builds and sustains strategic relationships with key stakeholders." },
      { competencyId: "key-stakeholder-engagement", level: "Expert", descriptorIndex: 3, text: "Drives transformative impact by leveraging extensive networks, facilitating dialogue, and fostering long-term relationships that advance the organisation's mission and objectives." },
    ],
    origin: "flagship",
  },
];

const flagshipQuestionsTr: Question[] = [
  {
    id: "research-project-management__flagship__risk-scenario",
    competencyId: "research-project-management",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Complexity",
    type: "scenario",
    prompt:
      "Çok ortaklı bir araştırma projesini yönetiyorsunuz. Büyük bir çıktının teslimine üç ay kala, bir ortak personel değişimi nedeniyle kilometre taşını kaçıracağını söylüyor; bu durum zaman çizelgesini ve bir fon sağlayıcı raporlama son tarihini tehdit ediyor. Büyük olasılıkla ne yaparsınız?",
    why: "Araştırma Projesi Yönetimi için İleri ve Uzman düzey tanımlayıcılarına karşı proaktif risk yönetimini ve portföy düzeyinde düşünmeyi test eder.",
    responseFormat: "single-select",
    options: [
      { value: "escalate", label: "Durumu derhal yöneticime iletir ve talimat beklerim.", levelSignal: { Foundational: 0.7, Intermediate: 0.2 } },
      { value: "log", label: "Sorunu anlamak için ortakla iletişime geçer, durumu belgeler ve proje risk kaydını güncellerim.", levelSignal: { Intermediate: 0.7, Advanced: 0.2 } },
      { value: "renegotiate", label: "Ortakla görev planını proaktif biçimde yeniden müzakere eder, hibe sözleşmesinin esnekliği dahilinde azaltma seçenekleri belirler ve bu bir uyumluluk sorununa dönüşmeden fon sağlayıcıyı bilgilendiririm.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "portfolio", label: "Bunu, tüm proje portföyüm genelinde kaynak ve sinerjileri yeniden dengeleyen portföy düzeyinde bir risk incelemesine girdi olarak kullanır ve öğrenilen dersleri gelecekteki konsorsiyum anlaşmalarına yansıtırım.", levelSignal: { Expert: 0.85, Advanced: 0.2 } },
    ],
    sourceDescriptors: [
      { competencyId: "research-project-management", level: "Advanced", descriptorIndex: 0, text: "Olası sorunları azaltmak için stratejiler uygulayarak riskleri proaktif biçimde belirler, değerlendirir ve yönetir." },
      { competencyId: "research-project-management", level: "Expert", descriptorIndex: 2, text: "Kaynak tahsisini ve proje sinerjilerini optimize ederek bir araştırma projeleri portföyünü yönetir." },
    ],
    origin: "flagship",
  },
  {
    id: "research-project-management__flagship__risk-followup",
    competencyId: "research-project-management",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Impact",
    type: "outcome",
    prompt: "Buna benzer bir durumu (veya benzer bir proje riskini) kişisel olarak ele aldınız mı? Öyleyse, ne olduğunu ve sonucunun ne olduğunu kısaca anlatın.",
    why: "Varsayımsal bir muhakeme kararını, gösterilmiş gerçek deneyimden ayırır.",
    responseFormat: "free-text",
    sourceDescriptors: [
      { competencyId: "research-project-management", level: "Advanced", descriptorIndex: 0, text: "Olası sorunları azaltmak için stratejiler uygulayarak riskleri proaktif biçimde belirler, değerlendirir ve yönetir." },
    ],
    origin: "flagship",
  },
  {
    id: "pre-award__flagship__competing-proposals",
    competencyId: "pre-award",
    targetLevels: ["Advanced", "Expert"],
    dimension: "StrategicInfluence",
    type: "scenario",
    prompt:
      "Kurumunuzdaki iki güçlü araştırmacı, kurum başına yalnızca bir başvuruya izin veren aynı fonlama çağrısına rakip başvurular sunmak istiyor. Bu durumu nasıl ele alırsınız?",
    why: "Hibe Öncesi için İleri ve Uzman düzey tanımlayıcılarına karşı stratejik fonlama portföyü muhakemesini test eder.",
    responseFormat: "single-select",
    options: [
      { value: "leave-it", label: "İki araştırmacının aralarında karar vermesine izin veririm.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "recommend", label: "Her iki fikri de çağrının değerlendirme kriterlerine göre incelerim ve daha güçlü olanı, gerekçesini açıklayarak öneririm.", levelSignal: { Intermediate: 0.6, Advanced: 0.3 } },
      { value: "structured-review", label: "Stratejik önceliklere karşı yapılandırılmış bir iç inceleme kolaylaştırırım ve bir önerinin, doğrudan rekabet etmek yerine diğerinin unsurlarıyla birleştirilerek güçlendirilip güçlendirilemeyeceğini araştırırım.", levelSignal: { Advanced: 0.7, Expert: 0.2 } },
      { value: "policy", label: "Bunu kurumsal stratejiye girdi olarak kullanırım — örn. çağrı uygunluk politikasını, fonlama portföyü dengelemesini ayarlamak ve bu çatışmanın gelecekteki turlarda daha az olası olması için kapasite koçluğu yapmak.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "pre-award", level: "Advanced", descriptorIndex: 0, text: "Kurumsal araştırma fırsatlarını ve önceliklerini fonlama fırsatlarıyla uyumlu hale getirir; araştırmacılar ve araştırma ekipleri için başvuru sahibi hibe başarısını sağlayacak bireysel planlar geliştirir." },
      { competencyId: "pre-award", level: "Expert", descriptorIndex: 0, text: "Kurumsal, ulusal ve uluslararası hedeflerle uyumlu hale getirerek kurumsal araştırma fonlama stratejilerinin geliştirilmesine katkıda bulunur." },
    ],
    origin: "flagship",
  },
  {
    id: "post-award__flagship__overspend-scenario",
    competencyId: "post-award",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Responsibility",
    type: "scenario",
    prompt:
      "Fonlanan çok ortaklı bir projenin ortasında, bir ortağın onaylanmış bütçe kalemini önemli ölçüde aştığını fark ediyorsunuz ve hâlâ bir yıl kalmış durumda. En olası eylem tarzınız nedir?",
    why: "Hibe Sonrası için İleri ve Uzman düzey tanımlayıcılarına karşı finansal ve konsorsiyum risk yönetimini test eder.",
    responseFormat: "single-select",
    options: [
      { value: "flag-later", label: "Bir sonraki ilerleme raporu için not alır ve yöneticime bildiririm.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "investigate", label: "Aşırı harcamayı anlamak için ortakla iletişime geçer, bunu hibe sözleşmesinin bütçe kurallarına göre kontrol eder ve düzeltici bir plan belgelerim.", levelSignal: { Intermediate: 0.6, Advanced: 0.25 } },
      { value: "negotiate-amendment", label: "Ortak ve fon sağlayıcı ile resmi bir incelemeye liderlik eder, konsorsiyum anlaşması dahilinde bir bütçe değişikliği müzakere eder ve risk kaydını ile finansal tahmini güncellerim.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "process-change", label: "Bunu, tüm proje portföyü genelinde finansal kontrolleri ve raporlama sıklığını gözden geçirme sinyali olarak ele alır ve bunu gelecekte daha erken yakalamak için bir süreç değişikliği öneririm.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "post-award", level: "Advanced", descriptorIndex: 1, text: "Şartları, koşulları ve bütçe değerlendirmelerini ele alarak fon sağlayıcı kuruluşlarla hibe anlaşmalarını müzakere eder ve sonuçlandırır." },
      { competencyId: "post-award", level: "Expert", descriptorIndex: 2, text: "Araştırma proje sonuçlarını ve verimliliğini artırmak için süreçler başlatır ve uygular; fonlanan araştırmayı yönetmek için temel performans göstergelerini/metriklerini ifade eder ve ödüllendirir." },
    ],
    origin: "flagship",
  },
  {
    id: "people-management__flagship__missed-deadlines",
    competencyId: "people-management",
    targetLevels: ["Advanced", "Expert"],
    dimension: "Leadership",
    type: "scenario",
    prompt:
      "Ekibinizdeki yetenekli bir üye, geçtiğimiz ay boyunca son tarihleri kaçırmaya başladı ve bir şeylerin ters gittiğini hissediyorsunuz ama henüz bir şey söylemedi. Büyük olasılıkla ne yaparsınız?",
    why: "İnsan Yönetimi ve Ekip Performansı Yönetimi için İleri ve Uzman düzey tanımlayıcılarına karşı proaktif insan liderliğini test eder.",
    responseFormat: "single-select",
    options: [
      { value: "wait", label: "Kendiliğinden çözülüp çözülmediğini görmek için beklerim ve yalnızca devam ederse ele alırım.", levelSignal: { Foundational: 0.5, Intermediate: 0.2 } },
      { value: "checkin", label: "Durumu kontrol etmek, neler olduğunu anlamak ve birlikte sonraki adımlar üzerinde anlaşmak için özel bir görüşme yaparım.", levelSignal: { Intermediate: 0.7, Advanced: 0.2 } },
      { value: "pattern", label: "Bu görüşmeyi yaparım, ayrıca katkıda bulunabilecek daha geniş örüntüleri (iş yükü, belirsiz beklentiler) araştırır, gerekirse ekibin çalışma biçimini ayarlarım.", levelSignal: { Advanced: 0.7, Expert: 0.2 } },
      { value: "systemic", label: "Bunu, ekip genelindeki iş yükü ve refah sistemlerini gözden geçirme fırsatı olarak kullanır ve kurumdaki diğer liderlere bunu erken fark etme konusunda mentorluk yaparım.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "people-management", level: "Advanced", descriptorIndex: 0, text: "Ekip içindeki gelecekteki zorlukları öngörür ve bunlara hazırlanır." },
      { competencyId: "people-management", level: "Expert", descriptorIndex: 2, text: "Zorlu ekip ve/veya kurumsal koşullarda dayanıklılık ve uyum sağlama gösterir." },
    ],
    origin: "flagship",
  },
  {
    id: "strategic-planning__flagship__five-year-strategy",
    competencyId: "strategic-planning",
    targetLevels: ["Advanced", "Expert"],
    dimension: "StrategicInfluence",
    type: "scenario",
    prompt: "Kurumunuz önümüzdeki beş yıla ilişkin araştırma stratejisini gözden geçiriyor. Büyük olasılıkla nasıl bir rol oynarsınız?",
    why: "Stratejik Planlama için İleri ve Uzman düzey tanımlayıcılarına karşı stratejik katkıyı test eder.",
    responseFormat: "single-select",
    options: [
      { value: "input-only", label: "Sorulursa, örneğin kendi projelerim hakkında veri gibi katkı sağlarım.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "analysis", label: "Planı bilgilendirmek için ilgili eğilimleri ve tehditleri toplamaya ve analiz etmeye yardımcı olurum.", levelSignal: { Intermediate: 0.6, Advanced: 0.25 } },
      { value: "formulate", label: "Ulusal/uluslararası ağlarla bağlantı kurarak ve kurumsal hedeflerle uyumlu uygulama planları oluşturarak stratejik girişimleri kendim formüle etmeye yardımcı olurum.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "drive", label: "Küresel eğilim analizini bütünleştirerek ve üst yönetime karar sürecinde rehberlik ederek stratejinin tanınan bir yönlendiricisi olurum.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "strategic-planning", level: "Advanced", descriptorIndex: 0, text: "Kapsamlı ve ileriye dönük stratejik girişimler oluşturma becerisi gösterir." },
      { competencyId: "strategic-planning", level: "Expert", descriptorIndex: 0, text: "İçgörüleri bütünleştirme, küresel eğilimleri analiz etme ve ortaya çıkan zorlukları öngörme kapasitesini gösterir; bu da çevik ve uyarlanabilir stratejik planların oluşturulmasıyla sonuçlanır." },
    ],
    origin: "flagship",
  },
  {
    id: "key-stakeholder-engagement__flagship__difficult-stakeholder",
    competencyId: "key-stakeholder-engagement",
    targetLevels: ["Advanced", "Expert"],
    dimension: "StakeholderInfluence",
    type: "scenario",
    prompt:
      "Projenizle çelişen önceliklere sahip ve etkileşim kurulması zor olmuş üst düzey bir paydaştan (bir fon sağlayıcı, sanayi ortağı veya politika yapıcı) destek almanız gerekiyor. Buna en yakın yaklaşımınız hangisidir?",
    why: "Kilit Paydaşlarla Katılım için İleri ve Uzman düzey tanımlayıcılarına karşı paydaş stratejisinin sofistike düzeyini test eder.",
    responseFormat: "single-select",
    options: [
      { value: "delegate", label: "Bunun yerine daha kıdemli bir meslektaşımdan yaklaşmasını isterim.", levelSignal: { Foundational: 0.6, Intermediate: 0.2 } },
      { value: "map", label: "Çıkarlarını ve endişelerini haritalandırır, ardından ortak zemin bulmak için bir görüşme ayarlarım.", levelSignal: { Intermediate: 0.65, Advanced: 0.2 } },
      { value: "strategy", label: "Güçlerini ve etkilerini anlayarak ve her iki taraf için de işe yarayan bir yaklaşımı müzakere ederek özel bir katılım stratejisi oluştururum.", levelSignal: { Advanced: 0.75, Expert: 0.2 } },
      { value: "network", label: "Bunu, mevcut ağımdan ve ilişki sermayemden yararlanarak onları kurumun misyonuyla uzun vadede uyumlu hale getiren daha geniş bir paydaş stratejisinin parçası olarak ele alırım.", levelSignal: { Expert: 0.85 } },
    ],
    sourceDescriptors: [
      { competencyId: "key-stakeholder-engagement", level: "Advanced", descriptorIndex: 0, text: "Kilit paydaşlarla stratejik ilişkiler kurar ve sürdürür." },
      { competencyId: "key-stakeholder-engagement", level: "Expert", descriptorIndex: 3, text: "Geniş ağlardan yararlanarak, diyaloğu kolaylaştırarak ve kurumun misyonunu ve hedeflerini ilerleten uzun vadeli ilişkileri teşvik ederek dönüştürücü bir etki yaratır." },
    ],
    origin: "flagship",
  },
];

export const flagshipQuestionsByLang: Record<Lang, Question[]> = {
  en: flagshipQuestionsEn,
  tr: flagshipQuestionsTr,
};

// Backwards-compatible named export (English), kept for any direct importers.
export const flagshipQuestions = flagshipQuestionsEn;
