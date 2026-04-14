import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  uuid,
  jsonb,
  integer,
  bigint,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// --- 0. ENUMY ---

export const tokenTypeEnum = pgEnum("token_type", [
  "password_reset",
  "email_verification",
  "registration_confirmation",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "auth",
  "system",
]);

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "need_factcheck",
  "need_read",
  "published",
]);

export const organizationApplicationStatusEnum = pgEnum(
  "organization_application_status",
  ["submitted", "under_review", "approved", "rejected", "withdrawn"],
);

export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
  "owner",
  "manager",
  "viewer",
]);

export const organizationInviteStatusEnum = pgEnum(
  "organization_invite_status",
  ["pending", "accepted", "revoked", "expired"],
);

export const organizationOnboardingStatusEnum = pgEnum(
  "organization_onboarding_status",
  ["pending", "active", "suspended"],
);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "dismissed",
]);

// --- 1. UŽIVATELÉ A ROLE ---

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 32 }).notNull(),
    surname: varchar("surname", { length: 32 }).notNull(), // Extra pole - BetterAuth ho ignoruje
    email: varchar("email", { length: 128 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(), // BetterAuth vyžaduje
    image: varchar("image", { length: 1024 }), // BetterAuth používá 'image', ne 'picture'
    bio: varchar("bio", { length: 4096 }).default("").notNull(), // Extra pole
    maxStorageBytes: bigint("max_storage_bytes", { mode: "number" })
      .default(2147483648)
      .notNull(), // 2GB default
    lastLoginAt: timestamp("last_login_at"), // Extra pole
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Extra pole - soft delete
    isBanned: boolean("is_banned").default(false).notNull(), // Extra pole
    bannedAt: timestamp("banned_at"), // Extra pole
    // POZOR: password se ukládá v 'account' tabulce (BetterAuth), ne zde!
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  }),
);

/**
 * Audit Logy - Záznamy o důležitých změnách v systému (Byznysová úroveň)
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(), // např. "articles"
    entityId: uuid("entity_id"), // ID konkrétního záznamu
    metadata: jsonb("metadata"), // Snapshot změn: { "old": {...}, "new": {...} }
    ipAddress: varchar("ip_address", { length: 45 }), // Pro security audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
    userActionIdx: index("audit_user_action_idx").on(t.userId, t.action),
  }),
);

/**
 * BetterAuth - Session tabulka
 * Ukládá aktivní session uživatelů
 */
export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("session_token_idx").on(t.token),
    userIdIdx: index("session_user_id_idx").on(t.userId),
  }),
);

/**
 * BetterAuth - Account tabulka
 * Ukládá password (pro email/password) a OAuth účty
 * Pro email/password: providerId = "credential", accountId = userId, password = hashed password
 */
export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: varchar("account_id", { length: 256 }).notNull(), // Pro credential = userId, pro OAuth = provider account ID
    providerId: varchar("provider_id", { length: 64 }).notNull(), // "credential" pro email/password, "google", "github", atd. pro OAuth
    password: varchar("password", { length: 256 }), // Hashed password (pouze pro credential provider)
    accessToken: text("access_token"), // OAuth access token
    refreshToken: text("refresh_token"), // OAuth refresh token
    accessTokenExpiresAt: timestamp("access_token_expires_at"), // OAuth token expiration
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"), // OAuth refresh token expiration
    scope: varchar("scope", { length: 512 }), // OAuth scope
    idToken: text("id_token"), // OAuth ID token
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdProviderIdx: index("account_user_id_provider_idx").on(
      t.userId,
      t.providerId,
    ),
    accountIdProviderIdx: index("account_account_id_provider_idx").on(
      t.accountId,
      t.providerId,
    ),
  }),
);

/**
 * BetterAuth - Verification tabulka
 * Pro email verification a password reset
 */
export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: varchar("identifier", { length: 256 }).notNull(), // Email nebo jiný identifikátor
    value: varchar("value", { length: 512 }).notNull(), // Verification token
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    identifierValueIdx: index("verification_identifier_value_idx").on(
      t.identifier,
      t.value,
    ),
  }),
);

/**
 * BetterAuth - Passkey tabulka
 * Pro WebAuthn passkey autentizaci
 */
