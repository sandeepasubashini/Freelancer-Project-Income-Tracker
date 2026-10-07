import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client owner is required.'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client name is required.'],
      trim: true,
      minlength: [2, 'Client name must be at least 2 characters long.'],
      maxlength: [100, 'Client name cannot be longer than 100 characters.'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email cannot be longer than 254 characters.'],
      validate: {
        validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Enter a valid email address.',
      },
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [40, 'Phone cannot be longer than 40 characters.'],
      default: '',
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, 'Company cannot be longer than 120 characters.'],
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot be longer than 500 characters.'],
      default: '',
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

const Client = mongoose.model('Client', clientSchema)

export default Client
