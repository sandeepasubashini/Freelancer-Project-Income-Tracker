import mongoose from 'mongoose'

const paymentStatuses = ['Pending', 'Paid']
const paymentMethods = ['Cash', 'Bank Transfer', 'Card', 'Other']

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Income owner is required.'],
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'A project is required.'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required.'],
      min: [0, 'Payment amount must be greater than 0.'],
      validate: {
        validator: (value) => Number.isFinite(value) && value > 0,
        message: 'Payment amount must be a number greater than 0.',
      },
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required.'],
      validate: {
        validator: (value) => Number.isFinite(value.getTime()),
        message: 'Payment date is invalid.',
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: paymentStatuses,
        message: 'Payment status must be Pending or Paid.',
      },
      default: 'Pending',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: paymentMethods,
        message: 'Payment method must be Cash, Bank Transfer, Card, or Other.',
      },
      default: 'Other',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot be longer than 2000 characters.'],
      default: '',
    },
  },
  { timestamps: true },
)

const Income = mongoose.model('Income', incomeSchema)

export { paymentMethods, paymentStatuses }
export default Income
