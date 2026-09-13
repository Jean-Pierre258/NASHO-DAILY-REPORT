/**
 * NASHO DAILY REPORTING SYSTEM - JAVASCRIPT CONTROLLER
 * Full offline-first storage, Google Sheets Webhook Sync, CSV Export,
 * Printable PDF reports, and bilingual support (Kinyarwanda / English).
 */

// Global State
let currentLanguage = localStorage.getItem('nasho_lang') || 'rw';
let reportsData = [];
let sheetConfig = {
  webhookUrl: '',
  directUrl: '',
  autoSync: true
};
let uploadedImageBase64 = null;

// Localization Dictionary
const translations = {
  rw: {
    app_title: "NASHO DAILY REPORT",
    app_subtitle: "Sisitemu yo Gutanga no Gukurikirana Raporo z'Akazi za Buri Munsi",
    sheet_not_connected: "Google Sheet: Ntidahuje",
    sheet_connected: "Google Sheet: Yarahujwe",
    tab_new_report: "Tanga Raporo Nshya",
    tab_dashboard: "Imbonerahamwe n'Ubushakashatsi",
    tab_history: "Amateka ya Raporo",
    tab_google_sheet: "Guhuza na Google Sheet",
    form_title: "Kuzuza Raporo y'Umunsi",
    form_subtitle: "Uzuza neza imyirondoro, ibikorwa byakozwe, ibipimo, n'imbogamizi zagaragaye.",
    load_draft: "Kugarura Ibyari Byuzuye",
    clear_form: "Guhanagura Byose",
    card_general_info: "1. Amakuru y'Ibanze & Umwirondoro",
    lbl_date: "Itariki y'Akazi *",
    lbl_shift: "Igihe cy'Akazi (Shift) *",
    lbl_department: "Ishami / Department *",
    lbl_reporter_name: "Izina ry'Utanga Raporo (Supervisor / Lead) *",
    lbl_reporter_phone: "Nimero ya Telefone",
    lbl_site_zone: "Aho Akazi Kakorewe (Zone / Pivot / Sector) *",
    card_metrics: "2. Ibipimo by'Umunsi (Quantitative Metrics)",
    lbl_workers: "Umubare w'Abakozi Bakoranye",
    lbl_hours: "Amasaha Yakozwe (Hours)",
    lbl_fuel: "Mazutu / Lisansi Yakoreshejwe (Liters)",
    lbl_output: "Umusaruro / Ingano y'Ibyakozwe (Hectares / Units)",
    card_tasks: "3. Ibikorwa Byakozwe Uyu Munsi (Daily Activities)",
    tasks_hint: "Ongeraho buri gikorwa cyakozwe, urwego kigezeho, n'ibisobanuro byacyo.",
    btn_add_task: "+ Ongeraho Igikorwa",
    card_issues: "4. Imbogamizi, Impanuka cyangwa Ibibazo Byagaragaye",
    issues_hint: "Andika ibibazo byahagaritse akazi, imashini zapfuye cyangwa ibikeneye gukemurwa vuba.",
    btn_add_issue: "+ Ongeraho Ikibazo",
    card_tomorrow: "5. Ibiteganyijwe Gukorwa Ejo & Ibisobanuro Byiyongereye",
    lbl_tomorrow_plan: "Gahunda y'Ibikorwa by'Ejo (Tomorrow's Targets) *",
    lbl_remarks: "Icyitonderwa cyangwa Ibyifuzo ku Buyobozi (General Remarks)",
    lbl_photo: "Ifoto / Gihamya y'Ibikorwa (Photo Attachment - Optional)",
    upload_prompt: "Kanda hano cyangwa uhashyire ifoto y'ibikorwa/ikibazo",
    lbl_auto_sync_check: "Kohereza ako kanya muri Google Sheet ibitswe",
    btn_preview: "Reba Uko Iza Gusa",
    btn_submit: "Tanga Raporo ubu",
    dashboard_title: "Imbonerahamwe y'Ibikorwa (Analytics & KPIs)",
    dashboard_subtitle: "Incamake y'imikorere, ibipimo n'imbogamizi zatanzwe muri Nasho.",
    btn_export_csv: "Kukuramo CSV / Excel",
    btn_open_sheet: "Reba muri Google Sheet",
    stat_total_reports: "Raporo Zose Zatanzwe",
    stat_total_workers: "Abakozi Bakoze (Total)",
    stat_issues_recorded: "Imbogamizi Zanditswe",
    stat_total_fuel: "Mazutu Yakoreshejwe",
    chart_dept_distribution: "Raporo Zikurikije Amashami (Departments)",
    issues_feed_title: "Ibibazo Bikeneye Ibisubizo Vuba",
    history_title: "Amateka n'Urutonde rwa Raporo Zose",
    history_subtitle: "Shakisha, shungura, kora PDF, cyangwa usome raporo zose zatanzwe.",
    btn_export_all: "Gukuramo CSV / Excel",
    btn_backup: "Kubika Backup (JSON)",
    btn_import: "Kugarura Backup",
    filter_search: "Shakisha (Izina, Aho cyakorewe, n'ibindi)",
    filter_dept: "Ishami (Department)",
    filter_date_from: "Kuva Itariki",
    filter_date_to: "Kugeza Itariki",
    filter_reset: "Gusubiraho",
    th_date: "Itariki",
    th_shift: "Shift",
    th_reporter: "Utanga Raporo",
    th_dept: "Ishami",
    th_zone: "Ahakorewe",
    th_tasks_count: "Ibikorwa",
    th_issues_count: "Ibibazo",
    th_status: "Status",
    th_actions: "Ibikorwa",
    empty_table_title: "Nta raporo ibonetse",
    empty_table_desc: "Nta raporo ihwanye n'ibyo ushakishije cyangwa nta raporo iruzuzwa.",
    btn_create_first: "Tanga Raporo ya Mbere",
    modal_sheet_title: "Guhuza Urubuga na Google Sheet yawe",
    modal_sheet_desc: "Huza iyi fomu na Google Sheet yawe kugira ngo buri raporo ijye yikora muri sheet ako kanya!",
    how_to_setup: "Amabwiriza y'uburyo bwo kubona iyi Link muri Google Sheet yawe (Mu masegonda 30)"
  },
  en: {
    app_title: "NASHO DAILY REPORT",
    app_subtitle: "Operations Daily Reporting & Monitoring System",
    sheet_not_connected: "Google Sheet: Disconnected",
    sheet_connected: "Google Sheet: Connected",
    tab_new_report: "New Daily Report",
    tab_dashboard: "Dashboard & KPIs",
    tab_history: "Reports History",
    tab_google_sheet: "Google Sheet Integration",
    form_title: "Fill Daily Operations Report",
    form_subtitle: "Record team information, operations performed, metrics, and site issues.",
    load_draft: "Restore Draft",
    clear_form: "Clear Form",
    card_general_info: "1. Basic Details & Reporter Info",
    lbl_date: "Operations Date *",
    lbl_shift: "Work Shift *",
    lbl_department: "Department *",
    lbl_reporter_name: "Reporter Name (Lead / Supervisor) *",
    lbl_reporter_phone: "Phone Number",
    lbl_site_zone: "Location / Site Zone (Pivot, Sector) *",
    card_metrics: "2. Daily Quantitative Metrics",
    lbl_workers: "Total Workers On-Site",
    lbl_hours: "Total Hours Worked",
    lbl_fuel: "Fuel Consumed (Liters)",
    lbl_output: "Output / Coverage (Hectares / Units)",
    card_tasks: "3. Tasks & Activities Completed Today",
    tasks_hint: "Add each activity performed, progress status, and execution notes.",
    btn_add_task: "+ Add Activity",
    card_issues: "4. Challenges, Breakdowns & Incidents",
    issues_hint: "Record site delays, mechanical breakdowns, or pending issues.",
    btn_add_issue: "+ Add Issue",
    card_tomorrow: "5. Plan for Tomorrow & Additional Remarks",
    lbl_tomorrow_plan: "Tomorrow's Action Plan *",
    lbl_remarks: "General Notes / Management Requests",
    lbl_photo: "Photo Attachment / Site Evidence (Optional)",
    upload_prompt: "Click or drag & drop activity photo here",
    lbl_auto_sync_check: "Auto-sync directly to Google Sheet upon submit",
    btn_preview: "Preview Document",
    btn_submit: "Submit Daily Report",
    dashboard_title: "Operations Dashboard & KPIs",
    dashboard_subtitle: "Real-time summary of tasks, metrics, and site issues in Nasho.",
    btn_export_csv: "Export CSV / Excel",
    btn_open_sheet: "Open Google Sheet",
    stat_total_reports: "Total Reports Submitted",
    stat_total_workers: "Total Workers Deployed",
    stat_issues_recorded: "Issues Recorded",
    stat_total_fuel: "Fuel Consumed",
    chart_dept_distribution: "Reports by Department",
    issues_feed_title: "Issues Requiring Attention",
    history_title: "All Historical Reports",
    history_subtitle: "Search, filter, view, print PDF, or manage past submissions.",
    btn_export_all: "Export CSV / Excel",
    btn_backup: "Backup Data (JSON)",
    btn_import: "Restore Backup",
    filter_search: "Search (Name, Zone, Task)",
    filter_dept: "Department",
    filter_date_from: "From Date",
    filter_date_to: "To Date",
    filter_reset: "Reset Filter",
    th_date: "Date",
    th_shift: "Shift",
    th_reporter: "Reporter",
    th_dept: "Department",
    th_zone: "Site Zone",
    th_tasks_count: "Tasks",
    th_issues_count: "Issues",
    th_status: "Status",
    th_actions: "Actions",
    empty_table_title: "No reports found",
    empty_table_desc: "No submissions match your search query or no reports exist yet.",
    btn_create_first: "Create First Report",
    modal_sheet_title: "Connect Website with your Google Sheet",
    modal_sheet_desc: "Connect this form to your Google Sheet so every submitted report appends automatically!",
    how_to_setup: "Step-by-step setup guide for your Google Sheet (30 seconds)"
  }
};

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initLanguage();
  initFormDefaults();
  renderReportsTable();
  updateDashboardKPIs();
  updateSheetStatusBadge();

  if (window.lucide) {
    lucide.createIcons();
  }

  // Setup auto-save listener on form fields
  const form = document.getElementById('dailyReportForm');
  if (form) {
    form.addEventListener('input', debounceAutoSave);
  }
});

