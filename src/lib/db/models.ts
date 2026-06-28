import mongoose, { Schema } from "mongoose";

const timestamps = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

const userSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    name: { type: String },
    onboardingProfile: { type: Schema.Types.Mixed, default: null },
    preferences: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps },
);

const topicSchema = new Schema(
  {
    id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
  },
  { timestamps },
);
topicSchema.index({ ownerId: 1, id: 1 }, { unique: true });

const noteSchema = new Schema(
  {
    id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    mentalModel: { type: String, default: "" },
    executionFlow: { type: String, default: "" },
    edgeCases: { type: String, default: "" },
    tradeOffs: { type: String, default: "" },
    commonMistakes: { type: String, default: "" },
    interviewQuestions: { type: String, default: "" },
    examples: { type: String, default: "" },
    personalNotes: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
  },
  { timestamps },
);
noteSchema.index({ ownerId: 1, topicId: 1 }, { unique: true });

const studyPlanSchema = new Schema(
  {
    id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active",
    },
    targetRole: { type: String, required: true },
    techStack: { type: [String], default: [] },
    yearsOfExperience: { type: Number, required: true },
    targetTimeline: { type: String, required: true },
    targetCompany: { type: String },
    jobDescription: { type: String },
    aiGenerated: { type: Boolean, default: true },
    sourcePrompt: { type: String },
    providerId: { type: String },
    interviewAreas: { type: [Schema.Types.Mixed], default: [] },
    weeks: { type: [Schema.Types.Mixed], default: [] },
    mockInterviews: { type: [Schema.Types.Mixed], default: [] },
    milestones: { type: [Schema.Types.Mixed], default: [] },
    recallTemplates: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps },
);
studyPlanSchema.index({ ownerId: 1, id: 1 }, { unique: true });

const revisionQueueItemSchema = new Schema(
  {
    id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    dueDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Skipped"],
      default: "Pending",
    },
  },
  { timestamps },
);
revisionQueueItemSchema.index({ ownerId: 1, id: 1 }, { unique: true });

const recallSessionSchema = new Schema(
  {
    id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    weaknesses: { type: String, default: "" },
    strengths: { type: String, default: "" },
  },
  { timestamps },
);
recallSessionSchema.index({ ownerId: 1, id: 1 }, { unique: true });

const aiProviderConfigSchema = new Schema(
  {
    id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    label: { type: String, required: true },
    encryptedApiKey: { type: String },
    maskedKey: { type: String },
    baseUrl: { type: String },
    model: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 1 },
    costMode: {
      type: String,
      enum: ["cheap", "balanced", "quality"],
      default: "cheap",
    },
    status: {
      type: String,
      enum: ["connected", "error", "untested"],
      default: "untested",
    },
    lastTestedAt: { type: String },
    lastError: { type: String },
  },
  { timestamps },
);
aiProviderConfigSchema.index({ ownerId: 1, id: 1 }, { unique: true });

export const UserModel =
  mongoose.models.User ?? mongoose.model("User", userSchema);

export const TopicModel =
  mongoose.models.Topic ?? mongoose.model("Topic", topicSchema);

export const NoteModel =
  mongoose.models.Note ?? mongoose.model("Note", noteSchema);

export const StudyPlanModel =
  mongoose.models.StudyPlan ?? mongoose.model("StudyPlan", studyPlanSchema);

export const RevisionQueueItemModel =
  mongoose.models.RevisionQueueItem ??
  mongoose.model("RevisionQueueItem", revisionQueueItemSchema);

export const RecallSessionModel =
  mongoose.models.RecallSession ??
  mongoose.model("RecallSession", recallSessionSchema);

export const AIProviderConfigModel =
  mongoose.models.AIProviderConfig ??
  mongoose.model("AIProviderConfig", aiProviderConfigSchema);

const topicLibrarySchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    groups: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps },
);
topicLibrarySchema.index({ ownerId: 1, categoryId: 1 }, { unique: true });

export const TopicLibraryModel =
  mongoose.models.TopicLibrary ??
  mongoose.model("TopicLibrary", topicLibrarySchema);
