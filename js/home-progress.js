function completedAnswerCount(userAnswers) {
  if (!userAnswers || typeof userAnswers !== 'object') return 0;
  return Object.values(userAnswers).filter((value) => {
    return value === true || value === false || value === 'submitted';
  }).length;
}

function parseState(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return null;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function getSetSizes(subject) {
  if (Array.isArray(subject.setSizes) && subject.setSizes.length > 0) {
    return subject.setSizes.slice();
  }
  if (typeof subject.setSize === 'number' && Array.isArray(subject.setNames)) {
    return subject.setNames.map(() => subject.setSize);
  }
  if (Array.isArray(subject.setNames) && subject.setNames.length > 0) {
    const evenSize = Math.ceil((subject.questionCount || 0) / subject.setNames.length);
    return subject.setNames.map(() => evenSize);
  }
  return [subject.questionCount || 0];
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(rest).padStart(2, '0');
}

export function summarizeSubjectProgress(subject, rawValue) {
  const state = parseState(rawValue);
  const setNames = Array.isArray(subject.setNames) && subject.setNames.length > 0 ? subject.setNames : ['练习'];
  const setSizes = getSetSizes(subject);
  const totalCount = subject.questionCount || setSizes.reduce((sum, size) => sum + size, 0);
  const sets = Array.isArray(state?.sets) ? state.sets : [];
  const activeSetIndex = Math.max(0, Math.min(Number(state?.activeSet) || 0, setNames.length - 1));
  const activeSet = sets[activeSetIndex] || {};
  const doneCount = sets.reduce((sum, setData) => {
    return sum + completedAnswerCount(setData && setData.userAnswers);
  }, 0);
  const activeSetDone = completedAnswerCount(activeSet.userAnswers);
  const activeSetTotal = setSizes[activeSetIndex] || 0;
  const currentIdx = Math.max(0, Number(activeSet.currentIdx) || 0);
  const practiceSec = Math.max(0, Number(state?.practiceSec) || 0);
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return {
    ...subject,
    doneCount,
    totalCount,
    percent,
    activeSetIndex,
    activeSetName: setNames[activeSetIndex] || '练习',
    activeSetDone,
    activeSetTotal,
    currentQuestion: currentIdx + 1,
    practiceSec,
    practiceLabel: formatDuration(practiceSec),
    updatedAt: Number(state?.updatedAt) || 0,
    hasProgress: doneCount > 0 || currentIdx > 0 || practiceSec > 0,
  };
}

export function summarizeAllSubjects(subjects, storage) {
  return subjects.map((subject) => {
    const rawValue = subject.storageKey && storage && typeof storage.getItem === 'function'
      ? storage.getItem(subject.storageKey)
      : null;
    return summarizeSubjectProgress(subject, rawValue);
  });
}

export function pickContinueSubject(summaries) {
  return summaries
    .filter((summary) => summary.hasProgress)
    .sort((a, b) => {
      if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
      return b.doneCount - a.doneCount;
    })[0] || null;
}