export const passkey = pgTable(
  "passkey",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }), // Název passkey (volitelné)
    publicKey: text("public_key").notNull(), // Veřejný klíč passkey
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialID: varchar("credential_id", { length: 512 }).notNull().unique(), // Unikátní identifikátor credential
    counter: integer("counter").notNull(), // Counter pro replay protection
    deviceType: varchar("device_type", { length: 64 }), // Typ zařízení
    backedUp: boolean("backed_up").default(false).notNull(), // Zda je passkey zálohován
    transports: varchar("transports", { length: 256 }), // Transporty (usb, nfc, ble, internal, hybrid)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    aaguid: varchar("aaguid", { length: 64 }), // Authenticator Attestation GUID
  },
  (t) => ({
    credentialIdIdx: uniqueIndex("passkey_credential_id_idx").on(
      t.credentialID,
    ),
    userIdIdx: index("passkey_user_id_idx").on(t.userId),
  }),
);

/**
 * Vlastní verification tokens (pro vlastní tokeny mimo BetterAuth)
 * Může být použito pro další typy tokenů
 */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 256 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: tokenTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    tokenIdx: index("token_lookup_idx").on(t.token),
  }),
);

export const roleDefinitions = pgTable(
  "role_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 64 }).notNull().unique(),
    color: varchar("color", { length: 7 }).default("#FFFFFF").notNull(),
    permissions: bigint("permissions", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    weight: integer("weight").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: uniqueIndex("role_definitions_name_idx").on(t.name),
  }),
);

export const userToRoles = pgTable(
  "user_to_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roleDefinitions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

export const subscriptions = pgTable("subscriptions", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

// --- 2. OBSAH (ČLÁNKY, TAGY, SEKCE) ---

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }),
    slug: varchar("slug", { length: 512 }).notNull().unique(),
    imageUrl: varchar("image_url", { length: 1024 }),
    content: jsonb("content"),
    status: articleStatusEnum("status").default("draft").notNull(),
    premiumOnly: boolean("premium_only").default(false).notNull(),
    ratingEnabled: boolean("rating_enabled").default(true).notNull(),
    commentsEnabled: boolean("comments_enabled").default(true).notNull(),
    readingTime: integer("reading_time"), // čas na přečtení v minutách
    viewCount: integer("view_count").default(0).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    dislikesCount: integer("dislikes_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    slugIdx: uniqueIndex("articles_slug_idx").on(t.slug),
    authorIdx: index("articles_author_id_idx").on(t.authorId),
    statusIdx: index("articles_status_idx").on(t.status),
  }),
);

export const articleViews = pgTable(
  "article_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    articleIdIdx: index("article_views_article_id_idx").on(t.articleId),
    createdAtIdx: index("article_views_created_at_idx").on(t.createdAt),
  }),
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 32 }).notNull().unique(),
    description: varchar("description", { length: 128 }),
  },
  (t) => ({
    nameIdx: uniqueIndex("tags_name_idx").on(t.name),
  }),
);

export const keywords = pgTable(
  "keywords",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 32 }).notNull().unique(),
  },
  (t) => ({
    nameIdx: uniqueIndex("keywords_name_idx").on(t.name),
  }),
);

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).unique(),
  description: varchar("description", { length: 512 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
});

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.tagId] }),
  }),
);

export const articleKeywords = pgTable(
  "article_keywords",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    keywordId: uuid("keyword_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.keywordId] }),
  }),
);

export const sectionTags = pgTable(
  "section_tags",
  {
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sectionId, t.tagId] }),
  }),
);

export const favoriteTags = pgTable(
  "favorite_tags",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.tagId] }),
  }),
);

// --- 3. DISKUZE (THREADS & COMMENTS) ---

