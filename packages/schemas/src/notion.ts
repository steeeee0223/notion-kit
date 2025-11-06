import { z } from "zod/v4";

export const CoverImageObject = z.object({
  type: z.enum(["file", "url"]),
  url: z.string(),
});

export const IconObject = z.object({
  type: z.enum(["lucide", "emoji", "url", "text"]),
  src: z.string(),
  color: z.string().optional(),
});
export type IconData = z.infer<typeof IconObject>;

export const PageObject = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  isArchived: z.boolean(),
  coverImage: CoverImageObject.optional(),
  icon: IconObject.optional(),
  parentId: z.string().nullable(),
  isPublished: z.boolean(),
  isFavorite: z.boolean(),
  url: z.string().optional(),
  publicUrl: z.string().optional(),
  createdAt: z.number(),
  lastEditedAt: z.number(),
  createdBy: z.string(),
  lastEditedBy: z.string(),
});
export type Page = z.infer<typeof PageObject>;

export type UpdatePageParams = Partial<
  Pick<Page, "parentId" | "title" | "icon" | "isFavorite" | "isArchived">
>;

export const UserObject = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string(),
});
export type User = z.infer<typeof UserObject>;

export enum Role {
  ADMIN = "admin",
  OWNER = "owner",
  MEMBER = "member",
  GUEST = "guest",
}
export const RoleObject = z.enum(Role);

export enum Plan {
  FREE = "free",
  EDUCATION = "education",
  PLUS = "plus",
  BUSINESS = "business",
  ENTERPRISE = "enterprise",
}
export const PlanObject = z.enum(Plan);

export const WorkspaceObject = z.object({
  id: z.string(),
  role: RoleObject,
  name: z.string(),
  icon: IconObject.optional(),
  memberCount: z.number(),
  plan: PlanObject,
});
export type Workspace = z.infer<typeof WorkspaceObject>;
