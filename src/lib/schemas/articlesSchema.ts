import { z } from "zod";

const articleImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) {
        return false;
      }

      if (value.startsWith("/")) {
        return true;
      }

      return z.url().safeParse(value).success;
    },
    {
      message: "Invalid URL",
    },
  );

const optionalArticleImageUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}, articleImageUrlSchema.optional());

const nullableArticleImageUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}, articleImageUrlSchema.nullable());

/**
 * Schéma pro autora článku
 */
export const ArticleAuthorSchema = z.object({
   id: z.string().uuid(),
   name: z.string(),
   surname: z.string(),
   image: z.string().url(),
});

/**
 * Schéma pro tag článku
 */
export const ArticleTagSchema = z.object({
   id: z.string().uuid(),
   name: z.string(),
   description: z.string().nullable(),
});

export const ArticleKeywordSchema = z.object({
   id: z.string().uuid(),
   name: z.string(),
});

/**
 * Schéma pro článek s autorem (pro seznamy)
 */
export const ArticleWithAuthorSchema = z.object({
   id: z.string().uuid(),
   title: z.string(),
   slug: z.string(),
   description: z.string().nullable(),
   imageUrl: z.string().nullable(),
   status: z.enum(["draft", "need_factcheck", "need_read", "published"]),
   readingTime: z.number().nullable(),
   viewCount: z.number(),
   likesCount: z.number(),
   createdAt: z.date(),
   author: ArticleAuthorSchema.nullable(),
});

/**
 * Schéma pro článek s autorem a tagy (pro detail)
 */
export const ArticleWithAuthorAndTagsSchema = ArticleWithAuthorSchema.extend({
   content: z.unknown(),
   premiumOnly: z.boolean(),
   ratingEnabled: z.boolean(),
   commentsEnabled: z.boolean(),
   dislikesCount: z.number(),
   updatedAt: z.date(),
   tags: z.array(ArticleTagSchema),
   keywords: z.array(ArticleKeywordSchema),
});

/**
 * Schéma pro kartu článku (UI komponenta)
 */
export const ArticleCardSchema = z.object({
   id: z.string(),
   title: z.string(),
   slug: z.string(),
   description: z.string().nullable(),
   imageUrl: z.string().nullable(),
   readingTime: z.number().nullable(),
   authorName: z.string(),
   authorAvatar: z.string().nullable(),
   publishedAt: z.string(),
   category: z.string().nullable(),
   articleUrl: z.string(),
   tags: z.array(ArticleTagSchema).optional(),
});

export type ArticleCard = z.infer<typeof ArticleCardSchema>;

/**
 * Schéma pro detail článku (UI)
 */
export const ArticleDetailSchema = z.object({
   id: z.string(),
   title: z.string(),
   slug: z.string(),
   description: z.string().nullable(),
   imageUrl: z.string().nullable(),
   content: z.unknown(),
   premiumOnly: z.boolean(),
   authorName: z.string(),
   authorAvatar: z.string().nullable(),
   publishedAt: z.string(),
   updatedAt: z.string(),
   readingTime: z.number().nullable(),
   viewCount: z.number(),
   likesCount: z.number(),
   dislikesCount: z.number(),
   tags: z.array(ArticleTagSchema),
   ratingEnabled: z.boolean(),
   commentsEnabled: z.boolean(),
   threadId: z.string().nullable(),
});

export type ArticleDetail = z.infer<typeof ArticleDetailSchema>;

/**
 * Schéma pro vytvoření článku
 */
export const CreateArticleSchema = z.object({
   title: z.string().min(1).max(256),
   description: z.string().max(1024).optional(),
   slug: z.string().min(1).max(512),
   imageUrl: optionalArticleImageUrlSchema,
   content: z.unknown().optional(),
   authorId: z.string().uuid().optional(),
   status: z
      .enum(["draft", "need_factcheck", "need_read", "published"])
      .default("draft"),
   premiumOnly: z.boolean().default(false),
   ratingEnabled: z.boolean().default(true),
   commentsEnabled: z.boolean().default(true),
   tagIds: z.array(z.string().uuid()).optional(),
   keywords: z.array(z.string().trim().min(1).max(32)).optional(),
});

export type CreateArticle = z.infer<typeof CreateArticleSchema>;

/**
 * Schéma pro update článku
 */
export const UpdateArticleSchema = z.object({
   title: z.string().min(1).max(256).optional(),
   description: z.string().max(1024).nullable().optional(),
   slug: z.string().min(1).max(512).optional(),
   imageUrl: nullableArticleImageUrlSchema.optional(),
   content: z.unknown().nullable().optional(),
   authorId: z.string().uuid().optional(),
   status: z
      .enum(["draft", "need_factcheck", "need_read", "published"])
      .optional(),
   premiumOnly: z.boolean().optional(),
   ratingEnabled: z.boolean().optional(),
   commentsEnabled: z.boolean().optional(),
   tagIds: z.array(z.string().uuid()).optional(),
   keywords: z.array(z.string().trim().min(1).max(32)).optional(),
});

export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
