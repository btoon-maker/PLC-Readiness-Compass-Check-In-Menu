/* ============================================================
   PLC Readiness Check-In Menu
   Menu version of the PLC Readiness Compass.

   What changed from the original full Compass:
   - The same DOMAINS array remains the single source of domain content.
   - A new CHECKINS map defines each menu option (which domains it uses,
     time estimate, when to use it, and the core question it opens).
   - The individual page renders only the selected domain(s).
   - Response codes use the format: PLC-CHECKIN|domainIds|ratings
     e.g. PLC-CHECKIN|vision|3,4,3,2
          PLC-CHECKIN|leadership,vision,learning,practice,conditions|3,3,2,4|...
   - The dashboard accepts codes from one check-in type at a time and
     builds a report scoped to those domains only.

   Privacy is unchanged: nothing is stored or transmitted. Written
   evidence notes never enter the response code or the team dashboard.
   ============================================================ */

const DOMAINS = [
  {
    id: "leadership",
    title: "Shared and Supportive Leadership",
    short: "Shared Leadership",
    description: "This section looks at how formal PLC leadership supports shared ownership, teacher voice, and meaningful collaboration, even when the PLC is facilitated by a designated lead or guided by administrative priorities.",
    evidenceLead: "Think about recent agendas, administrative priorities, facilitation moves, team decisions, follow-up, and whose voices shaped the work.",
    items: [
      "When we meet as a PLC, team members have meaningful opportunities to shape the work, even when the agenda is guided by a department lead or administrative priorities.",
      "Although one person may formally facilitate the PLC, different members have opportunities to guide discussion, ask questions, contribute expertise, or take ownership of next steps.",
      "Our PLC time is protected for meaningful instructional work, not only announcements, reminders, administrative updates, or compliance tasks.",
      "When we identify a barrier, the department lead, administrator, or team helps remove it or helps us find a realistic path forward."
    ],
    prompts: [
      "Where do members currently have real influence over PLC decisions?",
      "Whose voices are shaping the work most often, and whose voices might be easier to miss?",
      "What small facilitation move would make leadership feel more shared next time?"
    ],
    recommendation: "Clarify which parts of the PLC agenda are administratively directed, which parts can be shaped by the team, and one decision or follow-up action members can collectively own."
  },
  {
    id: "vision",
    // User-facing menu language is "Shared Purpose" (see facilitator guide
    // for the original Hord & Sommers framework name, preserved below).
    title: "Shared Purpose",
    short: "Shared Purpose",
    frameworkTitle: "Shared Values and Vision",
    description: "This section asks whether the team has a shared reason for meeting that goes deeper than completing tasks.",
    evidenceLead: "Think about whether the team returns to common goals, student needs, course expectations, or shared definitions of success.",
    items: [
      "Our PLC has a clear shared purpose that connects to student learning, not just department operations.",
      "When we talk about student success, we generally mean the same thing and can name what we are trying to improve.",
      "Our PLC priorities connect to larger school, department, or organizational goals without losing sight of what our students need.",
      "When we disagree about a decision, we can return to shared values or student evidence to move the conversation forward."
    ],
    prompts: [
      "What student-learning priority most clearly unites our work right now?",
      "Where are we truly aligned, and where might we only be assuming alignment?",
      "How could our next agenda make our shared purpose more visible?"
    ],
    recommendation: "Name one shared student-learning priority and use it to anchor the next PLC agenda."
  },
  {
    id: "learning",
    title: "Collective Learning and Application",
    short: "Collective Learning",
    description: "This section focuses on whether PLC conversations lead to shared learning, instructional action, and follow-up.",
    evidenceLead: "Think about student work, assessment data, engagement patterns, shared strategies, implementation checks, or revisiting prior decisions.",
    items: [
      "In PLC meetings, we use student work, assessment data, engagement evidence, or teacher observations to decide what instructional action to try next.",
      "We share strategies or resources in a way that helps others understand how they could actually use them.",
      "Ideas from PLC do not just stay in the meeting. We try them, adapt them, or build them into our work.",
      "We come back to previous PLC actions and ask whether they helped students or need to be adjusted."
    ],
    prompts: [
      "What evidence do we currently use to guide decisions?",
      "What is one idea we have discussed but not yet tested?",
      "How will we know whether a PLC action improved student learning?"
    ],
    recommendation: "Choose one shared strategy to try, decide what evidence will show whether it helped, and revisit it at the next meeting."
  },
  {
    id: "practice",
    title: "Shared Personal Practice",
    short: "Shared Practice",
    description: "This section looks at how safe and normal it feels to make teaching practice visible to colleagues.",
    evidenceLead: "Think about student work samples, feedback examples, lesson artifacts, classroom dilemmas, peer questions, or moments when practice was discussed honestly.",
    items: [
      "It feels safe enough in our PLC to share real examples of practice, including things that are unfinished, messy, or still in progress.",
      "We talk about instructional choices and student learning, not only pacing, deadlines, or logistics.",
      "When someone shares a challenge, the conversation feels supportive and problem-solving oriented rather than judgmental.",
      "Our team has low-risk ways to examine practice, such as looking at student work, assignment examples, feedback, or lesson materials together."
    ],
    prompts: [
      "What kind of practice-sharing would feel safe as a first step?",
      "What feels too risky to share right now?",
      "How can we begin with artifacts before moving toward deeper feedback?"
    ],
    recommendation: "Begin with a low-risk artifact protocol, such as reviewing one student work sample or one assignment example together."
  },
  {
    id: "conditions",
    title: "Supportive Conditions",
    short: "Supportive Conditions",
    description: "This section asks whether the team has the time, trust, norms, tools, and structures needed for PLC work to actually happen.",
    evidenceLead: "Think about meeting time, agenda structure, norms, data access, psychological safety, tools, resources, and follow-through systems.",
    items: [
      "Our PLC has enough protected time and structure to do more than rush through updates.",
      "We have norms or routines that help us have honest, respectful, and productive conversations.",
      "We can access the data, tools, resources, or examples we need when we are trying to solve an instructional problem.",
      "People can name barriers or ask for help without worrying that it will be used against them."
    ],
    prompts: [
      "What structural barrier most limits our PLC work?",
      "Which norm would improve the quality of our conversation?",
      "What support do we need from leadership to strengthen PLC readiness?"
    ],
    recommendation: "Strengthen the meeting structure first: clarify agenda purpose, norms, needed evidence, and one follow-up routine."
  }
];

