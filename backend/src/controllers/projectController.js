import mongoose from 'mongoose'
import Client from '../models/Client.js'
import Project, { projectStatuses } from '../models/Project.js'

const editableFields = ['projectName', 'client', 'description', 'status', 'fee', 'startDate', 'dueDate']

function getProjectInput(body, { requireAll = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' }
  }
  if (Object.hasOwn(body, 'user')) {
    return { error: 'Project ownership is assigned from your authenticated account.' }
  }

  const input = {}
  for (const field of editableFields) {
    if (!Object.hasOwn(body, field)) continue
    const value = body[field]
    if (field === 'fee') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        return { error: 'Project fee must be a non-negative number.' }
      }
      input.fee = value
    } else if (field === 'client') {
      if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
        return { error: 'A valid client ID is required.' }
      }
      input.client = value
    } else if (field === 'status') {
      if (typeof value !== 'string' || !projectStatuses.includes(value)) {
        return { error: `Status must be one of: ${projectStatuses.join(', ')}.` }
      }
      input.status = value
    } else if (field === 'startDate' || field === 'dueDate') {
      if (value === '' || value === null) {
        input[field] = undefined
      } else {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return { error: `${field === 'startDate' ? 'Start' : 'Due'} date must be a valid date.` }
        }
        const date = new Date(`${value}T00:00:00.000Z`)
        if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
          return { error: `${field === 'startDate' ? 'Start' : 'Due'} date must be a valid date.` }
        }
        input[field] = date
      }
    } else {
      if (typeof value !== 'string') {
        return { error: `${field} must be a string.` }
      }
      input[field] = value.trim()
    }
  }

  if (requireAll && (!input.projectName || !input.client || input.fee === undefined)) {
    return { error: 'Project name, client, and fee are required.' }
  }
  if (Object.hasOwn(input, 'projectName') && (input.projectName.length < 2 || input.projectName.length > 150)) {
    return { error: 'Project name must be between 2 and 150 characters long.' }
  }
  if (input.description?.length > 2000) {
    return { error: 'Description cannot be longer than 2000 characters.' }
  }
  if (input.startDate && input.dueDate && input.dueDate < input.startDate) {
    return { error: 'Due date cannot be earlier than the start date.' }
  }
  if (!Object.keys(input).length) {
    return { error: 'Provide at least one project field to save.' }
  }

  return { input }
}

function sendProjectValidationError(response, error) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({
      status: 'error',
      message: error.name === 'CastError'
        ? 'Project data contains an invalid value.'
        : Object.values(error.errors)[0]?.message || 'Project details are invalid.',
    })
  }
  throw error
}

async function clientBelongsToUser(clientId, userId) {
  return Boolean(await Client.exists({ _id: clientId, user: userId }))
}

const populatedProjectQuery = (query) => query.populate('client', 'name company')

export async function createProject(request, response) {
  const { input, error } = getProjectInput(request.body, { requireAll: true })
  if (error) return response.status(400).json({ status: 'error', message: error })

  if (!(await clientBelongsToUser(input.client, request.userId))) {
    return response.status(400).json({
      status: 'error',
      message: 'Selected client does not exist or does not belong to your account.',
    })
  }

  try {
    const project = await Project.create({ ...input, user: request.userId })
    await project.populate('client', 'name company')
    return response.status(201).json({
      status: 'success',
      message: 'Project created successfully.',
      data: { project },
    })
  } catch (error) {
    return sendProjectValidationError(response, error)
  }
}

export async function getProjects(request, response) {
  const filter = { user: request.userId }
  const { status, client, search } = request.query

  if (status !== undefined) {
    if (!projectStatuses.includes(status)) {
      return response.status(400).json({
        status: 'error',
        message: `Status must be one of: ${projectStatuses.join(', ')}.`,
      })
    }
    filter.status = status
  }

  if (client !== undefined) {
    if (!mongoose.isValidObjectId(client)) {
      return response.status(400).json({ status: 'error', message: 'Invalid client ID.' })
    }
    filter.client = client
  }

  if (search !== undefined) {
    if (typeof search !== 'string' || search.length > 100) {
      return response.status(400).json({ status: 'error', message: 'Search must be 100 characters or fewer.' })
    }
    if (search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.projectName = { $regex: escapedSearch, $options: 'i' }
    }
  }

  const projects = await populatedProjectQuery(Project.find(filter).sort({ createdAt: -1 }))
  return response.status(200).json({ status: 'success', data: { projects } })
}

export async function getProject(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid project ID.' })
  }

  const project = await populatedProjectQuery(
    Project.findOne({ _id: request.params.id, user: request.userId }),
  )
  if (!project) {
    return response.status(404).json({ status: 'error', message: 'Project not found.' })
  }
  return response.status(200).json({ status: 'success', data: { project } })
}

export async function updateProject(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid project ID.' })
  }

  const { input, error } = getProjectInput(request.body)
  if (error) return response.status(400).json({ status: 'error', message: error })

  if (input.client && !(await clientBelongsToUser(input.client, request.userId))) {
    return response.status(400).json({
      status: 'error',
      message: 'Selected client does not exist or does not belong to your account.',
    })
  }

  try {
    const existingProject = await Project.findOne({
      _id: request.params.id,
      user: request.userId,
    })
    if (!existingProject) {
      return response.status(404).json({ status: 'error', message: 'Project not found.' })
    }

    const startDate = Object.hasOwn(input, 'startDate') ? input.startDate : existingProject.startDate
    const dueDate = Object.hasOwn(input, 'dueDate') ? input.dueDate : existingProject.dueDate
    if (startDate && dueDate && dueDate < startDate) {
      return response.status(400).json({
        status: 'error',
        message: 'Due date cannot be earlier than the start date.',
      })
    }

    const project = await populatedProjectQuery(
      Project.findOneAndUpdate(
        { _id: request.params.id, user: request.userId },
        { $set: input },
        { new: true, runValidators: true },
      ),
    )
    if (!project) {
      return response.status(404).json({ status: 'error', message: 'Project not found.' })
    }
    return response.status(200).json({
      status: 'success',
      message: 'Project updated successfully.',
      data: { project },
    })
  } catch (error) {
    return sendProjectValidationError(response, error)
  }
}

export async function deleteProject(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid project ID.' })
  }

  const project = await Project.findOneAndDelete({
    _id: request.params.id,
    user: request.userId,
  })
  if (!project) {
    return response.status(404).json({ status: 'error', message: 'Project not found.' })
  }
  return response.status(200).json({
    status: 'success',
    message: 'Project deleted successfully.',
  })
}
