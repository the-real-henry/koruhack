"use client";

import { useState } from "react";
import { Button } from "../ui/button";

interface FeedbackCardProps {
    feedback: {
        feedback_id: string;
        created_at: string;
        rating: number;
        text_note: string;
        file_url?: string;
        transcription?: string;
    };
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
    const [transcription, setTranscription] = useState(feedback.transcription);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const date = new Date(feedback.created_at).toLocaleDateString();

    const getTranscription = async () => {
        setIsTranscribing(true);
        try {
            // First get the transcription from the transcribe API
            const transcribeResponse = await fetch('/api/transcribe', {
                method: 'POST',
                body: JSON.stringify({ audioUrl: feedback.file_url }),
                headers: { 'Content-Type': 'application/json' }
            });
            const transcribeData = await transcribeResponse.json();
            
            if (transcribeData.text) {
                // Then update the feedback with the transcription
                const updateResponse = await fetch('/api/feedback', {
                    method: 'PATCH',
                    body: JSON.stringify({
                        feedback_id: feedback.feedback_id,
                        transcription: transcribeData.text
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update transcription');
                }

                setTranscription(transcribeData.text);
            }
        } catch (error) {
            console.error('Error getting transcription:', error);
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <div className="border border-border rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">{date}</span>
                <span className="font-semibold">Rating: {feedback.rating}</span>
            </div>
            
            <p className="my-4">{feedback.text_note}</p>

            {feedback.file_url && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    {feedback.file_url.includes('.mp3') && (
                        <>
                            <h4 className="font-medium mb-2">Audio Evidence:</h4>
                            <audio controls className="w-full mb-4">
                                <source src={feedback.file_url} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                            <div className="border-t border-border pt-4">
                                <h4 className="font-medium mb-2">Transcription:</h4>
                                {transcription ? (
                                    <p>{transcription}</p>
                                ) : (
                                    <div>
                                        <p className="mb-2">No transcription available</p>
                                        <Button 
                                            onClick={getTranscription}
                                            disabled={isTranscribing}
                                            variant="secondary"
                                        >
                                            {isTranscribing ? 'Transcribing...' : 'Get Transcription'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {feedback.file_url.includes('.jpg') && (
                        <>
                            <h4 className="font-medium mb-2">Photo Evidence:</h4>
                            <img 
                                src={feedback.file_url} 
                                alt="Evidence" 
                                className="w-full rounded-md"
                            />
                        </>
                    )}

                    {feedback.file_url.includes('.webm') && (
                        <>
                            <h4 className="font-medium mb-2">Video Evidence:</h4>
                            <video controls className="w-full rounded-md">
                                <source src={feedback.file_url} type="video/webm" />
                                Your browser does not support the video element.
                            </video>
                        </>
                    )}
                </div>
            )}
        </div>
    );
} 