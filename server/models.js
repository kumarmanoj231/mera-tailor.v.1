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
      enum: ["unverified", "pending", "verified", "rejected", "resubmission_required", "suspended"],
      default: "unverified",
      index: true,
    },
    verificationAppliedAt: Date,
    verificationNotes: String,
    rejectionReason: String,
    resubmissionNotes: String,
    suspendedReason: String,
    suspendedAt: Date,
    documentUrl: { type: String, trim: true },
    documents: [
      {
        label: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
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
    roleConfirmed: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    profileCompleted: { type: Boolean, default: false },
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
        enum: ["unverified", "pending", "verified", "rejected", "resubmission_required", "suspended"],
        default: "unverified",
        index: true,
      },
      verified: { type: Boolean, default: false, index: true },
      verificationAppliedAt: Date,
      verificationNotes: String,
      verifiedBy: String,
      verifiedAt: Date,
      rejectionReason: String,
      resubmissionNotes: String,
      suspendedReason: String,
      suspendedAt: Date,
      documentUrl: String,
      documents: [
        {
          label: String,
          url: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    orderType: { type: String, enum: ['individual', 'bulk'], default: 'individual', index: true },
    clerkUserId: { type: String, required: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    organisation: { type: String, trim: true },
    sourceRequirement: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessRequest', index: true },
    acceptedQuote: { type: mongoose.Schema.Types.ObjectId },
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', index: true },
    tailorName: String,
    garment: String,
    category: String,
    quantity: Number,
    sizeBreakdown: { type: mongoose.Schema.Types.Mixed },
    color: String,
    fabric: String,
    deadline: String,
    notes: String,
    designAttachments: [String],
    progressPhotos: [
      {
        url: String,
        caption: String,
        milestone: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    measurementMode: String,
    measurementProfileId: String,
    unitPrice: Number,
    price: Number,
    quotePrice: { type: Number, min: 0 },
    agreedAmount: { type: Number, min: 0 },
    deliveryDeadline: String,
    status: {
      type: String,
      default: 'Request Sent',
      index: true,
    },
    productionStatus: {
      type: String,
      enum: [
        'not_started',
        'measurements_pending',
        'design_approval_pending',
        'materials_pending',
        'cutting',
        'stitching',
        'quality_check',
        'ready_for_delivery',
        'delivered',
      ],
      default: 'not_started',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'advance_paid', 'paid', 'refunded', 'disputed'],
      default: 'pending',
      index: true,
    },
    platformFeeStatus: {
      type: String,
      enum: ['pending', 'calculated', 'collected', 'waived', 'settled'],
      default: 'pending',
    },
    platformFeeRate: { type: Number, default: 0.05 },
    platformFeeAmount: { type: Number, default: 0 },
    netTailorAmount: { type: Number, default: 0 },
    terms: String,
    statusHistory: [
      {
        status: String,
        productionStatus: String,
        updatedBy: String,
        role: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    history: [mongoose.Schema.Types.Mixed],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

orderSchema.index({ tailorId: 1, createdAt: -1 });
orderSchema.index({ clerkUserId: 1, createdAt: -1 });
orderSchema.index({ sourceRequirement: 1, acceptedQuote: 1 });

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
    sizeBreakdown: { type: mongoose.Schema.Types.Mixed },
    designAttachments: [String],
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
    awardedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true },
);

const messageSchema = new mongoose.Schema(
  {
    orderId: { type: String, index: true },
    orderObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    sourceRequirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessRequest', index: true },
    senderClerkUserId: { type: String, required: true, index: true },
    senderName: { type: String, trim: true },
    senderRole: { type: String, enum: ['customer', 'business', 'tailor', 'admin', 'system'], default: 'customer' },
    senderAvatar: { type: String, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    messageType: {
      type: String,
      enum: ['text', 'system', 'milestone_update', 'quote_update', 'attachment', 'payment_update'],
      default: 'text',
    },
    attachments: [
      {
        url: String,
        name: String,
        fileType: String,
        sizeBytes: Number,
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed },
    readBy: [{ clerkUserId: String, readAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

messageSchema.index({ orderId: 1, createdAt: 1 });
messageSchema.index({ sourceRequirementId: 1, createdAt: 1 });

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

const reviewSchema = new mongoose.Schema(
  {
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor", required: true, index: true },
    clerkUserId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true, maxlength: 120 },
    userAvatar: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ tailorId: 1, createdAt: -1 });

const businessSchema = new mongoose.Schema(
  {
    ownerClerkUserId: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    gstin: { type: String, trim: true, uppercase: true },
    businessType: { type: String, trim: true, default: "Corporate Enterprise" },
    panNumber: { type: String, trim: true, uppercase: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true, default: "Jaipur" },
    state: { type: String, trim: true, default: "Rajasthan" },
    pincode: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    documentUrl: { type: String, trim: true },
    documents: [
      {
        label: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    location: pointSchema,
    verified: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected", "resubmission_required", "suspended"],
      default: "unverified",
      index: true,
    },
    verificationAppliedAt: Date,
    verificationNotes: String,
    verifiedBy: String,
    verifiedAt: Date,
    rejectionReason: String,
    resubmissionNotes: String,
    suspendedReason: String,
    suspendedAt: Date,
  },
  { timestamps: true }
);

const verificationRequestSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["tailor", "business"],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    companyName: String,
    documentUrl: String,
    documents: [
      {
        label: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    gstin: String,
    panNumber: String,
    businessType: String,
    experience: Number,
    phone: String,
    address: String,
    city: String,
    state: String,
    notes: String,
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "resubmission_required", "suspended"],
      default: "pending",
      index: true,
    },
    reviewedBy: String,
    reviewedByEmail: String,
    reviewedAt: Date,
    reviewDecision: {
      type: String,
      enum: ["approved", "rejected", "resubmission_required", "suspended"],
    },
    rejectionReason: String,
    resubmissionNotes: String,
    submittedAt: { type: Date, default: Date.now, index: true },
    history: [
      {
        action: String,
        status: String,
        actorClerkUserId: String,
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

verificationRequestSchema.index({ targetType: 1, status: 1, submittedAt: -1 });

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },
    adminClerkUserId: { type: String, required: true, index: true },
    adminEmail: { type: String, trim: true },
    targetUserId: { type: String, index: true },
    targetClerkUserId: { type: String, index: true },
    previousRole: { type: String },
    newRole: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    result: { type: String, enum: ['success', 'failure'], default: 'success' },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const Tailor = mongoose.models.Tailor || mongoose.model("Tailor", tailorSchema, "tailors");
export const Business = mongoose.models.Business || mongoose.model("Business", businessSchema, "businesses");
export const User = mongoose.models.User || mongoose.model("User", userSchema, "users");
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema, "orders");
export const Measurement =
  mongoose.models.Measurement || mongoose.model("Measurement", measurementSchema, "measurements");
export const BusinessRequest =
  mongoose.models.BusinessRequest || mongoose.model("BusinessRequest", businessRequestSchema, "business_requests");
export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema, "notifications");
export const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema, "reviews");
export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema, "audit_logs");
export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema, "messages");
export const VerificationRequest =
  mongoose.models.VerificationRequest || mongoose.model("VerificationRequest", verificationRequestSchema, "verification_requests");



