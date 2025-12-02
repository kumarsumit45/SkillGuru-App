const API_BASE_URL = 'https://api.theskillguru.org';

// const API_BASE_URL = (
//   config.backendUrl || 'http://localhost:8082'
// ).replace(/\/$/, '');

const LIVE_QUIZ_BASE = `${API_BASE_URL}/live-quiz`;

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      query.append(key, value.join(','));
      return;
    }
    query.append(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export async function fetchLiveQuizzes({
  quizType,
  labels = [],
  exams = [],
  language,
  activeOnly,
  limit = "200",
  atTime,
} = {}) {
  const query = buildQueryString({
    quizType,
    labels,
    exams,
    language,
    activeOnly,
    limit,
    atTime,
  });

  const response = await fetch(`${LIVE_QUIZ_BASE}${query}`);
  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(message.error || 'Failed to fetch quizzes');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Fetch only live quizzes (currently active)
 * @param {Object} params - Query parameters
 * @param {number} params.daysBack - Number of days to look back (default: 7)
 * @param {number} params.daysForward - Number of days to look forward (default: 1)
 */
export async function fetchLiveQuizzesOnly({
  quizType,
  labels = [],
  exams = [],
  language,
  limit = "200",
  atTime,
  daysBack = 7,
  daysForward = 1,
} = {}) {
  const query = buildQueryString({
    quizType,
    labels,
    exams,
    language,
    limit,
    atTime,
    daysBack,
    daysForward,
  });

  const response = await fetch(`${LIVE_QUIZ_BASE}/live${query}`);
  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(message.error || 'Failed to fetch live quizzes');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Fetch only upcoming quizzes (not started yet)
 * @param {Object} params - Query parameters
 * @param {number} params.daysForward - Number of days to look forward (default: 7)
 */
export async function fetchUpcomingQuizzes({
  quizType,
  labels = [],
  exams = [],
  language,
  limit = "200",
  atTime,
  daysForward = 7,
} = {}) {
  const query = buildQueryString({
    quizType,
    labels,
    exams,
    language,
    limit,
    atTime,
    daysForward,
  });

  const response = await fetch(`${LIVE_QUIZ_BASE}/upcoming${query}`);
  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(message.error || 'Failed to fetch upcoming quizzes');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Fetch attempted quizzes for a specific user
 */
export async function fetchAttemptedQuizzes(userId, { limit = 100 } = {}) {
  if (!userId) return [];

  const query = buildQueryString({ limit });

  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/attempted/${userId}${query}`);
    if (!response.ok) {
      const message = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      throw new Error(message.error || 'Failed to fetch attempted quizzes');
    }

    const data = await response.json();
    return data.attempts || [];
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch attempted quizzes:', error.message);
    return [];
  }
}

const safeJson = async (response) => {
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const parseApiResponse = async (response) => {
  if (!response.ok) {
    const payload = await safeJson(response).catch(() => ({}));
    const message = payload?.error || payload?.message || response.statusText;
    throw new Error(message);
  }
  return safeJson(response);
};

export async function fetchLiveQuizById(quizId) {
  if (!quizId) throw new Error('quizId is required');
  const response = await fetch(`${LIVE_QUIZ_BASE}/${quizId}`);
  const data = await parseApiResponse(response);
  return data;
}

export async function startLiveQuizSession(quizId, body = {}) {
  if (!quizId) return null;
  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/${quizId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await parseApiResponse(response);
  } catch (error) {
    console.warn('[liveQuizApi] Failed to start session:', error.message);
    return null;
  }
}

export async function submitLiveQuizAnswer({
  quizId,
  sessionId,
  questionId,
  selectedOption,
  timeSpentSeconds,
}) {
  if (!quizId || !sessionId || !questionId) return null;
  try {
    const response = await fetch(
      `${LIVE_QUIZ_BASE}/${quizId}/session/${sessionId}/answer`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedOption, timeSpentSeconds }),
      }
    );
    return await parseApiResponse(response);
  } catch (error) {
    console.warn('[liveQuizApi] Failed to submit answer:', error.message);
    return null;
  }
}

export async function completeLiveQuizSession({ quizId, sessionId, answers, summary }) {
  if (!quizId || !sessionId) return null;
  try {
    const response = await fetch(
      `${LIVE_QUIZ_BASE}/${quizId}/session/${sessionId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, summary }),
      }
    );
    return await parseApiResponse(response);
  } catch (error) {
    console.warn('[liveQuizApi] Failed to complete session:', error.message);
    return null;
  }
}

export async function fetchLiveQuizLeaderboard(quizId, { limit, sessionId, includePrizeInfo = true } = {}) {
  if (!quizId) return {
    leaderboard: [],
    highlighted: null,
    count: 0,
    totalParticipants: 0,
    quizId: null,
    quizLabel: null,
    quizSubject: null,
    slotHourKey: null,
    slotDisplay: null,
    prizeDistributionSummary: null
  };
  const query = buildQueryString({ limit, sessionId, includePrizeInfo });
  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/${quizId}/leaderboard${query}`);
    const data = await parseApiResponse(response);
    return {
      leaderboard: Array.isArray(data?.leaderboard) ? data.leaderboard : [],
      highlighted: data?.highlighted || null,
      count: data?.count || (Array.isArray(data?.leaderboard) ? data.leaderboard.length : 0),
      totalParticipants: data?.totalParticipants || 0,
      quizId: data?.quizId || null,
      quizLabel: data?.quizLabel || null,
      quizSubject: data?.quizSubject || null,
      slotHourKey: data?.slotHourKey || null,
      slotDisplay: data?.slotDisplay || null,
      prizeDistributionSummary: data?.prizeDistributionSummary || null,
    };
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch leaderboard:', error.message);
    return {
      leaderboard: [],
      highlighted: null,
      count: 0,
      totalParticipants: 0,
      quizId: null,
      quizLabel: null,
      quizSubject: null,
      slotHourKey: null,
      slotDisplay: null,
      prizeDistributionSummary: null
    };
  }
}

export async function fetchUserQuizAttempts(userId, { limit = 50 } = {}) {
  if (!userId) return [];
  const query = buildQueryString({ limit });
  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/results/user/${userId}${query}`);
    const data = await parseApiResponse(response);
    if (Array.isArray(data?.attempts)) {
      return data.attempts;
    }
    if (Array.isArray(data?.items)) {
      return data.items;
    }
    if (Array.isArray(data?.results)) {
      return data.results;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch attempts:', error.message);
    return [];
  }
}

export async function fetchDailyWinners(date, includeDetails = true) {
  const query = buildQueryString({ date, includeDetails });
  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/prize-distribution/day/current${query}`);
    const data = await parseApiResponse(response);
    return data;
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch daily winners:', error.message);
    throw error;
  }
}

/**
 * Fetch all practice quizzes with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {Array} params.labels - Filter by labels
 * @param {string} params.language - Filter by language
 */
export async function fetchPracticeQuizzes({
  page = 1,
  limit = 20,
  labels = [],
  language,
} = {}) {
  const query = buildQueryString({
    page,
    limit,
    labels,
    language,
  });

  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/practice${query}`);
    const data = await parseApiResponse(response);
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      total: data?.total || 0,
      page: data?.page || page,
      limit: data?.limit || limit,
      hasMore: data?.hasMore !== undefined ? data.hasMore : (data?.items?.length || 0) === limit,
    };
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch practice quizzes:', error.message);
    throw error;
  }
}
