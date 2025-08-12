import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User library and reading progress
  library: defineTable({
    userId: v.string(),
    mangaSlug: v.string(),
    status: v.union(v.literal("reading"), v.literal("want_to_read"), v.literal("completed"), v.literal("dropped")),
    addedAt: v.number(),
    lastReadAt: v.optional(v.number()),
    currentChapter: v.optional(v.string()),
    isFavorite: v.boolean(),
  }).index("by_user", ["userId"]).index("by_user_and_manga", ["userId", "mangaSlug"]),

  // Reading progress for chapters
  readingProgress: defineTable({
    userId: v.string(),
    mangaSlug: v.string(),
    chapterSlug: v.string(),
    currentPage: v.number(),
    totalPages: v.number(),
    isCompleted: v.boolean(),
    readAt: v.number(),
  }).index("by_user_and_manga", ["userId", "mangaSlug"]).index("by_user_manga_chapter", ["userId", "mangaSlug", "chapterSlug"]),

  // User preferences
  userPreferences: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("auto")),
    readingMode: v.union(v.literal("vertical"), v.literal("horizontal")),
    autoScroll: v.boolean(),
    brightness: v.number(),
    pageSound: v.boolean(),
    notifications: v.boolean(),
    downloadQuality: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  }).index("by_user", ["userId"]),

  // Downloaded chapters for offline reading
  downloads: defineTable({
    userId: v.string(),
    mangaSlug: v.string(),
    chapterSlug: v.string(),
    downloadedAt: v.number(),
    size: v.number(),
    status: v.union(v.literal("downloading"), v.literal("completed"), v.literal("failed")),
  }).index("by_user", ["userId"]).index("by_user_and_manga", ["userId", "mangaSlug"]),

  // Search history
  searchHistory: defineTable({
    userId: v.string(),
    query: v.string(),
    searchedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Recently viewed manga
  recentlyViewed: defineTable({
    userId: v.string(),
    mangaSlug: v.string(),
    mangaTitle: v.string(),
    mangaImage: v.string(),
    viewedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_and_viewed", ["userId", "viewedAt"]),
});