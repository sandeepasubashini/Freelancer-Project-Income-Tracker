import mongoose from 'mongoose'
import Client from '../models/Client.js'
import { buildPagination, parsePagination } from '../utils/pagination.js'

const editableFields = ['name', 'email', 'phone', 'company', 'address', 'notes']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getClientInput(body, { requireName = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' }
  }

  if (Object.hasOwn(body, 'user')) {
    return { error: 'Client ownership is assigned from your authenticated account.' }
  }

  const input = {}
  for (const field of editableFields) {
    if (Object.hasOwn(body, field)) {
      if (typeof body[field] !== 'string') {
        return { error: `${field} must be a string.` }
      }
      const value = body[field].trim()
      input[field] = field === 'email' ? value.toLowerCase() : value
    }
  }

  if (requireName && !input.name) {
    return { error: 'Client name is required.' }
  }
  if (Object.hasOwn(input, 'name') && (input.name.length < 2 || input.name.length > 100)) {
    return { error: 'Client name must be between 2 and 100 characters long.' }
  }
  if (input.email && (input.email.length > 254 || !emailPattern.test(input.email))) {
    return { error: 'Enter a valid client email address.' }
  }
  if (input.phone?.length > 40) {
    return { error: 'Phone cannot be longer than 40 characters.' }
  }
  if (input.company?.length > 120) {
    return { error: 'Company cannot be longer than 120 characters.' }
  }
  if (input.address?.length > 500) {
    return { error: 'Address cannot be longer than 500 characters.' }
  }
  if (input.notes?.length > 2000) {
    return { error: 'Notes cannot be longer than 2000 characters.' }
  }
  if (Object.keys(input).length === 0) {
    return { error: 'Provide at least one client field to save.' }
  }

  return { input }
}

function isValidClientId(id) {
  return mongoose.isValidObjectId(id)
}

function sendClientError(response, error) {
  if (error.name === 'ValidationError') {
    return response.status(400).json({
      status: 'error',
      message: Object.values(error.errors)[0]?.message || 'Client details are invalid.',
    })
  }
  throw error
}

export async function createClient(request, response) {
  const { input, error } = getClientInput(request.body, { requireName: true })
  if (error) {
    return response.status(400).json({ status: 'error', message: error })
  }

  try {
    const client = await Client.create({ ...input, user: request.userId })
    return response.status(201).json({
      status: 'success',
      message: 'Client created successfully.',
      data: { client },
    })
  } catch (createError) {
    return sendClientError(response, createError)
  }
}

export async function getClients(request, response) {
  const pagination = parsePagination(request.query)
  if (pagination.error) {
    return response.status(400).json({ status: 'error', message: pagination.error })
  }

  const filter = { user: request.userId }
  const { search } = request.query
  if (search !== undefined) {
    if (typeof search !== 'string' || search.length > 100) {
      return response.status(400).json({
        status: 'error',
        message: 'Search must be 100 characters or fewer.',
      })
    }
    if (search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = { $regex: escapedSearch, $options: 'i' }
      filter.$or = [{ name: regex }, { company: regex }, { email: regex }]
    }
  }

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Client.countDocuments(filter),
  ])
  return response.status(200).json({
    status: 'success',
    data: { clients },
    pagination: buildPagination(pagination.page, pagination.limit, total),
  })
}

export async function getClient(request, response) {
  if (!isValidClientId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid client ID.' })
  }

  const client = await Client.findOne({ _id: request.params.id, user: request.userId })
  if (!client) {
    return response.status(404).json({ status: 'error', message: 'Client not found.' })
  }

  return response.status(200).json({ status: 'success', data: { client } })
}

export async function updateClient(request, response) {
  if (!isValidClientId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid client ID.' })
  }

  const { input, error } = getClientInput(request.body)
  if (error) {
    return response.status(400).json({ status: 'error', message: error })
  }

  if (Object.hasOwn(input, 'name') && input.name.length < 2) {
    return response.status(400).json({
      status: 'error',
      message: 'Client name must be at least 2 characters long.',
    })
  }

  try {
    const client = await Client.findOneAndUpdate(
      { _id: request.params.id, user: request.userId },
      { $set: input },
      { new: true, runValidators: true },
    )
    if (!client) {
      return response.status(404).json({ status: 'error', message: 'Client not found.' })
    }

    return response.status(200).json({
      status: 'success',
      message: 'Client updated successfully.',
      data: { client },
    })
  } catch (updateError) {
    return sendClientError(response, updateError)
  }
}

export async function deleteClient(request, response) {
  if (!isValidClientId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid client ID.' })
  }

  const client = await Client.findOneAndDelete({
    _id: request.params.id,
    user: request.userId,
  })
  if (!client) {
    return response.status(404).json({ status: 'error', message: 'Client not found.' })
  }

  return response.status(200).json({
    status: 'success',
    message: 'Client deleted successfully.',
  })
}
