import express from 'express';
import { scanRoutes } from './scan';
import { issuesRoutes } from './issues';
import { assessmentsRoutes } from './assessments';
import { statsRoutes } from './stats';

const router = express.Router();

// API versioning
router.use('/v1/scan', scanRoutes);
router.use('/v1/issues', issuesRoutes);
router.use('/v1/assessments', assessmentsRoutes);
router.use('/v1/stats', statsRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'UniSafe API',
    version: '1.0.0',
    description: 'API for UniSafe firmware safety scanner',
    endpoints: {
      scan: '/api/v1/scan',
      issues: '/api/v1/issues',
      assessments: '/api/v1/assessments',
      stats: '/api/v1/stats'
    }
  });
});

export { router as apiRoutes };
