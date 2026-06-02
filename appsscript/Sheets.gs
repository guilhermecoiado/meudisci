const SHEET_COLUMNS = {
  discipulo: 1,
  email: 2,
  siglaAcesso: 3,
  senhaAcesso: 4,
  discipulador: 5,
  lider: 6,
  ultimoDisci: 7,
  proximoDisci: 8,
  ultimoTopico: 9,
  metaSemana: 10,
  calendarEventId: 11,
};

function getDiscipleDashboard(token) {
  const session = requireSession_(token, 'disciple');
  const row = getDiscipleByRowId_(session.rowId);

  if (!row) {
    return { ok: false, error: 'Discípulo não encontrado.' };
  }

  return {
    ok: true,
    data: {
      nome: row.discipulo,
      discipulador: row.discipulador,
      ultimoDisci: formatDateTime_(row.ultimoDisci),
      proximoDisci: formatDateTime_(row.proximoDisci),
      metaSemana: row.metaSemana || '',
      scheduleUrl: APP_CONFIG.scheduleUrl,
    },
  };
}

function getAdminDashboard(token) {
  requireSession_(token, 'admin');
  const rows = getAllDiscipleRows_();

  const agendados = rows.filter(function (row) {
    return !!row.proximoDisci;
  }).length;

  return {
    ok: true,
    data: {
      stats: {
        total: rows.length,
        agendados: agendados,
        semAgenda: rows.length - agendados,
      },
      disciples: rows.map(function (row) {
        return {
          rowId: row.rowId,
          nome: row.discipulo,
          email: row.email,
          siglaAcesso: row.siglaAcesso,
          senhaAcesso: row.senhaAcesso,
          discipulador: row.discipulador,
          lider: row.lider,
          ultimoDisci: formatDateTime_(row.ultimoDisci),
          proximoDisci: formatDateTime_(row.proximoDisci),
          ultimoTopico: row.ultimoTopico,
          metaSemana: row.metaSemana,
        };
      }),
    },
  };
}

function updateDiscipleField(token, rowId, field, value) {
  requireSession_(token, 'admin');

  const allowedFields = {
    nome: SHEET_COLUMNS.discipulo,
    email: SHEET_COLUMNS.email,
    siglaAcesso: SHEET_COLUMNS.siglaAcesso,
    senhaAcesso: SHEET_COLUMNS.senhaAcesso,
    discipulador: SHEET_COLUMNS.discipulador,
    lider: SHEET_COLUMNS.lider,
    ultimoTopico: SHEET_COLUMNS.ultimoTopico,
    metaSemana: SHEET_COLUMNS.metaSemana,
  };

  if (!Object.prototype.hasOwnProperty.call(allowedFields, field)) {
    return { ok: false, error: 'Campo inválido para edição.' };
  }

  const numericRow = Number(rowId);
  if (!numericRow || numericRow < 2) {
    return { ok: false, error: 'rowId inválido.' };
  }

  const normalizedValue = String(value || '').trim();
  if (field === 'email' && normalizedValue && normalizedValue.indexOf('@') === -1) {
    return { ok: false, error: 'Email inválido.' };
  }

  if (field === 'siglaAcesso') {
    const normalizedSigla = normalizedValue.toUpperCase();
    if (!normalizedSigla) {
      return { ok: false, error: 'Sigla de acesso inválida.' };
    }

    const rows = getAllDiscipleRows_();
    const hasDuplicate = rows.some(function (row) {
      return row.rowId !== numericRow && String(row.siglaAcesso || '').trim().toUpperCase() === normalizedSigla;
    });
    if (hasDuplicate) {
      return { ok: false, error: 'Já existe discípulo com esta sigla.' };
    }

    const sheetSigla = getControlSheet_();
    sheetSigla.getRange(numericRow, allowedFields[field]).setValue(normalizedSigla);
    return { ok: true };
  }

  if (field === 'lider') {
    if (normalizedValue !== 'Sim' && normalizedValue !== 'Não') {
      return { ok: false, error: 'Valor inválido para Líder.' };
    }
  }

  const sheet = getControlSheet_();
  sheet.getRange(numericRow, allowedFields[field]).setValue(normalizedValue);

  return { ok: true };
}

