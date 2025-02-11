"use client";

import { Microphone } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface IngestPopupProps {
    type: "Photo" | "Video" | "Audio";
    children: React.ReactNode;
}

export function IngestPopup({ type, children }: IngestPopupProps) {
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const router = useRouter();

    // Media stream handling
    const startMediaStream = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert(`Your browser does not support ${type.toLowerCase()} capture`);
            return;
        }

        try {
            const constraints = {
                audio: type === "Audio" || type === "Video",
                video: type !== "Audio" ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } : false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current && type !== "Audio") {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            if (type === "Video" || type === "Audio") {
                mediaRecorderRef.current = new MediaRecorder(stream);
                chunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        chunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const mimeType = type === "Video" ? "video/webm" : "audio/webm";
                    const mediaBlob = new Blob(chunksRef.current, { type: mimeType });
                    const reader = new FileReader();
                    reader.readAsDataURL(mediaBlob);
                    reader.onloadend = () => {
                        sessionStorage.setItem(
                            type === "Video" ? "capturedVideo" : "capturedAudio",
                            reader.result as string
                        );
                        stopMediaStream();
                        router.push(`/feedback?media=${type.toLowerCase()}`);
                    };
                };
            }
        } catch (error: any) {
            console.error(`Error accessing ${type.toLowerCase()} devices:`, error);
            alert(error.message || `Failed to access ${type.toLowerCase()} devices`);
        }
    };

    const stopMediaStream = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

        const imageDataUrl = canvas.toDataURL("image/jpeg");
        sessionStorage.setItem("capturedImage", imageDataUrl);

        stopMediaStream();
        router.push("/feedback?media=photo");
    };

    const handleClose = () => {
        stopMediaStream();
        setIsRecording(false);
    };

    return (
        <Dialog onOpenChange={(open) => {
            if (open) {
                startMediaStream();
            } else {
                handleClose();
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-white border-none text-primary max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-[32px] font-medium text-black font-cherryBomb">
                        {isRecording ? `Recording ${type}...` : `Capture ${type}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {type !== "Audio" && (
                        <div className="w-full aspect-video bg-black/5 rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted={type === "Photo"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {type === "Audio" && (
                        <div className="w-full h-32 bg-black/5 rounded-lg flex items-center justify-center">
                            <Microphone size={48} className="text-primary/50" weight="fill" />
                        </div>
                    )}

                    <div className="flex gap-4">
                        {type === "Photo" ? (
                            <Button
                                onClick={capturePhoto}
                                className="bg-primary hover:bg-primary/90 text-white px-8"
                            >
                                Capture Photo
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    if (!isRecording) {
                                        setIsRecording(true);
                                        mediaRecorderRef.current?.start();
                                    } else {
                                        setIsRecording(false);
                                        mediaRecorderRef.current?.stop();
                                    }
                                }}
                                className={isRecording ? "bg-red-500 hover:bg-red-600 text-white px-8" : "bg-primary hover:bg-primary/90 text-white px-8"}
                            >
                                {isRecording ? `Stop ${type} Recording` : `Start ${type} Recording`}
                            </Button>
                        )}

                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
