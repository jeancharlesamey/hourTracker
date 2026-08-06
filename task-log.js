// Shared task change-log utilities (localStorage-backed, key: dt_taskLog)

const FIELD_LABELS = {
  idOpus: 'ID',
  name: 'Task name',
  jiraLink: 'Jira link',
  estimate: 'Estimate',
  deliveryDate: 'Delivery date',
  status: 'Status',
  color: 'Color'
};

const STATUS_LABELS = {
  soon: 'Soon',
  inPause: 'In Pause',
  inProgress: 'In Progress',
  devStarted: 'Dev started',
  checking: 'Final review',
  done: 'Done',
  archived: 'Archived'
};

function taskLogGenerateUid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `uid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function taskLogEnsureUid(task) {
  if (!task.uid) task.uid = taskLogGenerateUid();
  return task.uid;
}

function taskLogGetAll() {
  try {
    return JSON.parse(localStorage.getItem('dt_taskLog') || '[]');
  } catch {
    return [];
  }
}

function taskLogSaveAll(entries) {
  localStorage.setItem('dt_taskLog', JSON.stringify(entries));
}

function logTaskChange(task, field, from, to) {
  if (!task) return;
  const fromStr = String(from ?? '');
  const toStr = String(to ?? '');
  if (fromStr === toStr) return;

  taskLogEnsureUid(task);
  const entries = taskLogGetAll();
  entries.push({
    uid: task.uid,
    field,
    from: from ?? '',
    to: to ?? '',
    date: new Date().toISOString()
  });
  if (entries.length > 500) entries.splice(0, entries.length - 500);
  taskLogSaveAll(entries);
}

window.FIELD_LABELS = FIELD_LABELS;
window.STATUS_LABELS = STATUS_LABELS;
window.taskLogEnsureUid = taskLogEnsureUid;
window.taskLogGetAll = taskLogGetAll;
window.taskLogSaveAll = taskLogSaveAll;
window.logTaskChange = logTaskChange;
