function loginDisciple(sigla, password) {
  const credentials = {
    sigla: String(sigla || '').trim().toUpperCase(),
    password: String(password || '').trim(),
  };

  if (!credentials.sigla || !credentials.password) {
    return { ok: false, error: 'Informe sigla e senha.' };
  }

  const rows = getAllDiscipleRows_();
  const user = rows.find(function (row) {
    return (
      String(row.siglaAcesso || '').trim().toUpperCase() === credentials.sigla &&
      String(row.senhaAcesso || '').trim() === credentials.password
    );
  });

  if (!user) {
    return { ok: false, error: 'Credenciais inválidas.' };
  }

  const token = createSession_({
    role: 'disciple',
    rowId: user.rowId,
    name: user.discipulo,
  });

  return {
    ok: true,
    token: token,
    role: 'disciple',
    expiresInSeconds: APP_CONFIG.sessionTtlSeconds,
  };
}

function loginAdmin(user, password) {
  const adminUser = String(user || '').trim();
  const adminPassword = String(password || '').trim();

  if (
    adminUser !== APP_CONFIG.adminUser ||
    adminPassword !== APP_CONFIG.adminPassword
  ) {
    return { ok: false, error: 'Credenciais inválidas.' };
  }

  const token = createSession_({ role: 'admin', username: APP_CONFIG.adminUser });

  return {
    ok: true,
    token: token,
    role: 'admin',
    expiresInSeconds: APP_CONFIG.sessionTtlSeconds,
  };
}

function logout(token) {
  if (!token) {
    return { ok: true };
  }

  CacheService.getScriptCache().remove('session:' + token);
  return { ok: true };
}

function getSession_(token) {
  const safeToken = String(token || '').trim();
  if (!safeToken) {
    return null;
  }

  const raw = CacheService.getScriptCache().get('session:' + safeToken);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

function requireSession_(token, role) {
  const session = getSession_(token);
  if (!session) {
    throw new Error('Sessão inválida ou expirada. Faça login novamente.');
  }

  if (role && session.role !== role) {
    throw new Error('Acesso não autorizado.');
  }

  return session;
}

function createSession_(payload) {
  const token = Utilities.getUuid();
  CacheService
    .getScriptCache()
    .put('session:' + token, JSON.stringify(payload), APP_CONFIG.sessionTtlSeconds);
  return token;
}
