import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { fetchUserProfile, updateUserProfile } from '../../api/profileUserApi';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const EditProfile = () => {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    bioTitle: '',
    bioDescription: '',
    class: '',
    school: '',
    institutionCompany: '',
    googleMeetLink: '',
    phoneNumber: '',
    userEmail: '',
    teacherCost: '',
    language: '',
    proficiencyLevel: '',
    proficiencySkills: {
      read: false,
      write: false,
      speak: false,
    },
    gender: '',
    city: '',
    state: '',
    guruSkills: [],
    profileImageUrl: null,
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [uid]);

  const loadUserProfile = async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      const profileData = await fetchUserProfile(uid);
      setFormData({
        fullName: profileData.fullName || '',
        bioTitle: profileData.bioTitle || '',
        bioDescription: profileData.bioDescription || '',
        class: profileData.class || '',
        school: profileData.school || '',
        institutionCompany: profileData.institutionCompany || '',
        googleMeetLink: profileData.googleMeetLink || '',
        phoneNumber: profileData.userPhone || profileData.phoneNumber || '',
        userEmail: profileData.userEmail || '',
        teacherCost: profileData.teacherCost?.toString() || '',
        language: profileData.language || '',
        proficiencyLevel: profileData.proficiencyLevel || '',
        proficiencySkills: {
          read: profileData.proficiencySkills?.read || false,
          write: profileData.proficiencySkills?.write || false,
          speak: profileData.proficiencySkills?.speak || false,
        },
        gender: profileData.gender || '',
        city: profileData.city || '',
        state: profileData.state || '',
        guruSkills: profileData['Guru skills'] || [],
        profileImageUrl: profileData.profileImageUrl || null,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProficiencyToggle = (skill) => {
    setFormData((prev) => ({
      ...prev,
      proficiencySkills: {
        ...prev.proficiencySkills,
        [skill]: !prev.proficiencySkills[skill],
      },
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.guruSkills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        guruSkills: [...prev.guruSkills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      guruSkills: prev.guruSkills.filter((s) => s !== skill),
    }));
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prev) => ({ ...prev, profileImageUrl: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required');
      return;
    }

    if (!formData.userEmail.trim()) {
      Alert.alert('Validation Error', 'Email Address is required');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        bioTitle: formData.bioTitle,
        bioDescription: formData.bioDescription,
        class: formData.class,
        school: formData.school,
        institutionCompany: formData.institutionCompany,
        googleMeetLink: formData.googleMeetLink,
        userPhone: formData.phoneNumber,
        userEmail: formData.userEmail,
        teacherCost: parseFloat(formData.teacherCost) || 0,
        language: formData.language,
        proficiencyLevel: formData.proficiencyLevel,
        proficiencySkills: formData.proficiencySkills,
        gender: formData.gender,
        city: formData.city,
        state: formData.state,
        'Guru skills': formData.guruSkills,
        profileImageUrl: formData.profileImageUrl,
      };

      await updateUserProfile(uid, updateData);
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
            {formData.profileImageUrl ? (
              <Image source={{ uri: formData.profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person" size={50} color="#6366f1" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Text style={styles.label}>
            Full Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Guest_user_406ka"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
          />

          <Text style={styles.label}>Bio Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Full Stack Developer"
            value={formData.bioTitle}
            onChangeText={(value) => handleInputChange('bioTitle', value)}
          />

          <Text style={styles.label}>Bio Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            value={formData.bioDescription}
            onChangeText={(value) => handleInputChange('bioDescription', value)}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Class</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 10th Grade / CSE-A"
            value={formData.class}
            onChangeText={(value) => handleInputChange('class', value)}
          />

          <Text style={styles.label}>School</Text>
          <TextInput
            style={styles.input}
            placeholder="Search and select your school"
            value={formData.school}
            onChangeText={(value) => handleInputChange('school', value)}
          />

          <Text style={styles.label}>Institution/Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Search and select your company"
            value={formData.institutionCompany}
            onChangeText={(value) => handleInputChange('institutionCompany', value)}
          />

          <Text style={styles.label}>Google Meet Link</Text>
          <TextInput
            style={styles.input}
            placeholder="https://meet.google.com/..."
            value={formData.googleMeetLink}
            onChangeText={(value) => handleInputChange('googleMeetLink', value)}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 (+91)"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Email Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            value={formData.userEmail}
            onChangeText={(value) => handleInputChange('userEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teacher Cost (₹/min)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.teacherCost}
            onChangeText={(value) => handleInputChange('teacherCost', value)}
            keyboardType="decimal-pad"
          />
          <Text style={styles.helperText}>
            Set your per minute teaching cost. Leave as 0 for free calls.
          </Text>
        </View>

        {/* Language Proficiency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Proficiency</Text>

          <Text style={styles.label}>Language *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., English"
            value={formData.language}
            onChangeText={(value) => handleInputChange('language', value)}
          />

          <Text style={styles.label}>Proficiency Level *</Text>
          <TextInput
            style={styles.input}
            placeholder="Select proficiency"
            value={formData.proficiencyLevel}
            onChangeText={(value) => handleInputChange('proficiencyLevel', value)}
          />

          <View style={styles.checkboxGroup}>
            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => handleProficiencyToggle('read')}
            >
              <View style={styles.checkbox}>
                {formData.proficiencySkills.read && (
                  <Ionicons name="checkmark" size={16} color="#6366f1" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Read</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => handleProficiencyToggle('write')}
            >
              <View style={styles.checkbox}>
                {formData.proficiencySkills.write && (
                  <Ionicons name="checkmark" size={16} color="#6366f1" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Write</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => handleProficiencyToggle('speak')}
            >
              <View style={styles.checkbox}>
                {formData.proficiencySkills.speak && (
                  <Ionicons name="checkmark" size={16} color="#6366f1" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Speak</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>

          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => handleInputChange('gender', 'Male')}
            >
              <View style={styles.radio}>
                {formData.gender === 'Male' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => handleInputChange('gender', 'Female')}
            >
              <View style={styles.radio}>
                {formData.gender === 'Female' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Female</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => handleInputChange('gender', 'Other')}
            >
              <View style={styles.radio}>
                {formData.gender === 'Other' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your city"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
          />

          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your state"
            value={formData.state}
            onChangeText={(value) => handleInputChange('state', value)}
          />
        </View>

        {/* Guru Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guru Skills</Text>

          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              placeholder="Search for guru skills"
              value={newSkill}
              onChangeText={setNewSkill}
            />
            <TouchableOpacity style={styles.addSkillButton} onPress={handleAddSkill}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.skillsContainer}>
            {formData.guruSkills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                  <Ionicons name="close-circle" size={18} color="#6366f1" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  checkboxGroup: {
    marginTop: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  radioGroup: {
    marginTop: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillInput: {
    flex: 1,
  },
  addSkillButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  skillText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
