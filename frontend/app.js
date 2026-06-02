const STORAGE_KEY = 'meudisci_session';
const API_URL = (window.MEUDISCI_API_URL || window.location.href).trim();

const ui = {
  loginSection: document.getElementById('loginSection'),
  discipleDashboard: document.getElementById('discipleDashboard'),
  adminDashboard: document.getElementById('adminDashboard'),
  feedback: document.getElementById('loginFeedback'),
  tabDisciple: document.getElementById('tabDisciple'),
  tabAdmin: document.getElementById('tabAdmin'),
  discipleForm: document.getElementById('discipleForm'),
  adminForm: document.getElementById('adminForm'),
  installAppBtn: document.getElementById('installAppBtn'),
  installAppActionButtons: document.querySelectorAll('[data-action="install-app"]'),
  greeting: document.getElementById('greeting'),
  discipleMentor: document.getElementById('discipleMentor'),
  discipleLast: document.getElementById('discipleLast'),
  discipleNext: document.getElementById('discipleNext'),
  discipleGoal: document.getElementById('discipleGoal'),
  discipleMetaSecondary: document.querySelector('.meta-secondary'),
  noScheduleAlert: document.getElementById('noScheduleAlert'),
  scheduleBtn: document.getElementById('scheduleBtn'),
  viewMySchedulesBtn: document.getElementById('viewMySchedulesBtn'),
  statTotal: document.getElementById('statTotal'),
  statScheduled: document.getElementById('statScheduled'),
  statWithout: document.getElementById('statWithout'),
  adminGreeting: document.getElementById('adminGreeting'),
  toggleAdminListScope: document.getElementById('toggleAdminListScope'),
  openNoScheduleModal: document.getElementById('openNoScheduleModal'),
  noScheduleModal: document.getElementById('noScheduleModal'),
  closeNoScheduleModal: document.getElementById('closeNoScheduleModal'),
  noScheduleList: document.getElementById('noScheduleList'),
  viewScheduledBtn: document.getElementById('viewScheduledBtn'),
  adminList: document.getElementById('adminList'),
  scheduledModal: document.getElementById('scheduledModal'),
  closeScheduledModal: document.getElementById('closeScheduledModal'),
  scheduledSummary: document.getElementById('scheduledSummary'),
  scheduledList: document.getElementById('scheduledList'),
  discipleScheduledModal: document.getElementById('discipleScheduledModal'),
  closeDiscipleScheduledModal: document.getElementById('closeDiscipleScheduledModal'),
  discipleScheduledSummary: document.getElementById('discipleScheduledSummary'),
  discipleScheduledList: document.getElementById('discipleScheduledList'),
  confirmModal: document.getElementById('confirmModal'),
  confirmModalTitle: document.getElementById('confirmModalTitle'),
  confirmModalMessage: document.getElementById('confirmModalMessage'),
  confirmModalCancel: document.getElementById('confirmModalCancel'),
  confirmModalConfirm: document.getElementById('confirmModalConfirm'),
  addDiscipleBtn: document.getElementById('addDiscipleBtn'),
  addDiscipleModal: document.getElementById('addDiscipleModal'),
  closeAddDiscipleModal: document.getElementById('closeAddDiscipleModal'),
  addDiscipleForm: document.getElementById('addDiscipleForm'),
  addDiscipleFeedback: document.getElementById('addDiscipleFeedback'),
  saveNewDiscipleBtn: document.getElementById('saveNewDiscipleBtn'),
  logoutDisciple: document.getElementById('logoutDisciple'),
  topLogoutBtn: document.getElementById('topLogoutBtn'),
  logoutAdmin: document.getElementById('logoutAdmin'),
  navHomeBtn: document.getElementById('navHomeBtn'),
  navDisciplesBtn: document.getElementById('navDisciplesBtn'),
  navAgendaBtn: document.getElementById('navAgendaBtn'),
  adminNavHomeBtn: document.getElementById('adminNavHomeBtn'),
  adminNavDisciplesBtn: document.getElementById('adminNavDisciplesBtn'),
  adminNavAgendaBtn: document.getElementById('adminNavAgendaBtn'),
  adminNavAddBtn: document.getElementById('adminNavAddBtn'),
  adminDisciplesModal: document.getElementById('adminDisciplesModal'),
  closeAdminDisciplesModal: document.getElementById('closeAdminDisciplesModal'),
  adminDisciplesModalList: document.getElementById('adminDisciplesModalList'),
  editDiscipleModal: document.getElementById('editDiscipleModal'),
  closeEditDiscipleModal: document.getElementById('closeEditDiscipleModal'),
  editDiscipleForm: document.getElementById('editDiscipleForm'),
  saveEditedDiscipleBtn: document.getElementById('saveEditedDiscipleBtn'),
  editDiscipleRowId: document.getElementById('editDiscipleRowId'),
  editDiscipleName: document.getElementById('editDiscipleName'),
  editDiscipleEmail: document.getElementById('editDiscipleEmail'),
  editDiscipleSigla: document.getElementById('editDiscipleSigla'),
  editDiscipleSenha: document.getElementById('editDiscipleSenha'),
  editDiscipleMentor: document.getElementById('editDiscipleMentor'),
  editDiscipleLeader: document.getElementById('editDiscipleLeader'),
  editDiscipleFeedback: document.getElementById('editDiscipleFeedback'),
};

let runtimeState = {
  role: null,
  token: null,
  scheduleUrl: '',
  adminDisciples: [],
  scheduledEvents: [],
  discipleScheduledEvents: [],
  adminName: '',
  showAllAdminList: false,
};

let confirmModalResolver = null;
let toastTimer = null;
let deferredInstallPrompt = null;

