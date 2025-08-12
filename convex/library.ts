import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Add manga to library
export const addToLibrary = mutation({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
    status: v.union(v.literal("reading"), v.literal("want_to_read"), v.literal("completed"), v.literal("dropped")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("library")
      .withIndex("by_user_and_manga", (q) => q.eq("userId", args.userId).eq("mangaSlug", args.mangaSlug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastReadAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("library", {
        userId: args.userId,
        mangaSlug: args.mangaSlug,
        status: args.status,
        addedAt: Date.now(),
        isFavorite: false,
      });
    }
  },
});

// Remove from library
export const removeFromLibrary = mutation({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("library")
      .withIndex("by_user_and_manga", (q) => q.eq("userId", args.userId).eq("mangaSlug", args.mangaSlug))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

// Toggle favorite
export const toggleFavorite = mutation({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("library")
      .withIndex("by_user_and_manga", (q) => q.eq("userId", args.userId).eq("mangaSlug", args.mangaSlug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isFavorite: !existing.isFavorite,
      });
      return !existing.isFavorite;
    }
    return false;
  },
});

// Get user library
export const getUserLibrary = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const library = await ctx.db
      .query("library")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return library;
  },
});

// Get library by status
export const getLibraryByStatus = query({
  args: {
    userId: v.string(),
    status: v.union(v.literal("reading"), v.literal("want_to_read"), v.literal("completed"), v.literal("dropped")),
  },
  handler: async (ctx, args) => {
    const library = await ctx.db
      .query("library")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .collect();

    return library;
  },
});

// Check if manga is in library
export const isInLibrary = query({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("library")
      .withIndex("by_user_and_manga", (q) => q.eq("userId", args.userId).eq("mangaSlug", args.mangaSlug))
      .unique();

    return existing || null;
  },
});

// Update reading progress
export const updateReadingProgress = mutation({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
    chapterSlug: v.string(),
    currentPage: v.number(),
    totalPages: v.number(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_manga_chapter", (q) => 
        q.eq("userId", args.userId)
         .eq("mangaSlug", args.mangaSlug)
         .eq("chapterSlug", args.chapterSlug)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentPage: args.currentPage,
        totalPages: args.totalPages,
        isCompleted: args.isCompleted,
        readAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("readingProgress", {
        userId: args.userId,
        mangaSlug: args.mangaSlug,
        chapterSlug: args.chapterSlug,
        currentPage: args.currentPage,
        totalPages: args.totalPages,
        isCompleted: args.isCompleted,
        readAt: Date.now(),
      });
    }
  },
});

// Get reading progress
export const getReadingProgress = query({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
    chapterSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_manga_chapter", (q) => 
        q.eq("userId", args.userId)
         .eq("mangaSlug", args.mangaSlug)
         .eq("chapterSlug", args.chapterSlug)
      )
      .unique();

    return progress;
  },
});

// Get manga reading progress
export const getMangaProgress = query({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_and_manga", (q) => q.eq("userId", args.userId).eq("mangaSlug", args.mangaSlug))
      .order("desc")
      .collect();

    return progress;
  },
});

// Add to recently viewed
export const addToRecentlyViewed = mutation({
  args: {
    userId: v.string(),
    mangaSlug: v.string(),
    mangaTitle: v.string(),
    mangaImage: v.string(),
  },
  handler: async (ctx, args) => {
    // Remove existing entry if it exists
    const existing = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("mangaSlug"), args.mangaSlug))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Add new entry
    await ctx.db.insert("recentlyViewed", {
      userId: args.userId,
      mangaSlug: args.mangaSlug,
      mangaTitle: args.mangaTitle,
      mangaImage: args.mangaImage,
      viewedAt: Date.now(),
    });

    // Keep only last 20 entries
    const allViewed = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (allViewed.length > 20) {
      const toDelete = allViewed.slice(20);
      for (const item of toDelete) {
        await ctx.db.delete(item._id);
      }
    }
  },
});

// Get recently viewed
export const getRecentlyViewed = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const recentlyViewed = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    return recentlyViewed;
  },
});