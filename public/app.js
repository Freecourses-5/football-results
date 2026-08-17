/* ---------------- i18n ---------------- */
const DICT = {
  ar: {
    brand: "كورة لايف",
    eyebrow_hero: "لوحة النتائج المباشرة",
    hero_title: "نتائج مباريات كرة القدم، لحظة بلحظة.",
    hero_desc: "تابع مباريات اليوم والنتائج المباشرة من مصدر بيانات رياضي موثوق.",
    hero_stat_label: "مباراة اليوم",
    live_now: "مباراة مباشرة الآن",
    date_label: "التاريخ",
    today: "اليوم",
    search_placeholder: "ابحث عن فريق...",
    section_eyebrow: "مركز المباريات",
    section_title: "مباريات اليوم",
    filter_all: "الكل",
    filter_live: "مباشر",
    filter_scheduled: "لم تبدأ",
    filter_finished: "انتهت",
    important_eyebrow: "اختيارات اليوم",
    important_title: "أهم المباريات",
    important_badge: "مقترحة لك",
    state_loading: "جاري تحميل المباريات...",
    state_empty: "لا توجد مباريات مطابقة لهذا البحث أو الفلتر.",
    state_error: "تعذّر تحميل المباريات، حاول مرة أخرى.",
    status_live: "مباشر",
    status_finished: "انتهت",
    venue_label: "الملعب",
    referee_label: "الحكم",
    footer_tag: "منصة نتائج مباريات كرة القدم مباشرة",
    theme_toggle: "تبديل المظهر",
    lang_toggle: "English",
    league_fallback: "بطولة",
    team_fallback: "الفريق",
  },
  en: {
    brand: "Kora Live",
    eyebrow_hero: "LIVE SCOREBOARD",
    hero_title: "Football scores, live.",
    hero_desc: "Follow today's fixtures and live scores from a trusted sports data source.",
    hero_stat_label: "matches today",
    live_now: "matches live now",
    date_label: "Date",
    today: "Today",
    search_placeholder: "Search a team...",
    section_eyebrow: "MATCH CENTER",
    section_title: "Today's Fixtures",
    filter_all: "All",
    filter_live: "Live",
    filter_scheduled: "Upcoming",
    filter_finished: "Finished",
    important_eyebrow: "TODAY'S PICKS",
    important_title: "Top Matches",
    important_badge: "Featured",
    state_loading: "Loading fixtures…",
    state_empty: "No matches for this search or filter.",
    state_error: "Couldn't load fixtures, please try again.",
    status_live: "LIVE",
    status_finished: "FT",
    venue_label: "Venue",
    referee_label: "Referee",
    footer_tag: "Live football scores platform",
    theme_toggle: "Toggle theme",
    lang_toggle: "العربية",
    league_fallback: "League",
    team_fallback: "Team",
  }
};

const state = {
  lang: localStorage.getItem("lang") || "ar",
  date: localDate(),
  filter: "all",
  query: "",
  matches: [],
  favLeagues: JSON.parse(localStorage.getItem("favLeagues") || "[]")
};

function t(key) {
  return DICT[state.lang][key] || DICT.ar[key] || key;
}

function applyLang() {
  const dir = state.lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = state.lang;
  document.documentElement.dir = dir;
  document.title = state.lang === "ar"
    ? "كورة لايف | نتائج مباريات كرة القدم"
    : "Kora Live | Football Scores";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  document.getElementById("selectedDate").textContent = formatDate(state.date);
}

/* ---------------- Date helpers ---------------- */
function localDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(d);
  const get = t => parts.find(x => x.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function shiftDate(date, days) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(date) {
  const locale = state.lang === "ar" ? "ar-EG" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Africa/Cairo", weekday: "long", day: "numeric", month: "long"
  }).format(new Date(`${date}T12:00:00`));
}

function formatTime(iso) {
  const locale = state.lang === "ar" ? "ar-EG" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit"
  }).format(new Date(iso));
}

