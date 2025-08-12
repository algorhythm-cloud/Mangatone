import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import MangaCard from "@/components/MangaCard";

const TRENDING_TABS = [
  { id: "all", label: "All", type: undefined },
  { id: "manga", label: "Manga", type: "manga" },
  { id: "manhwa", label: "Manhwa", type: "manhwa" },
  { id: "manhua", label: "Manhua", type: "manhua" },
];

const TIME_PERIODS = [
  { id: "today", label: "Today", icon: "today" },
  { id: "week", label: "This Week", icon: "calendar" },
  { id: "month", label: "This Month", icon: "calendar-outline" },
];

export default function TrendingScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState("all");
  const [timePeriod, setTimePeriod] = useState("today");
  const [browseData, setBrowseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const browseManga = useAction(api.manga.browseManga);

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#FF6B35",
      border: "#E0E0E0",
      trending: "#FF4444",
    },
    dark: {
      background: "#121212",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      border: "#333333",
      trending: "#FF6B6B",
    },
  };

  const theme = colors[colorScheme || "light"];

  const fetchBrowseData = useCallback(async (type?: string) => {
    try {
      setLoading(true);
      const data = await browseManga({ 
        type: type as any, 
        page: 1 
      });
      setBrowseData(data);
    } catch (error) {
      console.error("Error fetching browse data:", error);
    } finally {
      setLoading(false);
    }
  }, [browseManga]);

  useEffect(() => {
    if (activeTab !== "all") {
      fetchBrowseData(activeTab);
    } else {
      fetchBrowseData();
    }
  }, [activeTab, fetchBrowseData]);

  const handleMangaPress = (manga: any) => {
    router.push(`/manga/${manga.slug}`);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Trending
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          What's hot right now
        </Text>
      </View>
      <View style={[styles.trendingIcon, { backgroundColor: theme.trending }]}>
        <Ionicons name="flame" size={24} color="white" />
      </View>
    </Animated.View>
  );

  const renderTimePeriods = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.timePeriodsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timePeriodsRow}>
          {TIME_PERIODS.map((period) => {
            const isActive = timePeriod === period.id;
            return (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.timePeriod,
                  {
                    backgroundColor: isActive ? theme.primary : theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setTimePeriod(period.id)}
              >
                <Ionicons
                  name={period.icon as any}
                  size={16}
                  color={isActive ? "white" : theme.text}
                />
                <Text
                  style={[
                    styles.timePeriodText,
                    { color: isActive ? "white" : theme.text },
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderTabs = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsRow}>
          {TRENDING_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
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
                onPress={() => handleTabChange(tab.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? "white" : theme.text },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderTopRanked = () => {
    if (!browseData?.results) return null;

    const topThree = browseData.results.slice(0, 3);

    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.topRankedContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Top Ranked
        </Text>
        <View style={styles.podiumContainer}>
          {topThree.map((manga: any, index: number) => {
            const rank = index + 1;
            const podiumHeight = rank === 1 ? 120 : rank === 2 ? 100 : 80;
            const medalColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32";

            return (
              <Animated.View
                key={manga.slug}
                entering={FadeInDown.delay(500 + index * 100)}
                style={[styles.podiumItem, { height: podiumHeight }]}
              >
                <TouchableOpacity
                  style={styles.podiumManga}
                  onPress={() => handleMangaPress(manga)}
                >
                  <MangaCard
                    title={manga.title}
                    slug={manga.slug}
                    image={manga.image}
                    onPress={() => handleMangaPress(manga)}
                    rating={4.5 + Math.random() * 0.5}
                    latestChapter="Latest"
                    genres={["Popular"]}
                    type="Trending"
                    isHot={rank === 1}
                    style={styles.podiumCard}
                  />
                  <View style={[styles.rankBadge, { backgroundColor: medalColor }]}>
                    <Text style={styles.rankText}>{rank}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderTrendingList = () => {
    if (!browseData?.results) return null;

    const remainingManga = browseData.results.slice(3);

    return (
      <Animated.View entering={FadeInDown.delay(600)} style={styles.trendingListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Trending Now
          </Text>
          <View style={styles.trendingIndicator}>
            <Ionicons name="trending-up" size={16} color={theme.trending} />
            <Text style={[styles.trendingText, { color: theme.trending }]}>
              Hot
            </Text>
          </View>
        </View>

        <FlatList
          data={remainingManga}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(700 + index * 50)}>
              <TouchableOpacity
                style={[styles.trendingItem, { backgroundColor: theme.surface }]}
                onPress={() => handleMangaPress(item)}
              >
                <View style={styles.trendingRank}>
                  <Text style={[styles.trendingRankText, { color: theme.primary }]}>
                    #{index + 4}
                  </Text>
                </View>
                
                <View style={styles.trendingContent}>
                  <MangaCard
                    title={item.title}
                    slug={item.slug}
                    image={item.image}
                    onPress={() => handleMangaPress(item)}
                    rating={4.0 + Math.random() * 1.0}
                    latestChapter="Latest"
                    genres={["Trending"]}
                    type="Popular"
                    style={styles.trendingCard}
                  />
                </View>
 
                 <View style={styles.trendingStats}>
                   <View style={styles.statItem}>
                     <Ionicons name="eye" size={14} color={theme.textSecondary} />
                     <Text style={[styles.statText, { color: theme.textSecondary }]}>
                       {Math.floor(Math.random() * 1000)}K
                     </Text>
                   </View>
                   <View style={styles.statItem}>
                     <Ionicons name="heart" size={14} color={theme.trending} />
                     <Text style={[styles.statText, { color: theme.textSecondary }]}>
                       {Math.floor(Math.random() * 100)}K
                     </Text>
                   </View>
                 </View>
               </TouchableOpacity>
             </Animated.View>
           )}
           keyExtractor={(item) => item.slug}
           showsVerticalScrollIndicator={false}
           scrollEnabled={false}
           contentContainerStyle={styles.trendingList}
         />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading trending manga...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderTimePeriods()}
        {renderTabs()}
        {renderTopRanked()}
        {renderTrendingList()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
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
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  trendingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  timePeriodsContainer: {
    marginBottom: 16,
  },
  timePeriodsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  timePeriod: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  timePeriodText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  topRankedContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  podiumManga: {
    position: "relative",
    width: "100%",
  },
  podiumCard: {
    width: "100%",
  },
  rankBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  trendingListContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  trendingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  trendingList: {
    paddingBottom: 100,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
  },
  trendingRank: {
    width: 40,
    alignItems: "center",
  },
  trendingRankText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  trendingContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  trendingCard: {
    width: "100%",
  },
  trendingStats: {
    alignItems: "flex-end",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});