/* app.js – Resume & Cover Letter Builder */

// ── Tab switching ─────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
  });
});

// ── Helpers ───────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function show(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? '' : 'none';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// ── Dynamic entry blocks (Experience / Education) ─────────────────────
function addEntry(listId, templateId, updateFn) {
  const list = document.getElementById(listId);
  const tmpl = document.getElementById(templateId);
  const clone = tmpl.content.cloneNode(true);
  const block = clone.querySelector('.entry-block');

  // Remove button
  block.querySelector('.remove-btn').addEventListener('click', () => {
    block.remove();
    updateFn();
  });

  // Live update on any input change
  block.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', updateFn);
  });

  list.appendChild(block);
  updateFn();
}

document.getElementById('add-experience').addEventListener('click', () =>
  addEntry('experience-list', 'tmpl-experience', updateResumePreview)
);

document.getElementById('add-education').addEventListener('click', () =>
  addEntry('education-list', 'tmpl-education', updateResumePreview)
);

// ── Resume live preview ───────────────────────────────────────────────
function updateResumePreview() {
  const name     = val('r-name')     || 'Your Name';
  const title    = val('r-title');
  const email    = val('r-email');
  const phone    = val('r-phone');
  const location = val('r-location');
  const linkedin = val('r-linkedin');
  const summary  = val('r-summary');
  const skills   = val('r-skills');

  // Header
  setText('pv-r-name', name);
  setText('pv-r-title', title);

  // Contact chips
  const contactItems = [email, phone, location, linkedin].filter(Boolean);
  setHtml('pv-r-contact', contactItems.map(c => `<span>${esc(c)}</span>`).join(''));

  // Summary
  show('pv-r-summary-sec', !!summary);
  setText('pv-r-summary', summary);

  // Experience
  const expBlocks = document.querySelectorAll('#experience-list .entry-block');
  let expHtml = '';
  expBlocks.forEach(block => {
    const jobTitle = block.querySelector('.exp-jobtitle').value.trim();
    const company  = block.querySelector('.exp-company').value.trim();
    const start    = block.querySelector('.exp-start').value.trim();
    const end      = block.querySelector('.exp-end').value.trim();
    const desc     = block.querySelector('.exp-desc').value.trim();
    if (!jobTitle && !company) return;
    const dateRange = [start, end].filter(Boolean).join(' – ');
    expHtml += `
      <div class="rdoc-exp-item">
        <div class="rdoc-item-header">
          <span class="rdoc-item-title">${esc(jobTitle)}</span>
          <span class="rdoc-item-date">${esc(dateRange)}</span>
        </div>
        ${company ? `<div class="rdoc-item-sub">${esc(company)}</div>` : ''}
        ${desc ? `<div class="rdoc-item-desc">${esc(desc)}</div>` : ''}
      </div>`;
  });
  show('pv-r-exp-sec', !!expHtml);
  setHtml('pv-r-experience', expHtml);

  // Education
  const eduBlocks = document.querySelectorAll('#education-list .entry-block');
  let eduHtml = '';
  eduBlocks.forEach(block => {
    const degree      = block.querySelector('.edu-degree').value.trim();
    const institution = block.querySelector('.edu-institution').value.trim();
    const start       = block.querySelector('.edu-start').value.trim();
    const end         = block.querySelector('.edu-end').value.trim();
    if (!degree && !institution) return;
    const dateRange = [start, end].filter(Boolean).join(' – ');
    eduHtml += `
      <div class="rdoc-edu-item">
        <div class="rdoc-item-header">
          <span class="rdoc-item-title">${esc(degree)}</span>
          <span class="rdoc-item-date">${esc(dateRange)}</span>
        </div>
        ${institution ? `<div class="rdoc-item-sub">${esc(institution)}</div>` : ''}
      </div>`;
  });
  show('pv-r-edu-sec', !!eduHtml);
  setHtml('pv-r-education', eduHtml);

  // Skills
  const skillTags = skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<span class="rdoc-skill-tag">${esc(s)}</span>`)
    .join('');
  show('pv-r-skills-sec', !!skillTags);
  setHtml('pv-r-skills', skillTags);
}

// Attach listeners for static resume fields
[
  'r-name', 'r-title', 'r-email', 'r-phone',
  'r-location', 'r-linkedin', 'r-summary', 'r-skills'
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateResumePreview);
});

// ── Cover Letter live preview ─────────────────────────────────────────
function updateCoverLetterPreview() {
  const name           = val('cl-name')           || 'Your Name';
  const email          = val('cl-email');
  const phone          = val('cl-phone');
  const location       = val('cl-location');
  const dateVal        = val('cl-date');
  const hiringManager  = val('cl-hiring-manager');
  const company        = val('cl-company');
  const companyAddress = val('cl-company-address');
  const position       = val('cl-position');
  const opening        = val('cl-opening');
  const body           = val('cl-body');
  const closing        = val('cl-closing');

  setText('pv-cl-name', name);
  setText('pv-cl-sign-name', name);

  // Contact line
  const contactParts = [email, phone, location].filter(Boolean);
  setText('pv-cl-contact', contactParts.join(' • '));

  // Date
  if (dateVal) {
    const formatted = new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    setText('pv-cl-date', formatted);
  } else {
    setText('pv-cl-date', '');
  }

  // Recipient block
  const recipientLines = [
    hiringManager,
    company,
    companyAddress
  ].filter(Boolean);
  setHtml(
    'pv-cl-recipient',
    recipientLines.map(l => `<p>${esc(l)}</p>`).join('')
  );

  // Salutation
  const salutation = hiringManager
    ? `Dear ${hiringManager},`
    : 'Dear Hiring Manager,';
  setText('pv-cl-salutation', salutation);

  // Opening with auto-fill placeholder
  let openingText = opening;
  if (!openingText && (company || position)) {
    openingText =
      `I am writing to express my strong interest in the ${position || '[Position]'} role at ` +
      `${company || '[Company]'}. I am confident that my background and skills make me a strong candidate.`;
  }
  setText('pv-cl-opening', openingText);
  setText('pv-cl-bodytext', body);
  setText('pv-cl-closing', closing);
}

// Attach listeners for cover letter fields
[
  'cl-name', 'cl-email', 'cl-phone', 'cl-location', 'cl-date',
  'cl-hiring-manager', 'cl-company', 'cl-company-address',
  'cl-position', 'cl-opening', 'cl-body', 'cl-closing'
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateCoverLetterPreview);
});

// Set default date for cover letter
(function setDefaultDate() {
  const dateInput = document.getElementById('cl-date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
})();

// ── Print handlers ────────────────────────────────────────────────────
document.getElementById('print-resume').addEventListener('click', () => {
  // Temporarily hide cover letter preview so only resume prints
  const clTab = document.getElementById('coverletter-tab');
  clTab.style.display = 'none';
  window.print();
  clTab.style.display = '';
});

document.getElementById('print-coverletter').addEventListener('click', () => {
  // Temporarily hide resume preview so only cover letter prints
  const rTab = document.getElementById('resume-tab');
  rTab.style.display = 'none';
  window.print();
  rTab.style.display = '';
});

// ── Initial render ────────────────────────────────────────────────────
updateResumePreview();
updateCoverLetterPreview();
