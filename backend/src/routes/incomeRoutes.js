import { Router } from 'express'
import {
  createIncome,
  deleteIncome,
  getIncomeRecord,
  getIncomeRecords,
  updateIncome,
} from '../controllers/incomeController.js'
import { authenticateToken } from '../middleware/authenticateToken.js'

const router = Router()

router.use(authenticateToken)
router.route('/').post(createIncome).get(getIncomeRecords)
router.route('/:id').get(getIncomeRecord).put(updateIncome).delete(deleteIncome)

export default router
