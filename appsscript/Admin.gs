function createTriggers() {
  const targetFunctions = [
    'syncCalendarEvents',
    'processFinishedDiscipleships',
  ];

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (targetFunctions.indexOf(trigger.getHandlerFunction()) !== -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('syncCalendarEvents')
    .timeBased()
    .everyMinutes(15)
    .create();

  ScriptApp.newTrigger('processFinishedDiscipleships')
    .timeBased()
    .everyHours(1)
    .create();
}
