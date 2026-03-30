import express from 'express';
import { createRoom, joinRoom } from '../controllers/room.controller.ts';

const router = express.Router();

router.post('/createRoom', createRoom);
router.post('/joinRoom', joinRoom);

export default router;