const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
const ALL_DOMAIN_IDS = DOMAINS.map(d => d.id);

/* Each menu option: which domains it covers, a time estimate, when to use it,
   and the core question it helps the PLC discuss. The single-domain check-in
   ids match their domain ids so planner links like ?checkin=vision work. */
const CHECKINS = {
  full: {
    id: "full",
    title: "Full Compass",
    menuTitle: "Full Compass: All Five Domains",
    reportTitle: "PLC Readiness Conversation Report",
    domainIds: ALL_DOMAIN_IDS.slice(),
    time: "10–15 minutes",
    whenToUse: "Beginning-of-year or midyear readiness baseline, or any time the team wants a comprehensive picture across all five conditions.",
    coreQuestion: "Across all five conditions, where is our PLC ready for deeper work, and where do we need to build readiness first?"
  },
  leadership: {
    id: "leadership",
    title: "Shared Leadership Check-In",
    reportTitle: "Shared Leadership Check-In Conversation Report",
    domainIds: ["leadership"],
    time: "3–5 minutes",
    whenToUse: "When administrative priorities are shaping the work, or when you want to check whether teacher voice and shared ownership are present.",
    coreQuestion: "Where do team members have real voice and ownership in our PLC, and where could that be strengthened?"
  },
  vision: {
    id: "vision",
    title: "Shared Purpose Check-In",
    reportTitle: "Shared Purpose Check-In Conversation Report",
    domainIds: ["vision"],
    time: "3–5 minutes",
    whenToUse: "When the team needs a clearer shared reason for meeting, or when members may only be assuming they agree on what success looks like.",
    coreQuestion: "What student-learning purpose most clearly unites our work right now?"
  },
  learning: {
    id: "learning",
    title: "Collective Learning Check-In",
    reportTitle: "Collective Learning Check-In Conversation Report",
    domainIds: ["learning"],
    time: "3–5 minutes",
    whenToUse: "When the team is in a data or instructional cycle and wants to check whether conversations are leading to action and follow-up.",
    coreQuestion: "What evidence or student work should guide our next instructional decision?"
  },
  practice: {
    id: "practice",
    title: "Shared Practice Check-In",
    reportTitle: "Shared Practice Check-In Conversation Report",
    domainIds: ["practice"],
    time: "3–5 minutes",
    whenToUse: "Once some trust is established and the team is ready to make practice more visible to one another.",
    coreQuestion: "What kind of practice-sharing would feel useful and low-risk for this team right now?"
  },
  conditions: {
    id: "conditions",
    title: "Supportive Conditions Check-In",
    reportTitle: "Supportive Conditions Check-In Conversation Report",
    domainIds: ["conditions"],
    time: "3–5 minutes",
    whenToUse: "When meetings feel rushed or compliance-based, and you want to look at time, structure, norms, and access first.",
    coreQuestion: "What condition would make our PLC time more focused, honest, or useful?"
  }
};

/* Menu display order */
const CHECKIN_ORDER = ["full", "leadership", "vision", "learning", "practice", "conditions"];

/* ---------- shared helpers ---------- */

function domainsFor(domainIds) {
  // Return DOMAIN objects in canonical order, filtered to the selected ids.
  return DOMAINS.filter(d => domainIds.includes(d.id));
}

function domainSignature(domainIds) {
  return domainIds.slice().sort().join(",");
}

function checkinForDomainIds(domainIds) {
  const sig = domainSignature(domainIds);
  return Object.values(CHECKINS).find(c => domainSignature(c.domainIds) === sig) || null;
}

function readinessLabel(score) {
  if (score < 2) return {
    label: "Foundational Concern",
    cls: "low",
    desc: "major readiness conditions may be absent or inconsistent. The team may need to begin with trust, time, norms, and clarity before expecting deeper PLC work."
  };

  if (score < 2.8) return {
    label: "Emerging",
    cls: "mid",
    desc: "some readiness conditions are present, but the team may need more consistency, shared routines, and support."
  };

  if (score < 3.5) return {
    label: "Developing",
    cls: "neutral",
    desc: "the team has usable readiness foundations and may be ready to strengthen PLC practice through focused next steps and follow-up."
  };

  return {
    label: "Established",
    cls: "good",
    desc: "this area appears to be a strong readiness condition for deeper PLC work."
  };
}

function spreadInfo(spread) {
  if (spread <= 0.24) return {
    label: "Similar responses",
    cls: "good",
    meaning: "The response spread is relatively small, so members may be seeing this condition in similar ways."
  };

  if (spread <= 0.49) return {
    label: "Some variation",
    cls: "neutral",
    meaning: "The response spread shows some variation, so it may be useful to ask what different experiences or evidence shaped members’ responses."
  };

  return {
    label: "Larger variation",
    cls: "mid",
    meaning: "The response spread is larger, so the team should discuss what different experiences may be shaping members’ perceptions before choosing a next step."
  };
}

