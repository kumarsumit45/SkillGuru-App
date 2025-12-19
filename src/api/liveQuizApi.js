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
  limit = "300",
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

/**
 * Fetch user's quiz attempts with optional questions and answers
 * @param {string} userId - The user ID
 * @param {Object} options - Fetch options
 * @param {number} options.limit - Maximum number of attempts to fetch (default: 50)
 * @param {boolean} options.includeQuestions - Whether to include quiz questions (default: true)
 * @param {boolean} options.includeAnswers - Whether to include user's answers (default: true)
 * @returns {Promise<Array>} Array of quiz attempts
 */
export async function fetchUserQuizAttempts(userId, { limit = 50, includeQuestions = true, includeAnswers = true } = {}) {
  if (!userId) return [];

  // Build query string with all parameters
  const query = buildQueryString({
    limit,
    includeQuestions,
    includeAnswers
  });

  try {
    const response = await fetch(`${LIVE_QUIZ_BASE}/results/user/${userId}${query}`);
    const data = await parseApiResponse(response);

    console.log('[liveQuizApi] Raw API response:', JSON.stringify(data).substring(0, 500));

    // Extract attempts array from various possible response formats
    let attempts = [];
    if (Array.isArray(data?.attempts)) {
      attempts = data.attempts;
    } else if (Array.isArray(data?.items)) {
      attempts = data.items;
    } else if (Array.isArray(data?.results)) {
      attempts = data.results;
    } else if (Array.isArray(data)) {
      attempts = data;
    }

    if (attempts.length > 0) {
      console.log('[liveQuizApi] First attempt structure:', Object.keys(attempts[0]));
      console.log('[liveQuizApi] Has questionBreakdown?', attempts[0]?.questionBreakdown ? 'Yes' : 'No');
      if (attempts[0]?.questionBreakdown) {
        console.log('[liveQuizApi] QuestionBreakdown length:', attempts[0].questionBreakdown.length);
        console.log('[liveQuizApi] First breakdown item:', attempts[0].questionBreakdown[0]);
      }
    }

    return attempts;
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch attempts:', error.message);
    return [];
  }
}

/**
 * Fetch a specific quiz attempt result by attempt/session ID
 * @param {string} attemptId - The attempt/session ID
 * @param {Object} options - Additional options
 * @param {boolean} options.includeAnswers - Whether to include user answers (default: true)
 * @returns {Promise<Object>} The attempt details with questions and answers
 */
// export async function fetchQuizAttemptById(attemptId, { includeAnswers = true } = {}) {
//   if (!attemptId) throw new Error('attemptId is required');



//   try {
//     const query = buildQueryString({ includeAnswers });
//     const url = `${LIVE_QUIZ_BASE}/results/${attemptId}${query}`;
//     // console.log('[fetchQuizAttemptById] URL:', url);

//     const response = await fetch(url);
//     // console.log('[fetchQuizAttemptById] Response status:', response.status);

//     const data = await parseApiResponse(response);
    

//     return data;
//   } catch (error) {
//     console.warn('[fetchQuizAttemptById] Failed to fetch attempt by ID:', error.message);
//     throw error;
//   }
// }

/**
 * Fetch user's answers for a specific quiz attempt
 * Tries multiple possible API endpoints to find where answers are stored
 * @param {string} attemptId - The attempt/session ID
 * @param {string} quizId - The quiz ID (optional, used for fallback endpoints)
 * @returns {Promise<Array>} Array of user answers
 */
export async function fetchAttemptAnswers(attemptId, quizId = null) {
  if (!attemptId) throw new Error('attemptId is required');

  // console.log('\n[fetchAttemptAnswers] Trying multiple endpoints to find answers...');
  // console.log('[fetchAttemptAnswers] Attempt ID:', attemptId);
  // console.log('[fetchAttemptAnswers] Quiz ID:', quizId);

  // List of possible API endpoints where answers might be stored
  const possibleEndpoints = [
    `${LIVE_QUIZ_BASE}/results/${attemptId}/answers`,
    `${LIVE_QUIZ_BASE}/results/${attemptId}`,
    `${LIVE_QUIZ_BASE}/sessions/${attemptId}/answers`,
    `${LIVE_QUIZ_BASE}/sessions/${attemptId}`,
    `${LIVE_QUIZ_BASE}/attempts/${attemptId}/answers`,
    `${LIVE_QUIZ_BASE}/attempts/${attemptId}`,
  ];

  // If quizId is provided, add more endpoints
  if (quizId) {
    possibleEndpoints.push(
      `${LIVE_QUIZ_BASE}/${quizId}/session/${attemptId}/answers`,
      `${LIVE_QUIZ_BASE}/${quizId}/sessions/${attemptId}/answers`,
      `${LIVE_QUIZ_BASE}/${quizId}/attempts/${attemptId}/answers`
    );
  }

  // Try each endpoint
  for (const endpoint of possibleEndpoints) {
    try {
      const response = await fetch(endpoint);

      // Check if response is successful
      if (response.ok) {
        const data = await response.json();
        // console.log(`[fetchAttemptAnswers] ✅ SUCCESS at: ${endpoint}`);
        // console.log(`[fetchAttemptAnswers] Response:`, data);

        // Extract answers from various possible formats
        const answers = data?.answers || data?.userAnswers || data?.responses || data?.submissions;

        if (answers && (Array.isArray(answers) || typeof answers === 'object')) {
          
          return Array.isArray(answers) ? answers : [answers];
        }

        // If the whole response looks like answers array
        if (Array.isArray(data)) {
          return data;
        }
      } else {
      }
    } catch (error) {
    }
  }

  return [];
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
 * @param {boolean} params.fetchAll - Fetch all pages if true (default: false)
 */
export async function fetchPracticeQuizzes({
  page = 1,
  limit = 20,
  labels = [],
  language,
  fetchAll = false,
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
    const result = {
      items: Array.isArray(data?.items) ? data.items : [],
      total: data?.total || 0,
      page: data?.page || page,
      limit: data?.limit || limit,
      hasMore: data?.hasMore !== undefined ? data.hasMore : (data?.items?.length || 0) === limit,
    };

    // If fetchAll is true, fetch all remaining pages
    if (fetchAll && result.hasMore) {
      let currentPage = page + 1;
      let allItems = [...result.items];

      while (true) {
        const nextQuery = buildQueryString({
          page: currentPage,
          limit,
          labels,
          language,
        });

        const nextResponse = await fetch(`${LIVE_QUIZ_BASE}/practice${nextQuery}`);
        const nextData = await parseApiResponse(nextResponse);
        const nextItems = Array.isArray(nextData?.items) ? nextData.items : [];

        if (nextItems.length === 0) break;

        allItems = [...allItems, ...nextItems];

        const hasMore = nextData?.hasMore !== undefined ? nextData.hasMore : nextItems.length === limit;
        if (!hasMore) break;

        currentPage++;
      }

      return {
        items: allItems,
        total: data?.total || allItems.length,
        page: 1,
        limit: allItems.length,
        hasMore: false,
      };
    }

    return result;
  } catch (error) {
    console.warn('[liveQuizApi] Failed to fetch practice quizzes:', error.message);
    throw error;
  }
}