/* ---------------- Utils ---------------- */
function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function statusType(s) {
  const live = ["1H", "2H", "ET", "BT", "P", "LIVE", "HT"];
  const finished = ["FT", "AET", "PEN", "AWD", "WO", "CANC", "ABD"];
  if (live.includes(s)) return "live";
  if (finished.includes(s)) return "finished";
  return "scheduled";
}

function statusLabel(m) {
  const type = statusType(m.status.short);
  if (type === "live") return `● ${m.status.elapsed ? m.status.elapsed + "'" : t("status_live")}`;
  if (type === "finished") return t("status_finished");
  return formatTime(m.date);
}

/* ---------------- Arabic football names ---------------- */
const TEAM_AR = {
  "Liverpool":"ليفربول","Manchester City":"مانشستر سيتي","Manchester United":"مانشستر يونايتد","Arsenal":"أرسنال","Chelsea":"تشيلسي","Tottenham":"توتنهام","Tottenham Hotspur":"توتنهام هوتسبير","Newcastle":"نيوكاسل","Aston Villa":"أستون فيلا","West Ham":"وست هام","Everton":"إيفرتون","Brighton":"برايتون","Crystal Palace":"كريستال بالاس","Fulham":"فولهام","Wolverhampton Wanderers":"وولفرهامبتون","Wolves":"وولفرهامبتون","Nottingham Forest":"نوتنغهام فورست",
  "Real Madrid":"ريال مدريد","Barcelona":"برشلونة","Atletico Madrid":"أتلتيكو مدريد","Atlético Madrid":"أتلتيكو مدريد","Sevilla":"إشبيلية","Valencia":"فالنسيا","Villarreal":"فياريال","Athletic Club":"أتلتيك بيلباو","Real Betis":"ريال بيتيس","Real Sociedad":"ريال سوسيداد","Girona":"جيرونا",
  "Bayern Munich":"بايرن ميونخ","Borussia Dortmund":"بوروسيا دورتموند","Bayer Leverkusen":"باير ليفركوزن","RB Leipzig":"لايبزيغ","Eintracht Frankfurt":"آينتراخت فرانكفورت","VfB Stuttgart":"شتوتغارت",
  "Inter":"إنتر ميلان","Inter Milan":"إنتر ميلان","AC Milan":"ميلان","Juventus":"يوفنتوس","Napoli":"نابولي","AS Roma":"روما","Lazio":"لاتسيو","Atalanta":"أتلانتا","Fiorentina":"فيورنتينا",
  "Paris Saint Germain":"باريس سان جيرمان","Paris Saint-Germain":"باريس سان جيرمان","Marseille":"مارسيليا","Monaco":"موناكو","Lyon":"ليون","Lille":"ليل",
  "Ajax":"أياكس","PSV Eindhoven":"آيندهوفن","Feyenoord":"فينورد","Benfica":"بنفيكا","FC Porto":"بورتو","Sporting CP":"سبورتينغ لشبونة","Galatasaray":"غلطة سراي","Fenerbahce":"فنربخشة","Fenerbahçe":"فنربخشة","Besiktas":"بشكتاش","Celtic":"سيلتيك","Rangers":"رينجرز",
  "Al Ahly":"الأهلي","Al Ahly SC":"الأهلي","Zamalek SC":"الزمالك","Zamalek":"الزمالك","Pyramids FC":"بيراميدز","Pyramids":"بيراميدز","Al Hilal":"الهلال","Al Nassr":"النصر","Al-Ittihad":"الاتحاد","Al Ittihad":"الاتحاد","Al Ain":"العين","Al Sadd":"السد",
  "River Plate":"ريفر بليت","Boca Juniors":"بوكا جونيورز","Flamengo":"فلامينغو","Argentinos JRS":"أرجنتينوس جونيورز","Argentinos Juniors":"أرجنتينوس جونيورز","Deportivo Pereira":"ديبورتيس بيريرا","Jaguares":"خاغواريس","Jaguares de Cordoba":"خاغواريس دي كوردوبا","Fortaleza FC":"فورتاليزا","Fortaleza CEIF":"فورتاليزا","America de Cali":"أمريكا دي كالي","América de Cali":"أمريكا دي كالي","Independiente Medellin":"إنديبندينتي ميديلين","Independiente Medellín":"إنديبندينتي ميديلين","Millonarios":"ميلوناريوس","Santa Fe":"إنديبندينتي سانتا في","Once Caldas":"أونسي كالداس","Valledupar FC":"فالدوبار","Valledupar":"فالدوبار","Bogota FC":"بوغوتا إف سي","Atlético Nacional":"أتلتيكو ناسيونال","Atletico Nacional":"أتلتيكو ناسيونال","Deportivo Cali":"ديبورتيفو كالي","Palmeiras":"بالميراس","Santos":"سانتوس","Corinthians":"كورينثيانز","Botafogo":"بوتافوغو","Fluminense":"فلومينينسي",
  "Argentina":"الأرجنتين","Brazil":"البرازيل","Egypt":"مصر","Morocco":"المغرب","Algeria":"الجزائر","Tunisia":"تونس","Colombia":"كولومبيا","Spain":"إسبانيا","England":"إنجلترا","France":"فرنسا","Germany":"ألمانيا","Italy":"إيطاليا"
};

