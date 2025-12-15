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
    console.log('[profileUserApi] Fetching profile from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[profileUserApi] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[profileUserApi] Error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    const data = await response.json();
    console.log('[profileUserApi] Response data:', JSON.stringify(data, null, 2));

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
    console.log('[profileUserApi] Updating profile at:', url);
    console.log('[profileUserApi] Profile data:', JSON.stringify(profileData, null, 2));

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    console.log('[profileUserApi] Update response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[profileUserApi] Update error response:', errorData);
      throw new Error(errorData.message || 'Failed to update user profile');
    }

    const data = await response.json();
    console.log('[profileUserApi] Update response data:', JSON.stringify(data, null, 2));

    return data.user || data;
  } catch (error) {
    console.error('[profileUserApi] Failed to update user profile:', error);
    throw error;
  }
};
