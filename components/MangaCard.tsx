import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface MangaCardProps {
  title: string;
  slug: string;
  image: string;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  rating?: number;
  latestChapter?: string;
  genres?: string[];
  type?: string;
  isHot?: boolean;
  style?: any;
  variant?: "grid" | "list" | "featured";
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function MangaCard({
  title,
  slug,
  image,
  onPress,
  onFavorite,
  isFavorite = false,
  rating,
  latestChapter,
  genres = [],
  type,
  isHot = false,
  style,
  variant = "grid",
}: MangaCardProps) {
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);
  const favoriteScale = useSharedValue(1);

  const colors = {
    light: {
      background: "#FFFFFF",
      text: "#000000",
      textSecondary: "#666666",
      border: "#E0E0E0",
      shadow: "#000000",
      primary: "#FF6B35",
      surface: "#F8F9FA",
    },
    dark: {
      background: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      border: "#333333",
      shadow: "#000000",
      primary: "#FF8A65",
      surface: "#2A2A2A",
    },
  };

  const theme = colors[colorScheme || "light"];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const favoriteAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: favoriteScale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handleFavorite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    favoriteScale.value = withSpring(1.2, {}, () => {
      favoriteScale.value = withSpring(1);
    });
    onFavorite?.();
  };

  // Grid variant (default) - for home screen grids
  if (variant === "grid") {
    return (
      <AnimatedTouchableOpacity
        style={[styles.gridContainer, { backgroundColor: theme.background }, animatedStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.gridImage}
            contentFit="cover"
            transition={300}
            placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
          
          {/* Hot indicator */}
          {isHot && (
            <View style={[styles.hotBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="flame" size={10} color="white" />
              <Text style={styles.hotText}>HOT</Text>
            </View>
          )}

          {/* Type badge */}
          {type && (
            <View style={[styles.typeBadge, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
              <Text style={styles.typeText}>{type}</Text>
            </View>
          )}

          {/* Favorite button */}
          {onFavorite && (
            <AnimatedTouchableOpacity
              style={[styles.favoriteButton, favoriteAnimatedStyle]}
              onPress={handleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? theme.primary : "white"}
              />
            </AnimatedTouchableOpacity>
          )}
        </View>

        <View style={styles.gridContent}>
          <Text style={[styles.gridTitle, { color: theme.text }]} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.gridMetadata}>
            {rating && (
              <View style={styles.rating}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}

            {latestChapter && (
              <Text style={[styles.chapter, { color: theme.textSecondary }]} numberOfLines={1}>
                {latestChapter}
              </Text>
            )}
          </View>

          {genres.length > 0 && (
            <View style={styles.genres}>
              {genres.slice(0, 2).map((genre, index) => (
                <View key={index} style={[styles.genreTag, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.genreText, { color: theme.textSecondary }]}>
                    {genre}
                  </Text>
                </View>
              ))}
              {genres.length > 2 && (
                <Text style={[styles.moreGenres, { color: theme.textSecondary }]}>
                  +{genres.length - 2}
                </Text>
              )}
            </View>
          )}
        </View>
      </AnimatedTouchableOpacity>
    );
  }

  // List variant - for search results and library
  if (variant === "list") {
    return (
      <AnimatedTouchableOpacity
        style={[styles.listContainer, { backgroundColor: theme.background }, animatedStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.listImageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.listImage}
            contentFit="cover"
            transition={300}
            placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
          
          {isHot && (
            <View style={[styles.listHotBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="flame" size={8} color="white" />
            </View>
          )}
        </View>

        <View style={styles.listContent}>
          <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.listMetadata}>
            {rating && (
              <View style={styles.rating}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
            
            {type && (
              <View style={[styles.listTypeBadge, { backgroundColor: theme.surface }]}>
                <Text style={[styles.listTypeText, { color: theme.textSecondary }]}>{type}</Text>
              </View>
            )}
          </View>

          {latestChapter && (
            <Text style={[styles.listChapter, { color: theme.textSecondary }]} numberOfLines={1}>
              {latestChapter}
            </Text>
          )}

          {genres.length > 0 && (
            <View style={styles.listGenres}>
              {genres.slice(0, 3).map((genre, index) => (
                <Text key={index} style={[styles.listGenreText, { color: theme.textSecondary }]}>
                  {genre}{index < Math.min(genres.length - 1, 2) ? " • " : ""}
                </Text>
              ))}
            </View>
          )}
        </View>

        {onFavorite && (
          <AnimatedTouchableOpacity
            style={[styles.listFavoriteButton, favoriteAnimatedStyle]}
            onPress={handleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? theme.primary : theme.textSecondary}
            />
          </AnimatedTouchableOpacity>
        )}
      </AnimatedTouchableOpacity>
    );
  }

  // Featured variant - for carousels and featured sections
  return (
    <AnimatedTouchableOpacity
      style={[styles.featuredContainer, animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: image }}
        style={styles.featuredImage}
        contentFit="cover"
        transition={300}
        placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      />
      
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          {isHot && (
            <View style={[styles.featuredHotBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="flame" size={12} color="white" />
              <Text style={styles.featuredHotText}>HOT</Text>
            </View>
          )}
          
          <Text style={[styles.featuredTitle, { color: "white" }]} numberOfLines={2}>
            {title}
          </Text>
          
          <View style={styles.featuredMetadata}>
            {rating && (
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={[styles.ratingText, { color: "rgba(255,255,255,0.9)" }]}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
            
            {type && (
              <View style={styles.featuredTypeBadge}>
                <Text style={styles.featuredTypeText}>{type}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid variant styles
  gridContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gridImageContainer: {
    position: "relative",
    aspectRatio: 3 / 4,
  },
  gridImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 6,
  },
  gridMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  // List variant styles
  listContainer: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listImageContainer: {
    position: "relative",
    width: 80,
    height: 112,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  listImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  listContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 4,
  },
  listMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  listChapter: {
    fontSize: 12,
    marginBottom: 4,
  },
  listGenres: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listGenreText: {
    fontSize: 11,
  },
  listHotBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  listTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  listTypeText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  listFavoriteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Featured variant styles
  featuredContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
    marginBottom: 8,
  },
  featuredMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredHotBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  featuredHotText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  featuredTypeBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  featuredTypeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Shared styles
  hotBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hotText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
    marginLeft: 2,
  },
  typeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  favoriteButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 2,
  },
  chapter: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  genres: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  genreTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 2,
  },
  genreText: {
    fontSize: 9,
    fontWeight: "500",
  },
  moreGenres: {
    fontSize: 9,
    fontWeight: "500",
  },
});