/**
 * Local Storage Initialization
 */
function initStorage() {
  // Load Google Sheet Config
  const savedConfig = localStorage.getItem('nasho_sheet_config');
  if (savedConfig) {
    try {
      sheetConfig = JSON.parse(savedConfig);
      document.getElementById('googleSheetWebhookUrl').value = sheetConfig.webhookUrl || '';
      document.getElementById('googleSheetDirectUrl').value = sheetConfig.directUrl || '';
      document.getElementById('autoSyncToGoogleSheet').checked = sheetConfig.autoSync !== false;
    } catch (e) {
      console.error('Error parsing sheet config', e);
    }
  }

  // Load Reports or Populate Seed Data
  const savedReports = localStorage.getItem('nasho_reports_v2');
  if (savedReports) {
    try {
      reportsData = JSON.parse(savedReports);
    } catch (e) {
      reportsData = [];
    }
  }

  // If completely empty, seed with 3 realistic Nasho reports
  if (!reportsData || reportsData.length === 0) {
    seedInitialData();
  }
}

/**
 * Seed realistic initial data for Nasho operations
 */
function seedInitialData() {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  reportsData = [
    {
      id: "NSR-20260913-0001",
      date: todayStr,
      shift: "Umunsi (Day Shift)",
      department: "Ubwuhira (Irrigation & Water)",
      reporterName: "Jean Paul Mugisha",
      reporterPhone: "0788 452 119",
      siteZone: "Center Pivot 08 & Substation 3",
      metricWorkers: 8,
      metricHours: 8.5,
      metricFuel: 35,
      metricProduction: "24 Hectares z'Ibigori zashyizwemo amazi",
      tasks: [
        { name: "Kugenzura umuvuduko w'amazi muri Pivot 08", status: "Byarangiye", notes: "Umuvuduko ni 4.2 Bar, bikora neza." },
        { name: "Gusimbuza umuyoboro wamenetse wa Nozzle 14", status: "Byarangiye", notes: "Icyuma gishya cyashyizwemo cyavuye mu bubiko." }
      ],
      issues: [
        { severity: "Biringaniye", desc: "Umuyoboro w'amazi wari washangiwe n'umucanga mu cyobo cya filter", action: "Filter yasukuwe, amazi asubira mu murongo." }
      ],
      tomorrowPlan: "1. Gutangiza Pivot 09 na 10\n2. Gupima ingano y'amazi mu kigega kinini cya Nasho",
      generalRemarks: "Dukeneye udupfunyiko dushya (seals) tw'imiyoboro mu cyumweru gitaha.",
      submittedAt: new Date().toLocaleString(),
      syncedToSheet: true
    },
    {
      id: "NSR-20260912-0002",
      date: yesterdayStr,
      shift: "Umunsi (Day Shift)",
      department: "Ubuhinzi (Agronomy & Farming)",
      reporterName: "Marie Claire Uwase",
      reporterPhone: "0785 332 901",
      siteZone: "Block C - Imirima y'Icyitegererezo",
      metricWorkers: 22,
      metricHours: 8,
      metricFuel: 12,
      metricProduction: "Hegitari 6 zatewemo ifumbire ya NPK",
      tasks: [
        { name: "Gukwirakwiza ifumbire mu mirima y'ibishyimbo", status: "Byarangiye", notes: "Abakozi 18 bakoze akazi kateganyijwe kose." },
        { name: "Kugenzura ibyonnyi n'indwara ku mababi", status: "Biracyakomeza", notes: "Nta nkongwa zagaragaye, amababi ameze neza." }
      ],
      issues: [],
      tomorrowPlan: "Gukomeza gutera ifumbire muri Block D no gutegura imiti yo gutera.",
      generalRemarks: "Imvura yaguye ku mugoroba yafashije ifumbire kwinjira mu butaka.",
      submittedAt: new Date(Date.now() - 86400000).toLocaleString(),
      syncedToSheet: true
    },
    {
      id: "NSR-20260911-0003",
      date: yesterdayStr,
      shift: "Umunsi (Day Shift)",
      department: "Imashini na Tekiniki (Machinery & Workshop)",
      reporterName: "Emmanuel Hakizimana",
      reporterPhone: "0783 112 458",
      siteZone: "Workshop & Generator House 2",
      metricWorkers: 5,
      metricHours: 9,
      metricFuel: 60,
      metricProduction: "Tarakiteri 2 zasanywe ziteguye guhinga",
      tasks: [
        { name: "Guhindura amavuta ya Moteri kuri Tarakiteri Ferguson 240", status: "Byarangiye", notes: "Filters zose zahinduwe nshya." },
        { name: "Gusana sisitemu y'amashanyarazi ya Generator House 2", status: "Byarangiye", notes: "Batterie yari yapfuye yasimbuwe." }
      ],
      issues: [
        { severity: "Bikomeye", desc: "Ipaji y'imbere ya Tarakiteri John Deere yaturikiye mu murima", action: "Ikeneye kugurwa indi nshya kuko idashobora guterwa ipine." }
      ],
      tomorrowPlan: "Kugenzura pompe zose z'amashanyarazi muri Pumping Station 1.",
      generalRemarks: "Ubuyobozi bwakwemeza kugura ipine nshya ya John Deere vuba.",
      submittedAt: new Date(Date.now() - 172800000).toLocaleString(),
      syncedToSheet: false
    }
  ];

  localStorage.setItem('nasho_reports_v2', JSON.stringify(reportsData));
}