function ensureToastContainer_() {
  let container = document.getElementById('appToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'appToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type) {
  const tone = type || 'success';
  const container = ensureToastContainer_();
  const toast = document.createElement('div');
  toast.className = `toast toast-${tone}`;
  toast.textContent = String(message || '').trim();
  container.innerHTML = '';
  container.appendChild(toast);

  if (navigator.vibrate) {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      if (tone === 'error') {
        navigator.vibrate([40, 30, 40]);
      } else if (tone === 'info') {
        navigator.vibrate(22);
      } else {
        navigator.vibrate([18, 28, 18]);
      }
    }
  }

  window.requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function ensureLoadingOverlay_() {
  let overlay = document.getElementById('appLoadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'appLoadingOverlay';
    overlay.className = 'app-loading-overlay hidden';
    overlay.innerHTML = `
      <div class="app-loading-box" role="status" aria-live="polite">
        <span class="app-loading-spinner" aria-hidden="true"></span>
        <span id="appLoadingMessage">Carregando...</span>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showLoading(message) {
  const overlay = ensureLoadingOverlay_();
  const msgEl = overlay.querySelector('#appLoadingMessage');
  if (msgEl) {
    msgEl.textContent = message || 'Carregando...';
  }
  overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = ensureLoadingOverlay_();
  overlay.classList.add('hidden');
}

function updateInstallButton_() {
  if (!ui.installAppActionButtons || !ui.installAppActionButtons.length) {
    return;
  }
  const hasPrompt = Boolean(deferredInstallPrompt);
  ui.installAppActionButtons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }
    button.title = hasPrompt ? 'Instalar app' : 'Instalação pode não estar disponível neste dispositivo';
  });
}

async function handleInstallApp() {
  if (!deferredInstallPrompt) {
    showToast('Instalação não disponível neste dispositivo.', 'info');
    return;
  }

  deferredInstallPrompt.prompt();
  try {
    const choice = await deferredInstallPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      showToast('App instalado com sucesso!', 'success');
    } else {
      showToast('Instalação cancelada.', 'info');
    }
  } finally {
    deferredInstallPrompt = null;
    updateInstallButton_();
  }
}

function setActiveTab(role) {
  const disciple = role === 'disciple';
  ui.tabDisciple.classList.toggle('active', disciple);
  ui.tabAdmin.classList.toggle('active', !disciple);
  ui.discipleForm.classList.toggle('active', disciple);
  ui.adminForm.classList.toggle('active', !disciple);
  ui.loginSection.classList.toggle('login-role-disciple', disciple);
  ui.loginSection.classList.toggle('login-role-admin', !disciple);
  ui.adminForm.setAttribute('aria-hidden', String(disciple));
  ui.discipleForm.setAttribute('aria-hidden', String(!disciple));
  ui.feedback.textContent = '';
  ui.feedback.style.color = '';
  ui.feedback.classList.remove('feedback-loading', 'feedback-success', 'feedback-error');
}

function setLoginFeedback_(message, tone) {
  ui.feedback.classList.remove('feedback-loading', 'feedback-success', 'feedback-error');
  ui.feedback.textContent = message || '';
  if (tone === 'success') {
    ui.feedback.style.color = '#1f7b5b';
    void ui.feedback.offsetWidth;
    ui.feedback.classList.add('feedback-success');
    return;
  }
  if (tone === 'error') {
    ui.feedback.style.color = '#c03737';
    void ui.feedback.offsetWidth;
    ui.feedback.classList.add('feedback-error');
    return;
  }
  ui.feedback.style.color = '';
  if (tone === 'info') {
    void ui.feedback.offsetWidth;
    ui.feedback.classList.add('feedback-loading');
  }
}

async function apiCall(action, payload) {
  return jsonpCall(action, payload);
}

function jsonpCall(action, payload) {
  return new Promise((resolve, reject) => {
    const callbackName = `meudisci_jsonp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const params = new URLSearchParams({
      action,
      payload: JSON.stringify(payload || {}),
      callback: callbackName,
      _: String(Date.now()),
    });
    const separator = API_URL.includes('?') ? '&' : '?';
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Tempo limite da requisição excedido.'));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Falha de comunicação com a API.'));
    };

    script.src = `${API_URL}${separator}${params.toString()}`;
    document.body.appendChild(script);
  });
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  runtimeState = {
    role: null,
    token: null,
    scheduleUrl: '',
    adminDisciples: [],
    scheduledEvents: [],
    discipleScheduledEvents: [],
    adminName: '',
    showAllAdminList: false,
  };
}

function restoreSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_err) {
    clearSession();
    return null;
  }
}

function showLogin() {
  ui.loginSection.classList.remove('hidden');
  ui.discipleDashboard.classList.add('hidden');
  ui.adminDashboard.classList.add('hidden');
  document.body.classList.remove('disciple-view');
  document.body.classList.remove('admin-view');
}

function showDiscipleDashboard() {
  ui.loginSection.classList.add('hidden');
  ui.discipleDashboard.classList.remove('hidden');
  ui.adminDashboard.classList.add('hidden');
  document.body.classList.add('disciple-view');
  document.body.classList.remove('admin-view');
}

function showAdminDashboard() {
  ui.loginSection.classList.add('hidden');
  ui.discipleDashboard.classList.add('hidden');
  ui.adminDashboard.classList.remove('hidden');
  document.body.classList.remove('disciple-view');
  document.body.classList.add('admin-view');
}

function openAddDiscipleModal() {
  ui.addDiscipleFeedback.style.color = '';
  ui.addDiscipleFeedback.textContent = '';
  ui.addDiscipleForm.reset();
  ui.addDiscipleModal.classList.remove('hidden');
  ui.addDiscipleModal.setAttribute('aria-hidden', 'false');
}

function closeAddDiscipleModal() {
  ui.addDiscipleModal.classList.add('hidden');
  ui.addDiscipleModal.setAttribute('aria-hidden', 'true');
}

