/* ============================================================
   CivicConnect AI — Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ── STATE ──────────────────────────────────────────────────
  let uploadedFile = null;
  let aiResultVisible = false;
  let currentFilter = 'all';
  let complaints = [];

  // ── DOM REFS ───────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ── INIT ───────────────────────────────────────────────────
  function init() {
    complaints = loadComplaints();
    bindNav();
    bindTabBtns();
    bindUpload();
    bindReport();
    bindTrack();
    bindModal();
    bindHamburger();
    bindHeroCtas();
    buildBarChart();
  }

  // ── NAVIGATION ─────────────────────────────────────────────
  function bindNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const tab = link.dataset.tab;
        switchTab(tab);
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const heroSection = $('heroSection');
        const mainApp = $('mainApp');
        heroSection.style.display = 'none';
        mainApp.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function bindHeroCtas() {
    document.querySelectorAll('.tab-trigger').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const tab = btn.dataset.tab;
        $('heroSection').style.display = 'none';
        switchTab(tab);
        $('mainApp').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function bindHamburger() {
    const ham = $('hamburger');
    const menu = $('mobileMenu');
    ham.addEventListener('click', () => menu.classList.toggle('open'));
    document.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const tab = link.dataset.tab;
        menu.classList.remove('open');
        $('heroSection').style.display = 'none';
        switchTab(tab);
        $('mainApp').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ── TABS ───────────────────────────────────────────────────
  function bindTabBtns() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'tab-' + tab);
    });
    if (tab === 'track') renderComplaints();
  }

  // ── UPLOAD ─────────────────────────────────────────────────
  function bindUpload() {
    const area     = $('uploadArea');
    const content  = $('uploadContent');
    const preview  = $('uploadPreview');
    const imgEl    = $('previewImg');
    const input    = $('fileInput');
    const uploadBtn = $('uploadBtn');
    const removeBtn = $('removePhoto');

    uploadBtn.addEventListener('click', e => { e.stopPropagation(); input.click(); });
    area.addEventListener('click', () => { if (!uploadedFile) input.click(); });

    input.addEventListener('change', () => {
      if (input.files[0]) handleFile(input.files[0]);
    });

    // Drag & drop
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
      else showToast('Please drop an image file.', 'error');
    });

    removeBtn.addEventListener('click', e => {
      e.stopPropagation();
      uploadedFile = null;
      imgEl.src = '';
      preview.style.display = 'none';
      content.style.display = 'flex';
      input.value = '';
      hideAiResult();
    });

    function handleFile(file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File too large. Please use an image under 10 MB.', 'error');
        return;
      }
      uploadedFile = file;
      const reader = new FileReader();
      reader.onload = ev => {
        imgEl.src = ev.target.result;
        content.style.display = 'none';
        preview.style.display = 'block';
        // Auto-detect category from filename
        autoDetectCategory(file.name);
        showToast('Photo uploaded. Click "Analyze with AI" to continue.');
      };
      reader.readAsDataURL(file);
    }

    function autoDetectCategory(filename) {
      const detected = detectIssueFromText('', filename);
      if (detected !== 'other') {
        const sel = $('issueCategory');
        if (!sel.value) {
          sel.value = detected;
        }
      }
    }
  }

  // ── REPORT FORM ────────────────────────────────────────────
  function bindReport() {
    $('analyzeBtn').addEventListener('click', analyzeIssue);
    $('clearBtn').addEventListener('click', clearForm);
    $('submitBtn').addEventListener('click', submitComplaint);
  }

  function analyzeIssue() {
    const cat   = $('issueCategory').value;
    const desc  = $('issueDesc').value.trim();
    const loc   = $('issueLocation').value.trim();
    const sev   = $('issueSeverity').value;

    if (!cat && !desc && !uploadedFile) {
      showToast('Please upload a photo, select a category, or describe the issue.', 'error');
      return;
    }

    // Set analyzing state
    const btn = $('analyzeBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> <span>Analyzing…</span>';

    setTimeout(() => {
      // Determine category
      let key = cat || detectIssueFromText(desc, uploadedFile ? uploadedFile.name : '');
      if (!key || key === '') key = 'other';
      const data = AI_ROUTING[key] || AI_ROUTING.other;

      // Score
      const score = calcPriority(data.baseScore, sev || 'medium');
      const label = getPriorityLabel(score);
      const similar = Math.floor(Math.random() * 5);

      // Populate result
      $('aiIssueType').textContent   = data.label;
      $('aiDept').textContent        = data.dept;
      $('aiScore').textContent       = score + ' / 10';
      $('aiEta').textContent         = data.eta;
      $('aiSimilar').textContent     = similar > 0 ? similar + ' report' + (similar > 1 ? 's' : '') + ' nearby' : 'None nearby';
      $('aiConfidence').textContent  = data.confidence + '%';
      $('aiTip').textContent         = data.tip;

      const badge = $('priorityBadge');
      badge.textContent = label + ' priority';
      badge.className = 'priority-badge ' + label.toLowerCase();

      $('aiResult').style.display = 'block';
      aiResultVisible = true;

      // Store temp result on window for submission
      window._pendingAI = { key, data, score, label, similar };

      // If category was auto-detected, update dropdown
      if (!$('issueCategory').value) {
        $('issueCategory').value = key;
      }

      btn.disabled = false;
      btn.innerHTML = '<span class="btn-icon">✦</span><span>Re-analyze</span>';
      $('aiResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1800);
  }

  function submitComplaint() {
    const cat      = $('issueCategory').value;
    const desc     = $('issueDesc').value.trim();
    const loc      = $('issueLocation').value.trim();
    const sev      = $('issueSeverity').value;
    const phone    = $('issuePhone').value.trim();

    if (!cat && !desc) {
      showToast('Please fill in at least the category or description.', 'error');
      return;
    }
    if (!loc) {
      showToast('Please enter the location of the issue.', 'error');
      return;
    }
    if (!aiResultVisible) {
      showToast('Please run the AI analysis before submitting.', 'error');
      return;
    }

    const ai   = window._pendingAI || {};
    const data = ai.data || AI_ROUTING[cat] || AI_ROUTING.other;
    const key  = ai.key || cat || 'other';

    const complaint = {
      id:            genId(),
      title:         desc.length > 0
        ? (desc.length > 60 ? desc.slice(0, 60) + '…' : desc)
        : data.label + (loc ? ' at ' + loc : ''),
      category:      key,
      area:          loc,
      description:   desc || 'No description provided.',
      phone:         phone,
      date:          new Date().toISOString().slice(0, 10),
      status:        'pending',
      dept:          data.dept,
      eta:           'Pending — ' + data.eta,
      priorityScore: ai.score || 5.0,
      priorityLabel: ai.label || 'Medium',
      aiConfidence:  data.confidence,
      similar:       ai.similar || 0,
      timeline: [
        { event: 'Complaint submitted', time: new Date().toLocaleString('en-IN'), done: true },
        { event: 'AI classified and routed to ' + data.dept, time: new Date().toLocaleString('en-IN'), done: true },
        { event: 'Department review in progress', time: 'Pending', done: false },
        { event: 'Field team inspection', time: 'Scheduled', done: false },
        { event: 'Resolution and closure', time: 'Estimated: ' + data.eta, done: false }
      ]
    };

    saveComplaint(complaint);
    complaints = loadComplaints();

    showToast('✓ Complaint ' + complaint.id + ' submitted successfully!', 'success');
    clearForm();
    hideAiResult();

    // Switch to track tab after 1.5s
    setTimeout(() => {
      switchTab('track');
      $('mainApp').scrollIntoView({ behavior: 'smooth' });
    }, 1600);
  }

  function clearForm() {
    ['issueCategory', 'issueLocation', 'issueDesc', 'issueSeverity', 'issuePhone'].forEach(id => {
      $(id).value = '';
    });
    uploadedFile = null;
    $('previewImg').src = '';
    $('uploadPreview').style.display = 'none';
    $('uploadContent').style.display = 'flex';
    $('fileInput').value = '';
    hideAiResult();
    $('analyzeBtn').innerHTML = '<span class="btn-icon">✦</span><span>Analyze with AI</span>';
    $('analyzeBtn').disabled = false;
    window._pendingAI = null;
  }

  function hideAiResult() {
    $('aiResult').style.display = 'none';
    aiResultVisible = false;
  }

  // ── TRACK TAB ──────────────────────────────────────────────
  function bindTrack() {
    $('searchInput').addEventListener('input', renderComplaints);

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderComplaints();
      });
    });
  }

  function renderComplaints() {
    const grid = $('complaintsGrid');
    const q    = $('searchInput').value.toLowerCase().trim();

    let list = complaints.filter(c => {
      if (currentFilter !== 'all') {
        const s = c.status === 'progress' ? 'progress' : c.status;
        if (s !== currentFilter) return false;
      }
      if (q) {
        const searchable = (c.id + c.title + c.area + c.category + c.description).toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });

    if (!list.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px 0; color:var(--muted);">
          <div style="font-size:32px; margin-bottom:10px;">🔍</div>
          <div style="font-size:15px; font-weight:500; color:var(--ink-3);">No complaints found</div>
          <div style="font-size:13px; margin-top:4px;">Try adjusting the search or filter</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(c => {
      const statusLabel = c.status === 'progress' ? 'In progress'
        : c.status.charAt(0).toUpperCase() + c.status.slice(1);
      const barClass = 'bar-' + c.status;
      const badgeClass = 'status-' + c.status;
      return `
        <div class="complaint-card" data-id="${c.id}" role="button" tabindex="0" aria-label="View complaint ${c.id}">
          <div class="cc-top">
            <span class="cc-id">${c.id}</span>
            <span class="status-badge ${badgeClass}">${statusLabel}</span>
          </div>
          <div class="cc-title">${c.title}</div>
          <div class="cc-meta">
            <span>📍 ${c.area}</span>
            <span>📅 ${fmtDate(c.date)}</span>
            <span>🏢 ${c.dept}</span>
          </div>
          <div class="cc-progress">
            <div class="cc-bar ${barClass}"></div>
          </div>
          <div class="cc-eta">${c.eta}</div>
        </div>
      `;
    }).join('');

    // Bind click on each card
    grid.querySelectorAll('.complaint-card').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openModal(card.dataset.id);
      });
    });
  }

  // ── MODAL ──────────────────────────────────────────────────
  function bindModal() {
    $('modalClose').addEventListener('click', closeModal);
    $('modalOverlay').addEventListener('click', e => {
      if (e.target === $('modalOverlay')) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openModal(id) {
    const c = complaints.find(x => x.id === id);
    if (!c) return;

    const statusLabel = c.status === 'progress' ? 'In progress'
      : c.status.charAt(0).toUpperCase() + c.status.slice(1);
    const badgeClass = 'status-' + c.status;
    const priorityColor = c.priorityLabel === 'Critical' ? '#A32D2D'
      : c.priorityLabel === 'High' ? '#854F0B'
      : c.priorityLabel === 'Medium' ? '#185FA5'
      : '#3B6D11';

    const tlHtml = (c.timeline || []).map((t, i) => `
      <div class="tl-item">
        <div class="tl-dot ${t.done ? '' : 'empty'}"></div>
        <div>
          <div class="tl-label">${t.event}</div>
          <div class="tl-time">${t.time}</div>
        </div>
      </div>
    `).join('');

    $('modalBody').innerHTML = `
      <div class="modal-id">${c.id}</div>
      <div class="modal-title">${c.title}</div>
      <div class="modal-status">
        <span class="status-badge ${badgeClass}">${statusLabel}</span>
        &nbsp;
        <span class="priority-badge ${c.priorityLabel.toLowerCase()}">${c.priorityLabel} priority</span>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Description</div>
        <div class="modal-section-val">${c.description}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        <div class="ai-field">
          <span class="ai-field-label">Location</span>
          <span class="ai-field-value">${c.area}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">Reported on</span>
          <span class="ai-field-value">${fmtDate(c.date)}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">Assigned to</span>
          <span class="ai-field-value">${c.dept}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">Resolution ETA</span>
          <span class="ai-field-value">${c.eta}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">AI priority score</span>
          <span class="ai-field-value" style="color:${priorityColor}">${c.priorityScore} / 10</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">AI confidence</span>
          <span class="ai-field-value">${c.aiConfidence}%</span>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Status timeline</div>
        <div class="timeline">${tlHtml}</div>
      </div>
    `;

    $('modalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $('modalOverlay').style.display = 'none';
    document.body.style.overflow = '';
  }

  // ── DASHBOARD CHART ────────────────────────────────────────
  function buildBarChart() {
    const data = [
      { label: 'Potholes',     count: 384, color: '#1D9E75' },
      { label: 'Streetlights', count: 271, color: '#378ADD' },
      { label: 'Garbage',      count: 237, color: '#F4A92A' },
      { label: 'Water leaks',  count: 174, color: '#7F77DD' },
      { label: 'Sewage',       count: 108, color: '#D85A30' },
      { label: 'Other',        count: 110, color: '#888780' }
    ];
    const max = Math.max(...data.map(d => d.count));
    $('barChart').innerHTML = data.map(d => `
      <div class="bar-row">
        <span class="bar-lbl">${d.label}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.round(d.count / max * 100)}%; background:${d.color};"></div>
        </div>
        <span class="bar-val">${d.count}</span>
      </div>
    `).join('');
  }

  // ── TOAST ──────────────────────────────────────────────────
  function showToast(msg, type) {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'toast'; }, 3500);
  }

  // ── BOOT ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

})();
