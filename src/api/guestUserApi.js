import config from "../config/index"

export const guestSignup = async () => {
    try {
      setGuestLoading(true);
      setError("");
      const resp = await fetch(`${config.backendUrl}/auth/guest/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await resp.json().catch(async () => ({
        message: await resp.text(),
      }));
      if (!resp.ok) {
        throw new Error(data?.error || data?.message || "Guest signup failed");
      }
      if (!data?.token || !data?.uid) {
        throw new Error("Invalid response from guest signup");
      }
      // Sign in to Firebase using the custom token
      await signInWithCustomToken(auth, data.token);
      await AsyncStorage.setItem("uid", data.uid);
      try {
        await AsyncStorage.setItem("authToken", data.token || "");
      } catch (_) {}

      try {
        await handleStoreReferral();
      } catch (_) {}
      try {
        await saveRolesToDatabase();
      } catch (_) {}

      setUid(true);
      setGuestUid(data.uid);
      setTimeout(() => router.push("/"), 0);
    } catch (e) {
      console.error("guestSignup error", e);
      setError(e.message || "Guest signup failed");
      Alert.alert("Error", e.message || "Guest signup failed");
    } finally {
      setGuestLoading(false);
    }
  };

  // Guest Login
  export const guestLogin = async () => {
    try {
      const uid = (guestUid || (await AsyncStorage.getItem("uid")) || "").trim();
      if (!uid || !uid.startsWith("guest_")) {
        Alert.alert("Error", "Enter a valid guest UID starting with guest_");
        return;
      }
      setGuestLoading(true);
      setError("");
      const resp = await fetch(`${config.backendUrl}/auth/guest/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await resp.json().catch(async () => ({
        message: await resp.text(),
      }));
      if (!resp.ok) {
        throw new Error(data?.error || data?.message || "Guest login failed");
      }
      if (!data?.token) {
        throw new Error("Invalid response from guest login");
      }
      await signInWithCustomToken(auth, data.token);
      await AsyncStorage.setItem("uid", uid);
      try {
        await AsyncStorage.setItem("authToken", data.token || "");
      } catch (_) {}

      try {
        await handleStoreReferral();
      } catch (_) {}
      setUid(true);
      setTimeout(() => router.push("/"), 0);
    } catch (e) {
      console.error("guestLogin error", e);
      setError(e.message || "Guest login failed");
      Alert.alert("Error", e.message || "Guest login failed");
    } finally {
      setGuestLoading(false);
    }
  };
