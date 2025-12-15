const API_BASE_URL = "https://api.theskillguru.org";

const saveEditedDetails = async () => {
  if (!validateForm()) return;
  setIsSaving(true);

  let meetLinkToSave = formData.meet_link;
  if (meetLinkToSave && !meetLinkToSave.startsWith("https://")) {
    meetLinkToSave = "https://" + meetLinkToSave;
  }

  try {
    const normalizedPhone = (formData.phoneNumber || "").trim();
    const payloadFormData = {
      ...formData,
      phoneNumber: normalizedPhone,
      userPhone: normalizedPhone ? countryCode + normalizedPhone : "",
    };

    const response = await fetch(`${API_BASE_URL}/edit-profile/edit-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: localStorage.getItem("uid"),
        ...payloadFormData,
        userphone: normalizedPhone,
        countryCode: countryCode,
        meet_link: meetLinkToSave,
        selectedSkills,
        selectedLearnerSkills,
        roles: user.role,
      }),
    });

    if (formData.meet_link1) await handleAddLink(formData.meet_link1);
    if (formData.meet_link2) await handleAddLink(formData.meet_link2);

    const data = await response.json();
    if (response.ok) {
      toast.success("Profile updated successfully!");
      // Optionally navigate back to profile
      // navigate('/profile');
    } else {
      toast.error(data.message || "Error updating profile");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Network error. Please try again.");
  } finally {
    setIsSaving(false);
  }
};

setFormData((prev) => ({
  ...prev,
  fullName: user.fullName || "",
  bioTitle: user.bioTitle || "",
  meet_link: user.meet_link || "",
  meet_link1: user.meet_link1 || "",
  meet_link2: user.meet_link2 || "",
  bioDescription: user.bioDescription || "",
  class: user.class || "",
  school: user.school || "",
  schoolLogoUrl: user.schoolLogoUrl || "",
  schoolId: user.schoolId || "",
  companyName: user.companyName || "",
  companyLogoUrl: user.companyLogoUrl || "",
  companyId: user.companyId || "",
  language: user.language || "",
  proficiency: user.proficiency || "",
  read: user.read || false,
  write: user.write || false,
  speak: user.speak || false,
  gender: user.gender || "",
  referralCode: user.referralCode || "",
  description: user.description || "",
  phoneNumber:
    user.phoneNumber ||
    (user.userPhone ? user.userPhone.replace(/^\+\d{1,3}/, "") : ""),
  userPhone: user.userPhone || "",
  countryCode: user.countryCode || countryCode,
  city: user.city || "",
  state: user.state || "",
  userEmail: user.userEmail || "",
  teacherCost: user.teacherCost || 0,
}));