function domainInterpretation(domain, score, spread) {
  const spreadText = spreadInfo(spread);

  const cues = {
    leadership: {
      cue: "This domain may be worth discussing in relation to teacher voice, shared ownership, facilitation, and how administrative priorities are translated into PLC work.",
      question: "Where do team members currently have meaningful voice or ownership, and where could that be strengthened?"
    },
    vision: {
      cue: "This domain may be worth discussing in relation to shared purpose, student-learning priorities, and whether the team is working from the same definition of success.",
      question: "What student-learning priority should most clearly guide our next PLC cycle?"
    },
    learning: {
      cue: "This domain may be worth discussing in relation to how the team uses evidence, shares strategies, tries ideas, and follows up on whether those ideas helped students.",
      question: "What evidence or student work should guide our next instructional decision?"
    },
    practice: {
      cue: "This domain may be worth discussing in relation to trust, psychological safety, and how comfortable the team feels examining real examples of practice together.",
      question: "What kind of practice-sharing would feel useful and low-risk for this team right now?"
    },
    conditions: {
      cue: "This domain may be worth discussing in relation to time, meeting structure, norms, resources, data access, and the supports needed for meaningful PLC work.",
      question: "What condition would make our PLC time more focused, honest, or useful?"
    }
  };

  return {
    cue: `${cues[domain.id].cue} ${spreadText.meaning}`,
    question: cues[domain.id].question
  };
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function stdDev(arr) {
  if (arr.length <= 1) return 0;
  const m = average(arr);
  const variance = average(arr.map(x => Math.pow(x - m, 2)));
  return Math.sqrt(variance);
}

/* ---------- response code (new menu format) ---------- */

function makeCode(scores, domainIds) {
  const ids = domainIds.join(",");
  const payload = domainIds.map(id => scores[id].join(",")).join("|");
  return `PLC-CHECKIN|${ids}|${payload}`;
}

function parseCode(code) {
  const trimmed = code.trim();

  if (!trimmed.startsWith("PLC-CHECKIN|")) {
    throw new Error("Code must begin with PLC-CHECKIN|");
  }

  const parts = trimmed.slice("PLC-CHECKIN|".length).split("|");

  if (parts.length < 2) {
    throw new Error("Code is incomplete. It must list domains and at least one set of ratings.");
  }

  const domainIds = parts[0].split(",").map(s => s.trim()).filter(Boolean);
  const ratingGroups = parts.slice(1);

  if (domainIds.length === 0) {
    throw new Error("Code does not list any domains.");
  }

  const unknown = domainIds.filter(id => !DOMAIN_BY_ID[id]);
  if (unknown.length) {
    throw new Error("Code includes an unknown domain id: " + unknown.join(", "));
  }

  if (domainIds.length !== ratingGroups.length) {
    throw new Error("The number of domains does not match the number of rating groups.");
  }

  const scores = {};

  domainIds.forEach((id, i) => {
    const nums = ratingGroups[i].split(",").map(x => Number(x.trim()));

    if (nums.length !== 4 || nums.some(n => ![1, 2, 3, 4].includes(n))) {
      throw new Error("Each domain must contain four ratings from 1 to 4.");
    }

    scores[id] = nums;
  });

  return { domainIds, scores };
}

function scoreDomains(scores, domainIds) {
  const result = {};
  domainIds.forEach(id => {
    result[id] = round2(average(scores[id]));
  });
  return result;
}

/* ---------- shared rendering ---------- */

function renderBars(domainScores, containerId, domainIds) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  domainsFor(domainIds).forEach(d => {
    const score = domainScores[d.id];
    const info = readinessLabel(score);
    const pct = (score / 4) * 100;

    const row = document.createElement("div");
    row.className = "score-row";

    const labelCell = document.createElement("div");
    labelCell.innerHTML = `<strong>${d.short}</strong><br><span class="small">${d.title}</span>`;

    const chartCell = document.createElement("div");
    chartCell.className = "svg-bar-wrap";
    chartCell.innerHTML = `
      <svg class="score-svg" viewBox="0 0 400 24" preserveAspectRatio="none" aria-label="${d.short} score bar">
        <rect x="1" y="1" width="398" height="22" rx="11" ry="11" fill="#ffffff" stroke="#b8bfd1" stroke-width="1.5"></rect>
        <rect x="1" y="1" width="${Math.max(6, pct * 3.98)}" height="22" rx="11" ry="11" fill="#149da1"></rect>
        <line x1="100" y1="1" x2="100" y2="23" stroke="#d8cfe5" stroke-width="1"></line>
        <line x1="200" y1="1" x2="200" y2="23" stroke="#d8cfe5" stroke-width="1"></line>
        <line x1="300" y1="1" x2="300" y2="23" stroke="#d8cfe5" stroke-width="1"></line>
        <text x="200" y="16" text-anchor="middle" font-size="11" fill="#172033">${score.toFixed(2)} / 4.00</text>
      </svg>
    `;

    const scoreCell = document.createElement("div");
    scoreCell.innerHTML = `<span class="badge ${info.cls}">${score.toFixed(2)}</span>`;

    row.appendChild(labelCell);
    row.appendChild(chartCell);
    row.appendChild(scoreCell);
    container.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function collectEvidenceNotes(domainIds) {
  const notes = {};
  domainIds.forEach(id => {
    const field = document.querySelector(`textarea[name="${id}_evidence"]`);
    notes[id] = field ? field.value.trim() : "";
  });
  return notes;
}

function renderEvidenceNotes(notes, containerId, domainIds) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const selected = domainsFor(domainIds);
  const hasAnyNotes = selected.some(d => notes[d.id]);

  if (!hasAnyNotes) {
    container.innerHTML = `
      <h3>Evidence Notes</h3>
      <p class="small">No written evidence notes were entered. Ratings can still be used for reflection, but adding notes can make the summary more useful.</p>
    `;
    return;
  }

  const rows = selected.map(domain => {
    const safeNote = notes[domain.id]
      ? escapeHtml(notes[domain.id]).replaceAll("\n", "<br>")
      : "<span class='small'>No note entered.</span>";

    return `
      <div class="result-card">
        <h4>${domain.title}</h4>
        <p>${safeNote}</p>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <h3>Evidence Notes</h3>
    <p class="small">These notes are included in your individual PDF summary. They are not included in the response code shared with the facilitator.</p>
    ${rows}
  `;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => alert("Copied."));
}

function exportPdf(title) {
  document.title = title || "PLC Readiness Check-In Report";
  window.print();
}

/* ============================================================
   Individual page (menu + scoped assessment)
   ============================================================ */

let activeCheckin = null; // the CHECKINS entry currently being completed

function getQueryCheckin() {
  const params = new URLSearchParams(location.search);
  const c = params.get("checkin");
  return c && CHECKINS[c] ? c : null;
}

function setQueryCheckin(checkinId) {
  const url = new URL(location.href);
  if (checkinId) {
    url.searchParams.set("checkin", checkinId);
  } else {
    url.searchParams.delete("checkin");
  }
  history.replaceState(null, "", url.toString());
}

function renderCheckinMenu() {
  const container = document.getElementById("checkinMenu");
  if (!container) return;

  const cards = CHECKIN_ORDER.map(id => {
    const c = CHECKINS[id];
    const isFull = c.id === "full";
    return `
      <div class="checkin-card ${isFull ? "full" : ""}">
        <span class="checkin-meta">~ ${c.time}</span>
        <h3>${c.menuTitle || c.title}</h3>
        <p class="when"><strong>When to use:</strong> ${c.whenToUse}</p>
        <div class="core-q"><strong>Core question:</strong> ${c.coreQuestion}</div>
        <div class="spacer"></div>
        <button type="button" class="start-checkin" data-checkin="${c.id}">
          ${isFull ? "Start the Full Compass" : "Start this check-in"}
        </button>
      </div>
    `;
  }).join("");

  container.querySelector(".checkin-grid").innerHTML = cards;

  container.querySelectorAll(".start-checkin").forEach(btn => {
    btn.addEventListener("click", () => startCheckin(btn.dataset.checkin));
  });
}

function generateIndividualForm(domainIds) {
  const form = document.getElementById("assessmentForm");
  if (!form) return;
  form.innerHTML = "";

  domainsFor(domainIds).forEach((domain) => {
    const section = document.createElement("section");
    section.className = "card domain";

    section.innerHTML = `
      <h2>${domain.title}</h2>
      <p class="domain-intro">${domain.description}</p>
      <div class="evidence-note">
        <strong>Before rating:</strong> ${domain.evidenceLead}
      </div>
    `;

    domain.items.forEach((item, i) => {
      const name = `${domain.id}_${i}`;

      const itemDiv = document.createElement("div");
      itemDiv.className = "item";

      itemDiv.innerHTML = `
        <p>${i + 1}. ${item}</p>
        <div class="radio-row" role="radiogroup" aria-label="${item}">
          <label><input type="radio" name="${name}" value="1" required> 1 Not Yet</label>
          <label><input type="radio" name="${name}" value="2"> 2 Emerging</label>
          <label><input type="radio" name="${name}" value="3"> 3 Developing</label>
          <label><input type="radio" name="${name}" value="4"> 4 Established</label>
        </div>
      `;

      section.appendChild(itemDiv);
    });

    const evidence = document.createElement("div");
    evidence.className = "item";

    evidence.innerHTML = `
      <p>One example that influenced your ratings</p>
      <p class="plain">This does not transfer to the team dashboard. It is here to help make your ratings evidence-informed instead of just a gut reaction.</p>
      <textarea name="${domain.id}_evidence" placeholder="For example: a recent agenda, a student work conversation, a shared resource, a decision point, a barrier, or a moment of trust/distrust."></textarea>
    `;

    section.appendChild(evidence);
    form.appendChild(section);
  });
}

function collectIndividualScores(domainIds) {
  const scores = {};
  let missing = [];

  domainsFor(domainIds).forEach(domain => {
    scores[domain.id] = [];

    domain.items.forEach((item, i) => {
      const selected = document.querySelector(`input[name="${domain.id}_${i}"]:checked`);

      if (!selected) {
        missing.push(`${domain.short} item ${i + 1}`);
      } else {
        scores[domain.id].push(Number(selected.value));
      }
    });
  });

  if (missing.length) {
    alert("Please answer all rating items before generating your summary.");
    return null;
  }

  return scores;
}

function startCheckin(checkinId) {
  const checkin = CHECKINS[checkinId];
  if (!checkin) return;

  activeCheckin = checkin;
  setQueryCheckin(checkinId);

  // Build the scoped form
  generateIndividualForm(checkin.domainIds);

  // Header / framing for this check-in
  const titleEl = document.getElementById("activeCheckinTitle");
  const introEl = document.getElementById("activeCheckinIntro");
  if (titleEl) titleEl.textContent = checkin.title;
  if (introEl) {
    introEl.innerHTML = `
      <p><strong>Core question:</strong> ${checkin.coreQuestion}</p>
      <p class="small">Approximate time: ${checkin.time}. Answer based on what you have actually experienced in your most recent PLC meetings. When possible, think of a concrete example before choosing a rating.</p>
    `;
  }

  // Reset any prior results
  const results = document.getElementById("individualResults");
  if (results) results.style.display = "none";

  // Swap views
  document.getElementById("checkinMenu").style.display = "none";
  document.getElementById("assessmentView").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToMenu() {
  activeCheckin = null;
  setQueryCheckin(null);
  document.getElementById("assessmentView").style.display = "none";
  const results = document.getElementById("individualResults");
  if (results) results.style.display = "none";
  document.getElementById("checkinMenu").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initIndividualPage() {
  const menu = document.getElementById("checkinMenu");
  if (!menu) return; // not the index page

  renderCheckinMenu();

  const backBtn = document.getElementById("backToMenu");
  if (backBtn) backBtn.addEventListener("click", backToMenu);

  const genBtn = document.getElementById("generateIndividual");
  if (genBtn) {
    genBtn.addEventListener("click", () => {
      if (!activeCheckin) return;
      const domainIds = activeCheckin.domainIds;

      const scores = collectIndividualScores(domainIds);
      if (!scores) return;

      const domainScores = scoreDomains(scores, domainIds);
      const code = makeCode(scores, domainIds);
      const evidenceNotes = collectEvidenceNotes(domainIds);

      document.getElementById("individualResults").style.display = "block";

      renderBars(domainScores, "individualBars", domainIds);
      renderEvidenceNotes(evidenceNotes, "individualEvidenceNotes", domainIds);

      const overall = round2(average(domainIds.map(id => domainScores[id])));
      const level = readinessLabel(overall);
      const isSingle = domainIds.length === 1;
      const overallLabel = isSingle ? "Check-in average" : "Overall average";

      document.getElementById("individualOverall").innerHTML = `
        <h3>${activeCheckin.title} — Your Snapshot</h3>
        <p><strong>${overallLabel}:</strong> <span class="badge ${level.cls}">${overall.toFixed(2)} — ${level.label}</span></p>
        <p>Your responses suggest that ${level.desc}</p>
        <div class="warm-notice">
          <strong>Use this as reflection, not judgment.</strong> A lower score does not mean the team is failing. It means there may be a condition worth strengthening before expecting deeper PLC work.
        </div>
      `;

      document.getElementById("responseCode").textContent = code;

      window.scrollTo({
        top: document.getElementById("individualResults").offsetTop - 20,
        behavior: "smooth"
      });
    });
  }

  const copyBtn = document.getElementById("copyCode");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => copyText(document.getElementById("responseCode").textContent));
  }

  const exportBtn = document.getElementById("exportIndividualPdf");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const name = activeCheckin ? `${activeCheckin.title} — Individual Summary` : "Individual PLC Readiness Summary";
      exportPdf(name);
    });
  }

  // Deep link support: index.html?checkin=vision
  const fromQuery = getQueryCheckin();
  if (fromQuery) {
    startCheckin(fromQuery);
  }
}