async function openScheduledModal() {
  ui.scheduledSummary.textContent = 'Carregando agendamentos...';
  ui.scheduledList.innerHTML = '';
  ui.scheduledModal.classList.remove('hidden');
  ui.scheduledModal.setAttribute('aria-hidden', 'false');

  let result;
  try {
    result = await apiCall('getScheduledEvents', { token: runtimeState.token });
  } catch (_error) {
    ui.scheduledSummary.textContent = 'Não foi possível carregar os agendamentos.';
    ui.scheduledList.innerHTML = '<p class="scheduled-empty">Falha de comunicação com a API.</p>';
    return;
  }

  if (!result.ok) {
    ui.scheduledSummary.textContent = result.error || 'Não foi possível carregar os agendamentos.';
    ui.scheduledList.innerHTML = '<p class="scheduled-empty">Tente novamente em instantes.</p>';
    return;
  }

  runtimeState.scheduledEvents = result.data && result.data.events ? result.data.events : [];
  renderScheduledList();
}

function closeScheduledModal() {
  ui.scheduledModal.classList.add('hidden');
  ui.scheduledModal.setAttribute('aria-hidden', 'true');
}

function openNoScheduleModalFn() {
  const semAgenda = runtimeState.adminDisciples.filter(
    (d) => !String(d.proximoDisci || '').trim()
  );
  ui.noScheduleList.innerHTML = '';
  if (!semAgenda.length) {
    ui.noScheduleList.innerHTML = '<p class="scheduled-empty">Nenhum discípulo sem agenda. 🎉</p>';
  } else {
    semAgenda.forEach((d) => {
      const item = document.createElement('div');
      item.className = 'scheduled-item';
      item.innerHTML = `<strong>${d.nome || '—'}</strong>`;
      ui.noScheduleList.appendChild(item);
    });
  }
  ui.noScheduleModal.classList.remove('hidden');
  ui.noScheduleModal.setAttribute('aria-hidden', 'false');
}

function closeNoScheduleModalFn() {
  ui.noScheduleModal.classList.add('hidden');
  ui.noScheduleModal.setAttribute('aria-hidden', 'true');
}

async function openDiscipleScheduledModal() {
  ui.discipleScheduledSummary.textContent = 'Carregando agendamentos...';
  ui.discipleScheduledList.innerHTML = '';
  ui.discipleScheduledModal.classList.remove('hidden');
  ui.discipleScheduledModal.setAttribute('aria-hidden', 'false');

  let result;
  try {
    result = await apiCall('getDiscipleScheduledEvents', { token: runtimeState.token });
  } catch (_error) {
    ui.discipleScheduledSummary.textContent = 'Você não possui agendamentos!';
    ui.discipleScheduledList.innerHTML = '<p class="scheduled-empty">Você não possui agendamentos!</p>';
    return;
  }

  if (!result.ok) {
    ui.discipleScheduledSummary.textContent = 'Você não possui agendamentos!';
    ui.discipleScheduledList.innerHTML = '<p class="scheduled-empty">Você não possui agendamentos!</p>';
    return;
  }

  runtimeState.discipleScheduledEvents = result.data && result.data.events ? result.data.events : [];
  renderDiscipleScheduledList();
}

function closeDiscipleScheduledModal() {
  ui.discipleScheduledModal.classList.add('hidden');
  ui.discipleScheduledModal.setAttribute('aria-hidden', 'true');
}

function closeConfirmModal(result) {
  ui.confirmModal.classList.add('hidden');
  ui.confirmModal.setAttribute('aria-hidden', 'true');
  ui.confirmModalTitle.textContent = 'Confirmar Exclusão';
  ui.confirmModalConfirm.textContent = 'Excluir';
  ui.confirmModalCancel.textContent = 'Cancelar';
  ui.confirmModalCancel.classList.remove('hidden');
  ui.confirmModalConfirm.classList.remove('btn-danger');
  if (typeof confirmModalResolver === 'function') {
    const resolve = confirmModalResolver;
    confirmModalResolver = null;
    resolve(result);
  }
}

function openConfirmModal(message, options) {
  const config = options || {};
  const dangerConfirm = config.dangerConfirm !== undefined ? config.dangerConfirm : true;
  ui.confirmModalTitle.textContent = config.title || 'Confirmar Exclusão';
  ui.confirmModalMessage.textContent = message || 'Deseja realmente excluir este agendamento?';
  ui.confirmModalConfirm.textContent = config.confirmText || 'Excluir';
  ui.confirmModalCancel.textContent = config.cancelText || 'Cancelar';
  ui.confirmModalCancel.classList.toggle('hidden', Boolean(config.hideCancel));
  ui.confirmModalConfirm.classList.toggle('btn-danger', dangerConfirm);
  ui.confirmModal.classList.remove('hidden');
  ui.confirmModal.setAttribute('aria-hidden', 'false');
  return new Promise((resolve) => {
    confirmModalResolver = resolve;
  });
}

async function openPopupMessage(message, title) {
  await openConfirmModal(message, {
    title: title || 'Aviso',
    confirmText: 'OK',
    hideCancel: true,
    dangerConfirm: false,
  });
}

function renderScheduledList() {
  const scheduled = runtimeState.scheduledEvents;

  ui.scheduledSummary.textContent = `${scheduled.length} discipulado(s) marcado(s).`;

  if (!scheduled.length) {
    ui.scheduledList.innerHTML = '<p class="scheduled-empty">Nenhum discipulado marcado no momento.</p>';
    return;
  }

  ui.scheduledList.innerHTML = '';
  scheduled.forEach((event) => {
    const item = document.createElement('article');
    item.className = 'scheduled-item';
    item.innerHTML = `
      <h4>${event.nome || '-'}</h4>
      <p><strong>Próximo Disci:</strong> ${event.inicio || '-'}</p>
      <p><strong>Discipulador(es):</strong> ${event.discipulador || '-'}</p>
      <div class="scheduled-item-actions">
        <button class="btn btn-danger scheduled-delete-admin-btn" type="button" data-event-id="${event.eventId}">
          Excluir agendamento
        </button>
      </div>
    `;
    ui.scheduledList.appendChild(item);
  });
}

