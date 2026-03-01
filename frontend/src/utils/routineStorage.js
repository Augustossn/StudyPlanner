const LEGACY_PREFIX = 'routine_plans_';
const EMAIL_PREFIX = 'routine_plans_email_';
const GLOBAL_KEY = 'routine_plans_global';

export const resolveUserIdentifier = (user) => {
  if (!user) return null;

  if (user.userId !== undefined && user.userId !== null && user.userId !== '') {
    return String(user.userId);
  }

  if (user.id !== undefined && user.id !== null && user.id !== '') {
    return String(user.id);
  }

  return null;
};

const resolveEmailIdentifier = (user) => {
  if (!user?.email || typeof user.email !== 'string') return null;
  const normalized = user.email.trim().toLowerCase();
  return normalized || null;
};

export const getRoutineStorageKeys = (user) => {
  const keys = [];
  const userIdentifier = resolveUserIdentifier(user);
  const emailIdentifier = resolveEmailIdentifier(user);

  if (userIdentifier) {
    keys.push(`${LEGACY_PREFIX}${userIdentifier}`);
  }

  if (emailIdentifier) {
    keys.push(`${EMAIL_PREFIX}${emailIdentifier}`);
  }

  if (keys.length === 0) {
    keys.push(GLOBAL_KEY);
  }
  return keys;
};

const parseRoutines = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const loadRoutinesFromStorage = (user) => {
  const keys = getRoutineStorageKeys(user);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const parsed = parseRoutines(localStorage.getItem(key));
    if (parsed) {
      return { routines: parsed, sourceKey: key, keys };
    }
  }

  return { routines: [], sourceKey: null, keys };
};

export const saveRoutinesToStorage = (user, routines) => {
  const keys = getRoutineStorageKeys(user);
  const payload = JSON.stringify(routines);
  keys.forEach((key) => {
    localStorage.setItem(key, payload);
  });
};