/* ============================================================
   Dashboard page (scoped to one check-in type)
   ============================================================ */

function setupActionPlanTextareas() {
  const textareas = document.querySelectorAll(".action-input");

  textareas.forEach(textarea => {
    const resize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener("input", resize);
    resize();
  });
}

function renderSingleDomainReport(parsed, domain, checkin, body) {
  const memberAvgs = parsed.map(p => average(p.scores[domain.id]));
  const teamScore = round2(average(memberAvgs));
  const spread = round2(stdDev(memberAvgs));
  const info = readinessLabel(teamScore);
  const spreadDetails = spreadInfo(spread);
  const interpretation = domainInterpretation(domain, teamScore, spread);

  const domainScores = {};
  domainScores[domain.id] = teamScore;

  body.innerHTML = `
    <section id="teamSummary" class="card">
      <h2>${checkin.reportTitle}</h2>
      <p class="small">A focused, single-domain snapshot for a short PLC conversation.</p>
      <p><strong>Number of responses included:</strong> ${parsed.length}</p>
      <p><strong>Team average for ${domain.title}:</strong>
        <span class="badge ${info.cls}">${teamScore.toFixed(2)} — ${info.label}</span></p>
      <p>The submitted responses suggest that ${info.desc}</p>
      <div class="warm-notice">
        <strong>How to read this:</strong> The score is not the conversation. It is the doorway into it. Start by asking what evidence might explain the pattern.
      </div>
    </section>

    <section class="card">
      <h3>${domain.short} Score</h3>
      <div id="teamBars"></div>
    </section>

    <section class="card">
      <h3>Response Spread</h3>
      <p><strong>${spread.toFixed(2)}</strong> &nbsp; <span class="badge ${spreadDetails.cls}">${spreadDetails.label}</span></p>
      <p>${spreadDetails.meaning}</p>
      <p class="small">Response spread is based on variation in member averages for this domain. A larger spread suggests members may be experiencing this condition differently.</p>
    </section>

    <section class="card">
      <h3>Conversation Starter</h3>
      <div class="result-card">
        <h4>Conversation cue</h4>
        <p>${interpretation.cue}</p>
      </div>
      <div class="result-card">
        <h4>Possible next question</h4>
        <p>${interpretation.question}</p>
      </div>
      <div class="notice">
        <strong>Facilitation reminder:</strong> Ask, “What evidence explains this pattern?” before asking, “What should we do next?”
      </div>
    </section>

    <section class="card">
      <h3>One Next Step</h3>
      <p>Choose one realistic move to try before your next PLC meeting. The goal is not to fix everything. The goal is to strengthen one readiness condition on purpose.</p>
      <table class="action-table">
        <thead>
          <tr>
            <th>Readiness condition to strengthen</th>
            <th>One next step</th>
            <th>Owner/facilitator</th>
            <th>Timeline</th>
            <th>Evidence to revisit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${domain.title}</td>
            <td><textarea class="action-input" placeholder="What is one realistic next step?"></textarea></td>
            <td><textarea class="action-input" placeholder="Who will lead or follow up?"></textarea></td>
            <td><textarea class="action-input" placeholder="By when?"></textarea></td>
            <td><textarea class="action-input" placeholder="What evidence will we revisit?"></textarea></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;

  renderBars(domainScores, "teamBars", [domain.id]);
  setupActionPlanTextareas();
}

function renderBroadReport(parsed, domainIds, checkin, body) {
  const selected = domainsFor(domainIds);

  const domainTeamScores = {};
  const domainSpread = {};

  selected.forEach(d => {
    const memberAvgs = parsed.map(p => average(p.scores[d.id]));
    domainTeamScores[d.id] = round2(average(memberAvgs));
    domainSpread[d.id] = round2(stdDev(memberAvgs));
  });

  const overall = round2(average(selected.map(d => domainTeamScores[d.id])));
  const overallInfo = readinessLabel(overall);

  const sortedLow = [...selected].sort((a, b) => domainTeamScores[a.id] - domainTeamScores[b.id]);
  const lowest = sortedLow[0];
  const highest = sortedLow[sortedLow.length - 1];
  const widest = [...selected].sort((a, b) => domainSpread[b.id] - domainSpread[a.id])[0];
  const lowInfo = readinessLabel(domainTeamScores[lowest.id]);

  body.innerHTML = `
    <section id="teamSummary" class="card"></section>
    <section class="card">
      <h3>Team Readiness Profile</h3>
      <div id="teamBars"></div>
    </section>
    <section id="domainTable" class="card"></section>
    <section id="strengthGap" class="card"></section>
    <section id="conversationPrompts" class="card"></section>
    <section id="actionPlan" class="card"></section>
  `;

  document.getElementById("teamSummary").innerHTML = `
    <h2>${checkin.reportTitle}</h2>
    <p class="small">A team-level snapshot of readiness conditions, perception gaps, and possible next steps.</p>
    <p><strong>Number of individual assessments included:</strong> ${parsed.length}</p>
    <p><strong>Overall team average:</strong> <span class="badge ${overallInfo.cls}">${overall.toFixed(2)} — ${overallInfo.label}</span></p>
    <p>The submitted responses suggest that ${overallInfo.desc}</p>
    <div class="warm-notice">
      <strong>How to read this report:</strong> The scores are not the conversation. They are the doorway into the conversation. Start by asking what evidence might explain the pattern.
    </div>
    <div class="notice">
      <strong>Primary conversation priority:</strong> ${lowest.title}. This domain had the lowest average score. This pattern suggests that ${lowInfo.desc}
    </div>
  `;

  renderBars(domainTeamScores, "teamBars", domainIds);

  const tableRows = selected.map(d => {
    const score = domainTeamScores[d.id];
    const spread = domainSpread[d.id];
    const info = readinessLabel(score);
    const spreadDetails = spreadInfo(spread);
    const interpretation = domainInterpretation(d, score, spread);

    return `
      <tr>
        <td><strong>${d.title}</strong></td>
        <td>${score.toFixed(2)}</td>
        <td><span class="badge ${info.cls}">${info.label}</span></td>
        <td>
          <strong>${spread.toFixed(2)}</strong><br>
          <span class="badge ${spreadDetails.cls}">${spreadDetails.label}</span>
        </td>
        <td>${interpretation.cue}</td>
        <td>${interpretation.question}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("domainTable").innerHTML = `
    <h3>Domain Results</h3>
    <table class="domain-results-table">
      <thead>
        <tr>
          <th>PLC Component</th>
          <th>Avg.</th>
          <th>Level</th>
          <th>Spread</th>
          <th>Conversation cue</th>
          <th>Possible next question</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <p class="small">Response spread is based on variation in member domain averages. A larger spread suggests members may be experiencing this PLC condition differently.</p>
  `;

  document.getElementById("strengthGap").innerHTML = `
    <h3>Conversation Drivers</h3>
    <div class="grid">
      <div class="result-card col-4">
        <h4>Build From This Strength</h4>
        <p><strong>${highest.title}</strong></p>
        <p>This area appears to be the strongest readiness condition. Ask what makes it work and how that strength could support another domain.</p>
      </div>
      <div class="result-card col-4">
        <h4>Start Here</h4>
        <p><strong>${lowest.title}</strong></p>
        <p>${lowest.recommendation}</p>
      </div>
      <div class="result-card col-4">
        <h4>Notice This Perception Gap</h4>
        <p><strong>${widest.title}</strong></p>
        <p>Members may be experiencing this condition differently. Discuss evidence before jumping to solutions.</p>
      </div>
    </div>
  `;

  const lowPrompts = lowest.prompts.map(p => `<li>${p}</li>`).join("");
  const widePrompts = widest.prompts.map(p => `<li>${p}</li>`).join("");

  document.getElementById("conversationPrompts").innerHTML = `
    <h3>Facilitated Conversation Prompts</h3>
    <div class="grid">
      <div class="result-card col-6">
        <h4>Start with the lowest readiness area: ${lowest.short}</h4>
        <ul>${lowPrompts}</ul>
      </div>
      <div class="result-card col-6">
        <h4>Then discuss the largest perception gap: ${widest.short}</h4>
        <ul>${widePrompts}</ul>
      </div>
    </div>
    <div class="notice">
      <strong>Facilitation reminder:</strong> Ask, “What evidence explains this pattern?” before asking, “What should we do next?”
    </div>
  `;

  document.getElementById("actionPlan").innerHTML = `
    <h3>PLC Action Plan</h3>
    <p>Choose one realistic move to try before your next PLC meeting. The goal is not to fix everything. The goal is to strengthen one readiness condition on purpose.</p>
    <table class="action-table">
      <thead>
        <tr>
          <th>Readiness condition to strengthen</th>
          <th>One next step</th>
          <th>Owner/facilitator</th>
          <th>Timeline</th>
          <th>Evidence to revisit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${lowest.title}</td>
          <td><textarea class="action-input" placeholder="What is one realistic next step?"></textarea></td>
          <td><textarea class="action-input" placeholder="Who will lead or follow up?"></textarea></td>
          <td><textarea class="action-input" placeholder="By when?"></textarea></td>
          <td><textarea class="action-input" placeholder="What evidence will we revisit?"></textarea></td>
        </tr>
        <tr>
          <td>${widest.title}</td>
          <td><textarea class="action-input" placeholder="What is one realistic next step?"></textarea></td>
          <td><textarea class="action-input" placeholder="Who will lead or follow up?"></textarea></td>
          <td><textarea class="action-input" placeholder="By when?"></textarea></td>
          <td><textarea class="action-input" placeholder="What evidence will we revisit?"></textarea></td>
        </tr>
      </tbody>
    </table>
  `;

  setupActionPlanTextareas();
}