const LEAGUE_AR = {
  "Premier League":"الدوري الإنجليزي الممتاز","La Liga":"الدوري الإسباني","UEFA Champions League":"دوري أبطال أوروبا","UEFA Europa League":"الدوري الأوروبي","UEFA Europa Conference League":"دوري المؤتمر الأوروبي","Serie A":"الدوري الإيطالي","Bundesliga":"الدوري الألماني","Ligue 1":"الدوري الفرنسي","Eredivisie":"الدوري الهولندي","Primeira Liga":"الدوري البرتغالي","Liga Profesional Argentina":"الدوري الأرجنتيني للمحترفين","Primera A":"الدوري الكولومبي","Saudi Pro League":"الدوري السعودي للمحترفين","Egyptian Premier League":"الدوري المصري الممتاز","CAF Champions League":"دوري أبطال أفريقيا","FIFA World Cup":"كأس العالم","World Cup":"كأس العالم","Copa Libertadores":"كوبا ليبرتادوريس","Copa America":"كوبا أمريكا"
};

function translateName(name, map) {
  if (!name || state.lang !== "ar") return name || "";
  if (map[name]) return map[name];
  const normalized = name.trim().toLowerCase();
  const hit = Object.keys(map).find(k => k.toLowerCase() === normalized);
  return hit ? map[hit] : name;
}
function teamName(name) { return translateName(name, TEAM_AR); }
function leagueName(name) { return translateName(name, LEAGUE_AR); }

// Search works with either the original API name or its Arabic equivalent.
function searchableTeam(name) {
  return `${name || ""} ${teamName(name)}`.toLowerCase();
}

const BIG_LEAGUES = {
  "UEFA Champions League": 100, "Premier League": 95, "La Liga": 92,
  "Serie A": 88, "Bundesliga": 88, "Ligue 1": 84, "UEFA Europa League": 82,
  "Saudi Pro League": 75, "Liga Profesional Argentina": 70, "Primeira Liga": 68,
  "Eredivisie": 66, "Copa Libertadores": 78, "CAF Champions League": 72
};
const BIG_TEAMS = new Set([
  "Liverpool","Manchester City","Manchester United","Arsenal","Chelsea","Tottenham","Real Madrid","Barcelona","Atletico Madrid","Atlético Madrid","Bayern Munich","Borussia Dortmund","Bayer Leverkusen","Inter","Inter Milan","AC Milan","Juventus","Napoli","AS Roma","Paris Saint Germain","Paris Saint-Germain","Ajax","Benfica","FC Porto","Sporting CP","Al Ahly","Zamalek","Al Hilal","Al Nassr","Al-Ittihad","River Plate","Boca Juniors","Flamengo","Palmeiras"
]);
function importanceScore(m) {
  const league = BIG_LEAGUES[m.league?.name] || 0;
  const teams = (BIG_TEAMS.has(m.home?.name) ? 28 : 0) + (BIG_TEAMS.has(m.away?.name) ? 28 : 0);
  const live = statusType(m.status?.short) === "live" ? 45 : 0;
  const finished = statusType(m.status?.short) === "finished" ? 5 : 0;
  return league + teams + live + finished;
}
function importantMatches() {
  return [...state.matches].sort((a,b) => importanceScore(b) - importanceScore(a)).slice(0, 5);
}

