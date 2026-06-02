function syncCalendarEvents() {
  const sheet = getControlSheet_();
  const disciples = getAllDiscipleRows_();
  if (!disciples.length) {
    return;
  }

  const emailToDisciple = {};
  disciples.forEach(function (disciple) {
    const email = String(disciple.email || '').trim().toLowerCase();
    if (email) {
      emailToDisciple[email] = disciple;
    }
  });

  const now = new Date();
  const horizon = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const calendar = CalendarApp.getCalendarById(APP_CONFIG.calendarId);
  if (!calendar) {
    throw new Error('Calendar ID inválido ou sem permissão.');
  }

  const events = calendar.getEvents(now, horizon);
  const nextEventByRow = {};

  events.forEach(function (event) {
    const guests = event.getGuestList();
    const matched = findDiscipleByGuests_(guests, emailToDisciple);

    if (!matched) {
      return;
    }

    const rowId = matched.rowId;
    const eventId = event.getId();
    const start = event.getStartTime();

    const current = nextEventByRow[rowId];
    if (!current || start.getTime() < current.start.getTime()) {
      nextEventByRow[rowId] = {
        eventId: eventId,
        start: start,
      };
    }
  });

  const activeEventIds = {};
  Object.keys(nextEventByRow).forEach(function (rowId) {
    const nextEvent = nextEventByRow[rowId];
    sheet.getRange(Number(rowId), SHEET_COLUMNS.proximoDisci).setValue(nextEvent.start);
    sheet.getRange(Number(rowId), SHEET_COLUMNS.calendarEventId).setValue(nextEvent.eventId);
    activeEventIds[nextEvent.eventId] = true;
  });

  disciples.forEach(function (disciple) {
    const currentEventId = String(disciple.calendarEventId || '').trim();
    const hasUpcomingForRow = Object.prototype.hasOwnProperty.call(
      nextEventByRow,
      String(disciple.rowId)
    );

    if (!hasUpcomingForRow && currentEventId && !activeEventIds[currentEventId]) {
      sheet.getRange(disciple.rowId, SHEET_COLUMNS.proximoDisci).clearContent();
      sheet.getRange(disciple.rowId, SHEET_COLUMNS.calendarEventId).clearContent();
    }
  });
}

function getScheduledEvents(token) {
  requireSession_(token, 'admin');

  const disciples = getAllDiscipleRows_();
  const emailToDisciple = {};
  disciples.forEach(function (disciple) {
    const email = String(disciple.email || '').trim().toLowerCase();
    if (email) {
      emailToDisciple[email] = disciple;
    }
  });

  const now = new Date();
  const horizon = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const calendar = CalendarApp.getCalendarById(APP_CONFIG.calendarId);
  if (!calendar) {
    return { ok: false, error: 'Calendar ID inválido ou sem permissão.' };
  }

  const events = calendar.getEvents(now, horizon);
  const scheduledEvents = [];

  events.forEach(function (event) {
    const matched = findDiscipleByGuests_(event.getGuestList(), emailToDisciple);
    if (!matched) {
      return;
    }

    const start = event.getStartTime();

    scheduledEvents.push({
      eventId: event.getId(),
      nome: matched.discipulo || '-',
      discipulador: matched.discipulador || '-',
      inicio: formatDateTime_(start),
      startMs: start.getTime(),
    });
  });

  scheduledEvents.sort(function (a, b) {
    return a.startMs - b.startMs;
  });

  const responseEvents = scheduledEvents.map(function (event) {
    return {
      eventId: event.eventId,
      nome: event.nome,
      discipulador: event.discipulador,
      inicio: event.inicio,
    };
  });

  return {
    ok: true,
    data: {
      events: responseEvents,
    },
  };
}

