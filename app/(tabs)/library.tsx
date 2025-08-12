import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import MangaCard from "@/components/MangaCard";

const LIBRARY_TABS = [
  { id: "reading", label: "Reading", icon: "book" },
  { id: "want_to_read", label: "Want to Read", icon: "bookmark" },
  { id: "completed", label: "Completed", icon: "checkmark-circle" },
  { id: "dropped", label: "Dropped", icon: "close-circle" },
];

// Mock data - in real app this would come from Convex
const MOCK_LIBRARY_DATA = {
  reading: [
    {
      title: "Attack on Titan",
      slug: "attack-on-titan",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      progress: 67,
      currentChapter: "Chapter 45",
      totalChapters: 120,
    },
    {
      title: "One Piece",
      slug: "one-piece",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      progress: 23,
      currentChapter: "Chapter 280",
      totalChapters: 1200,
    },
  ],
  want_to_read: [
    {
      title: "Demon Slayer",
      slug: "demon-slayer",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    },
    {
      title: "My Hero Academia",
      slug: "my-hero-academia",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    },
  ],
  completed: [
    {
      title: "Death Note",
      slug: "death-note",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      rating: 5,
      completedAt: "2024-01-15",
    },
  ],
  dropped: [
    {
      title: "Bleach",
      slug: "bleach",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      droppedAt: "Chapter 200",
    },
  ],
};

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState("reading");

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#FF6B35",
      border: "#E0E0E0",
    },
    dark: {
      background: "#121212",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      border: "#333333",
    },
  };

  const theme = colors[colorScheme || "light"];

  const handleMangaPress = (manga: any) => {
    router.push(`/manga/${manga.slug}`);
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>
        My Library
      </Text>
      <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: theme.surface }]}
        onPress={() => router.push("/(tabs)/search")}
      >
        <Ionicons name="add" size={24} color={theme.text} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStats = () => {
    const totalReading = MOCK_LIBRARY_DATA.reading.length;
    const totalWantToRead = MOCK_LIBRARY_DATA.want_to_read.length;
    const totalCompleted = MOCK_LIBRARY_DATA.completed.length;
    const total = totalReading + totalWantToRead + totalCompleted;

    return (
      <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="book" size={20} color="white" />
          </View>
          <Text style={[styles.statNumber, { color: theme.text }]}>{totalReading}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reading</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: "#4FC3F7" }]}>
            <Ionicons name="bookmark" size={20} color="white" />
          </View>
          <Text style={[styles.statNumber, { color: theme.text }]}>{totalWantToRead}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Want to Read</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: "#81C784" }]}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </View>
          <Text style={[styles.statNumber, { color: theme.text }]}>{totalCompleted}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
      </Animated.View>
    );
  };

  const renderTabs = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsRow}>
          {LIBRARY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = MOCK_LIBRARY_DATA[tab.id as keyof typeof MOCK_LIBRARY_DATA]?.length || 0;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? theme.primary : theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? "white" : theme.text}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? "white" : theme.text },
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.tabBadge,
                      {
                        backgroundColor: isActive ? "rgba(255,255,255,0.3)" : theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        { color: isActive ? "white" : "white" },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderContinueReading = () => {
    if (activeTab !== "reading" || MOCK_LIBRARY_DATA.reading.length === 0) return null;

    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Continue Reading
        </Text>
        {MOCK_LIBRARY_DATA.reading.map((manga, index) => (
          <Animated.View key={manga.slug} entering={FadeInDown.delay(500 + index * 100)}>
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: theme.surface }]}
              onPress={() => handleMangaPress(manga)}
            >
              <View style={styles.continueCardContent}>
                <View style={styles.continueInfo}>
                  <Text style={[styles.continueTitle, { color: theme.text }]}>
                    {manga.title}
                  </Text>
                  <Text style={[styles.continueChapter, { color: theme.textSecondary }]}>
                    {manga.currentChapter} • {manga.totalChapters} chapters
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { backgroundColor: theme.primary, width: `${manga.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                      {manga.progress}%
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  const renderLibraryContent = () => {
    const data = MOCK_LIBRARY_DATA[activeTab as keyof typeof MOCK_LIBRARY_DATA] || [];

    if (data.length === 0) {
      return (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.emptyContainer}>
          <Ionicons
            name={LIBRARY_TABS.find(tab => tab.id === activeTab)?.icon as any}
            size={64}
            color={theme.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No manga in {LIBRARY_TABS.find(tab => tab.id === activeTab)?.label.toLowerCase()}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Start exploring to add manga to your library
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Text style={styles.exploreButtonText}>Explore Manga</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.contentContainer}>
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(500 + index * 50)}>
              <MangaCard
                title={item.title}
                slug={item.slug}
                image={item.image}
                onPress={() => handleMangaPress(item)}
                rating={(item as any).rating}
                latestChapter={(item as any).currentChapter || "Latest"}
                genres={["Action", "Drama"]}
                type="Manga"
                style={styles.libraryCard}
              />
            </Animated.View>
          )}
          keyExtractor={(item) => item.slug}
          numColumns={2}
          columnWrapperStyle={styles.libraryRow}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={styles.libraryList}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderStats()}
        {renderTabs()}
        {renderContinueReading()}
        {renderLibraryContent()}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  continueCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  continueCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  continueChapter: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 35,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  libraryList: {
    paddingBottom: 100,
  },
  libraryRow: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  libraryCard: {
    width: "48%",
  },
  bottomSpacing: {
    height: 100,
  },
});