export const commentThreads = pgTable(
  "comment_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    isLocked: boolean("is_locked").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    articleIdx: index("comment_threads_article_id_idx").on(t.articleId),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => commentThreads.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): any => comments.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    dislikesCount: integer("dislikes_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    // Moderace komentářů
    isHidden: boolean("is_hidden").default(false).notNull(),
    isModerated: boolean("is_moderated").default(false).notNull(),
    moderatedBy: uuid("moderated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    moderatedAt: timestamp("moderated_at"),
    moderationReason: varchar("moderation_reason", { length: 512 }),
    // Admin editace komentářů
    editedByAdmin: boolean("edited_by_admin").default(false).notNull(),
    editedByAdminId: uuid("edited_by_admin_id").references(() => users.id, {
      onDelete: "set null",
    }),
    editedByAdminAt: timestamp("edited_by_admin_at"),
    originalContent: text("original_content"),
  },
  (t) => ({
    threadIdx: index("comments_thread_id_idx").on(t.threadId),
    parentIdx: index("comments_parent_id_idx").on(t.parentId),
    userIdx: index("comments_user_id_idx").on(t.userId),
    moderatedByIdx: index("comments_moderated_by_idx").on(t.moderatedBy),
    editedByAdminIdx: index("comments_edited_by_admin_id_idx").on(
      t.editedByAdminId,
    ),
  }),
);

// --- 4. HODNOCENÍ ---

export const articleRatings = pgTable(
  "article_ratings",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    state: boolean("state").notNull(), // true = like, false = dislike
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.userId] }),
  }),
);

export const commentRatings = pgTable(
  "comment_ratings",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    state: boolean("state").notNull(), // true = like, false = dislike
  },
  (t) => ({
    pk: primaryKey({ columns: [t.commentId, t.userId] }),
  }),
);

// --- 5. MÉDIA A SYSTÉM ---

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 7 }).default("#FFFFFF").notNull(), // Sjednoceno s roleDefinitions
});

export const storage = pgTable(
  "storage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    folderId: uuid("folder_id").references(() => folders.id, {
      onDelete: "set null",
    }),
    fileUrl: varchar("file_url", { length: 1024 }).notNull(),
    fileName: varchar("file_name", { length: 256 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    folderIdx: index("storage_folder_id_idx").on(t.folderId),
    userIdx: index("storage_user_id_idx").on(t.userId),
  }),
);

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 64 }),
  seoName: varchar("seo_name", { length: 64 }),
  seoAuthor: varchar("seo_author", { length: 64 }),
  seoUrl: varchar("seo_url", { length: 128 }),
  seoDescription: varchar("seo_description", { length: 512 }),
  seoImageUrl: varchar("seo_image_url", { length: 1024 }),
  seoHex: varchar("seo_hex", { length: 6 }),
  registrationEnabled: boolean("registration_enabled").default(true).notNull(),
  plunkFromEmail: varchar("plunk_from_email", { length: 128 }),
  plunkApiKeyCiphertext: text("plunk_api_key_ciphertext"),
  plunkApiKeyIv: varchar("plunk_api_key_iv", { length: 64 }),
  plunkApiKeyTag: varchar("plunk_api_key_tag", { length: 64 }),
});

// --- 6. REKLAMNÍ SYSTÉM & ORGANIZACE ---

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 64 }).notNull(),
    imageUrl: varchar("image_url", { length: 1024 })
      .notNull()
      .default("/globe.svg"),
    websiteUrl: varchar("website_url", { length: 128 }),
    email: varchar("email", { length: 128 }).notNull(),
    phone: varchar("phone", { length: 128 }).notNull(),
    location: varchar("location", { length: 128 }).notNull(),
    ico: varchar("ico", { length: 9 }), // IČO: 8-9 číslic
    verified: boolean("verified").default(false).notNull(),
    onboardingStatus: organizationOnboardingStatusEnum("onboarding_status")
      .default("pending")
      .notNull(),
    approvedAt: timestamp("approved_at"),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    maxStorageBytes: bigint("max_storage_bytes", { mode: "number" })
      .default(5368709120)
      .notNull(), // 5GB default
    usedStorageBytes: bigint("used_storage_bytes", { mode: "number" })
      .default(0)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    onboardingStatusIdx: index("organizations_onboarding_status_idx").on(
      t.onboardingStatus,
    ),
    approvedByUserIdx: index("organizations_approved_by_user_id_idx").on(
      t.approvedByUserId,
    ),
  }),
);

export const organizationIntegrations = pgTable(
  "organization_integrations",
  {
    organizationId: uuid("organization_id")
      .primaryKey()
      .references(() => organizations.id, { onDelete: "cascade" }),
    plunkFromEmail: varchar("plunk_from_email", { length: 128 }),
    plunkApiKeyCiphertext: text("plunk_api_key_ciphertext"),
    plunkApiKeyIv: varchar("plunk_api_key_iv", { length: 64 }),
    plunkApiKeyTag: varchar("plunk_api_key_tag", { length: 64 }),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("organization_integrations_org_idx").on(t.organizationId),
  }),
);

