// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const SETTINGS_SECTIONS = [
  {
    title: "Reading",
    items: [
      { id: "reading_mode", label: "Reading Mode", icon: "book", type: "navigation", value: "Vertical" },
      { id: "auto_scroll", label: "Auto Scroll", icon: "play", type: "toggle", value: false },
      { id: "page_sound", label: "Page Turn Sound", icon: "volume-high", type: "toggle", value: true },
      { id: "brightness", label: "Brightness", icon: "sunny", type: "navigation", value: "Auto" },
    ],
  },
  {
    title: "Appearance",
    items: [
      { id: "theme", label: "Theme", icon: "color-palette", type: "navigation", value: "Auto" },
      { id: "language", label: "Language", icon: "language", type: "navigation", value: "English" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { id: "push_notifications", label: "Push Notifications", icon: "notifications", type: "toggle", value: true },
      { id: "new_chapters", label: "New Chapters", icon: "library", type: "toggle", value: true },
      { id: "recommendations", label: "Recommendations", icon: "heart", type: "toggle", value: false },
    ],
  },
  {
    title: "Storage",
    items: [
      { id: "downloads", label: "Downloads", icon: "download", type: "navigation", value: "2.1 GB" },
      { id: "cache", label: "Clear Cache", icon: "trash", type: "action", value: "156 MB" },
      { id: "download_quality", label: "Download Quality", icon: "image", type: "navigation", value: "High" },
    ],
  },
  {
    title: "About",
    items: [
      { id: "version", label: "Version", icon: "information-circle", type: "info", value: "1.0.0" },
      { id: "privacy", label: "Privacy Policy", icon: "shield-checkmark", type: "navigation" },
      { id: "terms", label: "Terms of Service", icon: "document-text", type: "navigation" },
      { id: "support", label: "Support", icon: "help-circle", type: "navigation" },
    ],
  },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [settings, setSettings] = useState<Record<string, any>>({
    auto_scroll: false,
    page_sound: true,
    push_notifications: true,
    new_chapters: true,
    recommendations: false,
  });

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#FF6B35",
      border: "#E0E0E0",
      danger: "#FF4444",
    },
    dark: {
      background: "#121212",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      border: "#333333",
      danger: "#FF6B6B",
    },
  };

  const theme = colors[colorScheme || "light"];

  const handleToggle = (settingId: string) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleAction = (settingId: string) => {
    switch (settingId) {
      case "cache":
        Alert.alert(
          "Clear Cache",
          "This will clear all cached images and data. Are you sure?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: () => {
              Alert.alert("Success", "Cache cleared successfully");
            }},
          ]
        );
        break;
      case "downloads":
        router.push("/downloads");
        break;
      case "reading_mode":
        router.push("/reading-settings");
        break;
      case "theme":
        router.push("/theme-settings");
        break;
      case "brightness":
        router.push("/brightness-settings");
        break;
      case "download_quality":
        router.push("/quality-settings");
        break;
      case "language":
        router.push("/language-settings");
        break;
      case "privacy":
        router.push("/privacy-policy");
        break;
      case "terms":
        router.push("/terms-of-service");
        break;
      case "support":
        router.push("/support");
        break;
    }
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Ionicons name="person" size={32} color="white" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.text }]}>
            Manga Reader
          </Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
            reader@mangatone.app
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.surface }]}
          onPress={() => router.push("/edit-profile")}
        >
          <Ionicons name="create" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>127</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reading</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>45</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>892</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hours Read</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderSettingsSection = (section: any, sectionIndex: number) => (
    <Animated.View
      key={section.title}
      entering={FadeInDown.delay(200 + sectionIndex * 100)}
      style={styles.section}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {section.title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
        {section.items.map((item: any, itemIndex: number) => (
          <View key={item.id}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                if (item.type === "toggle") {
                  handleToggle(item.id);
                } else if (item.type === "navigation" || item.type === "action") {
                  handleAction(item.id);
                }
              }}
              disabled={item.type === "info"}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + "20" }]}>
                  <Ionicons name={item.icon} size={20} color={theme.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </View>

              <View style={styles.settingRight}>
                {item.type === "toggle" && (
                  <Switch
                    value={settings[item.id]}
                    onValueChange={() => handleToggle(item.id)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="white"
                  />
                )}
                {(item.type === "navigation" || item.type === "info" || item.type === "action") && (
                  <>
                    {item.value && (
                      <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                        {item.value}
                      </Text>
                    )}
                    {item.type !== "info" && (
                      <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
            {itemIndex < section.items.length - 1 && (
              <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderDangerZone = () => (
    <Animated.View entering={FadeInDown.delay(800)} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.danger }]}>
        Danger Zone
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Alert.alert(
              "Sign Out",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: () => {
                  Alert.alert("Signed Out", "You have been signed out successfully");
                }},
              ]
            );
          }}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: theme.danger + "20" }]}>
              <Ionicons name="log-out" size={20} color={theme.danger} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.danger }]}>
              Sign Out
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {SETTINGS_SECTIONS.map((section, index) => renderSettingsSection(section, index))}
        {renderDangerZone()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  settingDivider: {
    height: 1,
    marginLeft: 64,
  },
  bottomSpacing: {
    height: 100,
  },
});