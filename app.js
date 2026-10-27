/* =========================================================
   NEWBORN REGISTER — Zandya Technologies International
   Demo storage + NIRA simulator
========================================================= */
(function () {
  const STORAGE_KEY = "zandyaNewbornApplications";
  const DEMO_REF = "DEMO-2026-001";

  function uid() {
    const n = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "NR-" + n.slice(-6) + "-" + r;
  }

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function ensureDemo() {
    const list = loadAll();
    if (list.some(function (x) { return x.reference === DEMO_REF; })) return;
    list.unshift({
      reference: DEMO_REF,
      status: "nin_processing",
      statusLabel: "NIN processing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facility: "Mulago National Referral Hospital (Demo)",
      child: {
        firstName: "Amani",
        lastName: "Nalubega",
        sex: "Female",
        dateOfBirth: "2026-10-20",
        timeOfBirth: "08:42",
        weightKg: "3.2"
      },
      mother: {
        fullName: "Sarah Nalubega",
        nin: "CM9000000000000",
        phone: "+256700000001"
      },
      father: {
        fullName: "James Okello",
        nin: "CM9000000000001",
        phone: "+256700000002"
      },
      nira: {
        queued: true,
        sent: true,
        ackId: "NIRA-DEMO-ACK-001",
        sentAt: new Date().toISOString()
      },
      source: "demo"
    });
    saveAll(list);
  }

  function sendToNiraSimulator(payload) {
    return {
      ok: true,
      mode: "demo",
      ackId: "NIRA-ACK-" + Date.now().toString(36).toUpperCase(),
      message: "Queued for NIRA (demo).",
      sentAt: new Date().toISOString()
    };
  }

  function createApplication(payload) {
    ensureDemo();
    const reference = uid();
    const nira = sendToNiraSimulator(payload);
    const row = {
      reference: reference,
      status: "received",
      statusLabel: "Application received",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facility: payload.facility || "Hospital registration desk",
      child: payload.child || {},
      mother: payload.mother || {},
      father: payload.father || {},
      nira: {
        queued: true,
        sent: !!nira.ok,
        ackId: nira.ackId || null,
        sentAt: nira.sentAt || null,
        mode: nira.mode || "demo"
      },
      source: payload.source || "hospital"
    };
    const list = loadAll();
    list.unshift(row);
    saveAll(list);
    return row;
  }

  function findByReference(ref) {
    ensureDemo();
    const key = String(ref || "").trim().toUpperCase();
    return (
      loadAll().find(function (x) {
        return String(x.reference).toUpperCase() === key;
      }) || null
    );
  }

  function statusStory(app) {
    const stages = [
      { id: "received", label: "Application received" },
      { id: "parent_verification", label: "Parent verification" },
      { id: "residence_review", label: "Residence review" },
      { id: "nin_processing", label: "NIN processing" },
      { id: "completed", label: "Completed (demo)" }
    ];
    const order = stages.map(function (s) { return s.id; });
    const idx = Math.max(0, order.indexOf(app.status));
    return stages.map(function (s, i) {
      return {
        label: s.label,
        done: i <= idx,
        current: i === idx
      };
    });
  }

  window.NewbornRegister = {
    DEMO_REF: DEMO_REF,
    ensureDemo: ensureDemo,
    createApplication: createApplication,
    findByReference: findByReference,
    statusStory: statusStory,
    loadAll: loadAll
  };

  ensureDemo();
})();