export const organizationApplications = pgTable(
  "organization_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicantUserId: uuid("applicant_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    status: organizationApplicationStatusEnum("status")
      .default("submitted")
      .notNull(),
    companyName: varchar("company_name", { length: 64 }).notNull(),
    websiteUrl: varchar("website_url", { length: 128 }),
    email: varchar("email", { length: 128 }).notNull(),
    phone: varchar("phone", { length: 128 }).notNull(),
    location: varchar("location", { length: 128 }).notNull(),
    ico: varchar("ico", { length: 9 }),
    note: varchar("note", { length: 2048 }),
    reviewedByUserId: uuid("reviewed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: varchar("rejection_reason", { length: 1024 }),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    applicantIdx: index("organization_applications_applicant_user_id_idx").on(
      t.applicantUserId,
    ),
    organizationIdx: index("organization_applications_organization_id_idx").on(
      t.organizationId,
    ),
    statusIdx: index("organization_applications_status_idx").on(t.status),
    reviewedByIdx: index(
      "organization_applications_reviewed_by_user_id_idx",
    ).on(t.reviewedByUserId),
  }),
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationMemberRoleEnum("role").default("viewer").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.organizationId, t.userId] }),
    userIdx: index("organization_members_user_id_idx").on(t.userId),
    roleIdx: index("organization_members_role_idx").on(t.role),
  }),
);

export const organizationInvites = pgTable(
  "organization_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 128 }).notNull(),
    role: organizationMemberRoleEnum("role").default("viewer").notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 128 }).notNull(),
    status: organizationInviteStatusEnum("status")
      .default("pending")
      .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    tokenUniqueIdx: uniqueIndex("organization_invites_token_unique").on(
      t.token,
    ),
    orgEmailStatusIdx: index("organization_invites_org_email_status_idx").on(
      t.organizationId,
      t.email,
      t.status,
    ),
    invitedByIdx: index("organization_invites_invited_by_user_id_idx").on(
      t.invitedByUserId,
    ),
    acceptedByIdx: index("organization_invites_accepted_by_user_id_idx").on(
      t.acceptedByUserId,
    ),
  }),
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeCampaignId: uuid("stripe_campaign_id"),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }),
    bannerImageUrl: varchar("banner_image_url", { length: 1024 }),
    bannerUrl: varchar("banner_url", { length: 4096 }),
    startingAt: timestamp("starting_at").defaultNow().notNull(),
    endingAt: timestamp("ending_at").notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    organizationIdx: index("campaigns_organization_id_idx").on(
      t.organizationId,
    ),
    dateRangeIdx: index("campaigns_date_range_idx").on(
      t.startingAt,
      t.endingAt,
    ),
  }),
);

// --- 8. REPORTY (HLÁŠENÍ NEVHODNÉHO OBSAHU) ---

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 32 }).notNull(), // "comment" | "article"
    entityId: uuid("entity_id").notNull(), // UUID komentáře nebo článku
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").default("pending").notNull(),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    reporterIdx: index("reports_reporter_id_idx").on(t.reporterId),
    entityIdx: index("reports_entity_idx").on(t.entityType, t.entityId),
    statusIdx: index("reports_status_idx").on(t.status),
    reviewedByIdx: index("reports_reviewed_by_idx").on(t.reviewedBy),
  }),
);

// --- 7. RELACE ---

