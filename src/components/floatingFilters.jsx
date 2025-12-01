import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const FloatingFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['classes']);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSSCExams, setSelectedSSCExams] = useState([]);
  const [selectedPopularExams, setSelectedPopularExams] = useState([]);
  const [expandedSections, setExpandedSections] = useState(['classes']);

  const categories = [
    { id: 'recommended', label: 'Recommended for you', icon: '★' },
    { id: 'classes', label: 'Classes', icon: '☐' },
    { id: 'ssc', label: 'SSC Exams', icon: '◎' },
    { id: 'popular', label: 'Popular & Entrance Exams', icon: '💬' },
  ];

  const classes = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12',
  ];

  // <CHANGE> Added SSC Exams data
  const sscExams = [
    'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD',
    'SSC CPO', 'SSC JE', 'SSC Stenographer', 'SSC JHT',
  ];

  // <CHANGE> Added Popular & Entrance Exams data
  const popularExams = [
    'JEE Main', 'JEE Advanced', 'NEET UG', 'UPSC CSE (Prelims)',
    'UPSC CSE (Mains)', 'Bank PO', 'Bank Clerk', 'Railway NTPC',
    'Railway ALP', 'State PSC', 'NDA', 'CDS',
    'IBPS Clerk', 'RRB Group D',
  ];

  const toggleSection = (id) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  // <CHANGE> Added toggle function for SSC Exams
  const toggleSSCExam = (exam) => {
    setSelectedSSCExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  // <CHANGE> Added toggle function for Popular Exams
  const togglePopularExam = (exam) => {
    setSelectedPopularExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedCategories([]);
    setSelectedClasses([]);
    setSelectedSSCExams([]);
    setSelectedPopularExams([]);
  };

  const getFilterSummary = () => {
    if (
      selectedCategories.length === 0 &&
      selectedClasses.length === 0 &&
      selectedSSCExams.length === 0 &&
      selectedPopularExams.length === 0
    ) {
      return 'All categories';
    }
    const parts = [];
    if (selectedCategories.includes('recommended')) parts.push('Recommended');
    if (selectedClasses.length > 0) parts.push(`${selectedClasses.length} classes`);
    if (selectedSSCExams.length > 0) parts.push(`${selectedSSCExams.length} SSC`);
    if (selectedPopularExams.length > 0) parts.push(`${selectedPopularExams.length} exams`);
    return parts.length > 0 ? parts.join(' • ') : 'All categories';
  };

  // <CHANGE> Helper function to render option grids
  const renderOptionsGrid = (options, selectedOptions, toggleFn) => (
    <View style={styles.optionsGrid}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selectedOptions.includes(option) && styles.optionButtonSelected,
          ]}
          onPress={() => toggleFn(option)}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedOptions.includes(option) && styles.optionButtonTextSelected,
            ]}
            numberOfLines={1}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Floating Pill Button */}
      <TouchableOpacity
        style={styles.floatingPill}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.9}
      >
        <View style={styles.pillContent}>
          <View style={styles.pillTextContainer}>
            <Text style={styles.pillTitle}>Filters & categories</Text>
            <Text style={styles.pillSubtitle}>{getFilterSummary()}</Text>
          </View>
          <Text style={styles.openButton}>OPEN</Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Filters & categories</Text>
                <Text style={styles.subtitle}>
                  Tailor the quiz list to your exam or class.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Section Title */}
              <Text style={styles.sectionTitle}>Select your category</Text>
              <Text style={styles.sectionSubtitle}>
                Choose one or more classes and exams to personalise the quiz list.
              </Text>

              {/* Categories */}
              {categories.map((category) => (
                <View key={category.id}>
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      (selectedCategories.includes(category.id) ||
                        expandedSections.includes(category.id)) &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      toggleCategory(category.id);
                      if (category.id !== 'recommended') {
                        toggleSection(category.id);
                      }
                    }}
                  >
                    <View style={styles.categoryLeft}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryLabel,
                          (selectedCategories.includes(category.id) ||
                            expandedSections.includes(category.id)) &&
                            styles.categoryLabelSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </View>
                    {category.id !== 'recommended' && (
                      <TouchableOpacity
                        onPress={() => toggleSection(category.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text
                          style={[
                            styles.toggleButton,
                            expandedSections.includes(category.id) &&
                              styles.toggleButtonActive,
                          ]}
                        >
                          {expandedSections.includes(category.id) ? 'Hide' : 'Show'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {/* Classes Grid */}
                  {category.id === 'classes' &&
                    expandedSections.includes('classes') &&
                    renderOptionsGrid(classes, selectedClasses, toggleClass)}

                  {/* SSC Exams Grid */}
                  {category.id === 'ssc' &&
                    expandedSections.includes('ssc') &&
                    renderOptionsGrid(sscExams, selectedSSCExams, toggleSSCExam)}

                  {/* Popular & Entrance Exams Grid */}
                  {category.id === 'popular' &&
                    expandedSections.includes('popular') &&
                    renderOptionsGrid(popularExams, selectedPopularExams, togglePopularExam)}
                </View>
              ))}

              {/* Bottom spacing */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSelection}
              >
                <Text style={styles.clearButtonText}>CLEAR SELECTION</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setIsOpen(false)}
              >
                <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  floatingPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillTextContainer: {
    flex: 1,
  },
  pillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  pillSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 2,
  },
  openButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C4692C',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 4,
  },
  closeButton: {
    fontSize: 16,
    color: '#6B7C93',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A5F',
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 4,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  categoryItemSelected: {
    borderColor: '#C4692C',
    backgroundColor: '#FFF9F5',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#6B7C93',
  },
  categoryLabel: {
    fontSize: 16,
    color: '#1E3A5F',
  },
  categoryLabelSelected: {
    color: '#C4692C',
  },
  toggleButton: {
    fontSize: 14,
    color: '#6B7C93',
  },
  toggleButtonActive: {
    color: '#C4692C',
  },
  // <CHANGE> Updated grid styles for all option types
  optionsGrid: {
    flexDirection: 'row',
    alignItems:"center",
    justifyContent:"center",
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 10,
    gap: 10, // Space between items
  },
  optionButton: {
    width: (width - 92) / 2, // Adjusted: (total width - container padding 40*2 - grid padding 10*2 - gap 10) / 2 columns
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: '#C4692C',
    backgroundColor: '#FFF9F5',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#1E3A5F',
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: '#C4692C',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    letterSpacing: 0.5,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#C4692C',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default FloatingFilter;