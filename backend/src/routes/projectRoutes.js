import { Router } from 'express'
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from '../controllers/projectController.js'
import { authenticateToken } from '../middleware/authenticateToken.js'

const router = Router()

router.use(authenticateToken)
router.route('/').post(createProject).get(getProjects)
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject)

export default router
