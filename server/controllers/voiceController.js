const GEMINI_FILES_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';
const GEMINI_INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 8;
const requestsByIp = new Map();

function getAudioMimeType(value = '') {
  const mime = String(value).split(';')[0].trim().toLowerCase();
  if (mime === 'audio/mp4') return 'audio/m4a';
  return mime;
}

function isRateLimited(ip) {
  const now = Date.now();
  const record = requestsByIp.get(ip);
  if (!record || now - record.startedAt >= RATE_WINDOW_MS) {
    requestsByIp.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > RATE_LIMIT;
}

async function responseJson(response) {
  return response.json().catch(() => ({}));
}

export async function transcribeVoiceRequest(req, res) {
  if (isRateLimited(req.ip)) return res.status(429).json({ code: 'GEMINI_RATE_LIMITED', error: 'Too many transcription requests. Please wait a minute and try again.' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ code: 'GEMINI_NOT_CONFIGURED', error: 'Voice transcription is not configured on this server.' });

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ code: 'AUDIO_EMPTY', error: 'No audio was received. Please record your request again.' });
  if (req.body.length > MAX_AUDIO_BYTES) return res.status(413).json({ code: 'AUDIO_TOO_LARGE', error: 'That recording is too large. Please try a shorter recording.' });

  const mimeType = getAudioMimeType(req.headers['content-type']);
  const supportedTypes = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/m4a', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac']);
  if (!supportedTypes.has(mimeType)) return res.status(415).json({ code: 'AUDIO_TYPE_UNSUPPORTED', error: 'This browser audio format is not supported. Please type your request instead.' });

  let uploadedFile;
  try {
    const uploadStart = await fetch(GEMINI_FILES_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(req.body.length),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: { display_name: 'mera-tailor-voice-request' } }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!uploadStart.ok) {
      const error = new Error('Gemini did not accept the audio upload.');
      error.geminiStatus = uploadStart.status;
      throw error;
    }

    const uploadUrl = uploadStart.headers.get('x-goog-upload-url');
    if (!uploadUrl) throw new Error('Gemini did not return an audio upload URL.');

    const uploaded = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
        'Content-Type': mimeType,
      },
      body: req.body,
      signal: AbortSignal.timeout(30_000),
    });
    const uploadResult = await responseJson(uploaded);
    uploadedFile = uploadResult.file;
    if (!uploaded.ok || !uploadedFile?.uri || !uploadedFile?.name) {
      const error = new Error('Gemini could not finish the audio upload.');
      error.geminiStatus = uploaded.status;
      throw error;
    }

    const transcription = await fetch(GEMINI_INTERACTIONS_URL, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.5-transcribe',
        input: [{ type: 'audio', uri: uploadedFile.uri, mime_type: mimeType }],
        generation_config: { transcription_config: { language_codes: [] } },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    const result = await responseJson(transcription);
    if (!transcription.ok) {
      const error = new Error('Gemini could not transcribe the recording.');
      error.geminiStatus = transcription.status;
      throw error;
    }

    const text = result.output_text
      || result.outputs?.filter((item) => item.type === 'text').map((item) => item.text).join('\n')
      || result.steps?.flatMap((step) => step.content || []).filter((item) => item.type === 'text').map((item) => item.text).join('\n')
      || '';
    if (!text.trim()) return res.status(422).json({ code: 'AUDIO_NOT_UNDERSTOOD', error: 'No clear speech was detected. Please try again or type your request.' });
    return res.json({ text: text.trim() });
  } catch (error) {
    const isRateLimitedByGemini = error.geminiStatus === 429;
    if (error.geminiStatus) console.error(`Gemini voice transcription request failed with HTTP ${error.geminiStatus}.`);
    else console.error(`Gemini voice transcription failed: ${error.message}`);
    return res.status(isRateLimitedByGemini ? 429 : 502).json({
      code: isRateLimitedByGemini ? 'GEMINI_RATE_LIMITED' : 'GEMINI_TRANSCRIPTION_FAILED',
      error: isRateLimitedByGemini ? 'Gemini is busy. Please try again shortly.' : 'Voice transcription failed. Please try again or type your request.',
    });
  } finally {
    if (uploadedFile?.name) {
      fetch(`https://generativelanguage.googleapis.com/v1beta/${uploadedFile.name}`, {
        method: 'DELETE',
        headers: { 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(10_000),
      }).catch(() => {});
    }
  }
}
