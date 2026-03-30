import express from 'express';
import { userInfo } from '../controllers/user.controller.ts';

const router: express.Router = express.Router();

router.post('/', userInfo);

export default router;