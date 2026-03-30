import express from 'express';
import { loadMessages } from '../controllers/message.controller.ts';

const router: express.Router = express.Router();

router.get('/message/:slug', loadMessages);
export default router;