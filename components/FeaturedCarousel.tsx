import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth - 32;
const CARD_HEIGHT = 240;

interface FeaturedItem {
  title: string;
  slug: string;
  image: string;
  description?: string;
  rating?: number;
  type?: string;
}

interface FeaturedCarouselProps {
  items: FeaturedItem[];
  onItemPress: (item: FeaturedItem) => void;
  autoScroll?: boolean;
}

export default function FeaturedCarousel({
  items,
  onItemPress,
  autoScroll = true,
}: FeaturedCarouselProps) {
  const colorScheme = useColorScheme();
  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const colors = {
    light: {
      background: "#FFFFFF",
      text: "#FFFFFF",
      textSecondary: "#E0E0E0",
      primary: "#FF6B35",
      overlay: ["transparent", "rgba(0,0,0,0.7)"],
    },
    dark: {
      background: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      overlay: ["transparent", "rgba(0,0,0,0.8)"],
    },
  };

  const theme = colors[colorScheme || "light"];

  const startAutoScroll = () => {
    if (!autoScroll || items.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      const nextIndex = (currentIndex.value + 1) % items.length;
      currentIndex.value = nextIndex;
      scrollX.value = withTiming(nextIndex * CARD_WIDTH, { duration: 500 });
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [items.length, autoScroll]);

  const handleItemPress = (item: FeaturedItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    stopAutoScroll();
    onItemPress(item);
    setTimeout(startAutoScroll, 5000); // Resume after 5 seconds
  };

  const renderItem = (item: FeaturedItem, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH,
      ];

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1, 0.9],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.7, 1, 0.7],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View key={index} style={[styles.card, animatedStyle]}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
          
          <LinearGradient
            colors={theme.overlay}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          <View style={styles.cardContent}>
            {item.type && (
              <View style={[styles.typeBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
            )}

            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
              {item.title}
            </Text>

            {item.description && (
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.cardFooter}>
              {item.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              )}

              <View style={styles.readButton}>
                <Text style={[styles.readButtonText, { color: theme.primary }]}>
                  Read Now
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.primary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {items.map((_, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            const isActive = Math.round(scrollX.value / CARD_WIDTH) === index;
            return {
              width: withTiming(isActive ? 24 : 8, { duration: 300 }),
              opacity: withTiming(isActive ? 1 : 0.5, { duration: 300 }),
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: theme.primary },
                animatedStyle,
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContainer}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
          currentIndex.value = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
        }}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={startAutoScroll}
      >
        {items.map((item, index) => renderItem(item, index))}
      </Animated.ScrollView>

      {items.length > 1 && renderPagination()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT + 40,
    marginBottom: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardTouchable: {
    flex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  typeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  readButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});