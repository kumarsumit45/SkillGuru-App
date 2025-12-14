const API_BASE_URL = "https://api.theskillguru.org";

const fetchUserData = async () => {
  try {
    setUserLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/currentuser/currentuser/${uid}`
    );
    const data = await response.json();
    setUser(data.user);
    fetchRecentCallers(data.user.recent_guru_callids || []);
    const encryptedCode = encrypt(uid);
    setReferralCode(encryptedCode);
  } catch {
  } finally {
    setUserLoading(false);
  }
};
