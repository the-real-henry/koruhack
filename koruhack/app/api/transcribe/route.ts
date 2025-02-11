import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: 'OpenAI API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const { audioUrl } = await request.json();

        if (!audioUrl) {
            return NextResponse.json(
                { error: 'Audio URL is required' },
                { status: 400 }
            );
        }

        // Download the audio file
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a temporary file
        const tempFilePath = join('/tmp', `${Date.now()}.mp3`);
        await writeFile(tempFilePath, buffer);

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        console.log('Processing audio file:', tempFilePath);
        const fileStream = fs.createReadStream(tempFilePath);

        const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-1",
            response_format: "json"
        });

        // Clean up
        fileStream.destroy();
        await fs.promises.unlink(tempFilePath);

        return NextResponse.json({ text: transcription.text });
    } catch (error: any) {
        console.error('Error processing audio:', error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to process audio' },
            { status: 500 }
        );
    }
}

// Increase the limit for the request body size
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};
