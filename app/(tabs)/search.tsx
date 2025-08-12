import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import MangaCard from "@/components/MangaCard";

const POPULAR_GENRES = [
  "Action", "Romance", "Comedy", "Drama", "Fantasy", "Adventure",
  "Slice of Life", "Supernatural", "School Life", "Shoujo"
];

const MANGA_TYPES = [
  { label: "All", value: undefined },
  { label: "Manga", value: "manga" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manhua", value: "manhua" },
];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchManga = useAction(api.manga.searchManga);
  const browseManga = useAction(api.manga.browseManga);
  const browseByGenre = useAction(api.manga.browseByGenre);

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#FF6B35",
      border: "#E0E0E0",
      inputBackground: "#F5F5F5",
    },
    dark: {
      background: "#121212",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      primary: "#FF8A65",
      border: "#333333",
      inputBackground: "#2A2A2A",
    },
  };

  const theme = colors[colorScheme || "light"];

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      const data = await searchManga({ query: query.trim(), page: 1 });
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchManga]);

  const performBrowse = useCallback(async (type: string) => {
    try {
      setIsSearching(true);
      const data = await browseManga({ type: type as any, page: 1 });
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Browse error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [browseManga]);

  const performGenreBrowse = useCallback(async (genre: string) => {
    try {
      setIsSearching(true);
      const data = await browseByGenre({ genre: genre.toLowerCase(), page: 1 });
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Genre browse error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [browseByGenre]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSelectedType(undefined);
      setSelectedGenre(undefined);
      performSearch(query);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [performSearch]);

  const handleTypeSelect = (type: string | undefined) => {
    setSelectedType(type);
    setSearchQuery("");
    setSelectedGenre(undefined);
    if (type) {
      performBrowse(type);
    } else {
      setSearchResults([]);
    }
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery("");
    setSelectedType(undefined);
    performGenreBrowse(genre);
  };

  const handleMangaPress = (manga: any) => {
    router.push(`/manga/${manga.slug}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType(undefined);
    setSelectedGenre(undefined);
    setSearchResults([]);
    setIsSearching(false);
  };

  const renderSearchBar = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search manga, manhwa, manhua..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {(searchQuery || selectedType || selectedGenre) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderTypeFilters = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.filtersContainer}>
      <Text style={[styles.filterTitle, { color: theme.text }]}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {MANGA_TYPES.map((type) => (
            <TouchableOpacity
              key={type.label}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedType === type.value ? theme.primary : theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleTypeSelect(type.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedType === type.value ? "white" : theme.text,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderGenreFilters = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.filtersContainer}>
      <Text style={[styles.filterTitle, { color: theme.text }]}>Genres</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {POPULAR_GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedGenre === genre ? theme.primary : theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleGenreSelect(genre)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedGenre === genre ? "white" : theme.text,
                  },
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0 && (searchQuery || selectedType || selectedGenre)) {
      return (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No results found
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Try adjusting your search or filters
          </Text>
        </Animated.View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.emptyContainer}>
          <Ionicons name="book" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Discover Amazing Manga
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Search for your favorite manga or browse by genre
          </Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.resultsContainer}>
        <Text style={[styles.resultsTitle, { color: theme.text }]}>
          {searchResults.length} results found
        </Text>
        <FlatList
          data={searchResults}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(500 + index * 50)}>
              <MangaCard
                title={item.title}
                slug={item.slug}
                image={item.image}
                onPress={() => handleMangaPress(item)}
                rating={4.0 + Math.random() * 1.0}
                latestChapter="Latest"
                genres={["Action", "Drama"]}
                type="Manga"
                variant="list"
                style={styles.resultCard}
              />
            </Animated.View>
          )}
          keyExtractor={(item) => item.slug}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSearchBar()}
        {renderTypeFilters()}
        {renderGenreFilters()}
        {renderResults()}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
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
  resultsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  resultCard: {
    marginBottom: 8,
  },
});