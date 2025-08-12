import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import FeaturedCarousel from "@/components/FeaturedCarousel";
import MangaCard from "@/components/MangaCard";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [homepageData, setHomepageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getHomepage = useAction(api.manga.getHomepage);

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

  const fetchHomepageData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await getHomepage({ page });
      setHomepageData(data);
    } catch (error) {
      console.error("Error fetching homepage:", error);
    } finally {
      setLoading(false);
    }
  }, [getHomepage]);

  useEffect(() => {
    fetchHomepageData(currentPage);
  }, [fetchHomepageData, currentPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchHomepageData(1);
    setRefreshing(false);
  }, [fetchHomepageData]);

  const handleMangaPress = (manga: any) => {
    router.push(`/manga/${manga.slug}`);
  };

  const handleSearchPress = () => {
    router.push("/(tabs)/search");
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.appName, { color: theme.text }]}>
            MangaTone
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.surface }]}
            onPress={handleSearchPress}
          >
            <Ionicons name="search" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.surface }]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderFeaturedSection = () => {
    if (!homepageData?.latestManga) return null;

    const featuredItems = homepageData.latestManga.slice(0, 5).map((manga: any) => ({
      title: manga.title,
      slug: manga.slug,
      image: manga.image,
      description: `Latest manga from our collection`,
      rating: 4.5 + Math.random() * 0.5,
      type: "Manga",
    }));

    return (
      <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Featured Today
        </Text>
        <FeaturedCarousel
          items={featuredItems}
          onItemPress={handleMangaPress}
          autoScroll={true}
        />
      </Animated.View>
    );
  };

  const renderLatestSection = () => {
    if (!homepageData?.latestManga) return null;

    return (
      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Latest Updates
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/trending")}
            style={styles.seeAllButton}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              See All
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={homepageData.latestManga.slice(5, 15)}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(400 + index * 50)}>
              <MangaCard
                title={item.title}
                slug={item.slug}
                image={item.image}
                onPress={() => handleMangaPress(item)}
                rating={4.0 + Math.random() * 1.0}
                latestChapter="Latest Chapter"
                genres={["Action", "Drama"]}
                type="Manga"
                variant="grid"
                style={styles.mangaCard}
              />
            </Animated.View>
          )}
          keyExtractor={(item) => item.slug}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    );
  };

  const renderPopularSection = () => {
    if (!homepageData?.latestManga) return null;

    return (
      <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Popular Today
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/trending")}
            style={styles.seeAllButton}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              See All
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {homepageData.latestManga.slice(15, 25).map((item: any, index: number) => (
            <Animated.View key={item.slug} entering={FadeInDown.delay(600 + index * 50)}>
              <MangaCard
                title={item.title}
                slug={item.slug}
                image={item.image}
                onPress={() => handleMangaPress(item)}
                rating={4.2 + Math.random() * 0.8}
                latestChapter="Ch. 45"
                genres={["Romance", "Comedy"]}
                type="Manhwa"
                isHot={index < 3}
                variant="grid"
                style={styles.horizontalCard}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderTrendingList = () => {
    if (!homepageData?.latestManga) return null;

    return (
      <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Trending Now
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/trending")}
            style={styles.seeAllButton}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              See All
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.trendingList}>
          {homepageData.latestManga.slice(25, 30).map((item: any, index: number) => (
            <Animated.View key={item.slug} entering={FadeInDown.delay(750 + index * 50)}>
              <View style={styles.trendingItem}>
                <View style={[styles.rankBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <MangaCard
                  title={item.title}
                  slug={item.slug}
                  image={item.image}
                  onPress={() => handleMangaPress(item)}
                  rating={4.5 + Math.random() * 0.5}
                  latestChapter="Latest"
                  genres={["Popular", "Trending"]}
                  type="Hot"
                  isHot={index < 2}
                  variant="list"
                  style={styles.trendingCard}
                />
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading amazing manga...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {renderHeader()}
        {renderFeaturedSection()}
        {renderLatestSection()}
        {renderPopularSection()}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  mangaCard: {
    width: "48%",
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  horizontalCard: {
    width: 160,
    marginRight: 12,
  },
  trendingList: {
    paddingHorizontal: 20,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  trendingCard: {
    flex: 1,
    marginBottom: 0,
  },
  bottomSpacing: {
    height: 100,
  },
});