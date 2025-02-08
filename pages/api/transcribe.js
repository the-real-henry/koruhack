
import formidable from 'formidable';
import fs from 'fs';
import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Processing audio file:', files.audio.filepath);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(files.audio.filepath),
      model: "whisper-1",
    });

    console.log('OpenAI response:', transcription);

    // Clean up the temporary file
    fs.unlinkSync(files.audio.filepath);

    const response = { text: transcription.text };
    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing audio:', error.message);
    res.status(500).json({ error: error.message });
  }
}
