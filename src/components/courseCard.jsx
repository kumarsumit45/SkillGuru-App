import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CourseCard({title,subject,speaking,material,guru,progress,time}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.7} style={styles.card}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.playButtonContainer}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color={"#fff"} style={{left:2}}/>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.classTitle}>{title}</Text>
            <Text style={styles.subject}>{subject}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.starButton}
          >
            {isFavorite ? (
              <AntDesign name="star" color={"green"} size={32} />
            ) : (
              <Feather name="star" color={"#000"} size={32} />
            )}
          </TouchableOpacity>
        </View>

        {/* Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            {/* <Text style={styles.badgeText}></Text> */}
            <FontAwesome name="book" color={"green"} size={22} />
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons
              name="person"
              size={20}
              color={"navy"}
              style={styles.detailIcon}
            />
            <Text style={styles.detailLabel}>Speaking: </Text>
            <Text style={styles.detailValue}>{speaking}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📘</Text>
            <Text style={styles.detailLabel}>Material: </Text>
            <Text style={styles.detailValue}>{material}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👩‍🏫</Text>
            <Text style={styles.detailLabel}>Guru: </Text>
            <Text style={styles.detailValue}>
              {guru}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill,{ width: `${progress}%` }]} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>⏱</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          <Text style={styles.completeText}>{progress}% Complete</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical:10,
    paddingHorizontal:5,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  playButtonContainer: {
    marginRight: 12,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d97438",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  titleSection: {
    flex: 1,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 2,
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d97438",
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 24,
    color: "#999",
  },
  badgeContainer: {
    marginBottom: 12,
    paddingLeft: 12,
  },
  badge: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 16,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e3a5f",
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "0%",
    backgroundColor: "#d97438",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  completeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d97438",
  },
});
