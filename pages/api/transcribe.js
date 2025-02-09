
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

  try {
    const { audioUrl } = JSON.parse(req.body);
    
    // Download the audio file
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a temporary file
    const tempFilePath = `/tmp/${Date.now()}.mp3`;
    fs.writeFileSync(tempFilePath, buffer);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Processing audio file:', tempFilePath);
    const fileStream = fs.createReadStream(tempFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "json"
    });

    fileStream.destroy();
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    return res.status(200).json({ text: transcription });
  } catch (error) {
    console.error('Error processing audio:', error.message);
    res.status(500).json({ error: error.message });
  }
}
