import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function register(request, response, next) {
  const { name, email, password } = request.body ?? {}

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return response.status(400).json({
      status: 'error',
      message: 'Name, email, and password are required.',
    })
  }

  const normalizedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    return response.status(400).json({
      status: 'error',
      message: 'Name must be between 2 and 100 characters long.',
    })
  }

  if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
    return response.status(400).json({
      status: 'error',
      message: 'Enter a valid email address.',
    })
  }

  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return response.status(400).json({
      status: 'error',
      message: 'Password must be at least 8 characters and no longer than 72 UTF-8 bytes.',
    })
  }

  try {
    const existingUser = await User.exists({ email: normalizedEmail })
    if (existingUser) {
      return response.status(409).json({
        status: 'error',
        message: 'An account with this email already exists.',
      })
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
    })

    return response.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        status: 'error',
        message: 'An account with this email already exists.',
      })
    }

    if (error.name === 'ValidationError') {
      const validationMessage = Object.values(error.errors)[0]?.message
      return response.status(400).json({
        status: 'error',
        message: validationMessage || 'User details are invalid.',
      })
    }

    return next(error)
  }
}

export async function login(request, response) {
  const { email, password } = request.body ?? {}

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return response.status(400).json({
      status: 'error',
      message: 'Email and password are required.',
    })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!emailPattern.test(normalizedEmail)) {
    return response.status(400).json({
      status: 'error',
      message: 'Enter a valid email address.',
    })
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return response.status(401).json({
      status: 'error',
      message: 'Invalid email or password.',
    })
  }

  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN
  if (!secret || !expiresIn) {
    throw new Error('JWT_SECRET and JWT_EXPIRES_IN must be configured.')
  }

  const token = jwt.sign({ sub: user.id }, secret, { expiresIn })

  return response.status(200).json({
    status: 'success',
    message: 'Login successful.',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    },
  })
}

export async function getCurrentUser(request, response) {
  const user = await User.findById(request.userId)

  if (!user) {
    return response.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    })
  }

  return response.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    },
  })
}
