import express from 'express';
import { userInfo } from '../controllers/user.controller.ts';
import { createRoom, joinRoom } from '../controllers/room.controller.ts';

const router = express.Router();

router.post('/', userInfo);

export default router;