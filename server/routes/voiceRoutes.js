import { Router, raw } from 'express';
import { transcribeVoiceRequest } from '../controllers/voiceController.js';
import { understandCategoryWithGemini } from '../controllers/aiController.js';

const router = Router();
const parseAudio = raw({ type: 'audio/*', limit: '8mb' });
router.post('/voice/transcribe', (req, res, next) => {
  parseAudio(req, res, (error) => {
    if (error?.type === 'entity.too.large') return res.status(413).json({ code: 'AUDIO_TOO_LARGE', error: 'That recording is too large. Please make a shorter recording.' });
    if (error) return res.status(400).json({ code: 'AUDIO_INVALID', error: 'The recording could not be read. Please record your request again.' });
    next();
  });
}, transcribeVoiceRequest);

router.post('/voice/understand', understandCategoryWithGemini);

export default router;
