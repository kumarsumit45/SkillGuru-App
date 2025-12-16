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
    const url = `${API_BASE_URL}/currentuser/currentuser/${uid}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[profileUserApi] Error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    const data = await response.json();

    return data.user || data;
  } catch (error) {
    console.error('[profileUserApi] Failed to fetch user profile:', error);
    throw error;
  }
};

/**
 * Update user profile data
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user profile data
 */
export const updateUserProfile = async (uid, profileData) => {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const url = `${API_BASE_URL}/currentuser/currentuser/${uid}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[profileUserApi] Update error response:', errorData);
      throw new Error(errorData.message || 'Failed to update user profile');
    }

    const data = await response.json();

    return data.user || data;
  } catch (error) {
    console.error('[profileUserApi] Failed to update user profile:', error);
    throw error;
  }
};
