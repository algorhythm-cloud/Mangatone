"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const API_BASE_URL = "https://v0-kingofshojo-api.vercel.app";

// Get homepage content
export const getHomepage = action({
  args: { page: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/home?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching homepage:", error);
      throw new Error("Failed to fetch homepage content");
    }
  },
});

// Get manga details
export const getMangaDetails = action({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manga/${args.slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching manga details:", error);
      throw new Error("Failed to fetch manga details");
    }
  },
});

// Get manga chapters
export const getMangaChapters = action({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manga/${args.slug}/chapters`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching manga chapters:", error);
      throw new Error("Failed to fetch manga chapters");
    }
  },
});

// Get chapter images
export const getChapterImages = action({
  args: { 
    mangaSlug: v.string(),
    chapterSlug: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chapter/${args.mangaSlug}/${args.chapterSlug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chapter images:", error);
      throw new Error("Failed to fetch chapter images");
    }
  },
});

// Search manga
export const searchManga = action({
  args: { 
    query: v.string(),
    page: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(args.query)}&page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching manga:", error);
      throw new Error("Failed to search manga");
    }
  },
});

// Browse manga by type
export const browseManga = action({
  args: { 
    type: v.optional(v.union(v.literal("manga"), v.literal("manhwa"), v.literal("manhua"))),
    page: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const type = args.type || "manga";
    const page = args.page || 1;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/browse?type=${type}&page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error browsing manga:", error);
      throw new Error("Failed to browse manga");
    }
  },
});

// Browse manga by genre
export const browseByGenre = action({
  args: { 
    genre: v.string(),
    page: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/genres/${args.genre}?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error browsing by genre:", error);
      throw new Error("Failed to browse by genre");
    }
  },
});

// Get series recommendations
export const getSeriesRecommendations = action({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/series/${args.slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching series recommendations:", error);
      throw new Error("Failed to fetch series recommendations");
    }
  },
});

// Get chapter recommendations
export const getChapterRecommendations = action({
  args: { 
    mangaSlug: v.string(),
    chapterSlug: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/chapter/${args.mangaSlug}/${args.chapterSlug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chapter recommendations:", error);
      throw new Error("Failed to fetch chapter recommendations");
    }
  },
});