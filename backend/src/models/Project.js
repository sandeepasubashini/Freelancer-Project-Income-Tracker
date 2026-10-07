import mongoose from 'mongoose'

const projectStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled']

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required.'],
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required.'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long.'],
      maxlength: [150, 'Project name cannot be longer than 150 characters.'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'A client is required.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot be longer than 2000 characters.'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: projectStatuses,
        message: 'Status must be Pending, In Progress, Completed, or Cancelled.',
      },
      default: 'Pending',
      required: true,
    },
    fee: {
      type: Number,
      required: [true, 'Project fee is required.'],
      min: [0, 'Project fee cannot be negative.'],
      validate: {
        validator: Number.isFinite,
        message: 'Project fee must be a valid number.',
      },
    },
    startDate: {
      type: Date,
      validate: {
        validator: (value) => !value || Number.isFinite(value.getTime()),
        message: 'Start date is invalid.',
      },
    },
    dueDate: {
      type: Date,
      validate: {
        validator: (value) => !value || Number.isFinite(value.getTime()),
        message: 'Due date is invalid.',
      },
    },
  },
  { timestamps: true },
)

projectSchema.pre('validate', function validateProjectDates() {
  if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
    this.invalidate('dueDate', 'Due date cannot be earlier than the start date.')
  }
})

const Project = mongoose.model('Project', projectSchema)

export { projectStatuses }
export default Project
