import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user preferences
export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    // Return default preferences if none exist
    if (!preferences) {
      return {
        theme: "auto" as const,
        readingMode: "vertical" as const,
        autoScroll: false,
        brightness: 1.0,
        pageSound: true,
        notifications: true,
        downloadQuality: "high" as const,
      };
    }

    return preferences;
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.string(),
    preferences: v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))),
      readingMode: v.optional(v.union(v.literal("vertical"), v.literal("horizontal"))),
      autoScroll: v.optional(v.boolean()),
      brightness: v.optional(v.number()),
      pageSound: v.optional(v.boolean()),
      notifications: v.optional(v.boolean()),
      downloadQuality: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args.preferences);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId: args.userId,
        theme: args.preferences.theme || "auto",
        readingMode: args.preferences.readingMode || "vertical",
        autoScroll: args.preferences.autoScroll || false,
        brightness: args.preferences.brightness || 1.0,
        pageSound: args.preferences.pageSound || true,
        notifications: args.preferences.notifications || true,
        downloadQuality: args.preferences.downloadQuality || "high",
      });
    }
  },
});

// Add to search history
export const addToSearchHistory = mutation({
  args: {
    userId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Don't add empty queries
    if (!args.query.trim()) return;

    // Remove existing entry if it exists
    const existing = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("query"), args.query))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Add new entry
    await ctx.db.insert("searchHistory", {
      userId: args.userId,
      query: args.query,
      searchedAt: Date.now(),
    });

    // Keep only last 20 searches
    const allSearches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (allSearches.length > 20) {
      const toDelete = allSearches.slice(20);
      for (const item of toDelete) {
        await ctx.db.delete(item._id);
      }
    }
  },
});

// Get search history
export const getSearchHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const searchHistory = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    return searchHistory;
  },
});

// Clear search history
export const clearSearchHistory = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const searchHistory = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const item of searchHistory) {
      await ctx.db.delete(item._id);
    }
  },
});