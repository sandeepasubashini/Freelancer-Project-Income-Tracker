import mongoose from 'mongoose'
import Income, { paymentMethods, paymentStatuses } from '../models/Income.js'
import Project from '../models/Project.js'
import { buildPagination, parsePagination } from '../utils/pagination.js'

const editableFields = ['project', 'amount', 'paymentDate', 'paymentStatus', 'paymentMethod', 'notes']

function getIncomeInput(body, { requireAll = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' }
  }
  if (Object.hasOwn(body, 'user')) {
    return { error: 'Income ownership is assigned from your authenticated account.' }
  }

  const input = {}
  for (const field of editableFields) {
    if (!Object.hasOwn(body, field)) continue
    const value = body[field]
    if (field === 'project') {
      if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
        return { error: 'A valid project ID is required.' }
      }
      input.project = value
    } else if (field === 'amount') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return { error: 'Payment amount must be a number greater than 0.' }
      }
      input.amount = value
    } else if (field === 'paymentDate') {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return { error: 'Payment date must be a valid date.' }
      }
      const date = new Date(`${value}T00:00:00.000Z`)
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        return { error: 'Payment date must be a valid date.' }
      }
      input.paymentDate = date
    } else if (field === 'paymentStatus') {
      if (typeof value !== 'string' || !paymentStatuses.includes(value)) {
        return { error: `Payment status must be one of: ${paymentStatuses.join(', ')}.` }
      }
      input.paymentStatus = value
    } else if (field === 'paymentMethod') {
      if (typeof value !== 'string' || !paymentMethods.includes(value)) {
        return { error: `Payment method must be one of: ${paymentMethods.join(', ')}.` }
      }
      input.paymentMethod = value
    } else {
      if (typeof value !== 'string') return { error: 'Notes must be a string.' }
      input.notes = value.trim()
      if (input.notes.length > 2000) {
        return { error: 'Notes cannot be longer than 2000 characters.' }
      }
    }
  }

  if (requireAll && (!input.project || input.amount === undefined || !input.paymentDate)) {
    return { error: 'Project, amount, and payment date are required.' }
  }
  if (!Object.keys(input).length) {
    return { error: 'Provide at least one payment field to save.' }
  }
  return { input }
}

function sendIncomeValidationError(response, error) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({
      status: 'error',
      message: error.name === 'CastError'
        ? 'Payment data contains an invalid value.'
        : Object.values(error.errors)[0]?.message || 'Payment details are invalid.',
    })
  }
  throw error
}

async function projectBelongsToUser(projectId, userId) {
  return Boolean(await Project.exists({ _id: projectId, user: userId }))
}

const populatedIncomeQuery = (query) => query.populate('project', 'projectName status')

export async function createIncome(request, response) {
  const { input, error } = getIncomeInput(request.body, { requireAll: true })
  if (error) return response.status(400).json({ status: 'error', message: error })
  if (!(await projectBelongsToUser(input.project, request.userId))) {
    return response.status(400).json({
      status: 'error',
      message: 'Selected project does not exist or does not belong to your account.',
    })
  }

  try {
    const income = await Income.create({ ...input, user: request.userId })
    await income.populate('project', 'projectName status')
    return response.status(201).json({
      status: 'success',
      message: 'Payment created successfully.',
      data: { income },
    })
  } catch (error) {
    return sendIncomeValidationError(response, error)
  }
}

export async function getIncomeRecords(request, response) {
  const pagination = parsePagination(request.query)
  if (pagination.error) {
    return response.status(400).json({ status: 'error', message: pagination.error })
  }

  const filter = { user: request.userId }
  const { paymentStatus, project, startDate, endDate } = request.query

  if (paymentStatus !== undefined) {
    if (!paymentStatuses.includes(paymentStatus)) {
      return response.status(400).json({
        status: 'error',
        message: `Payment status must be one of: ${paymentStatuses.join(', ')}.`,
      })
    }
    filter.paymentStatus = paymentStatus
  }

  if (project !== undefined) {
    if (!mongoose.isValidObjectId(project)) {
      return response.status(400).json({ status: 'error', message: 'Invalid project ID.' })
    }
    filter.project = project
  }

  if (startDate !== undefined || endDate !== undefined) {
    const paymentDate = {}
    for (const [key, value] of [['startDate', startDate], ['endDate', endDate]]) {
      if (value === undefined) continue
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return response.status(400).json({ status: 'error', message: `${key} must be a valid date.` })
      }
      const date = new Date(`${value}T00:00:00.000Z`)
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        return response.status(400).json({ status: 'error', message: `${key} must be a valid date.` })
      }
      if (key === 'startDate') paymentDate.$gte = date
      else {
        date.setUTCDate(date.getUTCDate() + 1)
        paymentDate.$lt = date
      }
    }
    if (paymentDate.$gte && paymentDate.$lt && paymentDate.$gte >= paymentDate.$lt) {
      return response.status(400).json({ status: 'error', message: 'startDate must not be later than endDate.' })
    }
    filter.paymentDate = paymentDate
  }

  const [records, total, summary] = await Promise.all([
    populatedIncomeQuery(
      Income.find(filter)
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
    ),
    Income.countDocuments(filter),
    Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentStatus',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ])
  const totals = summary.reduce((result, item) => {
    if (item._id === 'Paid') result.paid += item.amount
    if (item._id === 'Pending') result.pending += item.amount
    return result
  }, { paid: 0, pending: 0 })
  return response.status(200).json({
    status: 'success',
    data: { income: records, totals },
    pagination: buildPagination(pagination.page, pagination.limit, total),
  })
}

export async function getIncomeRecord(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid payment ID.' })
  }
  const income = await populatedIncomeQuery(
    Income.findOne({ _id: request.params.id, user: request.userId }),
  )
  if (!income) return response.status(404).json({ status: 'error', message: 'Payment not found.' })
  return response.status(200).json({ status: 'success', data: { income } })
}

export async function updateIncome(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid payment ID.' })
  }
  const { input, error } = getIncomeInput(request.body)
  if (error) return response.status(400).json({ status: 'error', message: error })
  if (input.project && !(await projectBelongsToUser(input.project, request.userId))) {
    return response.status(400).json({
      status: 'error',
      message: 'Selected project does not exist or does not belong to your account.',
    })
  }

  try {
    const income = await populatedIncomeQuery(
      Income.findOneAndUpdate(
        { _id: request.params.id, user: request.userId },
        { $set: input },
        { new: true, runValidators: true },
      ),
    )
    if (!income) return response.status(404).json({ status: 'error', message: 'Payment not found.' })
    return response.status(200).json({
      status: 'success',
      message: 'Payment updated successfully.',
      data: { income },
    })
  } catch (error) {
    return sendIncomeValidationError(response, error)
  }
}

export async function deleteIncome(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ status: 'error', message: 'Invalid payment ID.' })
  }
  const income = await Income.findOneAndDelete({
    _id: request.params.id,
    user: request.userId,
  })
  if (!income) return response.status(404).json({ status: 'error', message: 'Payment not found.' })
  return response.status(200).json({
    status: 'success',
    message: 'Payment deleted successfully.',
  })
}
