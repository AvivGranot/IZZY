import express from 'express';
// import aiCoachProRoutes from './aiCoachPro';
import izzyRoutes from './izzy';

const router = express.Router();

// router.use('/aicoachpro', aiCoachProRoutes);
router.use('/izzy', izzyRoutes);

export default router;