async function deleteAdminScheduledEvent(eventId) {
  let result;
  try {
    result = await apiCall('deleteAdminScheduledEvent', {
      token: runtimeState.token,
      eventId,
    });
  } catch (_error) {
    await openPopupMessage('Falha de comunicação com a API.');
    return;
  }

  if (!result.ok) {
    await openPopupMessage(result.error || 'Não foi possível excluir este agendamento.');
    return;
  }

  showToast('Excluído com sucesso!', 'success');
  await openScheduledModal();
  await loadAdminDashboard();
}

function renderDiscipleScheduledList() {
  const scheduled = runtimeState.discipleScheduledEvents;
  ui.discipleScheduledSummary.textContent = `${scheduled.length} agendamento(s) futuro(s).`;

  if (!scheduled.length) {
    ui.discipleScheduledList.innerHTML = '<p class="scheduled-empty">Você não possui agendamentos futuros.</p>';
    return;
  }

  ui.discipleScheduledList.innerHTML = '';
  scheduled.forEach((event) => {
    const item = document.createElement('article');
    item.className = 'scheduled-item';
    item.innerHTML = `
      <h4>${event.titulo || 'Discipulado'}</h4>
      <p><strong>Data/Hora:</strong> ${event.inicio || '-'}</p>
      <div class="scheduled-item-actions">
        <button class="btn btn-danger scheduled-delete-btn" type="button" data-event-id="${event.eventId}">
          Excluir agendamento
        </button>
      </div>
    `;
    ui.discipleScheduledList.appendChild(item);
  });
}

async function deleteDiscipleScheduledEvent(eventId) {
  let result;
  try {
    result = await apiCall('deleteDiscipleScheduledEvent', {
      token: runtimeState.token,
      eventId,
    });
  } catch (_error) {
    await openPopupMessage('Falha de comunicação com a API.');
    return;
  }

  if (!result.ok) {
    await openPopupMessage(result.error || 'Não foi possível excluir este agendamento.');
    return;
  }

  showToast('Excluído com sucesso!', 'success');
  await openDiscipleScheduledModal();
  await loadDiscipleDashboard();
}

async function loginDisciple(event) {
  event.preventDefault();

  const sigla = event.target.sigla.value;
  const password = event.target.password.value;

  setLoginFeedback_('Efetuando login...', 'info');

  let result;
  try {
    result = await apiCall('loginDisciple', { sigla, password });
  } catch (_error) {
    setLoginFeedback_('Não foi possível conectar com a API.', 'error');
    return;
  }

  if (!result.ok) {
    setLoginFeedback_(result.error || 'Falha no login.', 'error');
    return;
  }

  runtimeState.role = 'disciple';
  runtimeState.token = result.token;
  saveSession({ role: 'disciple', token: result.token });
  setLoginFeedback_('Login efetuado, aguarde!', 'success');
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  await loadDiscipleDashboard();
}

async function loginAdmin(event) {
  event.preventDefault();

  const user = event.target.user.value;
  const password = event.target.password.value;

  setLoginFeedback_('Efetuando login...', 'info');

  let result;
  try {
    result = await apiCall('loginAdmin', { user, password });
  } catch (_error) {
    setLoginFeedback_('Não foi possível conectar com a API.', 'error');
    return;
  }

  if (!result.ok) {
    setLoginFeedback_(result.error || 'Falha no login.', 'error');
    return;
  }

  runtimeState.role = 'admin';
  runtimeState.token = result.token;
  runtimeState.adminName = String(user || '').trim();
  runtimeState.showAllAdminList = false;
  saveSession({ role: 'admin', token: result.token, adminName: runtimeState.adminName });
  setLoginFeedback_('Login efetuado, aguarde!', 'success');
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  await loadAdminDashboard();
}

async function loadDiscipleDashboard() {
  let result;
  try {
    result = await apiCall('getDiscipleDashboard', { token: runtimeState.token });
  } catch (_error) {
    ui.feedback.textContent = 'Não foi possível carregar os dados.';
    clearSession();
    showLogin();
    return;
  }

  if (!result.ok) {
    ui.feedback.textContent = result.error || 'Sessão inválida.';
    clearSession();
    showLogin();
    return;
  }

  const data = result.data;
  runtimeState.scheduleUrl = data.scheduleUrl;

  ui.greeting.textContent = `Olá, ${data.nome || ''} 👋`;
  ui.discipleMentor.textContent = data.discipulador || '-';
  ui.discipleLast.textContent = data.ultimoDisci || '-';
  ui.discipleNext.textContent = data.proximoDisci || '-';
  const hasMeta = Boolean(String(data.metaSemana || '').trim());
  ui.discipleGoal.textContent = hasMeta ? data.metaSemana : 'Nenhuma meta definida.';
  if (ui.discipleMetaSecondary) {
    ui.discipleMetaSecondary.classList.toggle('hidden', hasMeta);
  }

  const hasSchedule = Boolean(data.proximoDisci);
  ui.noScheduleAlert.classList.toggle('hidden', hasSchedule);

  showDiscipleDashboard();
}