/**
 * Initialize Form Defaults
 */
function initFormDefaults() {
  const dateInput = document.getElementById('reportDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Clear & Add at least 1 default Task and 1 empty Issue
  const tasksContainer = document.getElementById('tasksContainer');
  if (tasksContainer && tasksContainer.children.length === 0) {
    addTaskRow();
  }

  const issuesContainer = document.getElementById('issuesContainer');
  if (issuesContainer && issuesContainer.children.length === 0) {
    addIssueRow();
  }
}

/**
 * Dynamic Task Rows
 */
function addTaskRow(taskData = { name: '', status: 'Byarangiye', notes: '' }) {
  const container = document.getElementById('tasksContainer');
  const rowId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.id = rowId;

  row.innerHTML = `
    <div class="form-group">
      <label class="text-xs">Izina ry'Igikorwa (Activity)</label>
      <input type="text" class="task-name" placeholder="Urugero: Gusana umuyoboro wa Pivot 3" value="${escapeHtml(taskData.name)}" required>
    </div>
    <div class="form-group">
      <label class="text-xs">Urwego (Status)</label>
      <select class="task-status">
        <option value="Byarangiye" ${taskData.status === 'Byarangiye' ? 'selected' : ''}>✅ Byarangiye (Done)</option>
        <option value="Biracyakomeza" ${taskData.status === 'Biracyakomeza' ? 'selected' : ''}>⏳ Biracyakomeza (In Progress)</option>
        <option value="Byarahagaze" ${taskData.status === 'Byarahagaze' ? 'selected' : ''}>⚠️ Byarahagaze (Delayed)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="text-xs">Ibisobanuro & Ibyagezweho (Details)</label>
      <input type="text" class="task-notes" placeholder="Ibisobanuro by'ibyakozwe cyangwa ibyagezweho..." value="${escapeHtml(taskData.notes)}">
    </div>
    <button type="button" class="btn-remove-row" onclick="removeDynamicRow('${rowId}')" title="Kuraho iki gikorwa">
      <i data-lucide="trash-2"></i>
    </button>
  `;

  container.appendChild(row);
  if (window.lucide) lucide.createIcons();
}

/**
 * Dynamic Issue Rows
 */
function addIssueRow(issueData = { severity: 'Biringaniye', desc: '', action: '' }) {
  const container = document.getElementById('issuesContainer');
  const rowId = 'issue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  const row = document.createElement('div');
  row.className = 'dynamic-row issue-row';
  row.id = rowId;

  row.innerHTML = `
    <div class="form-group">
      <label class="text-xs">Ubukana (Severity)</label>
      <select class="issue-severity">
        <option value="Byoroheje" ${issueData.severity === 'Byoroheje' ? 'selected' : ''}>🟡 Byoroheje (Low)</option>
        <option value="Biringaniye" ${issueData.severity === 'Biringaniye' ? 'selected' : ''}>🟠 Biringaniye (Medium)</option>
        <option value="Bikomeye" ${issueData.severity === 'Bikomeye' ? 'selected' : ''}>🔴 Bikomeye (Critical)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="text-xs">Ibisobanuro by'Ikibazo (Issue Description)</label>
      <input type="text" class="issue-desc" placeholder="Urugero: Moteri ya pompe 2 yagize ikibazo..." value="${escapeHtml(issueData.desc)}">
    </div>
    <div class="form-group">
      <label class="text-xs">Icyakozwe cyangwa Igisabwa (Action Taken / Required)</label>
      <input type="text" class="issue-action" placeholder="Icyakozwe cyangwa ubufasha busabwa..." value="${escapeHtml(issueData.action)}">
    </div>
    <button type="button" class="btn-remove-row" onclick="removeDynamicRow('${rowId}')" title="Kuraho iki kibazo">
      <i data-lucide="trash-2"></i>
    </button>
  `;

  container.appendChild(row);
  if (window.lucide) lucide.createIcons();
}

function removeDynamicRow(rowId) {
  const elem = document.getElementById(rowId);
  if (elem) {
    elem.remove();
  }
}

/**
 * Image Upload Handler
 */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast("Ifoto irengeje 5MB! Hitamo ifoto ntoya.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImageBase64 = e.target.result;
    document.getElementById('imagePreview').src = uploadedImageBase64;
    document.getElementById('imagePreviewContainer').classList.remove('hidden');
    document.getElementById('uploadPlaceholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

function removeUploadedImage() {
  uploadedImageBase64 = null;
  document.getElementById('reportPhoto').value = "";
  document.getElementById('imagePreviewContainer').classList.add('hidden');
  document.getElementById('uploadPlaceholder').classList.remove('hidden');
}

/**
 * Tab Switching Controller
 */
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  if (tabId === 'form') {
    document.getElementById('sectionForm').classList.add('active');
    document.getElementById('tabBtnForm').classList.add('active');
  } else if (tabId === 'dashboard') {
    document.getElementById('sectionDashboard').classList.add('active');
    document.getElementById('tabBtnDashboard').classList.add('active');
    updateDashboardKPIs();
  } else if (tabId === 'history') {
    document.getElementById('sectionHistory').classList.add('active');
    document.getElementById('tabBtnHistory').classList.add('active');
    renderReportsTable();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) lucide.createIcons();
}

/**
 * Handle Form Submission
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('dailyReportForm');
  const submitBtn = document.getElementById('btnSubmitReport');

  // Collect Tasks
  const taskRows = document.querySelectorAll('#tasksContainer .dynamic-row');
  const tasks = [];
  taskRows.forEach(row => {
    const name = row.querySelector('.task-name')?.value.trim();
    const status = row.querySelector('.task-status')?.value;
    const notes = row.querySelector('.task-notes')?.value.trim();
    if (name) {
      tasks.push({ name, status, notes });
    }
  });

  if (tasks.length === 0) {
    showToast("Shyiramo byibuze igikorwa kimwe cyakozwe!", "error");
    return;
  }

  // Collect Issues
  const issueRows = document.querySelectorAll('#issuesContainer .dynamic-row');
  const issues = [];
  issueRows.forEach(row => {
    const severity = row.querySelector('.issue-severity')?.value;
    const desc = row.querySelector('.issue-desc')?.value.trim();
    const action = row.querySelector('.issue-action')?.value.trim();
    if (desc) {
      issues.push({ severity, desc, action });
    }
  });

  // Generate Report ID: NSR-YYYYMMDD-XXXX
  const dateVal = document.getElementById('reportDate').value;
  const dateCode = dateVal ? dateVal.replace(/-/g, '') : new Date().toISOString().slice(0,10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reportId = `NSR-${dateCode}-${randomSuffix}`;

  const reportObject = {
    id: reportId,
    date: dateVal,
    shift: document.getElementById('reportShift').value,
    department: document.getElementById('department').value,
    reporterName: document.getElementById('reporterName').value.trim(),
    reporterPhone: document.getElementById('reporterPhone').value.trim(),
    siteZone: document.getElementById('siteZone').value.trim(),
    metricWorkers: parseFloat(document.getElementById('metricWorkers').value) || 0,
    metricHours: parseFloat(document.getElementById('metricHours').value) || 0,
    metricFuel: parseFloat(document.getElementById('metricFuel').value) || 0,
    metricProduction: document.getElementById('metricProduction').value.trim(),
    tasks: tasks,
    issues: issues,
    tomorrowPlan: document.getElementById('tomorrowPlan').value.trim(),
    generalRemarks: document.getElementById('generalRemarks').value.trim(),
    photo: uploadedImageBase64 || null,
    submittedAt: new Date().toLocaleString(),
    syncedToSheet: false
  };

  // Build Summary Strings for Google Sheets & CSV
  reportObject.tasksSummary = tasks.map(t => `[${t.status}] ${t.name}${t.notes ? ' (' + t.notes + ')' : ''}`).join(' | ');
  reportObject.issuesSummary = issues.length > 0 
    ? issues.map(i => `[${i.severity}] ${i.desc}${i.action ? ' -> ' + i.action : ''}`).join(' | ') 
    : 'Nta kibazo cyagaragaye';

  // UI Loading State
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Birimo kubikwa...`;
  if (window.lucide) lucide.createIcons();

  // Try Auto-Syncing to Google Sheets if enabled
  const shouldSync = document.getElementById('autoSyncToGoogleSheet').checked && sheetConfig.webhookUrl;
  if (shouldSync) {
    const syncSuccess = await sendDataToGoogleSheetWebhook(reportObject);
    reportObject.syncedToSheet = syncSuccess;
  }

  // Prepend to Local Storage
  reportsData.unshift(reportObject);
  localStorage.setItem('nasho_reports_v2', JSON.stringify(reportsData));
  localStorage.removeItem('nasho_form_draft');

  // Finish Loading
  submitBtn.disabled = false;
  submitBtn.innerHTML = `<i data-lucide="send"></i> <span data-i18n="btn_submit">Tanga Raporo ubu</span>`;
  if (window.lucide) lucide.createIcons();

  showToast(`Raporo ${reportId} yabitswe neza!` + (reportObject.syncedToSheet ? ' Yanoherejwe muri Google Sheet.' : ''), "success");

  // Reset form and view reports history
  resetForm();
  renderReportsTable();
  updateDashboardKPIs();
  switchTab('history');
}

/**
 * Send payload to Google Sheets Apps Script Webhook
 */
async function sendDataToGoogleSheetWebhook(report) {
  if (!sheetConfig.webhookUrl) return false;

  try {
    const payload = {
      id: report.id,
      date: report.date,
      shift: report.shift,
      department: report.department,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      siteZone: report.siteZone,
      metricWorkers: report.metricWorkers,
      metricHours: report.metricHours,
      metricFuel: report.metricFuel,
      metricProduction: report.metricProduction,
      tasksSummary: report.tasksSummary,
      issuesSummary: report.issuesSummary,
      tomorrowPlan: report.tomorrowPlan,
      generalRemarks: report.generalRemarks,
      submittedAt: report.submittedAt
    };

    // Google Apps Script requires text/plain or no-cors for direct browser fetch
    await fetch(sheetConfig.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    console.log('Dispatched successfully to Google Sheet Webhook');
    return true;
  } catch (error) {
    console.warn('Could not sync directly to Google Sheet Webhook:', error);
    return false;
  }
}

/**
 * Render Reports in History Table
 */
function renderReportsTable() {
  const tbody = document.getElementById('reportsTableBody');
  const emptyState = document.getElementById('tableEmptyState');
  const countBadge = document.getElementById('reportsCountBadge');
  if (!tbody) return;

  const filtered = getFilteredReports();
  tbody.innerHTML = '';
  countBadge.textContent = reportsData.length;

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('reportsTable').classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  document.getElementById('reportsTable').classList.remove('hidden');

  filtered.forEach(report => {
    const tr = document.createElement('tr');

    const issuesCount = (report.issues || []).length;
    const tasksCount = (report.tasks || []).length;

    let syncBadge = report.syncedToSheet 
      ? `<span class="table-badge emerald" title="Yoherejwe muri Google Sheet"><i data-lucide="check" style="width:12px;margin-right:3px;"></i> Sheet</span>`
      : `<span class="table-badge amber" title="Ibitse muri mudasobwa (Offline)"><i data-lucide="hard-drive" style="width:12px;margin-right:3px;"></i> Local</span>`;

    tr.innerHTML = `
      <td><strong>${report.date}</strong></td>
      <td><span class="text-xs text-muted">${report.shift ? report.shift.split(' ')[0] : 'Umunsi'}</span></td>
      <td>
        <div style="display:flex;flex-direction:column;">
          <strong>${escapeHtml(report.reporterName)}</strong>
          <span class="text-xs text-muted">${escapeHtml(report.reporterPhone || '')}</span>
        </div>
      </td>
      <td><span class="table-badge blue">${escapeHtml(report.department.split(' ')[0])}</span></td>
      <td><span class="text-sm">${escapeHtml(report.siteZone)}</span></td>
      <td><span class="table-badge emerald">${tasksCount} ibikorwa</span></td>
      <td>
        ${issuesCount > 0 
          ? `<span class="table-badge red">${issuesCount} ibibazo</span>` 
          : `<span class="table-badge emerald">Nta kibazo</span>`}
      </td>
      <td>${syncBadge}</td>
      <td class="text-right">
        <div class="table-actions-cell">
          <button class="btn-icon-table" onclick="viewReportDetails('${report.id}')" title="Reba Raporo / Print">
            <i data-lucide="eye"></i>
          </button>
          <button class="btn-icon-table" onclick="resyncSingleReport('${report.id}')" title="Kohereza muri Google Sheet">
            <i data-lucide="send"></i>
          </button>
          <button class="btn-icon-table delete" onclick="deleteReport('${report.id}')" title="Gusiba">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

/**
 * Filter Logic for History Table
 */
function getFilteredReports() {
  const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
  const dept = document.getElementById('filterDept')?.value || 'ALL';
  const dateFrom = document.getElementById('filterDateFrom')?.value || '';
  const dateTo = document.getElementById('filterDateTo')?.value || '';

  return reportsData.filter(r => {
    // Search matching
    const matchSearch = !search || 
      (r.reporterName && r.reporterName.toLowerCase().includes(search)) ||
      (r.siteZone && r.siteZone.toLowerCase().includes(search)) ||
      (r.id && r.id.toLowerCase().includes(search)) ||
      (r.tasksSummary && r.tasksSummary.toLowerCase().includes(search));

    // Department matching
    const matchDept = dept === 'ALL' || (r.department && r.department.includes(dept));

    // Date range
    const matchFrom = !dateFrom || r.date >= dateFrom;
    const matchTo = !dateTo || r.date <= dateTo;

    return matchSearch && matchDept && matchFrom && matchTo;
  });
}

function applyFilters() {
  renderReportsTable();
}

function resetFilters() {
  document.getElementById('filterSearch').value = '';
  document.getElementById('filterDept').value = 'ALL';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value = '';
  renderReportsTable();
}

/**
 * Dashboard KPIs & Charts
 */
function updateDashboardKPIs() {
  const totalReports = reportsData.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReports = reportsData.filter(r => r.date === todayStr);

  let totalWorkers = 0;
  let totalHours = 0;
  let totalFuel = 0;
  let totalIssues = 0;
  let criticalIssues = 0;
  const deptCounts = {};
  const recentCriticalIssuesList = [];

  reportsData.forEach(r => {
    totalWorkers += parseFloat(r.metricWorkers || 0);
    totalHours += parseFloat(r.metricHours || 0);
    totalFuel += parseFloat(r.metricFuel || 0);

    const issues = r.issues || [];
    totalIssues += issues.length;
    issues.forEach(i => {
      if (i.severity === 'Bikomeye' || i.severity === 'Critical') {
        criticalIssues++;
        recentCriticalIssuesList.push({ ...i, reporter: r.reporterName, date: r.date, zone: r.siteZone });
      }
    });

    const deptKey = r.department ? r.department.split('(')[0].trim() : 'Ibindi';
    deptCounts[deptKey] = (deptCounts[deptKey] || 0) + 1;
  });

  const avgHours = totalReports > 0 ? (totalHours / totalReports).toFixed(1) : 0;

  // Render Numbers
  document.getElementById('kpiTotalReports').textContent = totalReports;
  document.getElementById('kpiTodayCount').textContent = `${todayReports.length} z'uyu munsi`;
  document.getElementById('kpiTotalWorkers').textContent = totalWorkers;
  document.getElementById('kpiAvgHours').textContent = `${avgHours}h impuzandengo/raporo`;
  document.getElementById('kpiTotalIssues').textContent = totalIssues;
  document.getElementById('kpiCriticalIssues').textContent = `${criticalIssues} zikomeye cyane`;
  document.getElementById('kpiTotalFuel').textContent = `${totalFuel.toFixed(1)} L`;

  // Render Department Progress Bars
  const deptContainer = document.getElementById('deptBreakdownList');
  deptContainer.innerHTML = '';

  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
  if (sortedDepts.length === 0) {
    deptContainer.innerHTML = `<p class="text-sm text-muted">Nta makuru arahari.</p>`;
  } else {
    sortedDepts.forEach(([name, count]) => {
      const percentage = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
      const item = document.createElement('div');
      item.className = 'dept-prog-item';
      item.innerHTML = `
        <div class="dept-prog-meta">
          <span>${name}</span>
          <span>${count} (${percentage}%)</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
      `;
      deptContainer.appendChild(item);
    });
  }

  // Render Critical Issues Feed
  const issuesFeed = document.getElementById('dashboardIssuesFeed');
  issuesFeed.innerHTML = '';
  if (recentCriticalIssuesList.length === 0) {
    issuesFeed.innerHTML = `
      <div style="padding: 1.5rem; text-align:center; color: var(--secondary-400);">
        <i data-lucide="check-circle" style="width:32px;height:32px;margin-bottom:0.5rem;color:var(--primary-500);"></i>
        <p>Nta kibazo gikomeye kirimo gutegereza igisubizo ubu!</p>
      </div>
    `;
  } else {
    recentCriticalIssuesList.slice(0, 5).forEach(issue => {
      const card = document.createElement('div');
      card.className = 'issue-feed-card';
      card.innerHTML = `
        <div class="issue-feed-header">
          <span style="color:#b91c1c;">🔴 ${issue.severity} • ${issue.zone}</span>
          <span class="text-muted">${issue.date}</span>
        </div>
        <div class="issue-feed-desc"><strong>Ikibazo:</strong> ${escapeHtml(issue.desc)}</div>
        ${issue.action ? `<div class="text-xs" style="color:var(--secondary-600);"><strong>Igisabwa:</strong> ${escapeHtml(issue.action)}</div>` : ''}
      `;
      issuesFeed.appendChild(card);
    });
  }

  if (window.lucide) lucide.createIcons();
}

/**
 * View Detailed Report Modal (Print / PDF View)
 */
function viewReportDetails(reportId) {
  const report = reportsData.find(r => r.id === reportId);
  if (!report) return;

  // Fill in Document Fields
  document.getElementById('viewReportId').textContent = report.id;
  document.getElementById('viewDate').textContent = report.date;
  document.getElementById('viewShift').textContent = report.shift || '--';
  document.getElementById('viewDepartment').textContent = report.department || '--';
  document.getElementById('viewReporter').textContent = `${report.reporterName} ${report.reporterPhone ? '(' + report.reporterPhone + ')' : ''}`;
  document.getElementById('viewSiteZone').textContent = report.siteZone || '--';

  document.getElementById('viewWorkers').textContent = report.metricWorkers || 0;
  document.getElementById('viewHours').textContent = (report.metricHours || 0) + 'h';
  document.getElementById('viewFuel').textContent = (report.metricFuel || 0) + ' L';
  document.getElementById('viewProduction').textContent = report.metricProduction || 'N/A';

  // Sync status tag
  const syncTag = document.getElementById('viewReportSyncStatus');
  if (report.syncedToSheet) {
    syncTag.textContent = 'Google Sheet Synced';
    syncTag.style.color = '#059669';
  } else {
    syncTag.textContent = 'Local Storage Only';
    syncTag.style.color = '#d97706';
  }

  // Tasks Table
  const tasksTbody = document.getElementById('viewTasksTableBody');
  tasksTbody.innerHTML = '';
  (report.tasks || []).forEach((task, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${idx + 1}</strong></td>
      <td><strong>${escapeHtml(task.name)}</strong></td>
      <td><span class="table-badge ${task.status === 'Byarangiye' ? 'emerald' : 'amber'}">${escapeHtml(task.status)}</span></td>
      <td>${escapeHtml(task.notes || '--')}</td>
    `;
    tasksTbody.appendChild(row);
  });

  // Issues Table
  const issuesTbody = document.getElementById('viewIssuesTableBody');
  issuesTbody.innerHTML = '';
  const issues = report.issues || [];
  if (issues.length === 0) {
    issuesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#059669;padding:0.75rem;">Nta kibazo cyangwa imbogamizi yagaragaye uyu munsi.</td></tr>`;
  } else {
    issues.forEach((issue, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${idx + 1}</strong></td>
        <td><span class="table-badge red">${escapeHtml(issue.severity)}</span></td>
        <td>${escapeHtml(issue.desc)}</td>
        <td>${escapeHtml(issue.action || '--')}</td>
      `;
      issuesTbody.appendChild(row);
    });
  }

  // Tomorrow Plan & Remarks
  document.getElementById('viewTomorrowPlan').textContent = report.tomorrowPlan || 'N/A';
  document.getElementById('viewRemarks').textContent = report.generalRemarks || 'Nta bindi bisobanuro.';

  // Photo Attachment
  const photoContainer = document.getElementById('viewPhotoContainer');
  if (report.photo) {
    photoContainer.classList.remove('hidden');
    document.getElementById('viewPhotoImg').src = report.photo;
  } else {
    photoContainer.classList.add('hidden');
  }

  // Signatures
  document.getElementById('viewSigReporter').textContent = report.reporterName;
  document.getElementById('viewSigSubmittedAt').textContent = report.submittedAt || report.date;

  document.getElementById('modalReportView').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeReportViewModal() {
  document.getElementById('modalReportView').classList.add('hidden');
}

function printReportDocument() {
  window.print();
}

/**
 * Preview Current Form Before Submitting
 */
function previewCurrentReport() {
  const form = document.getElementById('dailyReportForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const tasks = [];
  document.querySelectorAll('#tasksContainer .dynamic-row').forEach(r => {
    const name = r.querySelector('.task-name')?.value.trim();
    const status = r.querySelector('.task-status')?.value;
    const notes = r.querySelector('.task-notes')?.value.trim();
    if (name) tasks.push({ name, status, notes });
  });

  const issues = [];
  document.querySelectorAll('#issuesContainer .dynamic-row').forEach(r => {
    const severity = r.querySelector('.issue-severity')?.value;
    const desc = r.querySelector('.issue-desc')?.value.trim();
    const action = r.querySelector('.issue-action')?.value.trim();
    if (desc) issues.push({ severity, desc, action });
  });

  const previewObj = {
    id: "NSR-PREVIEW-DRAFT",
    date: document.getElementById('reportDate').value,
    shift: document.getElementById('reportShift').value,
    department: document.getElementById('department').value,
    reporterName: document.getElementById('reporterName').value.trim(),
    reporterPhone: document.getElementById('reporterPhone').value.trim(),
    siteZone: document.getElementById('siteZone').value.trim(),
    metricWorkers: document.getElementById('metricWorkers').value || 0,
    metricHours: document.getElementById('metricHours').value || 0,
    metricFuel: document.getElementById('metricFuel').value || 0,
    metricProduction: document.getElementById('metricProduction').value.trim(),
    tasks: tasks,
    issues: issues,
    tomorrowPlan: document.getElementById('tomorrowPlan').value.trim(),
    generalRemarks: document.getElementById('generalRemarks').value.trim(),
    photo: uploadedImageBase64,
    submittedAt: new Date().toLocaleString(),
    syncedToSheet: false
  };

  // Push temporarily, view, then remove
  reportsData.unshift(previewObj);
  viewReportDetails('NSR-PREVIEW-DRAFT');
  reportsData.shift();
}

/**
 * Resync Single Report to Google Sheet
 */
async function resyncSingleReport(reportId) {
  const report = reportsData.find(r => r.id === reportId);
  if (!report) return;

  if (!sheetConfig.webhookUrl) {
    showToast("Banza ushyiremo Webhook URL ya Google Sheet mu Igenamiterere!", "error");
    openGoogleSheetModal();
    return;
  }

  showToast(`Kohereza ${reportId} muri Google Sheet...`, "info");
  const success = await sendDataToGoogleSheetWebhook(report);
  if (success) {
    report.syncedToSheet = true;
    localStorage.setItem('nasho_reports_v2', JSON.stringify(reportsData));
    renderReportsTable();
    showToast(`Raporo ${reportId} yoherejwe neza muri Google Sheet!`, "success");
  } else {
    showToast("Guhuza byanze. Ongera ugerageze cyangwa ugenzure URL.", "error");
  }
}

/**
 * Delete Report
 */
function deleteReport(reportId) {
  if (confirm(`Ese wizeye neza ko ushaka gusiba raporo ${reportId}?`)) {
    reportsData = reportsData.filter(r => r.id !== reportId);
    localStorage.setItem('nasho_reports_v2', JSON.stringify(reportsData));
    renderReportsTable();
    updateDashboardKPIs();
    showToast("Raporo yasibwe neza.", "info");
  }
}

/**
 * Reset / Clear Form
 */
function resetForm() {
  document.getElementById('dailyReportForm').reset();
  document.getElementById('tasksContainer').innerHTML = '';
  document.getElementById('issuesContainer').innerHTML = '';
  removeUploadedImage();
  initFormDefaults();
  localStorage.removeItem('nasho_form_draft');
  showToast("Ifomu yahanaguwe.", "info");
}

/**
 * Form Auto-Save / Draft Persistence
 */
let autoSaveTimeout = null;
function debounceAutoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    const draft = {
      date: document.getElementById('reportDate')?.value,
      shift: document.getElementById('reportShift')?.value,
      department: document.getElementById('department')?.value,
      reporterName: document.getElementById('reporterName')?.value,
      reporterPhone: document.getElementById('reporterPhone')?.value,
      siteZone: document.getElementById('siteZone')?.value,
      metricWorkers: document.getElementById('metricWorkers')?.value,
      metricHours: document.getElementById('metricHours')?.value,
      metricFuel: document.getElementById('metricFuel')?.value,
      metricProduction: document.getElementById('metricProduction')?.value,
      tomorrowPlan: document.getElementById('tomorrowPlan')?.value,
      generalRemarks: document.getElementById('generalRemarks')?.value
    };
    localStorage.setItem('nasho_form_draft', JSON.stringify(draft));
  }, 1000);
}

function loadDraft() {
  const draftStr = localStorage.getItem('nasho_form_draft');
  if (!draftStr) {
    showToast("Nta nyandiko y'agateganyo (draft) ibitswe.", "info");
    return;
  }

  try {
    const draft = JSON.parse(draftStr);
    if (draft.date) document.getElementById('reportDate').value = draft.date;
    if (draft.shift) document.getElementById('reportShift').value = draft.shift;
    if (draft.department) document.getElementById('department').value = draft.department;
    if (draft.reporterName) document.getElementById('reporterName').value = draft.reporterName;
    if (draft.reporterPhone) document.getElementById('reporterPhone').value = draft.reporterPhone;
    if (draft.siteZone) document.getElementById('siteZone').value = draft.siteZone;
    if (draft.metricWorkers) document.getElementById('metricWorkers').value = draft.metricWorkers;
    if (draft.metricHours) document.getElementById('metricHours').value = draft.metricHours;
    if (draft.metricFuel) document.getElementById('metricFuel').value = draft.metricFuel;
    if (draft.metricProduction) document.getElementById('metricProduction').value = draft.metricProduction;
    if (draft.tomorrowPlan) document.getElementById('tomorrowPlan').value = draft.tomorrowPlan;
    if (draft.generalRemarks) document.getElementById('generalRemarks').value = draft.generalRemarks;

    showToast("Amakuru yari yanditswe yagarutse!", "success");
  } catch (e) {
    console.error(e);
  }
}

/**
 * Google Sheet Settings Modal Controller
 */
function openGoogleSheetModal() {
  const modal = document.getElementById('modalGoogleSheet');
  modal.classList.remove('hidden');

  document.getElementById('googleSheetWebhookUrl').value = sheetConfig.webhookUrl || '';
  document.getElementById('googleSheetDirectUrl').value = sheetConfig.directUrl || '';

  updateModalSheetStatus();
  if (window.lucide) lucide.createIcons();
}

function closeGoogleSheetModal() {
  document.getElementById('modalGoogleSheet').classList.add('hidden');
}

function updateModalSheetStatus() {
  const circle = document.getElementById('modalStatusCircle');
  const title = document.getElementById('modalStatusTitle');
  const desc = document.getElementById('modalStatusDesc');

  if (sheetConfig.webhookUrl) {
    circle.className = 'status-indicator-circle connected';
    title.textContent = "Google Sheet Yarahujwe (Connected)";
    desc.textContent = "Webhook URL yarangije gushyirwamo kandi yiteguye kwakira raporo.";
  } else {
    circle.className = 'status-indicator-circle';
    title.textContent = "Google Sheet Ntidahuje (Not Connected)";
    desc.textContent = "Koporora Webhook URL ya Apps Script uyishyire mu kazu kari hasi.";
  }
}

function updateSheetStatusBadge() {
  const dot = document.getElementById('sheetStatusDot');
  const text = document.getElementById('sheetStatusText');

  if (sheetConfig.webhookUrl) {
    dot.className = 'status-dot connected';
    text.textContent = translations[currentLanguage].sheet_connected;
  } else {
    dot.className = 'status-dot disconnected';
    text.textContent = translations[currentLanguage].sheet_not_connected;
  }
}

function saveGoogleSheetSettings() {
  const webhookUrl = document.getElementById('googleSheetWebhookUrl').value.trim();
  const directUrl = document.getElementById('googleSheetDirectUrl').value.trim();
  const autoSync = document.getElementById('autoSyncToGoogleSheet').checked;

  sheetConfig.webhookUrl = webhookUrl;
  sheetConfig.directUrl = directUrl;
  sheetConfig.autoSync = autoSync;

  localStorage.setItem('nasho_sheet_config', JSON.stringify(sheetConfig));
  updateSheetStatusBadge();
  closeGoogleSheetModal();
  showToast("Igenamiterere rya Google Sheet ryabitswe neza!", "success");
}

async function testGoogleSheetConnection() {
  const webhookUrl = document.getElementById('googleSheetWebhookUrl').value.trim();
  if (!webhookUrl) {
    showToast("Banza ushyiremo Webhook URL ya Google Apps Script!", "error");
    return;
  }

  showToast("Kugerageza kohereza ubutumwa bw'ikizamini...", "info");
  try {
    const testPayload = {
      id: "TEST-CONNECTION",
      date: new Date().toISOString().split('T')[0],
      shift: "Ikizamini",
      reporterName: "System Test",
      department: "Tekiniki",
      siteZone: "Nasho HQ",
      metricWorkers: 1,
      metricHours: 1,
      metricFuel: 0,
      tasksSummary: "Kugenzura niba urubuga ruhura neza na Google Sheet",
      issuesSummary: "Nta kibazo",
      tomorrowPlan: "Gukomeza akazi",
      submittedAt: new Date().toLocaleString()
    };

    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(testPayload)
    });

    showToast("Ubutumwa bwohejejwe muri Google Sheet! Reba niba umurongo mushya waje muri Sheet yawe.", "success");
  } catch (error) {
    showToast("Kugerageza byanze: " + error.message, "error");
  }
}

function toggleGuide() {
  const content = document.getElementById('guideContent');
  const chevron = document.getElementById('guideChevron');
  content.classList.toggle('open');
  chevron.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
}

function copyAppsScriptCode() {
  const code = document.getElementById('appsScriptCodeSample').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const copyText = document.getElementById('copyCodeText');
    copyText.textContent = "Code Yakoporowe! (Copied)";
    setTimeout(() => {
      copyText.textContent = "Koporora Code (Copy)";
    }, 3000);
    showToast("Code yakoporowe mu bubiko!", "success");
  });
}

/**
 * CSV / Excel Export Matching Google Sheets
 */
function exportDataToCsv() {
  if (reportsData.length === 0) {
    showToast("Nta raporo ihari yo gukuramo muri CSV!", "error");
    return;
  }

  const headers = [
    "ID ya Raporo", "Itariki", "Shift", "Utanga Raporo", "Telefone",
    "Ishami (Department)", "Ahakorewe (Site/Zone)", "Abakozi", "Amasaha",
    "Mazutu (Liters)", "Umusaruro", "Ibikorwa Byakozwe", "Imbogamizi n'Ibibazo",
    "Gahunda y'Ejo", "Icyitonderwa", "Yatanzwe Kuri"
  ];

  const rows = reportsData.map(r => [
    `"${r.id}"`,
    `"${r.date}"`,
    `"${(r.shift || '').replace(/"/g, '""')}"`,
    `"${(r.reporterName || '').replace(/"/g, '""')}"`,
    `"${(r.reporterPhone || '').replace(/"/g, '""')}"`,
    `"${(r.department || '').replace(/"/g, '""')}"`,
    `"${(r.siteZone || '').replace(/"/g, '""')}"`,
    r.metricWorkers || 0,
    r.metricHours || 0,
    r.metricFuel || 0,
    `"${(r.metricProduction || '').replace(/"/g, '""')}"`,
    `"${(r.tasksSummary || '').replace(/"/g, '""')}"`,
    `"${(r.issuesSummary || '').replace(/"/g, '""')}"`,
    `"${(r.tomorrowPlan || '').replace(/"/g, '""')}"`,
    `"${(r.generalRemarks || '').replace(/"/g, '""')}"`,
    `"${r.submittedAt || ''}"`
  ]);

  // Add BOM for UTF-8 in Excel
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Nasho_Daily_Reports_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Amadosiye ya CSV yakuruwemo neza!", "success");
}

/**
 * Backup / Restore JSON
 */
function exportBackupJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportsData, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `Nasho_Reports_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Backup ya JSON yabitswe neza!", "success");
}

function importBackupJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        reportsData = imported;
        localStorage.setItem('nasho_reports_v2', JSON.stringify(reportsData));
        renderReportsTable();
        updateDashboardKPIs();
        showToast("Raporo zose zagaruwe neza!", "success");
      } else {
        showToast("Idosiye si nziza (Invalid JSON array).", "error");
      }
    } catch (err) {
      showToast("Ikosa mu gusoma JSON: " + err.message, "error");
    }
  };
  reader.readAsText(file);
}

/**
 * Language Localization Switcher
 */
function initLanguage() {
  setLanguage(currentLanguage);
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('nasho_lang', lang);

  document.getElementById('btnLangRw').classList.toggle('active', lang === 'rw');
  document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');

  const dict = translations[lang] || translations.rw;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  updateSheetStatusBadge();
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
