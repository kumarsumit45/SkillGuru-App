const API_BASE_URL = "https://api.theskillguru.org";

/**
 * Fetch user profile data
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User profile data
 */
export const fetchUserProfile = async (uid) => {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/currentuser/currentuser/${uid}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    const data = await response.json();
    return data.user || data;
  } catch (error) {
    console.error('[profileUserApi] Failed to fetch user profile:', error);
    throw error;
  }
};
