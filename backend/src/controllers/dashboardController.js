import mongoose from 'mongoose'
import Income from '../models/Income.js'
import Project, { projectStatuses } from '../models/Project.js'

export async function getDashboard(request, response) {
  const userId = new mongoose.Types.ObjectId(request.userId)
  const now = new Date()
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  const nextYearStart = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1))

  const [projectResults, incomeResults] = await Promise.all([
    Project.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          recentProjects: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'clients',
                localField: 'client',
                foreignField: '_id',
                pipeline: [
                  { $match: { user: userId } },
                  { $project: { name: 1, company: 1 } },
                ],
                as: 'client',
              },
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                projectName: 1,
                status: 1,
                fee: 1,
                startDate: 1,
                dueDate: 1,
                createdAt: 1,
                client: 1,
              },
            },
          ],
        },
      },
    ]),
    Income.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: '$paymentStatus',
                amount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          monthlyIncome: [
            {
              $match: {
                paymentStatus: 'Paid',
                paymentDate: { $gte: yearStart, $lt: nextYearStart },
              },
            },
            {
              $group: {
                _id: { $month: '$paymentDate' },
                amount: { $sum: '$amount' },
              },
            },
            { $sort: { _id: 1 } },
          ],
          recentPayments: [
            { $sort: { paymentDate: -1, createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                pipeline: [
                  { $match: { user: userId } },
                  { $project: { projectName: 1 } },
                ],
                as: 'project',
              },
            },
            { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                amount: 1,
                paymentDate: 1,
                paymentStatus: 1,
                paymentMethod: 1,
                createdAt: 1,
                project: 1,
              },
            },
          ],
        },
      },
    ]),
  ])

  const projectData = projectResults[0] || {}
  const incomeData = incomeResults[0] || {}
  const statusCountMap = new Map((projectData.statusCounts || []).map(({ _id, count }) => [_id, count]))
  const paymentSummary = new Map((incomeData.summary || []).map(({ _id, amount, count }) => [_id, { amount, count }]))
  const monthlyIncomeMap = new Map((incomeData.monthlyIncome || []).map(({ _id, amount }) => [_id, amount]))

  const statusCounts = projectStatuses.map((status) => ({
    status,
    count: statusCountMap.get(status) || 0,
  }))
  const totalProjects = statusCounts.reduce((sum, item) => sum + item.count, 0)

  return response.status(200).json({
    status: 'success',
    data: {
      statistics: {
        totalProjects,
        activeProjects: statusCountMap.get('In Progress') || 0,
        completedProjects: statusCountMap.get('Completed') || 0,
        totalIncome: paymentSummary.get('Paid')?.amount || 0,
        pendingPaymentAmount: paymentSummary.get('Pending')?.amount || 0,
        pendingPaymentCount: paymentSummary.get('Pending')?.count || 0,
      },
      monthlyIncome: Array.from({ length: 12 }, (_, index) => ({
        month: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
          .format(new Date(Date.UTC(now.getUTCFullYear(), index, 1))),
        monthNumber: index + 1,
        amount: monthlyIncomeMap.get(index + 1) || 0,
      })),
      projectStatusCounts: statusCounts,
      recentProjects: projectData.recentProjects || [],
      recentPayments: incomeData.recentPayments || [],
    },
  })
}
