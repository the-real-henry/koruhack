
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

    if (!files.audio) {
      throw new Error('No audio file received');
    }
    
    if (!files.audio.filepath) {
      throw new Error('Invalid audio file');
    }

    console.log('Processing audio file:', files.audio.filepath);
    const fileStream = fs.createReadStream(files.audio.filepath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "text"
    });

    // Clean up the temporary file
    fs.unlinkSync(files.audio.filepath);

    return res.status(200).json({ text: transcription });
  } catch (error) {
    console.error('Error processing audio:', error.message);
    res.status(500).json({ error: error.message });
  }
}