let dashboardReportTitle = "PLC Readiness Conversation Report";

function initDashboardPage() {
  const btn = document.getElementById("generateDashboard");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const raw = document.getElementById("codesInput").value
      .split(/\n+/)
      .map(x => x.trim())
      .filter(Boolean);

    if (raw.length < 2) {
      alert("Paste at least two individual response codes to generate a team dashboard.");
      return;
    }

    let parsed = [];
    let errors = [];

    raw.forEach((code, idx) => {
      try {
        parsed.push(parseCode(code));
      } catch (e) {
        errors.push(`Line ${idx + 1}: ${e.message}`);
      }
    });

    if (errors.length) {
      alert("Some response codes could not be read:\n\n" + errors.join("\n"));
      return;
    }

    // Every code must come from the same check-in (same set of domains).
    const firstSig = domainSignature(parsed[0].domainIds);
    const allMatch = parsed.every(p => domainSignature(p.domainIds) === firstSig);

    if (!allMatch) {
      alert(
        "These codes come from different check-ins.\n\n" +
        "All pasted codes must be from the SAME check-in (for example, all Shared Purpose codes, or all Full Compass codes). " +
        "Mixed check-in codes cannot be combined into one report.\n\n" +
        "Please generate a separate dashboard for each check-in type."
      );
      return;
    }

    const domainIds = domainsFor(parsed[0].domainIds).map(d => d.id); // canonical order
    const checkin = checkinForDomainIds(domainIds) || {
      reportTitle: "PLC Readiness Conversation Report"
    };

    dashboardReportTitle = checkin.reportTitle || "PLC Readiness Conversation Report";

    const printTitleEl = document.getElementById("printReportTitle");
    if (printTitleEl) printTitleEl.textContent = dashboardReportTitle;

    document.getElementById("dashboardResults").style.display = "block";
    const body = document.getElementById("reportBody");

    if (domainIds.length === 1) {
      renderSingleDomainReport(parsed, DOMAIN_BY_ID[domainIds[0]], checkin, body);
    } else {
      renderBroadReport(parsed, domainIds, checkin, body);
    }

    window.scrollTo({
      top: document.getElementById("dashboardResults").offsetTop - 20,
      behavior: "smooth"
    });
  });

  const exportBtn = document.getElementById("exportDashboardPdf");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => exportPdf(dashboardReportTitle));
  }

  const sampleBtn = document.getElementById("loadSample");
  if (sampleBtn) {
    // Sample demonstrates a short, single-domain check-in (Shared Purpose).
    sampleBtn.addEventListener("click", () => {
      document.getElementById("codesInput").value = [
        "PLC-CHECKIN|vision|3,4,3,2",
        "PLC-CHECKIN|vision|2,3,3,3",
        "PLC-CHECKIN|vision|4,3,2,3",
        "PLC-CHECKIN|vision|3,2,3,2"
      ].join("\n");
    });
  }
}

