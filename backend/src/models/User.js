import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
      maxlength: [100, 'Name cannot be longer than 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [254, 'Email cannot be longer than 254 characters.'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters long.'],
      validate: {
        validator: (value) => Buffer.byteLength(value, 'utf8') <= 72,
        message: 'Password cannot be longer than 72 UTF-8 bytes.',
      },
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(document, returnedObject) {
        delete returnedObject.password
        return returnedObject
      },
    },
  },
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return
  }

  this.password = await bcrypt.hash(this.password, 12)
})

const User = mongoose.model('User', userSchema)

export default User