function createAdminItem(disciple) {
  const item = document.createElement('article');
  item.className = 'admin-item';

  const initials = getInitials_(disciple.nome || '-');

  item.innerHTML = `
    <details class="admin-details">
      <summary class="admin-summary">
        <span class="disciple-avatar" aria-hidden="true">${initials}</span>
        <div class="admin-summary-main">
          <h4>${disciple.nome || '-'}</h4>
          <p class="admin-summary-sub">Próximo Disci: ${disciple.proximoDisci || '-'}</p>
        </div>
        <span class="expand-hint">Expandir</span>
      </summary>

      <div class="admin-body">
        <p class="kv"><span class="kv-icon kv-icon-email" aria-hidden="true"></span>Email: ${disciple.email || '-'}</p>
        <p class="kv"><span class="kv-icon kv-icon-mentor" aria-hidden="true"></span>Discipulador(es): ${disciple.discipulador || '-'}</p>
        <p class="kv"><span class="kv-icon kv-icon-leader" aria-hidden="true"></span>Líder?: ${disciple.lider || '-'}</p>
        <p class="kv"><span class="kv-icon kv-icon-last" aria-hidden="true"></span>Último Disci: ${disciple.ultimoDisci || '-'}</p>
        <p class="kv"><span class="kv-icon kv-icon-next" aria-hidden="true"></span>Próximo Disci: ${disciple.proximoDisci || '-'}</p>

        <div class="edit-grid">
          <label class="field-label field-label-topico">
            <span class="field-icon field-icon-topico" aria-hidden="true"></span>
            Ultimo Tópico
          </label>
          <textarea class="field-area field-area-topico" data-field="ultimoTopico">${disciple.ultimoTopico || ''}</textarea>
          <button class="btn btn-topico" data-action="save-topico" type="button">Salvar</button>

          <label class="field-label field-label-meta">
            <span class="field-icon field-icon-meta" aria-hidden="true"></span>
            Meta da Semana
          </label>
          <textarea class="field-area field-area-meta" data-field="metaSemana">${disciple.metaSemana || ''}</textarea>
          <button class="btn btn-meta" data-action="save-meta" type="button">Salvar</button>
        </div>
      </div>
    </details>
  `;

  const topicoBtn = item.querySelector('[data-action="save-topico"]');
  const metaBtn = item.querySelector('[data-action="save-meta"]');
  const topicoArea = item.querySelector('[data-field="ultimoTopico"]');
  const metaArea = item.querySelector('[data-field="metaSemana"]');
  const detailsEl = item.querySelector('.admin-details');
  const expandHintEl = item.querySelector('.expand-hint');

  function syncExpandHint() {
    if (!detailsEl || !expandHintEl) {
      return;
    }
    expandHintEl.textContent = detailsEl.open ? 'Recolher' : 'Expandir';
  }

  if (detailsEl) {
    detailsEl.addEventListener('toggle', syncExpandHint);
    syncExpandHint();
  }

  topicoBtn.addEventListener('click', async () => {
    topicoBtn.disabled = true;
    topicoBtn.textContent = 'Salvando';
    const saved = await saveAdminField(disciple.rowId, 'ultimoTopico', topicoArea.value);
    if (topicoBtn.isConnected) {
      topicoBtn.disabled = false;
      topicoBtn.textContent = 'Salvar';
    }
    if (saved) {
      await loadAdminDashboard();
    }
  });

  metaBtn.addEventListener('click', async () => {
    metaBtn.disabled = true;
    metaBtn.textContent = 'Salvando';
    const saved = await saveAdminField(disciple.rowId, 'metaSemana', metaArea.value);
    if (metaBtn.isConnected) {
      metaBtn.disabled = false;
      metaBtn.textContent = 'Salvar';
    }
    if (saved) {
      await loadAdminDashboard();
    }
  });

  return item;
}

function getInitials_(name) {
  const clean = String(name || '').trim();
  if (!clean) {
    return '??';
  }
  const parts = clean.split(/\s+/).filter(Boolean);
  const stopWords = new Set(['e', 'de', 'da', 'do', 'das', 'dos']);
  const significantParts = parts.filter((part) => !stopWords.has(part.toLowerCase()));
  const source = significantParts.length ? significantParts : parts;

  if (source.length === 1) {
    return source[0].slice(0, 2).toUpperCase();
  }

  return (source[0][0] + source[1][0]).toUpperCase();
}

function renderAdminList() {
  function parsePtDateTime_(value) {
    const text = String(value || '').trim();
    if (!text) {
      return null;
    }

    const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.getTime();
  }

  const source = [...runtimeState.adminDisciples].sort((a, b) => {
    const aHasSchedule = Boolean(String(a.proximoDisci || '').trim());
    const bHasSchedule = Boolean(String(b.proximoDisci || '').trim());

    if (aHasSchedule && !bHasSchedule) {
      return -1;
    }
    if (!aHasSchedule && bHasSchedule) {
      return 1;
    }

    if (!aHasSchedule && !bHasSchedule) {
      return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
    }

    const aTime = parsePtDateTime_(a.proximoDisci);
    const bTime = parsePtDateTime_(b.proximoDisci);

    if (aTime !== null && bTime !== null) {
      return aTime - bTime;
    }
    if (aTime !== null) {
      return -1;
    }
    if (bTime !== null) {
      return 1;
    }

    return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
  });

  ui.adminList.innerHTML = '';
  source.forEach((disciple) => {
    ui.adminList.appendChild(createAdminItem(disciple));
  });

  if (!source.length) {
    ui.adminList.innerHTML = '<p class="scheduled-empty">Nenhum discípulo nesta visualização.</p>';
  }
}

async function saveAdminField(rowId, field, value) {
  let result;
  try {
    result = await apiCall('updateDiscipleField', {
      token: runtimeState.token,
      rowId,
      field,
      value,
    });
  } catch (_error) {
    await openPopupMessage('Falha de comunicação com a API.');
    return false;
  }

  if (!result.ok) {
    await openPopupMessage(result.error || 'Não foi possível salvar.');
    return false;
  }

  if (field === 'ultimoTopico') {
    showToast('Tópico salvo!', 'success');
  } else if (field === 'metaSemana') {
    showToast('Meta salva!', 'success');
  } else {
    showToast('Editado com sucesso!', 'success');
  }

  return true;
}