/* ============================================================
   Planner page
   ============================================================ */

const CONTEXT_MAP = {
  new:      { label: "New or restarting PLC",                    checks: ["vision", "leadership"], note: "Start by naming a shared purpose, then look at how leadership and voice are shared." },
  admin:    { label: "Admin priorities are shaping the work",    checks: ["leadership"],            note: "A Shared Leadership check-in surfaces where teacher voice and ownership live inside an admin-driven agenda." },
  purpose:  { label: "Team needs shared purpose",                checks: ["vision"],                note: "A Shared Purpose check-in helps the team name what it is actually trying to improve." },
  data:     { label: "Team is in a data/instructional cycle",    checks: ["learning"],              note: "Collective Learning fits a team already working with evidence and deciding what to try next." },
  practice: { label: "Team is ready to examine practice",        checks: ["practice"],              note: "Shared Practice works best once some trust is established." },
  rushed:   { label: "Meetings feel rushed or compliance-based", checks: ["conditions"],            note: "Supportive Conditions looks at time, structure, and norms before deeper work is expected." },
  midyear:  { label: "Midyear reset",                            checks: ["full"], alt: ["conditions", "vision"], note: "Use the Full Compass for a broad reset, or pair Supportive Conditions with Shared Purpose for a lighter one." },
  endyear:  { label: "End-of-year reflection",                   checks: ["full"], alt: ["learning", "practice"], note: "Use the Full Compass to reflect broadly, or pair Collective Learning with Shared Practice." }
};

