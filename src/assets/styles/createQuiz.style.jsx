import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:   COLORS.background, //"#F5F5F7",
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card:{
    backgroundColor:"#fff",        //"#d8e0dede",
    borderWidth:0,
    marginHorizontal:-5,
    paddingHorizontal:18,
    paddingVertical:18,
    marginTop:-10,
    marginBottom:25,
    borderRadius:20
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ddd"  ,           //'#E5E7EB',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor:COLORS.gradient2,//'#4F46E5',
    borderColor: COLORS.gradient1,       //'#4face6ff',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
  inputWrapper: {
    position: 'relative',
  },
  topicInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.3,
    borderColor: "#ddd",               //'#E5E7EB',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    minHeight: 80,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.3,
    borderColor: "#ddd",              //'#E5E7EB',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",                 //'#F3F4F6',
  },
  suggestionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  fileButton: {
    flexDirection:"row",
    backgroundColor: '#FFFFFF',
    borderWidth: 1.3,
    borderColor:  "#ddd",                           //'#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent:"center",
    gap:10
  },
  fileButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1.3,
    borderColor: "#ddd",      //'#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    backgroundColor: COLORS.gradient2 ,//'#4F46E5',
    borderColor: COLORS.gradient1 ,//'#4F46E5',
  },
  optionButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  scheduleContainer: {
    marginBottom: 16,
  },
  scheduleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.3,
    borderColor:"#ddd",  //'#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  createButton: {
    backgroundColor:COLORS.gradient2 ,// '#4F46E5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default styles;