export const usersRelations = relations(users, ({ one, many }) => ({
  userToRoles: many(userToRoles),
  comments: many(comments),
  articles: many(articles),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  favoriteTags: many(favoriteTags),
  verificationTokens: many(verificationTokens),
  auditLogs: many(auditLogs),
  // BetterAuth relations
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  organizationMemberships: many(organizationMembers),
  organizationApplications: many(organizationApplications, {
    relationName: "applicant",
  }),
  reviewedOrganizationApplications: many(organizationApplications, {
    relationName: "reviewer",
  }),
  approvedOrganizations: many(organizations),
  // Reporty a moderace
  reports: many(reports, { relationName: "reporter" }),
  reviewedReports: many(reports, { relationName: "reviewer" }),
  moderatedComments: many(comments, { relationName: "moderator" }),
  adminEditedComments: many(comments, { relationName: "adminEditor" }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const verificationTokensRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
);

/**
 * BetterAuth Relations
 */
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, { fields: [session.userId], references: [users.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, { fields: [account.userId], references: [users.id] }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(users, { fields: [passkey.userId], references: [users.id] }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  thread: one(commentThreads, {
    fields: [articles.id],
    references: [commentThreads.articleId],
  }),
  tags: many(articleTags),
  keywords: many(articleKeywords),
  ratings: many(articleRatings),
}));

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    approvedBy: one(users, {
      fields: [organizations.approvedByUserId],
      references: [users.id],
    }),
    integrations: one(organizationIntegrations, {
      fields: [organizations.id],
      references: [organizationIntegrations.organizationId],
    }),
    campaigns: many(campaigns),
    applications: many(organizationApplications),
    members: many(organizationMembers),
  }),
);

export const organizationIntegrationsRelations = relations(
  organizationIntegrations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationIntegrations.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const organizationApplicationsRelations = relations(
  organizationApplications,
  ({ one }) => ({
    applicant: one(users, {
      fields: [organizationApplications.applicantUserId],
      references: [users.id],
      relationName: "applicant",
    }),
    reviewer: one(users, {
      fields: [organizationApplications.reviewedByUserId],
      references: [users.id],
      relationName: "reviewer",
    }),
    organization: one(organizations, {
      fields: [organizationApplications.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
);

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  organization: one(organizations, {
    fields: [campaigns.organizationId],
    references: [organizations.id],
  }),
}));

export const commentThreadsRelations = relations(
  commentThreads,
  ({ one, many }) => ({
    article: one(articles, {
      fields: [commentThreads.articleId],
      references: [articles.id],
    }),
    comments: many(comments),
  }),
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, { fields: [comments.userId], references: [users.id] }),
  thread: one(commentThreads, {
    fields: [comments.threadId],
    references: [commentThreads.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
  ratings: many(commentRatings),
  moderator: one(users, {
    fields: [comments.moderatedBy],
    references: [users.id],
    relationName: "moderator",
  }),
  adminEditor: one(users, {
    fields: [comments.editedByAdminId],
    references: [users.id],
    relationName: "adminEditor",
  }),
}));

export const articleRatingsRelations = relations(articleRatings, ({ one }) => ({
  article: one(articles, {
    fields: [articleRatings.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [articleRatings.userId],
    references: [users.id],
  }),
}));

export const commentRatingsRelations = relations(commentRatings, ({ one }) => ({
  comment: one(comments, {
    fields: [commentRatings.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentRatings.userId],
    references: [users.id],
  }),
}));

export const roleDefinitionsRelations = relations(
  roleDefinitions,
  ({ many }) => ({
    userToRoles: many(userToRoles),
  }),
);

export const userToRolesRelations = relations(userToRoles, ({ one }) => ({
  user: one(users, { fields: [userToRoles.userId], references: [users.id] }),
  role: one(roleDefinitions, {
    fields: [userToRoles.roleId],
    references: [roleDefinitions.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
  sectionTags: many(sectionTags),
  favoriteTags: many(favoriteTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, { fields: [articleTags.tagId], references: [tags.id] }),
}));

export const keywordsRelations = relations(keywords, ({ many }) => ({
  articleKeywords: many(articleKeywords),
}));

export const articleKeywordsRelations = relations(
  articleKeywords,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleKeywords.articleId],
      references: [articles.id],
    }),
    keyword: one(keywords, {
      fields: [articleKeywords.keywordId],
      references: [keywords.id],
    }),
  }),
);

export const sectionsRelations = relations(sections, ({ many }) => ({
  sectionTags: many(sectionTags),
}));

export const sectionTagsRelations = relations(sectionTags, ({ one }) => ({
  section: one(sections, {
    fields: [sectionTags.sectionId],
    references: [sections.id],
  }),
  tag: one(tags, { fields: [sectionTags.tagId], references: [tags.id] }),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  storage: many(storage),
}));

export const storageRelations = relations(storage, ({ one }) => ({
  user: one(users, { fields: [storage.userId], references: [users.id] }),
  folder: one(folders, {
    fields: [storage.folderId],
    references: [folders.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

