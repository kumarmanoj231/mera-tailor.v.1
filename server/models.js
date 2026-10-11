import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const tailorSchema = new mongoose.Schema(
  {
    ownerClerkUserId: { type: String, index: true },
    name: { type: String, required: true },
    owner: String,
    area: String,
    city: { type: String, index: true },
    state: String,
    country: String,
    location: pointSchema,
    distance: Number,
    image: String,
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    experience: Number,
    status: { type: String, default: "Available" },
    minPrice: Number,
    categories: [String],
    languages: [String],
    description: String,
    phone: String,
    services: [{ name: String, price: Number, days: Number }],
    capacitySlots: { type: Number, default: 10 },
    activeSlotsBooked: { type: Number, default: 0 },
    portfolio: [String],
    isDemo: { type: Boolean, default: false },
    verified: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    verificationAppliedAt: Date,
    verificationNotes: String,
    verifiedBy: String,
    verifiedAt: Date,
  },
  { timestamps: true },
);
tailorSchema.index({ location: "2dsphere" });

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true, default: "" },
    avatar: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
    role: {
      type: String,
      enum: ["customer", "tailor", "business", "admin"],
      default: "customer",
    },
    onboardingCompleted: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    primaryLocation: { type: pointSchema, default: undefined },
    locationLabel: { type: String, trim: true },
    locationAccuracyMeters: Number,
    locationSource: { type: String, enum: ["browser", "manual"] },
    locationConsentAt: Date,
    searchPreferences: {
      radiusKm: { type: Number, min: 1, max: 100, default: 10 },
      categories: { type: [String], default: [] },
      sortBy: {
        type: String,
        enum: ["recommended", "distance", "rating", "price"],
        default: "recommended",
      },
    },
    savedTailors: [
      {
        tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor" },
        savedAt: { type: Date, default: Date.now },
      },
    ],
    businessProfile: {
      companyName: { type: String, trim: true },
      gstin: { type: String, trim: true, uppercase: true },
      businessType: { type: String, trim: true },
      panNumber: { type: String, trim: true, uppercase: true },
      website: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      contactPerson: { type: String, trim: true },
      contactPhone: { type: String, trim: true },
      verificationStatus: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
        index: true,
      },
      verified: { type: Boolean, default: false, index: true },
      verificationAppliedAt: Date,
      verificationNotes: String,
      verifiedBy: String,
      verifiedAt: Date,
      rejectionReason: String,
      documentUrl: String,
    },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    clerkUserId: { type: String, required: true, index: true },
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor" },
    tailorName: String,
    garment: String,
    category: String,
    quantity: Number,
    color: String,
    fabric: String,
    deadline: String,
    notes: String,
    measurementMode: String,
    measurementProfileId: String,
    unitPrice: Number,
    price: Number,
    quotePrice: { type: Number, min: 0 },
    status: { type: String, default: "Request Sent" },
    history: [mongoose.Schema.Types.Mixed],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const measurementSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, index: true },
  name: String,
  garment: String,
  values: { type: Map, of: Number },
  updatedAt: { type: Date, default: Date.now },
});

const quoteSchema = new mongoose.Schema(
  {
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor" },
    tailorClerkUserId: String,
    tailorName: String,
    tailorImage: String,
    tailorCity: String,
    tailorPhone: String,
    tailorVerified: { type: Boolean, default: false },
    pricePerUnit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    leadTimeDays: { type: Number, default: 15 },
    sampleOffered: { type: Boolean, default: true },
    notes: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "shortlisted", "withdrawn"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const businessRequestSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    creatorEmail: String,
    creatorName: String,
    title: { type: String, trim: true },
    organisation: { type: String, required: true, trim: true },
    category: {
      type: String,
      default: "Corporate Uniforms",
      trim: true,
    },
    requirement: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitBudget: Number,
    estBudget: Number,
    timeline: String,
    city: { type: String, trim: true },
    sampleRequired: { type: Boolean, default: true },
    notes: String,
    isVerifiedBusiness: { type: Boolean, default: false, index: true },
    gstin: { type: String, trim: true },
    quotes: [quoteSchema],
    bids: [mongoose.Schema.Types.Mixed],
    status: {
      type: String,
      enum: [
        "open",
        "submitted",
        "reviewing",
        "quoted",
        "awarded",
        "in-production",
        "completed",
        "cancelled",
      ],
      default: "open",
      index: true,
    },
    awardedQuoteId: { type: mongoose.Schema.Types.ObjectId },
    awardedTailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor" },
  },
  { timestamps: true },
);

const notificationSchema = new mongoose.Schema(
  {
    recipientClerkUserId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 600 },
    type: {
      type: String,
      enum: ['order', 'quote', 'status', 'bid', 'measurement', 'profile', 'announcement', 'general'],
      default: 'general',
      index: true,
    },
    link: { type: String, trim: true, maxlength: 255 },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientClerkUserId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientClerkUserId: 1, createdAt: -1 });

export const Tailor = mongoose.models.Tailor || mongoose.model("Tailor", tailorSchema, "tailors");
export const User = mongoose.models.User || mongoose.model("User", userSchema, "users");
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema, "orders");
export const Measurement =
  mongoose.models.Measurement || mongoose.model("Measurement", measurementSchema, "measurements");
export const BusinessRequest =
  mongoose.models.BusinessRequest || mongoose.model("BusinessRequest", businessRequestSchema, "business_requests");
export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema, "notifications");