function deleteDisciple(token, rowId) {
  requireSession_(token, 'admin');

  const numericRow = Number(rowId);
  if (!numericRow || numericRow < 2) {
    return { ok: false, error: 'rowId inválido.' };
  }

  const sheet = getControlSheet_();
  const lastRow = sheet.getLastRow();
  if (numericRow > lastRow) {
    return { ok: false, error: 'Discípulo não encontrado.' };
  }

  sheet.deleteRow(numericRow);
  return { ok: true };
}

function createDisciple(token, disciplePayload) {
  requireSession_(token, 'admin');

  const disciple = {
    nome: String(disciplePayload.nome || '').trim(),
    email: String(disciplePayload.email || '').trim(),
    siglaAcesso: String(disciplePayload.siglaAcesso || '').trim().toUpperCase(),
    senhaAcesso: String(disciplePayload.senhaAcesso || '').trim(),
    discipulador: String(disciplePayload.discipulador || '').trim(),
    lider: String(disciplePayload.lider || '').trim(),
  };

  if (!disciple.nome || !disciple.email || !disciple.siglaAcesso || !disciple.senhaAcesso || !disciple.discipulador) {
    return { ok: false, error: 'Preencha todos os campos obrigatórios.' };
  }

  if (disciple.email.indexOf('@') === -1) {
    return { ok: false, error: 'Email inválido.' };
  }

  if (disciple.lider !== 'Sim' && disciple.lider !== 'Não') {
    disciple.lider = 'Não';
  }

  const rows = getAllDiscipleRows_();
  const emailExists = rows.some(function (row) {
    return String(row.email || '').trim().toLowerCase() === disciple.email.toLowerCase();
  });
  if (emailExists) {
    return { ok: false, error: 'Já existe discípulo com este email.' };
  }

  const siglaExists = rows.some(function (row) {
    return String(row.siglaAcesso || '').trim().toUpperCase() === disciple.siglaAcesso;
  });
  if (siglaExists) {
    return { ok: false, error: 'Já existe discípulo com esta sigla.' };
  }

  const sheet = getControlSheet_();
  sheet.appendRow([
    disciple.nome,
    disciple.email,
    disciple.siglaAcesso,
    disciple.senhaAcesso,
    disciple.discipulador,
    disciple.lider,
    '',
    '',
    '',
    '',
    '',
  ]);

  return { ok: true };
}

function getAllDiscipleRows_() {
  const sheet = getControlSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  return data.map(function (row, idx) {
    return rowToDisciple_(idx + 2, row);
  });
}

function getDiscipleByRowId_(rowId) {
  const sheet = getControlSheet_();
  const numericRow = Number(rowId);

  if (!numericRow || numericRow < 2 || numericRow > sheet.getLastRow()) {
    return null;
  }

  const row = sheet.getRange(numericRow, 1, 1, 11).getValues()[0];
  return rowToDisciple_(numericRow, row);
}

function rowToDisciple_(rowId, row) {
  return {
    rowId: rowId,
    discipulo: row[SHEET_COLUMNS.discipulo - 1],
    email: row[SHEET_COLUMNS.email - 1],
    siglaAcesso: row[SHEET_COLUMNS.siglaAcesso - 1],
    senhaAcesso: row[SHEET_COLUMNS.senhaAcesso - 1],
    discipulador: row[SHEET_COLUMNS.discipulador - 1],
    lider: row[SHEET_COLUMNS.lider - 1],
    ultimoDisci: row[SHEET_COLUMNS.ultimoDisci - 1],
    proximoDisci: row[SHEET_COLUMNS.proximoDisci - 1],
    ultimoTopico: row[SHEET_COLUMNS.ultimoTopico - 1],
    metaSemana: row[SHEET_COLUMNS.metaSemana - 1],
    calendarEventId: row[SHEET_COLUMNS.calendarEventId - 1],
  };
}

function getControlSheet_() {
  const spreadsheet = SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheetByName(APP_CONFIG.sheetName);

  if (!sheet) {
    throw new Error('Aba CONTROLE_DISCI não encontrada.');
  }

  return sheet;
}

function formatDateTime_(value) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (String(date) === 'Invalid Date') {
    return String(value);
  }

  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
}