function getDiscipleScheduledEvents(token) {
  const session = requireSession_(token, 'disciple');
  const disciple = getDiscipleByRowId_(session.rowId);
  if (!disciple) {
    return { ok: false, error: 'Discípulo não encontrado.' };
  }

  const discipleEmail = String(disciple.email || '').trim().toLowerCase();
  if (!discipleEmail) {
    return { ok: true, data: { events: [] } };
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const calendar = CalendarApp.getCalendarById(APP_CONFIG.calendarId);
  if (!calendar) {
    return { ok: false, error: 'Calendar ID inválido ou sem permissão.' };
  }

  const events = calendar.getEvents(now, horizon);
  const discipleEvents = [];

  events.forEach(function (event) {
    if (!eventHasGuestEmail_(event, discipleEmail)) {
      return;
    }

    const start = event.getStartTime();
    discipleEvents.push({
      eventId: event.getId(),
      inicio: formatDateTime_(start),
      startMs: start.getTime(),
      titulo: String(event.getTitle() || '').trim(),
    });
  });

  discipleEvents.sort(function (a, b) {
    return a.startMs - b.startMs;
  });

  return {
    ok: true,
    data: {
      events: discipleEvents.map(function (event) {
        return {
          eventId: event.eventId,
          inicio: event.inicio,
          titulo: event.titulo,
        };
      }),
    },
  };
}

function deleteDiscipleScheduledEvent(token, eventId) {
  const session = requireSession_(token, 'disciple');
  const disciple = getDiscipleByRowId_(session.rowId);
  if (!disciple) {
    return { ok: false, error: 'Discípulo não encontrado.' };
  }

  const discipleEmail = String(disciple.email || '').trim().toLowerCase();
  const safeEventId = String(eventId || '').trim();
  if (!safeEventId) {
    return { ok: false, error: 'eventId inválido.' };
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const calendar = CalendarApp.getCalendarById(APP_CONFIG.calendarId);
  if (!calendar) {
    return { ok: false, error: 'Calendar ID inválido ou sem permissão.' };
  }

  const event = findEventByIdInRange_(calendar, safeEventId, now, horizon);
  if (!event) {
    return { ok: false, error: 'Agendamento não encontrado.' };
  }

  if (!eventHasGuestEmail_(event, discipleEmail)) {
    return { ok: false, error: 'Você não tem permissão para excluir este agendamento.' };
  }

  event.deleteEvent();
  syncCalendarEvents();

  return { ok: true };
}

function deleteAdminScheduledEvent(token, eventId) {
  requireSession_(token, 'admin');

  const safeEventId = String(eventId || '').trim();
  if (!safeEventId) {
    return { ok: false, error: 'eventId inválido.' };
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const calendar = CalendarApp.getCalendarById(APP_CONFIG.calendarId);
  if (!calendar) {
    return { ok: false, error: 'Calendar ID inválido ou sem permissão.' };
  }

  const event = findEventByIdInRange_(calendar, safeEventId, now, horizon);
  if (!event) {
    return { ok: false, error: 'Agendamento não encontrado.' };
  }

  event.deleteEvent();
  syncCalendarEvents();

  return { ok: true };
}

function findEventByIdInRange_(calendar, eventId, start, end) {
  const events = calendar.getEvents(start, end);
  for (var i = 0; i < events.length; i += 1) {
    if (String(events[i].getId() || '') === eventId) {
      return events[i];
    }
  }
  return null;
}

function eventHasGuestEmail_(event, email) {
  const guests = event.getGuestList();
  for (var i = 0; i < guests.length; i += 1) {
    if (String(guests[i].getEmail() || '').trim().toLowerCase() === email) {
      return true;
    }
  }
  return false;
}

function processFinishedDiscipleships() {
  const sheet = getControlSheet_();
  const disciples = getAllDiscipleRows_();
  const now = new Date();

  disciples.forEach(function (disciple) {
    const nextDisci = toDate_(disciple.proximoDisci);
    if (!nextDisci) {
      return;
    }

    if (nextDisci.getTime() <= now.getTime()) {
      sheet.getRange(disciple.rowId, SHEET_COLUMNS.ultimoDisci).setValue(nextDisci);
      sheet.getRange(disciple.rowId, SHEET_COLUMNS.proximoDisci).clearContent();
      sheet.getRange(disciple.rowId, SHEET_COLUMNS.calendarEventId).clearContent();
    }
  });
}

function findDiscipleByGuests_(guests, emailToDisciple) {
  for (var i = 0; i < guests.length; i += 1) {
    var email = String(guests[i].getEmail() || '').trim().toLowerCase();
    if (email && emailToDisciple[email]) {
      return emailToDisciple[email];
    }
  }
  return null;
}

function toDate_(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  return String(parsed) === 'Invalid Date' ? null : parsed;
}