async function loadAdminDashboard() {
  let result;
  try {
    result = await apiCall('getAdminDashboard', { token: runtimeState.token });
  } catch (_error) {
    ui.feedback.textContent = 'Não foi possível carregar os dados.';
    clearSession();
    showLogin();
    return;
  }

  if (!result.ok) {
    ui.feedback.textContent = result.error || 'Sessão inválida.';
    clearSession();
    showLogin();
    return;
  }

  const data = result.data;
  runtimeState.adminDisciples = data.disciples || [];
  if (ui.adminGreeting) {
    const name = runtimeState.adminName || 'Discipulador';
    ui.adminGreeting.textContent = `Olá, ${name}! 👋`;
  }
  ui.statTotal.textContent = data.stats.total;
  ui.statScheduled.textContent = data.stats.agendados;
  ui.statWithout.textContent = data.stats.semAgenda;

  try {
    const scheduledResult = await apiCall('getScheduledEvents', { token: runtimeState.token });
    if (scheduledResult.ok) {
      runtimeState.scheduledEvents = scheduledResult.data && scheduledResult.data.events ? scheduledResult.data.events : [];
      ui.statScheduled.textContent = runtimeState.scheduledEvents.length;
    }
  } catch (_error) {
    // Mantem o valor fallback do dashboard quando houver falha.
  }

  renderAdminList();

  showAdminDashboard();
  setAdminNavActive('home');
}

