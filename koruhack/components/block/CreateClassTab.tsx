"use client";

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ImageSquare, Upload } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface Student {
    firstName: string;
    lastName: string;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

export function CreateClassTab() {
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [showStudents, setShowStudents] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            setFiles(files);
            // Create preview URL
            const url = URL.createObjectURL(files[0]);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("handleUpload started");
        setIsUploading(true);
        
        try {
            if (!files || !files[0]) {
                throw new Error('No file selected');
            }

            const formData = new FormData();
            formData.append('image', files[0]);

            const response = await fetch('/api/chat', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setStudents(data.students);
            setShowStudents(true);

            // Reset form
            setFiles(undefined);
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            console.log("handleUpload finished");
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="bg-primary rounded-[20px] text-white text-[13px] font-semibold px-4 py-2 min-w-[200px] min-h-[200px] flex flex-col justify-center items-center 
                    transform transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                    <ImageSquare size={100} className="fill-white" weight="fill" />
                    Upload Image
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-[32px] font-medium text-black font-cherryBomb">
                        {showStudents ? 'Detected Students' : 'Upload Image'}
                    </DialogTitle>
                </DialogHeader>

                {!showStudents ? (
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            {/* Preview Area */}
                            <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        width={500}
                                        height={500}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-6">
                                        <Upload size={48} className="mx-auto text-gray-400" weight="thin" />
                                        <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                                ref={fileInputRef}
                            />

                            {/* Buttons */}
                            <div className="flex gap-4 w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose File
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                    disabled={!files || isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="py-4">
                        <motion.div 
                            className="grid gap-3"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {students.map((student, index) => (
                                <motion.div
                                    key={index}
                                    variants={item}
                                    className="p-3 bg-primary hover:bg-primary/90 transition-colors cursor-pointer rounded-[8px] flex flex-row justify-start items-center"
                                >
                                    <p className="font-semibold text-white/80 text-[13px] text-center">
                                        {student.firstName} {student.lastName}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={() => {
                                    setShowStudents(false);
                                    setStudents([]);
                                }}
                                variant="outline"
                            >
                                Upload Another Image
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 