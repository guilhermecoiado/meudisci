const APP_CONFIG = {
  spreadsheetId: '1wyEdDTtfF8JcwP1DMHZaSFEQ_zUGsfDl6eaazXYsGnw',
  sheetName: 'CONTROLE_DISCI',
  calendarId: 'srscoiado@gmail.com',
  scheduleUrl: 'https://calendar.app.google/nQ3mBZhqoTFhUNNp7',
  adminUser: 'guiele',
  adminPassword: '1609prasempre',
  sessionTtlSeconds: 21600,
};

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    const payloadRaw = e && e.parameter ? e.parameter.payload : '';
    const callback = e && e.parameter ? e.parameter.callback : '';
    let payload = {};

    if (payloadRaw) {
      payload = JSON.parse(payloadRaw);
    }

    return handleGetRequest_({
      action: action,
      payload: payload,
      callback: callback,
    });
  } catch (error) {
    return jsonOrJsonpResponse_(
      { ok: false, error: error.message || 'Erro inesperado.' },
      e && e.parameter ? e.parameter.callback : null
    );
  }
}

function doPost(e) {
  try {
    const body = parseRequestBody_(e);
    return handleAction_(body.action, body.payload || {}, null);
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message || 'Erro inesperado.' });
  }
}

function handleGetRequest_(request) {
  if (!request.action) {
    return jsonOrJsonpResponse_(
      {
        ok: true,
        message: 'MeuDisci API ativa. Use action/payload.',
      },
      request.callback
    );
  }

  return handleAction_(request.action, request.payload || {}, request.callback);
}

function handleAction_(action, payload, callback) {
  let result;

  switch (action) {
    case 'loginDisciple':
      result = loginDisciple(payload.sigla, payload.password);
      break;
    case 'loginAdmin':
      result = loginAdmin(payload.user, payload.password);
      break;
    case 'logout':
      result = logout(payload.token);
      break;
    case 'getDiscipleDashboard':
      result = getDiscipleDashboard(payload.token);
      break;
    case 'getAdminDashboard':
      result = getAdminDashboard(payload.token);
      break;
    case 'updateDiscipleField':
      result = updateDiscipleField(payload.token, payload.rowId, payload.field, payload.value);
      break;
    case 'createDisciple':
      result = createDisciple(payload.token, payload.disciple || {});
      break;
    case 'deleteDisciple':
      result = deleteDisciple(payload.token, payload.rowId);
      break;
    case 'getScheduledEvents':
      result = getScheduledEvents(payload.token);
      break;
    case 'getDiscipleScheduledEvents':
      result = getDiscipleScheduledEvents(payload.token);
      break;
    case 'deleteDiscipleScheduledEvent':
      result = deleteDiscipleScheduledEvent(payload.token, payload.eventId);
      break;
    case 'deleteAdminScheduledEvent':
      result = deleteAdminScheduledEvent(payload.token, payload.eventId);
      break;
    default:
      result = { ok: false, error: 'Ação inválida.' };
      break;
  }

  return jsonOrJsonpResponse_(result, callback);
}

function jsonOrJsonpResponse_(obj, callback) {
  const safeCallback = sanitizeCallback_(callback);
  if (!safeCallback) {
    return jsonResponse_(obj);
  }

  return ContentService
    .createTextOutput(safeCallback + '(' + JSON.stringify(obj) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function sanitizeCallback_(callback) {
  const value = String(callback || '').trim();
  if (!value) {
    return '';
  }

  if (!/^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(value)) {
    return '';
  }

  return value;
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Requisição sem corpo JSON.');
  }

  return JSON.parse(e.postData.contents);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
