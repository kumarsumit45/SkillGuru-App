const API_BASE_URL = "https://api.theskillguru.org";

export const updateProfileWithAPI = async (uid, profileData) => {
  try {
    // Normalize phone number
    const normalizedPhone = (profileData.phoneNumber || "").trim();
    const countryCode = profileData.countryCode || "+91";

    // Format meet link
    let meetLinkToSave = profileData.googleMeetLink;
    if (meetLinkToSave && !meetLinkToSave.startsWith("https://")) {
      meetLinkToSave = "https://" + meetLinkToSave;
    }

    // Prepare payload matching the API structure
    const payload = {
      uid: uid,
      fullName: profileData.fullName || "",
      bioTitle: profileData.bioTitle || "",
      bioDescription: profileData.bioDescription || "",
      class: profileData.class || "",
      school: profileData.school || "",
      schoolLogoUrl: profileData.schoolLogoUrl || "",
      schoolId: profileData.schoolId || "",
      companyName: profileData.institutionCompany || "",
      companyLogoUrl: profileData.companyLogoUrl || "",
      companyId: profileData.companyId || "",
      meet_link: meetLinkToSave || "",
      meet_link1: profileData.meet_link1 || "",
      meet_link2: profileData.meet_link2 || "",
      phoneNumber: normalizedPhone,
      userPhone: normalizedPhone ? countryCode + normalizedPhone : "",
      userphone: normalizedPhone,
      countryCode: countryCode,
      userEmail: profileData.userEmail || "",
      teacherCost: profileData.teacherCost || 0,
      language: profileData.language || "",
      proficiency: profileData.proficiencyLevel || "",
      read: profileData.proficiencySkills?.read || false,
      write: profileData.proficiencySkills?.write || false,
      speak: profileData.proficiencySkills?.speak || false,
      gender: profileData.gender || "",
      city: profileData.city || "",
      state: profileData.state || "",
      referralCode: profileData.referralCode || "",
      description: profileData.description || "",
      selectedSkills: profileData.guruSkills || [],
      selectedLearnerSkills: profileData.learnerSkills || [],
      roles: profileData.roles || [],
      profileImageUrl: profileData.profileImageUrl || null,
    };

    const response = await fetch(`${API_BASE_URL}/edit-profile/edit-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
