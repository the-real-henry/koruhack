"use client";

import { Camera, VideoCamera, Microphone } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { IngestPopup } from "./IngestPopup";

export function BottomBar() {
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
            <div className="h-[40px] w-[300px] rounded-lg bg-primary/80 shadow-md shadow-black/10 flex items-center justify-between px-4">
                <IngestPopup type="Photo">
                    <Button variant="transparent" className="flex items-center gap-1 text-[14px]">
                        <Camera weight="fill" size={26} className="fill-white" />
                        <span>Photo</span>
                    </Button>
                </IngestPopup>

                <IngestPopup type="Video">
                    <Button variant="transparent" className="flex items-center gap-1 text-[14px]">
                        <VideoCamera weight="fill" size={26} className="fill-white" />
                        <span>Video</span>
                    </Button>
                </IngestPopup>

                <IngestPopup type="Audio">
                    <Button variant="transparent" className="flex items-center gap-1 text-[14px]">
                        <Microphone weight="fill" size={26} className="fill-white" />
                        <span>Audio</span>
                    </Button>
                </IngestPopup>
            </div>
        </div>
    );
}