async function submitNewDisciple(event) {
  event.preventDefault();

  const formData = new FormData(ui.addDiscipleForm);
  const disciple = {
    nome: String(formData.get('nome') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    siglaAcesso: String(formData.get('siglaAcesso') || '').trim().toUpperCase(),
    senhaAcesso: String(formData.get('senhaAcesso') || '').trim(),
    discipulador: String(formData.get('discipulador') || '').trim(),
    lider: String(formData.get('lider') || '').trim(),
  };

  ui.addDiscipleFeedback.textContent = '';
  ui.addDiscipleFeedback.style.color = '';
  ui.saveNewDiscipleBtn.disabled = true;

  let result;
  try {
    result = await apiCall('createDisciple', {
      token: runtimeState.token,
      disciple,
    });
  } catch (_error) {
    ui.addDiscipleFeedback.style.color = '';
    ui.addDiscipleFeedback.textContent = 'Falha de comunicação com a API.';
    ui.saveNewDiscipleBtn.disabled = false;
    return;
  }

  if (!result.ok) {
    ui.addDiscipleFeedback.style.color = '';
    ui.addDiscipleFeedback.textContent = result.error || 'Não foi possível criar o discípulo.';
    ui.saveNewDiscipleBtn.disabled = false;
    return;
  }

  ui.addDiscipleFeedback.style.color = '#1f7b5b';
  ui.addDiscipleFeedback.textContent = 'Discípulo cadastrado com sucesso.';
  showToast('Adicionado com sucesso!', 'success');

  window.setTimeout(async () => {
    closeAddDiscipleModal();
    ui.addDiscipleFeedback.style.color = '';
    ui.addDiscipleFeedback.textContent = '';
    ui.saveNewDiscipleBtn.disabled = false;
    await loadAdminDashboard();
  }, 900);
}

async function logoutCurrent() {
  if (runtimeState.token) {
    try {
      await apiCall('logout', { token: runtimeState.token });
    } catch (_error) {
      // Ignora erro de rede no logout e limpa a sessão localmente.
    }
  }
  clearSession();
  showLogin();
}

function openAgendaLink() {
  if (!runtimeState.scheduleUrl) {
    return;
  }
  window.open(runtimeState.scheduleUrl, '_blank', 'noopener,noreferrer');
}

function setDiscipleNavActive(activeKey) {
  const buttons = [
    { key: 'home', el: ui.navHomeBtn },
    { key: 'disciples', el: ui.navDisciplesBtn },
    { key: 'agenda', el: ui.navAgendaBtn },
  ];
  buttons.forEach(({ key, el }) => {
    if (!el) {
      return;
    }
    el.classList.toggle('active', key === activeKey);
  });
}

function setAdminNavActive(activeKey) {
  const buttons = [
    { key: 'home', el: ui.adminNavHomeBtn },
    { key: 'disciples', el: ui.adminNavDisciplesBtn },
    { key: 'agenda', el: ui.adminNavAgendaBtn },
    { key: 'add', el: ui.adminNavAddBtn },
  ];
  buttons.forEach(({ key, el }) => {
    if (!el) {
      return;
    }
    el.classList.toggle('active', key === activeKey);
  });
}

function openAdminDisciplesModal() {
  ui.adminDisciplesModalList.innerHTML = '';

  if (!runtimeState.adminDisciples.length) {
    ui.adminDisciplesModalList.innerHTML = '<p class="scheduled-empty">Nenhum discípulo encontrado.</p>';
  } else {
    runtimeState.adminDisciples.forEach((disciple) => {
      const item = document.createElement('article');
      item.className = 'scheduled-item admin-disciple-modal-item';
      item.innerHTML = `
        <h4>${disciple.nome || '-'}</h4>
        <p><strong>Email:</strong> ${disciple.email || '-'}</p>
        <p><strong>Discipulador(es):</strong> ${disciple.discipulador || '-'}</p>
        <div class="scheduled-item-actions">
          <button class="btn btn-ghost" type="button" data-action="edit-disciple" data-row-id="${disciple.rowId}">Editar</button>
          <button class="btn btn-danger" type="button" data-action="remove-disciple" data-row-id="${disciple.rowId}">Remover</button>
        </div>
      `;
      ui.adminDisciplesModalList.appendChild(item);
    });
  }

  ui.adminDisciplesModal.classList.remove('hidden');
  ui.adminDisciplesModal.setAttribute('aria-hidden', 'false');
}

function closeAdminDisciplesModal() {
  ui.adminDisciplesModal.classList.add('hidden');
  ui.adminDisciplesModal.setAttribute('aria-hidden', 'true');
}

function openEditDiscipleModal(rowId) {
  const disciple = runtimeState.adminDisciples.find((d) => String(d.rowId) === String(rowId));
  if (!disciple) {
    return;
  }

  ui.editDiscipleFeedback.textContent = '';
  ui.editDiscipleFeedback.style.color = '';
  ui.editDiscipleRowId.value = String(disciple.rowId);
  ui.editDiscipleName.value = disciple.nome || '';
  ui.editDiscipleEmail.value = disciple.email || '';
  ui.editDiscipleSigla.value = disciple.siglaAcesso || '';
  ui.editDiscipleSenha.value = disciple.senhaAcesso || '';
  ui.editDiscipleMentor.value = disciple.discipulador || '';
  ui.editDiscipleLeader.value = disciple.lider === 'Sim' ? 'Sim' : 'Não';

  ui.editDiscipleModal.classList.remove('hidden');
  ui.editDiscipleModal.setAttribute('aria-hidden', 'false');
}

function closeEditDiscipleModal() {
  ui.editDiscipleModal.classList.add('hidden');
  ui.editDiscipleModal.setAttribute('aria-hidden', 'true');
}

async function submitEditDisciple(event) {
  event.preventDefault();

  const originalSubmitText = ui.saveEditedDiscipleBtn
    ? ui.saveEditedDiscipleBtn.textContent
    : 'Salvar alterações';
  if (ui.saveEditedDiscipleBtn) {
    ui.saveEditedDiscipleBtn.disabled = true;
    ui.saveEditedDiscipleBtn.textContent = 'Salvando alterações';
  }

  const rowId = ui.editDiscipleRowId.value;
  const updates = {
    nome: ui.editDiscipleName.value,
    email: ui.editDiscipleEmail.value,
    siglaAcesso: String(ui.editDiscipleSigla.value || '').trim().toUpperCase(),
    senhaAcesso: ui.editDiscipleSenha.value,
    discipulador: ui.editDiscipleMentor.value,
    lider: ui.editDiscipleLeader.value,
  };

  try {
    const entries = Object.entries(updates);
    for (const [field, value] of entries) {
      let result;
      try {
        result = await apiCall('updateDiscipleField', {
          token: runtimeState.token,
          rowId,
          field,
          value,
        });
      } catch (_error) {
        await openPopupMessage('Falha de comunicação com a API.');
        return;
      }

      if (!result.ok) {
        await openPopupMessage(result.error || 'Não foi possível salvar as alterações.');
        return;
      }
    }

    closeEditDiscipleModal();

    ui.editDiscipleFeedback.style.color = '#1f7b5b';
    ui.editDiscipleFeedback.textContent = 'Alterações salvas com sucesso.';
    showToast('Editado com sucesso!', 'success');

    await loadAdminDashboard();
    openAdminDisciplesModal();
  } finally {
    if (ui.saveEditedDiscipleBtn) {
      ui.saveEditedDiscipleBtn.disabled = false;
      ui.saveEditedDiscipleBtn.textContent = originalSubmitText || 'Salvar alterações';
    }
  }
}

async function removeDisciple(rowId) {
  const confirmed = await openConfirmModal('Deseja realmente remover este discípulo?', {
    title: 'Confirmar Remoção',
    confirmText: 'Remover',
    cancelText: 'Cancelar',
    dangerConfirm: true,
  });
  if (!confirmed) {
    return;
  }

  let result;
  try {
    result = await apiCall('deleteDisciple', {
      token: runtimeState.token,
      rowId,
    });
  } catch (_error) {
    await openPopupMessage('Falha de comunicação com a API.');
    return;
  }

  if (!result.ok) {
    if (String(result.error || '').toLowerCase().includes('ação inválida')) {
      await openPopupMessage('Seu Apps Script publicado está desatualizado. Publique uma nova versão do Web App para habilitar a remoção de discípulos.');
      return;
    }
    await openPopupMessage(result.error || 'Não foi possível remover este discípulo.');
    return;
  }

  showToast('Excluído com sucesso!', 'success');
  await loadAdminDashboard();
  openAdminDisciplesModal();
}

function bindEvents() {
  ui.tabDisciple.addEventListener('click', () => setActiveTab('disciple'));
  ui.tabAdmin.addEventListener('click', () => setActiveTab('admin'));

  ui.discipleForm.addEventListener('submit', loginDisciple);
  ui.adminForm.addEventListener('submit', loginAdmin);
  if (ui.installAppActionButtons && ui.installAppActionButtons.length) {
    ui.installAppActionButtons.forEach((button) => {
      if (button instanceof HTMLElement) {
        button.addEventListener('click', handleInstallApp);
      }
    });
  }

  ui.scheduleBtn.addEventListener('click', openAgendaLink);

  if (ui.logoutDisciple) {
    ui.logoutDisciple.addEventListener('click', logoutCurrent);
  }
  if (ui.topLogoutBtn) {
    ui.topLogoutBtn.addEventListener('click', logoutCurrent);
  }
  ui.logoutAdmin.addEventListener('click', logoutCurrent);

  if (ui.navHomeBtn) {
    ui.navHomeBtn.addEventListener('click', () => {
      showDiscipleDashboard();
      setDiscipleNavActive('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (ui.navDisciplesBtn) {
    ui.navDisciplesBtn.addEventListener('click', () => {
      setDiscipleNavActive('disciples');
      openDiscipleScheduledModal();
    });
  }
  if (ui.navAgendaBtn) {
    ui.navAgendaBtn.addEventListener('click', () => {
      setDiscipleNavActive('agenda');
      openAgendaLink();
    });
  }

  if (ui.adminNavHomeBtn) {
    ui.adminNavHomeBtn.addEventListener('click', () => {
      showAdminDashboard();
      setAdminNavActive('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (ui.adminNavDisciplesBtn) {
    ui.adminNavDisciplesBtn.addEventListener('click', () => {
      setAdminNavActive('disciples');
      openAdminDisciplesModal();
    });
  }
  if (ui.adminNavAgendaBtn) {
    ui.adminNavAgendaBtn.addEventListener('click', () => {
      setAdminNavActive('agenda');
      openAgendaLink();
    });
  }
  if (ui.adminNavAddBtn) {
    ui.adminNavAddBtn.addEventListener('click', () => {
      setAdminNavActive('add');
      openAddDiscipleModal();
    });
  }

  if (ui.viewScheduledBtn) {
    ui.viewScheduledBtn.addEventListener('click', openScheduledModal);
  }
  if (ui.openNoScheduleModal) {
    ui.openNoScheduleModal.addEventListener('click', openNoScheduleModalFn);
  }
  if (ui.closeAdminDisciplesModal) {
    ui.closeAdminDisciplesModal.addEventListener('click', () => {
      closeAdminDisciplesModal();
      setAdminNavActive('home');
    });
  }
  if (ui.adminDisciplesModal) {
    ui.adminDisciplesModal.addEventListener('click', (event) => {
      if (event.target === ui.adminDisciplesModal) {
        closeAdminDisciplesModal();
        setAdminNavActive('home');
      }
    });
  }
  if (ui.adminDisciplesModalList) {
    ui.adminDisciplesModalList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const editBtn = target.closest('[data-action="edit-disciple"]');
      if (editBtn) {
        const rowId = editBtn.getAttribute('data-row-id');
        if (rowId) {
          openEditDiscipleModal(rowId);
        }
        return;
      }

      const removeBtn = target.closest('[data-action="remove-disciple"]');
      if (removeBtn) {
        const rowId = removeBtn.getAttribute('data-row-id');
        if (rowId) {
          removeDisciple(rowId);
        }
      }
    });
  }
  if (ui.closeEditDiscipleModal) {
    ui.closeEditDiscipleModal.addEventListener('click', closeEditDiscipleModal);
  }
  if (ui.editDiscipleModal) {
    ui.editDiscipleModal.addEventListener('click', (event) => {
      if (event.target === ui.editDiscipleModal) {
        closeEditDiscipleModal();
      }
    });
  }
  if (ui.editDiscipleForm) {
    ui.editDiscipleForm.addEventListener('submit', submitEditDisciple);
  }
  if (ui.closeNoScheduleModal) {
    ui.closeNoScheduleModal.addEventListener('click', closeNoScheduleModalFn);
  }
  if (ui.noScheduleModal) {
    ui.noScheduleModal.addEventListener('click', (event) => {
      if (event.target === ui.noScheduleModal) closeNoScheduleModalFn();
    });
  }
  if (ui.closeScheduledModal) {
    ui.closeScheduledModal.addEventListener('click', closeScheduledModal);
  }
  if (ui.scheduledModal) {
    ui.scheduledModal.addEventListener('click', (event) => {
      if (event.target === ui.scheduledModal) {
        closeScheduledModal();
      }
    });
  }
  if (ui.scheduledList) {
    ui.scheduledList.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const deleteButton = target.closest('.scheduled-delete-admin-btn');
      if (!deleteButton) {
        return;
      }

      const eventId = deleteButton.getAttribute('data-event-id');
      if (!eventId) {
        return;
      }

      const confirmed = await openConfirmModal('Deseja realmente excluir este agendamento?');
      if (!confirmed) {
        return;
      }

      deleteAdminScheduledEvent(eventId);
    });
  }

  if (ui.viewMySchedulesBtn) {
    ui.viewMySchedulesBtn.addEventListener('click', openDiscipleScheduledModal);
  }
  if (ui.closeDiscipleScheduledModal) {
    ui.closeDiscipleScheduledModal.addEventListener('click', closeDiscipleScheduledModal);
  }
  if (ui.discipleScheduledModal) {
    ui.discipleScheduledModal.addEventListener('click', (event) => {
      if (event.target === ui.discipleScheduledModal) {
        closeDiscipleScheduledModal();
      }
    });
  }
  if (ui.discipleScheduledList) {
    ui.discipleScheduledList.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const deleteButton = target.closest('.scheduled-delete-btn');
      if (!deleteButton) {
        return;
      }

      const eventId = deleteButton.getAttribute('data-event-id');
      if (!eventId) {
        return;
      }

      const confirmed = await openConfirmModal('Deseja realmente excluir este agendamento?');
      if (!confirmed) {
        return;
      }

      deleteDiscipleScheduledEvent(eventId);
    });
  }

  if (ui.confirmModalCancel) {
    ui.confirmModalCancel.addEventListener('click', () => closeConfirmModal(false));
  }
  if (ui.confirmModalConfirm) {
    ui.confirmModalConfirm.addEventListener('click', () => closeConfirmModal(true));
  }
  if (ui.confirmModal) {
    ui.confirmModal.addEventListener('click', (event) => {
      if (event.target === ui.confirmModal) {
        closeConfirmModal(false);
      }
    });
  }

  if (ui.addDiscipleBtn) {
    ui.addDiscipleBtn.addEventListener('click', openAddDiscipleModal);
  }
  if (ui.closeAddDiscipleModal) {
    ui.closeAddDiscipleModal.addEventListener('click', closeAddDiscipleModal);
  }
  if (ui.addDiscipleModal) {
    ui.addDiscipleModal.addEventListener('click', (event) => {
      if (event.target === ui.addDiscipleModal) {
        closeAddDiscipleModal();
      }
    });
  }
  if (ui.addDiscipleForm) {
    ui.addDiscipleForm.addEventListener('submit', submitNewDisciple);
  }
}

async function init() {
  bindEvents();
  setActiveTab('disciple');
  closeAddDiscipleModal();
  closeConfirmModal(false);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton_();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallButton_();
    showToast('App instalado com sucesso!', 'success');
  });

  updateInstallButton_();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  const session = restoreSession();
  if (!session || !session.token || !session.role) {
    showLogin();
    return;
  }

  runtimeState.role = session.role;
  runtimeState.token = session.token;
  runtimeState.adminName = session.adminName || '';
  runtimeState.showAllAdminList = false;

  setDiscipleNavActive('home');

  if (session.role === 'admin') {
    await loadAdminDashboard();
    return;
  }

  await loadDiscipleDashboard();
}

init();
