// pages/api/transcribe.js

import formidable from 'formidable';
import fs from 'fs';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false, // We disable Next.js' default body parsing so formidable can handle it
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse the incoming form with formidable
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error parsing form data' });
      return;
    }

    // Access the uploaded file (the field name should match what we appended in the client)
    const audioFile = files.audio;
    if (!audioFile) {
      res.status(400).json({ error: 'No audio file uploaded' });
      return;
    }

    try {
      // Create a FormData object to send to OpenAI
      // (Node 18+ supports the standard FormData; if not, you may need to install the "form-data" package)
      const formData = new FormData();
      // Append the file. Note: audioFile.filepath contains the path to the temp file.
      formData.append('file', fs.createReadStream(audioFile.filepath), {
        filename: audioFile.originalFilename || 'recording.webm',
      });
      formData.append('model', 'whisper-1');
      // Optionally, you could add a language or prompt here.

      const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          // Note: Do not set the Content-Type header manually here;
          // the browser/node will set the correct multipart/form-data boundary.
        },
        body: formData,
      });

      const data = await openaiResponse.json();

      // Return the transcription data (or error information) back to the client
      res.status(openaiResponse.ok ? 200 : openaiResponse.status).json(data);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ error: 'Error calling OpenAI transcription API' });
    }
  });
}