function checkinLink(checkinId) {
  const c = CHECKINS[checkinId];
  if (!c) return "";
  const label = c.id === "full" ? "Start the Full Compass" : `Start the ${c.title}`;
  return `<a class="btn-link" href="index.html?checkin=${c.id}">${label} &rarr;</a>`;
}

function addWeeks(date, weeks) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function fmtDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtRange(start, w1, w2) {
  return `${fmtDate(addWeeks(start, w1))} – ${fmtDate(addWeeks(start, w2))}`;
}

function initPlannerPage() {
  const btn = document.getElementById("generatePlan");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const startVal = document.getElementById("startDate").value;
    const resetVal = document.getElementById("resetDate").value;
    const frequency = document.getElementById("frequency").value;
    const contextKey = document.getElementById("contextSelect").value;

    const out = document.getElementById("plannerOutput");
    out.style.display = "block";

    let html = "";

    // 1) Context-based recommendation
    if (contextKey && CONTEXT_MAP[contextKey]) {
      const rec = CONTEXT_MAP[contextKey];
      const primaryLinks = rec.checks.map(checkinLink).join(" ");
      const altLinks = (rec.alt || []).map(checkinLink).join(" ");

      html += `
        <div class="rec-card">
          <h4>Based on your current PLC context</h4>
          <p class="small">${rec.label}</p>
          <p>${rec.note}</p>
          <p><strong>Suggested check-in${rec.checks.length > 1 ? "s" : ""}:</strong></p>
          <div>${primaryLinks}</div>
          ${altLinks ? `<p class="small" style="margin-top:.75rem;">Lighter alternative:</p><div>${altLinks}</div>` : ""}
        </div>
      `;
    } else {
      html += `
        <div class="notice">
          Choose a current PLC context above to see a suggested check-in. You can also map the year using approximate windows by adding a start date.
        </div>
      `;
    }

    // 2) Approximate windows (only if a start date is provided)
    if (startVal) {
      const start = new Date(startVal + "T00:00:00");
      const reset = resetVal ? new Date(resetVal + "T00:00:00") : null;

      // First-window length scales loosely with meeting frequency.
      const firstWindow =
        frequency === "weekly"  ? [0, 3] :
        frequency === "monthly" ? [0, 10] :
        frequency === "irregular" ? [0, 8] :
        [0, 6]; // biweekly / default

      const windows = [
        {
          label: "Start of year — first 2–3 PLC meetings",
          date: `${fmtRange(start, firstWindow[0], firstWindow[1])}`,
          links: checkinLink("vision")
        },
        {
          label: "Weeks 3–6 — once the team is meeting regularly",
          date: `${fmtRange(start, 3, 6)}`,
          links: `${checkinLink("leadership")} ${checkinLink("conditions")}`,
          note: "Shared Leadership or Supportive Conditions."
        },
        {
          label: "After your first data or instructional cycle",
          date: `around ${fmtDate(addWeeks(start, 9))}`,
          links: checkinLink("learning")
        },
        {
          label: "Once trust is established",
          date: `around ${fmtDate(addWeeks(start, 13))} or later`,
          links: checkinLink("practice")
        },
        {
          label: "Midyear",
          date: reset ? fmtDate(reset) : `around ${fmtDate(addWeeks(start, 18))}`,
          links: `${checkinLink("full")} ${checkinLink("conditions")}`,
          note: "Full Compass, or a targeted reset such as Supportive Conditions + Shared Purpose."
        },
        {
          label: "End of year",
          date: "final PLC cycle",
          links: `${checkinLink("full")} ${checkinLink("learning")}`,
          note: "Full Compass, or a reflection check-in such as Collective Learning + Shared Practice."
        }
      ];

      const items = windows.map(w => `
        <li>
          <span class="when-label">${w.label}</span>
          <span class="when-date">${w.date}</span>
          ${w.note ? `<p class="small" style="margin:.5rem 0 .35rem;">${w.note}</p>` : `<div style="margin-top:.5rem;"></div>`}
          <div>${w.links}</div>
        </li>
      `).join("");

      html += `
        <div class="rec-card">
          <h4>Approximate check-in map for the year</h4>
          <p class="small">These windows are guidance, not a required schedule. Skip, reorder, or repeat check-ins to fit your team.</p>
          <ul class="window-list">${items}</ul>
        </div>
      `;
    }

    out.innerHTML = html;

    window.scrollTo({
      top: out.offsetTop - 20,
      behavior: "smooth"
    });
  });
}

/* ---------- boot ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initIndividualPage();
  initDashboardPage();
  initPlannerPage();
});
