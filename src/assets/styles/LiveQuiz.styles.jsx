import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d0e7f7",
  },
  headerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 5,
    marginBottom: 2,

    backgroundColor: "#fff", // REQUIRED for Android shadow
    // borderTopEndRadius:10,

    borderBottomWidth: 0.5,
    borderBottomColor: "#b8b8b8c1",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    // Android shadow
    elevation: 6,
  },
  headerLogo: {
    height: 50,
    width: 50,
    left: -20,
  },
  headerTitleText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
    left: -15,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "trasparent",
    marginVertical: 0,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  languageSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  languageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  languageTabs: {
    flexDirection: "row",
    gap: 8,
  },
  languageTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  languageTabActive: {
    backgroundColor: "#DC2626",
  },
  languageTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  languageTabTextActive: {
    color: "#FFFFFF",
  },
  categoryTabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  categoryTabsScroll: {
    paddingHorizontal: 16,
  },
  categoryTabsContent: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
  },
  categoryTab: {
    minWidth: 90,
    paddingHorizontal: 8,
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#DC2626",
  },
  categoryBadge: {
    alignItems: "center",
    // borderWidth:1
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  categoryBadgeTextActive: {
    color: "#DC2626",
  },
  categoryCount: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  categoryCountActive: {
    color: "#DC2626",
    fontWeight: "600",
  },
  quizList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#DC2626",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  loadMoreButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  winnersScrollContainer: {
    flex: 1,
  },
  winnersScrollContent: {
    paddingBottom: 20,
  },
  winnersHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 0,
  },
  winnersTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  winnersDescription: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 16,
  },
  winnersControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  datePickerContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  refreshButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-end",
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  winnersStatus: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
  winnersList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
});

export default styles;