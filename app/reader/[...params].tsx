import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ReaderScreen() {
  const { params } = useLocalSearchParams<{ params: string[] }>();
  const [mangaSlug, chapterSlug] = params || [];
  
  const colorScheme = useColorScheme();
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState<"vertical" | "horizontal">("vertical");
  const [brightness, setBrightness] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chapterData, setChapterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const controlsOpacity = useSharedValue(1);
  const settingsTranslateY = useSharedValue(300);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const getChapterImages = useAction(api.manga.getChapterImages);

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#FF6B35",
      overlay: "rgba(0,0,0,0.8)",
    },
    dark: {
      background: "#000000",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      overlay: "rgba(0,0,0,0.9)",
    },
  };

  const theme = colors[colorScheme || "light"];

  useEffect(() => {
    // Hide status bar for immersive reading
    if (Platform.OS === "ios") {
      StatusBar.setHidden(isFullscreen, "slide");
    }

    return () => {
      if (Platform.OS === "ios") {
        StatusBar.setHidden(false, "slide");
      }
    };
  }, [isFullscreen]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    const timer = setTimeout(() => {
      if (showControls) {
        hideControls();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const showControlsHandler = () => {
    setShowControls(true);
    controlsOpacity.value = withTiming(1, { duration: 300 });
  };

  const hideControls = () => {
    setShowControls(false);
    controlsOpacity.value = withTiming(0, { duration: 300 });
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsHandler();
    }
  };

  const showSettingsPanel = () => {
    setShowSettings(true);
    settingsTranslateY.value = withSpring(0);
  };

  const hideSettingsPanel = () => {
    settingsTranslateY.value = withSpring(300, {}, () => {
      runOnJS(setShowSettings)(false);
    });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const progress = event.contentOffset.y / (event.contentSize.height - event.layoutMeasurement.height);
      runOnJS(setScrollProgress)(Math.max(0, Math.min(1, progress)));
    },
  });

  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  const settingsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: settingsTranslateY.value }],
    };
  });

  const renderTopControls = () => (
    <Animated.View style={[styles.topControls, { backgroundColor: theme.overlay }, controlsAnimatedStyle]}>
      <SafeAreaView>
        <View style={styles.topControlsContent}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterTitle} numberOfLines={1}>
              {chapterSlug?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={styles.pageInfo}>
              {Math.round(scrollProgress * 100)}% Complete
            </Text>
          </View>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={showSettingsPanel}
          >
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );

  const renderBottomControls = () => (
    <Animated.View style={[styles.bottomControls, { backgroundColor: theme.overlay }, controlsAnimatedStyle]}>
      <SafeAreaView>
        <View style={styles.bottomControlsContent}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              // Navigate to previous chapter
              Alert.alert("Previous Chapter", "Navigate to previous chapter");
            }}
          >
            <Ionicons name="chevron-back" size={20} color="white" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${scrollProgress * 100}%`,
                    backgroundColor: theme.primary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(scrollProgress * 100)}%
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              // Navigate to next chapter
              Alert.alert("Next Chapter", "Navigate to next chapter");
            }}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );

  const renderSettingsPanel = () => {
    if (!showSettings) return null;

    return (
      <View style={styles.settingsOverlay}>
        <TouchableOpacity 
          style={styles.settingsBackdrop} 
          onPress={hideSettingsPanel}
          activeOpacity={1}
        />
        <Animated.View style={[styles.settingsPanel, { backgroundColor: theme.surface }, settingsAnimatedStyle]}>
          <View style={styles.settingsHeader}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>
              Reading Settings
            </Text>
            <TouchableOpacity onPress={hideSettingsPanel}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="book" size={20} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Reading Mode
                </Text>
              </View>
              <View style={styles.modeButtons}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: readingMode === "vertical" ? theme.primary : theme.background,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setReadingMode("vertical")}
                >
                  <Text style={[
                    styles.modeButtonText,
                    { color: readingMode === "vertical" ? "white" : theme.text }
                  ]}>
                    Vertical
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: readingMode === "horizontal" ? theme.primary : theme.background,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setReadingMode("horizontal")}
                >
                  <Text style={[
                    styles.modeButtonText,
                    { color: readingMode === "horizontal" ? "white" : theme.text }
                  ]}>
                    Horizontal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="sunny" size={20} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Brightness
                </Text>
              </View>
              <View style={styles.brightnessContainer}>
                <TouchableOpacity
                  onPress={() => setBrightness(Math.max(0.1, brightness - 0.1))}
                >
                  <Ionicons name="remove" size={20} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.brightnessBar}>
                  <View 
                    style={[
                      styles.brightnessFill,
                      { 
                        width: `${brightness * 100}%`,
                        backgroundColor: theme.primary 
                      }
                    ]} 
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setBrightness(Math.min(1.0, brightness + 0.1))}
                >
                  <Ionicons name="add" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsFullscreen(!isFullscreen)}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="expand" size={20} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Fullscreen Mode
                </Text>
              </View>
              <Ionicons 
                name={isFullscreen ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isFullscreen ? theme.primary : theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderWebtoonReader = () => {
    if (!chapterData?.images || chapterData.images.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading chapter...
          </Text>
        </View>
      );
    }

    return (
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={false}
      >
        <TouchableOpacity
          style={styles.tapArea}
          onPress={toggleControls}
          activeOpacity={1}
        >
          {chapterData.images.map((image: any, index: number) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image.url }}
                style={styles.mangaImage}
                contentFit="contain"
                transition={300}
                placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                onLoad={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            </View>
          ))}
          
          {/* End of chapter indicator */}
          <View style={[styles.endOfChapter, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-circle" size={48} color={theme.primary} />
            <Text style={[styles.endTitle, { color: theme.text }]}>
              Chapter Complete!
            </Text>
            <Text style={[styles.endSubtitle, { color: theme.textSecondary }]}>
              You've reached the end of this chapter
            </Text>
            
            <View style={styles.endActions}>
              <TouchableOpacity
                style={[styles.endButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  Alert.alert("Next Chapter", "Navigate to next chapter");
                }}
              >
                <Text style={styles.endButtonText}>Next Chapter</Text>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.endButton, { backgroundColor: theme.background, borderColor: theme.primary, borderWidth: 1 }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.endButtonText, { color: theme.primary }]}>Back to Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.ScrollView>
    );
  };

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!mangaSlug || !chapterSlug) return;
      
      try {
        setLoading(true);
        const data = await getChapterImages({ mangaSlug, chapterSlug });
        setChapterData(data);
      } catch (error) {
        console.error("Error fetching chapter data:", error);
        Alert.alert("Error", "Failed to load chapter. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [mangaSlug, chapterSlug, getChapterImages]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading chapter...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, opacity: brightness }]}>
      {renderWebtoonReader()}
      {renderTopControls()}
      {renderBottomControls()}
      {renderSettingsPanel()}
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
  scrollContainer: {
    flex: 1,
  },
  tapArea: {
    flex: 1,
    minHeight: screenHeight,
  },
  imageContainer: {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  mangaImage: {
    width: screenWidth,
    minHeight: screenHeight * 0.8,
    maxHeight: screenHeight * 3,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topControlsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  chapterInfo: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  chapterTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  pageInfo: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomControlsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 4,
    color: "white",
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  settingsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  settingsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  settingsPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.6,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  modeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  brightnessContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brightnessBar: {
    width: 100,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
  },
  brightnessFill: {
    height: "100%",
    borderRadius: 2,
  },
  endOfChapter: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginTop: 40,
  },
  endTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  endSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  endActions: {
    width: "100%",
    gap: 12,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
    color: "white",
  },
});