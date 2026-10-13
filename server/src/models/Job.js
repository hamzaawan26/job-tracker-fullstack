import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, required: true, trim: true, maxlength: 150 },

    // unified status field for dropdown
    status: {
      type: String,
      enum: ['applied', 'interview', 'offer'],
      default: 'applied',
      required: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['applied', 'interview', 'offer'],
          required: true,
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    datePosted: { type: Date },
    deadline: { type: Date },
    dateApplied: { type: Date },
    platform: { type: String, maxlength: 100 },
    jobLink: { type: String, maxlength: 2048 },
    notes: { type: String, maxlength: 5000 },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
)
jobSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 })
jobSchema.index({ userId: 1, isDeleted: 1, status: 1 })
jobSchema.pre('save', function () {
  if (this.isNew) {
    this.statusHistory = [{ status: this.status }]
  }
})
jobSchema.pre('save', function () {
  // Ensure status history exists
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [
      { status: this.status, at: this.createdAt || new Date() },
    ]
  }

  // Auto-fill dateApplied if missing
  if (!this.dateApplied) {
    this.dateApplied = this.createdAt || new Date()
  }
})

export default mongoose.model('Job', jobSchema)