/* ---------------- Data loading ---------------- */
async function loadMatches() {
  const stateEl = document.getElementById("state");
  const grid = document.getElementById("matchesGrid");
  stateEl.textContent = t("state_loading");
  stateEl.style.display = "block";
  grid.innerHTML = "";

  try {
    const res = await fetch(`/api/fixtures?date=${encodeURIComponent(state.date)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || t("state_error"));

    state.matches = data.results || [];
    document.getElementById("selectedDate").textContent = formatDate(state.date);

    const numLocale = state.lang === "ar" ? "ar-EG" : "en-US";
    document.getElementById("matchCount").textContent = state.matches.length.toLocaleString(numLocale);

    const liveCount = state.matches.filter(m => statusType(m.status.short) === "live").length;
    const liveBadge = document.getElementById("liveBadge");
    if (liveCount > 0) {
      liveBadge.hidden = false;
      document.getElementById("liveCount").textContent = liveCount.toLocaleString(numLocale);
    } else {
      liveBadge.hidden = true;
    }

    const liveHero = document.getElementById("liveCountHero");
    if (liveHero) liveHero.textContent = liveCount.toLocaleString(numLocale);

    render();
  } catch (e) {
    stateEl.textContent = e.message || t("state_error");
  }
}

/* ---------------- Render ---------------- */
function render() {
  const grid = document.getElementById("matchesGrid");
  const stateEl = document.getElementById("state");
  const q = state.query.trim().toLowerCase();

  let list = state.matches.filter(m => {
    const type = statusType(m.status.short);
    const matchesFilter = state.filter === "all" || state.filter === type;
    const matchesQuery = !q ||
      searchableTeam(m.home.name).includes(q) ||
      searchableTeam(m.away.name).includes(q) ||
      searchableTeam(m.home.name).includes(q) ||
      searchableTeam(m.away.name).includes(q);
    return matchesFilter && matchesQuery;
  });

  if (!list.length) {
    grid.innerHTML = "";
    const important = document.getElementById("importantMatches");
    if (important) important.innerHTML = "";
    stateEl.textContent = t("state_empty");
    stateEl.style.display = "block";
    return;
  }
  stateEl.style.display = "none";
  renderImportantMatches(list);

  const groups = new Map();
  for (const m of list) {
    const key = `${m.league.id}-${m.league.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }

  const sortedGroups = [...groups.values()].sort((a, b) => {
    const aFav = state.favLeagues.includes(a[0].league.id) ? 0 : 1;
    const bFav = state.favLeagues.includes(b[0].league.id) ? 0 : 1;
    return aFav - bFav;
  });

  grid.innerHTML = sortedGroups.map(group => {
    const league = group[0].league;
    const isFav = state.favLeagues.includes(league.id);
    return `
      <article class="league-card">
        <div class="league-head">
          ${league.logo ? `<img src="${esc(league.logo)}" alt="" loading="lazy">` : ""}
          <div class="league-names">
            <strong>${esc(leagueName(league.name || t("league_fallback")))}</strong>
            <small>${esc(translateName(league.country || "", TEAM_AR))}</small>
          </div>
          <button class="fav-btn ${isFav ? "active" : ""}" data-league="${league.id}" aria-label="favorite">★</button>
        </div>
        ${group.map(matchRow).join("")}
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".fav-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.league);
      const idx = state.favLeagues.indexOf(id);
      if (idx === -1) state.favLeagues.push(id); else state.favLeagues.splice(idx, 1);
      localStorage.setItem("favLeagues", JSON.stringify(state.favLeagues));
      render();
    };
  });
}

function renderImportantMatches(list) {
  const box = document.getElementById("importantMatches");
  if (!box) return;
  const ranked = [...list].sort((a,b) => importanceScore(b) - importanceScore(a)).slice(0, 5);
  if (!ranked.length || importanceScore(ranked[0]) < 55) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = `
    <div class="important-head">
      <div><span class="eyebrow dark-eyebrow">${t("important_eyebrow")}</span><h2>${t("important_title")}</h2></div>
      <span class="important-badge">★ ${t("important_badge")}</span>
    </div>
    <div class="important-grid">${ranked.map(importantRow).join("")}</div>
  `;
}
function importantRow(m) {
  const type = statusType(m.status.short);
  const homeLogo = m.home.logo ? `<img src="${esc(m.home.logo)}" alt="" loading="lazy">` : "";
  const awayLogo = m.away.logo ? `<img src="${esc(m.away.logo)}" alt="" loading="lazy">` : "";
  const score = m.goals.home == null && m.goals.away == null ? "—" : `${m.goals.home ?? 0} - ${m.goals.away ?? 0}`;
  return `<article class="important-card">
    <div class="important-league">${esc(leagueName(m.league?.name || t("league_fallback")))}</div>
    <div class="important-teams">
      <div><span>${esc(teamName(m.home.name || t("team_fallback")))}</span>${homeLogo}</div>
      <div class="important-score"><b>${score}</b><small class="status ${type}">${esc(statusLabel(m))}</small></div>
      <div>${awayLogo}<span>${esc(teamName(m.away.name || t("team_fallback")))}</span></div>
    </div>
  </article>`;
}

function matchRow(m) {
  const type = statusType(m.status.short);
  const homeLogo = m.home.logo ? `<img src="${esc(m.home.logo)}" alt="" loading="lazy">` : "";
  const awayLogo = m.away.logo ? `<img src="${esc(m.away.logo)}" alt="" loading="lazy">` : "";

  const score = m.goals.home == null && m.goals.away == null
    ? "—"
    : `${m.goals.home ?? 0} - ${m.goals.away ?? 0}`;

  const details = [];
  if (m.venue && m.venue.name) details.push(`<span><b>${t("venue_label")}</b>${esc(m.venue.name)}</span>`);
  if (m.referee) details.push(`<span><b>${t("referee_label")}</b>${esc(m.referee)}</span>`);

  return `
    <details class="match" data-id="${m.id}">
      <summary>
        <div class="side home">
          <span class="team-name" title="${esc(m.home.name || "")}">${esc(teamName(m.home.name || t("team_fallback")))}</span>
          ${homeLogo}
        </div>
        <div class="score-box">
          <span class="score">${score}</span>
          <span class="status ${type}">${statusLabel(m)}</span>
        </div>
        <div class="side away">
          ${awayLogo}
          <span class="team-name" title="${esc(m.away.name || "")}">${esc(teamName(m.away.name || t("team_fallback")))}</span>
        </div>
      </summary>
      ${details.length ? `<div class="match-detail">${details.join("")}</div>` : ""}
    </details>
  `;
}

/* ---------------- Events ---------------- */
document.getElementById("prevDay").onclick = () => { state.date = shiftDate(state.date, -1); loadMatches(); };
document.getElementById("nextDay").onclick = () => { state.date = shiftDate(state.date, 1); loadMatches(); };
document.getElementById("todayBtn").onclick = () => { state.date = localDate(); loadMatches(); };

document.querySelectorAll(".filter").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    render();
  };
});

let searchTimer;
document.getElementById("searchInput").oninput = (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.query = e.target.value; render(); }, 150);
};

document.getElementById("themeBtn").onclick = () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("dark", document.documentElement.classList.contains("dark") ? "1" : "0");
};
if (localStorage.getItem("dark") === "1") document.documentElement.classList.add("dark");

document.getElementById("langBtn").onclick = () => {
  state.lang = state.lang === "ar" ? "en" : "ar";
  localStorage.setItem("lang", state.lang);
  applyLang();
  render();
};

/* ---------------- Init ---------------- */
applyLang();
loadMatches();

// Gentle auto-refresh for live matches on today's view.
setInterval(() => {
  if (state.date === localDate()) loadMatches();
}, 60000);
