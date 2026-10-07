import { Router } from 'express'
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
} from '../controllers/clientController.js'
import { authenticateToken } from '../middleware/authenticateToken.js'

const router = Router()

router.use(authenticateToken)
router.route('/').post(createClient).get(getClients)
router.route('/:id').get(getClient).put(updateClient).delete(deleteClient)

export default router
