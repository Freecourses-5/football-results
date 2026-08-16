const state = {
  date: localDate(),
  filter: "all",
  matches: []
};

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
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "Africa/Cairo", weekday: "long", day: "numeric", month: "long"
  }).format(new Date(`${date}T12:00:00`));
}

function esc(s="") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function statusType(s) {
  const live = ["1H","2H","ET","BT","P","LIVE","HT"];
  const finished = ["FT","AET","PEN","AWD","WO","CANC","ABD"];
  if (live.includes(s)) return "live";
  if (finished.includes(s)) return "finished";
  return "scheduled";
}

function statusLabel(m) {
  const type = statusType(m.status.short);
  if (type === "live") return `🔴 ${m.status.elapsed ? m.status.elapsed + "'" : "مباشر"}`;
  if (type === "finished") return "انتهت";
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit"
  }).format(new Date(m.date));
}

async function loadMatches() {
  const stateEl = document.getElementById("state");
  const grid = document.getElementById("matchesGrid");
  stateEl.textContent = "جاري تحميل المباريات...";
  stateEl.style.display = "block";
  grid.innerHTML = "";

  try {
    const res = await fetch(`/api/fixtures?date=${encodeURIComponent(state.date)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "حدث خطأ");

    state.matches = data.results || [];
    document.getElementById("selectedDate").textContent = formatDate(state.date);
    document.getElementById("matchCount").textContent = state.matches.length.toLocaleString("ar-EG");

    render();
  } catch (e) {
    stateEl.textContent = e.message;
  }
}

function render() {
  const grid = document.getElementById("matchesGrid");
  const stateEl = document.getElementById("state");

  let list = state.matches.filter(m => {
    const type = statusType(m.status.short);
    return state.filter === "all" || state.filter === type;
  });

  if (!list.length) {
    grid.innerHTML = "";
    stateEl.textContent = "لا توجد مباريات مطابقة لهذا الفلتر.";
    stateEl.style.display = "block";
    return;
  }
  stateEl.style.display = "none";

  const groups = new Map();
  for (const m of list) {
    const key = `${m.league.id}-${m.league.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }

  grid.innerHTML = [...groups.values()].map(group => {
    const league = group[0].league;
    return `
      <article class="league-card">
        <div class="league-head">
          ${league.logo ? `<img src="${esc(league.logo)}" alt="">` : ""}
          <div><strong>${esc(league.name || "بطولة")}</strong><small>${esc(league.country || "")}</small></div>
        </div>
        ${group.map(matchCard).join("")}
      </article>
    `;
  }).join("");
}

function matchCard(m) {
  const type = statusType(m.status.short);
  const homeLogo = m.home.logo ? `<img src="${esc(m.home.logo)}" alt="">` : "";
  const awayLogo = m.away.logo ? `<img src="${esc(m.away.logo)}" alt="">` : "";

  const score = m.goals.home == null && m.goals.away == null
    ? "—"
    : `${m.goals.home ?? 0} - ${m.goals.away ?? 0}`;

  return `
    <div class="match" data-id="${m.id}">
      <div class="match-top">
        <span>${esc(m.status.long || "")}</span>
        <span class="status ${type}">${statusLabel(m)}</span>
      </div>
      <div class="teams">
        <div class="team home">${esc(m.home.name || "الفريق")} ${homeLogo}</div>
        <div class="score">${score}<small>${type === "live" ? "الآن" : ""}</small></div>
        <div class="team away">${awayLogo} ${esc(m.away.name || "الفريق")}</div>
      </div>
    </div>
  `;
}

document.getElementById("prevDay").onclick = () => {
  state.date = shiftDate(state.date, -1);
  loadMatches();
};
document.getElementById("nextDay").onclick = () => {
  state.date = shiftDate(state.date, 1);
  loadMatches();
};
document.getElementById("todayBtn").onclick = () => {
  state.date = localDate();
  loadMatches();
};
document.querySelectorAll(".filter").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    render();
  };
});
document.getElementById("themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark") ? "1" : "0");
};
if (localStorage.getItem("dark") === "1") document.body.classList.add("dark");

loadMatches();
