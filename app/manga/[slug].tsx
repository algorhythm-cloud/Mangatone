import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import MangaCard from "@/components/MangaCard";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const HEADER_HEIGHT = 300;

export default function MangaDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colorScheme = useColorScheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState("chapters");
  const [mangaDetails, setMangaDetails] = useState<any>(null);
  const [mangaChapters, setMangaChapters] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const scrollY = useSharedValue(0);

  const getMangaDetails = useAction(api.manga.getMangaDetails);
  const getMangaChapters = useAction(api.manga.getMangaChapters);
  const getSeriesRecommendations = useAction(api.manga.getSeriesRecommendations);

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#FF6B35",
      border: "#E0E0E0",
      overlay: "rgba(0,0,0,0.6)",
    },
    dark: {
      background: "#121212",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      border: "#333333",
      overlay: "rgba(0,0,0,0.8)",
    },
  };

  const theme = colors[colorScheme || "light"];

  useEffect(() => {
    if (slug) {
      fetchMangaData();
    }
  }, [slug]);

  const fetchMangaData = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      
      // Fetch manga details
      const details = await getMangaDetails({ slug });
      setMangaDetails(details);
      
      // Fetch chapters
      const chapters = await getMangaChapters({ slug });
      setMangaChapters(chapters);
      
      // Fetch recommendations
      try {
        const recs = await getSeriesRecommendations({ slug });
        setRecommendations(recs);
      } catch (error) {
        console.log("Recommendations not available:", error);
      }
      
    } catch (error) {
      console.error("Error fetching manga data:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0, HEADER_HEIGHT],
      [1.2, 1, 0.8],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT / 2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const handleFavorite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsFavorite(!isFavorite);
  };

  const handleChapterPress = (chapter: any) => {
    router.push(`/reader/${slug}/${chapter.slug}`);
  };

  const handleMangaPress = (manga: any) => {
    router.push(`/manga/${manga.slug}`);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <Image
          source={{ uri: mangaDetails?.image }}
          style={styles.headerImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["transparent", theme.overlay]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.headerOverlay}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: "rgba(0,0,0,0.5)" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "rgba(0,0,0,0.5)" }]}
              onPress={() => {}}
            >
              <Ionicons name="share" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "rgba(0,0,0,0.5)" }]}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? theme.primary : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <Animated.View
        style={[
          styles.floatingHeader,
          { backgroundColor: theme.background },
          headerAnimatedStyle,
        ]}
      >
        <SafeAreaView>
          <View style={styles.floatingHeaderContent}>
            <TouchableOpacity
              style={styles.floatingBackButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.floatingTitle, { color: theme.text }]} numberOfLines={1}>
              {mangaDetails?.title}
            </Text>
            <TouchableOpacity
              style={styles.floatingActionButton}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? theme.primary : theme.text}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );

  const renderMangaInfo = () => (
    <Animated.View entering={FadeInUp.delay(300)} style={styles.infoContainer}>
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: mangaDetails?.image }}
          style={styles.coverImage}
          contentFit="cover"
          transition={300}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {mangaDetails?.title}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              4.{Math.floor(Math.random() * 9) + 1}
            </Text>
          </View>
          <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
            {mangaDetails?.author} • {mangaDetails?.released}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.statusText}>{mangaDetails?.status}</Text>
          </View>
          {mangaDetails?.type && (
            <View style={[styles.typeBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.typeText, { color: theme.textSecondary }]}>
                {mangaDetails.type}
              </Text>
            </View>
          )}
        </View>

        {mangaDetails?.genres && (
          <View style={styles.genres}>
            {mangaDetails.genres.slice(0, 3).map((genre: any, index: number) => (
              <View key={index} style={[styles.genreTag, { backgroundColor: theme.surface }]}>
                <Text style={[styles.genreText, { color: theme.textSecondary }]}>
                  {genre.name}
                </Text>
              </View>
            ))}
            {mangaDetails.genres.length > 3 && (
              <Text style={[styles.moreGenres, { color: theme.textSecondary }]}>
                +{mangaDetails.genres.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderActionButtons = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.actionContainer}>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        onPress={() => {
          if (mangaChapters?.chapters?.[0]) {
            handleChapterPress(mangaChapters.chapters[0]);
          }
        }}
      >
        <Ionicons name="play" size={20} color="white" />
        <Text style={styles.primaryButtonText}>Start Reading</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => {}}
      >
        <Ionicons name="add" size={20} color={theme.text} />
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Add to Library</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderDescription = () => (
    <Animated.View entering={FadeInDown.delay(500)} style={styles.descriptionContainer}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {mangaDetails?.description || "No description available."}
      </Text>
    </Animated.View>
  );

  const renderTabs = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.tabsContainer}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "chapters" && { borderBottomColor: theme.primary },
          ]}
          onPress={() => setSelectedTab("chapters")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === "chapters" ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            Chapters ({mangaChapters?.chapters?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "recommendations" && { borderBottomColor: theme.primary },
          ]}
          onPress={() => setSelectedTab("recommendations")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === "recommendations" ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            Similar
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderChapters = () => {
    if (selectedTab !== "chapters" || !mangaChapters?.chapters) return null;

    return (
      <Animated.View entering={FadeInDown.delay(700)} style={styles.chaptersContainer}>
        {mangaChapters.chapters.map((chapter: any, index: number) => (
          <Animated.View key={chapter.slug} entering={FadeInDown.delay(750 + index * 50)}>
            <TouchableOpacity
              style={[styles.chapterItem, { backgroundColor: theme.surface }]}
              onPress={() => handleChapterPress(chapter)}
            >
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, { color: theme.text }]}>
                  {chapter.title}
                </Text>
                <Text style={[styles.chapterDate, { color: theme.textSecondary }]}>
                  {chapter.date}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  const renderRecommendations = () => {
    if (selectedTab !== "recommendations" || !recommendations?.recommendations) return null;

    return (
      <Animated.View entering={FadeInDown.delay(700)} style={styles.recommendationsContainer}>
        <View style={styles.recommendationsGrid}>
          {recommendations.recommendations.map((manga: any, index: number) => (
            <Animated.View key={manga.slug} entering={FadeInDown.delay(750 + index * 50)}>
              <MangaCard
                title={manga.title}
                slug={manga.slug}
                image={manga.image}
                onPress={() => handleMangaPress(manga)}
                rating={manga.rating}
                latestChapter={manga.latestChapter}
                genres={[manga.type]}
                type={manga.type}
                isHot={manga.isHot}
                style={styles.recommendationCard}
              />
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
            Loading manga details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={{ height: HEADER_HEIGHT - 100 }} />
        {renderMangaInfo()}
        {renderActionButtons()}
        {renderDescription()}
        {renderTabs()}
        {renderChapters()}
        {renderRecommendations()}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 10,
  },
  imageContainer: {
    flex: 1,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  floatingHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  floatingBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
  },
  floatingActionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  coverContainer: {
    marginRight: 16,
  },
  coverImage: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },
  infoContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
    marginBottom: 8,
  },
  metadata: {
    marginBottom: 12,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  metadataText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  genreText: {
    fontSize: 10,
    fontWeight: "500",
  },
  moreGenres: {
    fontSize: 10,
    fontWeight: "500",
  },
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  chaptersContainer: {
    paddingHorizontal: 20,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  chapterDate: {
    fontSize: 14,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
  },
  recommendationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recommendationCard: {
    width: "48%",
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});