import type { Lang } from "../../../shared/types";

export const LANG_NAMES: Record<Lang, string> = { en: "English", tr: "Türkçe" };

export interface Strings {
  layout: {
    stepLabels: Record<"welcome" | "mode" | "role" | "documents" | "questioning" | "dashboard" | "gaps" | "report", string>;
    startOver: string;
    footer: string;
    footerCompleted: string;
    langLockedTitle: string;
  };
  welcome: {
    badge: string;
    title: string;
    body: string;
    howItWorksTitle: string;
    bullets: string[];
    namePrompt: string;
    namePlaceholder: string;
    start: string;
    footnote: string;
  };
  mode: {
    title: string;
    subtitle: string;
    modes: { id: "quick" | "standard" | "full" | "targeted"; title: string; desc: string; time: string }[];
    targetedHeading: (n: number) => string;
    continue: string;
  };
  role: {
    heading: string;
    subtitle: string;
    jobTitleLabel: string;
    jobTitlePlaceholder: string;
    orgTypeLabel: string;
    orgTypePlaceholder: string;
    responsibilitiesLabel: string;
    responsibilitiesPlaceholder: string;
    experienceLabel: string;
    checkboxesHeading: string;
    checkboxes: string[];
    profilesHeading: string;
    profilesSubtitle: string;
    targetHeading: string;
    targetOptions: { id: "current" | "future" | "both"; label: string }[];
    currentNotesLabel: string;
    currentNotesPlaceholder: string;
    futureDescLabel: string;
    futureDescPlaceholder: string;
    futureLevelLabel: string;
    futureLevelAuto: string;
    back: string;
    continue: string;
  };
  documents: {
    heading: string;
    subtitle: string;
    chooseFiles: string;
    uploading: string;
    hint: string;
    uploadedHeading: (n: number) => string;
    touched: (n: number) => string;
    processed: string;
    back: string;
    skipOrContinue: (hasDocs: boolean) => string;
  };
  questioning: {
    loadingNext: string;
    coveredLabel: (sufficient: number, total: number) => string;
    whyLabel: string;
    placeholder: string;
    continue: string;
    saving: string;
  };
  dashboard: {
    heading: string;
    statCompetencies: string;
    statDefensible: string;
    statHighPriority: string;
    heatmapHeading: string;
    insufficientEvidence: string;
    currentVsTargetHeading: string;
    currentVsTargetSubtitle: string;
    strengthsHeading: string;
    uncertaintyHeading: string;
    backToQuestions: string;
    seeGaps: string;
    loading: string;
  };
  gaps: {
    heading: string;
    subtitle: string;
    noGaps: string;
    priorityHeading: (label: string, n: number) => string;
    priorityLabels: { High: string; Medium: string; Low: string };
    notYetDemonstrated: string;
    developmentFocus: string;
    suggestedEvidence: string;
    arrowToTarget: (target: string) => string;
    back: string;
    generateReport: string;
    loading: string;
  };
  report: {
    heading: string;
    generatedAt: (date: string, mode: string) => string;
    print: string;
    exportJson: string;
    exportCsv: string;
    executiveSummary: string;
    roleProfile: string;
    jobTitleLabel: string;
    orgTypeLabel: string;
    experienceLabel: string;
    assessedAgainstLabel: string;
    competencyProfile: string;
    tableHeaders: { competency: string; current: string; target: string; confidence: string; evidence: string };
    domainAnalysis: string;
    strengthsPrefix: string;
    gapsPrefix: string;
    topStrengths: string;
    noStrengths: string;
    careerMap: string;
    noCareerGaps: string;
    uncertainty: string;
    noUncertainty: string;
    backToDashboard: string;
    startOver: string;
    loading: string;
  };
  common: {
    dash: string;
  };
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    layout: {
      stepLabels: { welcome: "Welcome", mode: "Mode", role: "Role Profile", documents: "Evidence", questioning: "Assessment", dashboard: "Profile", gaps: "Gap Analysis", report: "Report" },
      startOver: "Start over",
      footer: "RM Comp Self-Assessment Tool — competency data sourced from the European Competence Framework for Research Managers.",
      footerCompleted: " Assessment complete.",
      langLockedTitle: "Language is fixed for this assessment once it has started.",
    },
    welcome: {
      badge: "European Competence Framework for Research Managers (RM Comp)",
      title: "A defensible, evidence-based competency self-assessment",
      body: "This tool assesses your current research-management competence against the RM Comp framework, compares it to what your role actually requires, and gives you a specific, evidence-based development plan — not a generic quiz where picking \"Expert\" gets you \"Expert\".",
      howItWorksTitle: "How this works",
      bullets: [
        "🎯 You'll describe your role — the assessment adapts to focus on what's actually relevant to you.",
        "💬 Instead of rating yourself, you'll describe real, specific things you've done. The tool infers your level from that evidence.",
        "📎 You can optionally attach a CV, job description, or other evidence to strengthen the picture.",
        "📊 You'll get a level (Foundational / Intermediate / Advanced / Expert) per competency, with a confidence and evidence-strength rating — never a fake percentage score.",
        "🧭 A gap analysis compares your current level to what your role requires, with specific development priorities.",
      ],
      namePrompt: "Your name",
      namePlaceholder: "So your results can be identified if this is shared with a team lead",
      start: "Start the assessment",
      footnote: "Takes 10–30 minutes depending on the mode you choose. You can pause and resume at any time.",
    },
    mode: {
      title: "Choose an assessment mode",
      subtitle: "You can always come back and run the Full assessment later.",
      modes: [
        { id: "quick", title: "Quick Assessment", desc: "Only the competencies most relevant to your role. Fastest way to get a useful picture.", time: "~10 min" },
        { id: "standard", title: "Standard Assessment", desc: "Competencies of high and medium relevance to your role, assessed in more depth.", time: "~20 min" },
        { id: "full", title: "Full RM Comp Assessment", desc: "Every competency in the framework, regardless of relevance to your current role.", time: "~45+ min" },
        { id: "targeted", title: "Targeted Assessment", desc: "You choose exactly which competencies to assess.", time: "Varies" },
      ],
      targetedHeading: (n) => `Choose competencies (${n} selected)`,
      continue: "Continue",
    },
    role: {
      heading: "Tell us about your role",
      subtitle: "This isn't used to score you — job titles vary a lot between organisations. It's used to decide which competencies get more attention, and to suggest (never impose) a sensible target level.",
      jobTitleLabel: "Current job title",
      jobTitlePlaceholder: "e.g. Research Grants Officer",
      orgTypeLabel: "Organisation type",
      orgTypePlaceholder: "e.g. University, research institute, funder",
      responsibilitiesLabel: "In your own words, what do you actually do day to day?",
      responsibilitiesPlaceholder: "Describe your main responsibilities, not just your title.",
      experienceLabel: "Years working in research management / research support",
      checkboxesHeading: "Which of these apply to you?",
      checkboxes: [
        "I manage or supervise other people",
        "I contribute to organisational strategy or policy",
        "I work directly with funding programmes or calls",
        "I manage research projects end-to-end",
        "I regularly engage external stakeholders (funders, partners, industry)",
        "My work has an international or multi-country dimension",
      ],
      profilesHeading: "Which of these describe your work? (select all that apply)",
      profilesSubtitle: "These are assessment-navigation categories built for this tool — not part of the RM Comp framework itself. They only affect which competencies get more focus.",
      targetHeading: "What should we assess you against?",
      targetOptions: [
        { id: "current", label: "My current role's requirements" },
        { id: "future", label: "A future / desired role" },
        { id: "both", label: "Both — show me gaps for each" },
      ],
      currentNotesLabel: "Anything specific your current role requires that we should know? (optional)",
      currentNotesPlaceholder: "e.g. My role formally requires leading multi-partner consortium bids.",
      futureDescLabel: "Describe the future / desired role",
      futureDescPlaceholder: "e.g. Head of Research Support Office within 3 years",
      futureLevelLabel: "If you know it, what level does that role typically require? (optional — we'll suggest one if you leave this blank)",
      futureLevelAuto: "Let the tool suggest one",
      back: "Back",
      continue: "Continue",
    },
    documents: {
      heading: "Optional: add supporting evidence",
      subtitle: "Attach a CV, job description, performance review, or project summary. This never substitutes for the questions that follow — it's treated as weak, \"documentary\" evidence, distinguished from what you tell us directly. Nothing here proves competence by keyword matching alone.",
      chooseFiles: "Choose files",
      uploading: "Uploading…",
      hint: ".txt, .md, .pdf, or .docx — up to 15MB each. Processed locally by this app's own server, not sent anywhere else unless you've enabled LLM-assisted evaluation.",
      uploadedHeading: (n) => `Uploaded (${n})`,
      touched: (n) => `${n} competenc${n === 1 ? "y" : "ies"} touched`,
      processed: "processed",
      back: "Back",
      skipOrContinue: (hasDocs) => (hasDocs ? "Continue" : "Skip — continue to the assessment"),
    },
    questioning: {
      loadingNext: "Loading the next question…",
      coveredLabel: (sufficient, total) => `${sufficient} of ${total} competencies covered`,
      whyLabel: "Why am I being asked this?",
      placeholder: "Describe a specific, real example — what you did, and what happened.",
      continue: "Continue",
      saving: "Saving…",
    },
    dashboard: {
      heading: "Your competence profile",
      statCompetencies: "Competencies assessed",
      statDefensible: "With a defensible current level",
      statHighPriority: "High-priority gaps",
      heatmapHeading: "Competency heatmap",
      insufficientEvidence: "Insufficient evidence",
      currentVsTargetHeading: "Current vs. target level",
      currentVsTargetSubtitle: "The dark marker shows what your role requires; the filled bar shows evidence-supported current level.",
      strengthsHeading: "Top strengths (evidence-supported)",
      uncertaintyHeading: "Where evidence is still limited",
      backToQuestions: "Back to questions",
      seeGaps: "See gap analysis",
      loading: "Building your competence profile…",
    },
    gaps: {
      heading: "Gap analysis & development priorities",
      subtitle: "Compared against your stated target role — not against \"Expert\" by default.",
      noGaps: "No development gaps were identified relative to your stated target role, based on the evidence gathered.",
      priorityHeading: (label, n) => `${label} priority (${n})`,
      priorityLabels: { High: "High", Medium: "Medium", Low: "Low" },
      notYetDemonstrated: "Not yet demonstrated",
      developmentFocus: "Development focus",
      suggestedEvidence: "Evidence you could build toward this",
      arrowToTarget: (target) => `→ target ${target}`,
      back: "Back to profile",
      generateReport: "Generate final report",
      loading: "Loading gap analysis…",
    },
    report: {
      heading: "Final Assessment Report",
      generatedAt: (date, mode) => `Generated ${date} · Mode: ${mode}`,
      print: "Print / Save as PDF",
      exportJson: "Export JSON",
      exportCsv: "Export CSV",
      executiveSummary: "Executive Summary",
      roleProfile: "Role Profile",
      jobTitleLabel: "Job title",
      orgTypeLabel: "Organisation type",
      experienceLabel: "Experience",
      assessedAgainstLabel: "Assessed against",
      competencyProfile: "Competency Profile",
      tableHeaders: { competency: "Competency", current: "Current", target: "Target", confidence: "Confidence", evidence: "Evidence" },
      domainAnalysis: "Domain Analysis",
      strengthsPrefix: "Strengths",
      gapsPrefix: "Gaps",
      topStrengths: "Top Strengths",
      noStrengths: "No strengths could be established with sufficient confidence yet — more evidence would help.",
      careerMap: "Career Development Map",
      noCareerGaps: "No priority gaps identified relative to your stated target role.",
      uncertainty: "Uncertainty & Limitations",
      noUncertainty: "No significant uncertainty flags — evidence was reasonably consistent across the competencies assessed.",
      backToDashboard: "Back to dashboard",
      startOver: "Start a new assessment",
      loading: "Building your final report…",
    },
    common: { dash: "—" },
  },
  tr: {
    layout: {
      stepLabels: { welcome: "Hoş Geldiniz", mode: "Mod", role: "Rol Profili", documents: "Kanıt", questioning: "Değerlendirme", dashboard: "Profil", gaps: "Açık Analizi", report: "Rapor" },
      startOver: "Yeniden başla",
      footer: "RM Comp Öz-Değerlendirme Aracı — yetkinlik verileri Araştırma Yöneticileri için Avrupa Yetkinlik Çerçevesi'nden alınmıştır.",
      footerCompleted: " Değerlendirme tamamlandı.",
      langLockedTitle: "Değerlendirme başladıktan sonra dil değiştirilemez.",
    },
    welcome: {
      badge: "Araştırma Yöneticileri için Avrupa Yetkinlik Çerçevesi (RM Comp)",
      title: "Güvenilir, kanıta dayalı bir yetkinlik öz-değerlendirmesi",
      body: "Bu araç, araştırma yönetimindeki mevcut yetkinliğinizi RM Comp çerçevesine göre değerlendirir ve rolünüzün gerçekte ne gerektirdiğiyle karşılaştırır. Sonuç, \"Uzman\"ı işaretleyince sizi uzman yapan sıradan bir test değil; somut kanıtlara dayanan, size özel bir gelişim planıdır.",
      howItWorksTitle: "Nasıl çalışır?",
      bullets: [
        "🎯 Önce rolünüzü anlatırsınız; değerlendirme sizinle gerçekten ilgili konulara odaklanacak şekilde kendini ayarlar.",
        "💬 Kendinizi puanlamak yerine, yaptığınız somut şeyleri anlatırsınız. Düzeyiniz, bu anlattıklarınızdan çıkarılır.",
        "📎 İsterseniz özgeçmişinizi, iş tanımınızı veya başka bir kanıtı ekleyerek tabloyu güçlendirebilirsiniz.",
        "📊 Her yetkinlik için Temel, Orta, İleri veya Uzman düzeylerinden biri belirlenir; buna bir güven ve kanıt gücü derecesi eşlik eder — asla uydurma bir yüzde puanı görmezsiniz.",
        "🧭 Bir açık analizi mevcut düzeyinizi rolünüzün gerektirdiğiyle karşılaştırır ve nerede gelişmeniz gerektiğini somut biçimde gösterir.",
      ],
      namePrompt: "Adınız",
      namePlaceholder: "Bu bir ekip lideriyle paylaşılırsa sonuçlarınız tanınabilsin diye",
      start: "Değerlendirmeyi başlat",
      footnote: "Seçtiğiniz moda göre 10-30 dakika sürer. İstediğiniz an duraklatıp kaldığınız yerden devam edebilirsiniz.",
    },
    mode: {
      title: "Bir değerlendirme modu seçin",
      subtitle: "Daha sonra istediğiniz zaman geri dönüp Tam değerlendirmeyi de yapabilirsiniz.",
      modes: [
        { id: "quick", title: "Hızlı Değerlendirme", desc: "Yalnızca rolünüzle en çok ilgili yetkinlikler değerlendirilir. Faydalı bir sonuç almanın en hızlı yolu.", time: "~10 dk" },
        { id: "standard", title: "Standart Değerlendirme", desc: "Rolünüzle yüksek ve orta düzeyde ilgili yetkinlikler, biraz daha derinlemesine değerlendirilir.", time: "~20 dk" },
        { id: "full", title: "Tam RM Comp Değerlendirmesi", desc: "Mevcut rolünüzle ne kadar ilgili olduğuna bakılmaksızın çerçevedeki tüm yetkinlikler değerlendirilir.", time: "~45+ dk" },
        { id: "targeted", title: "Hedefli Değerlendirme", desc: "Hangi yetkinliklerin değerlendirileceğine siz karar verirsiniz.", time: "Değişken" },
      ],
      targetedHeading: (n) => `Yetkinlikleri seçin (${n} seçildi)`,
      continue: "Devam et",
    },
    role: {
      heading: "Rolünüz hakkında biraz bilgi verin",
      subtitle: "Bu bilgiler sizi puanlamak için değil — iş unvanları kurumdan kuruma çok değişir. Hangi yetkinliklere daha çok ağırlık verileceğine karar vermek ve makul bir hedef düzey önermek için kullanılır; hiçbir zaman size bir düzey dayatılmaz.",
      jobTitleLabel: "Mevcut iş unvanı",
      jobTitlePlaceholder: "örn. Araştırma Hibeleri Uzmanı",
      orgTypeLabel: "Kurum türü",
      orgTypePlaceholder: "örn. Üniversite, araştırma enstitüsü, fon sağlayıcı",
      responsibilitiesLabel: "Kendi cümlelerinizle, günlük olarak gerçekte ne yapıyorsunuz?",
      responsibilitiesPlaceholder: "Sadece unvanınızı değil, ana sorumluluklarınızı anlatın.",
      experienceLabel: "Araştırma yönetimi / araştırma desteğinde çalıştığınız yıl sayısı",
      checkboxesHeading: "Bunlardan hangileri sizin için geçerli?",
      checkboxes: [
        "Başka kişileri yönetiyor veya denetliyorum",
        "Kurumsal stratejiye veya politikaya katkıda bulunuyorum",
        "Doğrudan fonlama programları veya çağrılarıyla çalışıyorum",
        "Araştırma projelerini uçtan uca yönetiyorum",
        "Düzenli olarak dış paydaşlarla (fon sağlayıcılar, ortaklar, sanayi) etkileşim kuruyorum",
        "İşimin uluslararası veya çok ülkeli bir boyutu var",
      ],
      profilesHeading: "Bunlardan hangileri işinizi tanımlıyor? (uygun olanların hepsini seçin)",
      profilesSubtitle: "Bunlar bu araç için tasarlanmış yönlendirme kategorileridir; RM Comp çerçevesinin bir parçası değildir. Tek işlevleri, hangi yetkinliklere daha çok odaklanılacağını belirlemektir.",
      targetHeading: "Sizi neye göre değerlendirelim?",
      targetOptions: [
        { id: "current", label: "Mevcut rolümün gereksinimleri" },
        { id: "future", label: "Gelecekteki / arzu edilen bir rol" },
        { id: "both", label: "İkisi de — her biri için açıkları göster" },
      ],
      currentNotesLabel: "Bilmemiz gereken, mevcut rolünüzün gerektirdiği özel bir şey var mı? (isteğe bağlı)",
      currentNotesPlaceholder: "örn. Rolüm resmi olarak çok ortaklı konsorsiyum başvurularına liderlik etmemi gerektiriyor.",
      futureDescLabel: "Gelecekteki / arzu edilen rolü anlatın",
      futureDescPlaceholder: "örn. 3 yıl içinde Araştırma Destek Ofisi Müdürü",
      futureLevelLabel: "Biliyorsanız, bu rol tipik olarak hangi düzeyi gerektiriyor? (isteğe bağlı — boş bırakırsanız bir öneri sunarız)",
      futureLevelAuto: "Aracın bir öneri sunmasına izin ver",
      back: "Geri",
      continue: "Devam et",
    },
    documents: {
      heading: "İsteğe bağlı: destekleyici kanıt ekleyin",
      subtitle: "Bir özgeçmiş, iş tanımı, performans değerlendirmesi veya proje özeti ekleyebilirsiniz. Bu, aşağıdaki soruların yerini asla almaz; doğrudan sizin anlattıklarınızdan daha zayıf, \"belgesel\" bir kanıt olarak değerlendirilir. Burada hiçbir şey, sadece bir anahtar kelime geçiyor diye yetkinlik kanıtı sayılmaz.",
      chooseFiles: "Dosya seçin",
      uploading: "Yükleniyor…",
      hint: ".txt, .md, .pdf veya .docx — her biri en fazla 15MB. Dosyalar bu uygulamanın kendi sunucusunda, yerel olarak işlenir; LLM destekli değerlendirmeyi açmadığınız sürece başka hiçbir yere gönderilmez.",
      uploadedHeading: (n) => `Yüklendi (${n})`,
      touched: (n) => `${n} yetkinliğe dokunuldu`,
      processed: "işlendi",
      back: "Geri",
      skipOrContinue: (hasDocs) => (hasDocs ? "Devam et" : "Atla — değerlendirmeye devam et"),
    },
    questioning: {
      loadingNext: "Sonraki soru yükleniyor…",
      coveredLabel: (sufficient, total) => `${total} yetkinlikten ${sufficient} tanesi kapsandı`,
      whyLabel: "Bu neden soruluyor?",
      placeholder: "Somut, gerçek bir örnek anlatın — ne yaptığınızı ve ne olduğunu.",
      continue: "Devam et",
      saving: "Kaydediliyor…",
    },
    dashboard: {
      heading: "Yetkinlik profiliniz",
      statCompetencies: "Değerlendirilen yetkinlikler",
      statDefensible: "Güvenilir bir mevcut düzeyi belirlenenler",
      statHighPriority: "Yüksek öncelikli açıklar",
      heatmapHeading: "Yetkinlik ısı haritası",
      insufficientEvidence: "Yetersiz kanıt",
      currentVsTargetHeading: "Mevcut düzey ile hedef düzey",
      currentVsTargetSubtitle: "Koyu işaretçi rolünüzün gerektirdiği düzeyi, dolu çubuk ise kanıtlarla desteklenen mevcut düzeyinizi gösterir.",
      strengthsHeading: "En güçlü yönleriniz (kanıta dayalı)",
      uncertaintyHeading: "Kanıtın hâlâ sınırlı olduğu yerler",
      backToQuestions: "Sorulara dön",
      seeGaps: "Açık analizini gör",
      loading: "Yetkinlik profiliniz oluşturuluyor…",
    },
    gaps: {
      heading: "Açık analizi ve gelişim öncelikleri",
      subtitle: "Karşılaştırma varsayılan olarak \"Uzman\" düzeyine göre değil, sizin belirttiğiniz hedef role göre yapılır.",
      noGaps: "Toplanan kanıtlara göre, belirttiğiniz hedef role kıyasla bir gelişim açığı bulunamadı.",
      priorityHeading: (label, n) => `${label} öncelik (${n})`,
      priorityLabels: { High: "Yüksek", Medium: "Orta", Low: "Düşük" },
      notYetDemonstrated: "Henüz gösterilmedi",
      developmentFocus: "Gelişim odağı",
      suggestedEvidence: "Bu yönde oluşturabileceğiniz kanıt",
      arrowToTarget: (target) => `→ hedef ${target}`,
      back: "Profile dön",
      generateReport: "Nihai raporu oluştur",
      loading: "Açık analizi yükleniyor…",
    },
    report: {
      heading: "Nihai Değerlendirme Raporu",
      generatedAt: (date, mode) => `Oluşturulma: ${date} · Mod: ${mode}`,
      print: "Yazdır / PDF olarak kaydet",
      exportJson: "JSON Dışa Aktar",
      exportCsv: "CSV Dışa Aktar",
      executiveSummary: "Yönetici Özeti",
      roleProfile: "Rol Profili",
      jobTitleLabel: "İş unvanı",
      orgTypeLabel: "Kurum türü",
      experienceLabel: "Deneyim",
      assessedAgainstLabel: "Şuna göre değerlendirildi",
      competencyProfile: "Yetkinlik Profili",
      tableHeaders: { competency: "Yetkinlik", current: "Mevcut", target: "Hedef", confidence: "Güven", evidence: "Kanıt" },
      domainAnalysis: "Alan Analizi",
      strengthsPrefix: "Güçlü yönler",
      gapsPrefix: "Açıklar",
      topStrengths: "En Güçlü Yönler",
      noStrengths: "Henüz yeterli güvenle bir güçlü yön belirlenemedi — daha fazla kanıt yardımcı olacaktır.",
      careerMap: "Kariyer Gelişim Haritası",
      noCareerGaps: "Belirttiğiniz hedef role göre öncelikli bir açık belirlenmedi.",
      uncertainty: "Belirsizlik ve Sınırlamalar",
      noUncertainty: "Önemli bir belirsizlik işareti yok — değerlendirilen yetkinlikler genelinde kanıt makul ölçüde tutarlıydı.",
      backToDashboard: "Panele dön",
      startOver: "Yeni bir değerlendirme başlat",
      loading: "Nihai raporunuz oluşturuluyor…",
    },
    common: { dash: "—" },
  },
};
