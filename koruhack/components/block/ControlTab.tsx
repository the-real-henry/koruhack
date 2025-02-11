'use client';

import { ArrowCircleLeft, ArrowCircleRight } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { useState } from "react";
import clsx from "clsx";

interface ControlTabProps {
    isHidden?: boolean;
    purpose: "Class" | "Student";
    studentName?: string;
}

export function ControlTab({ isHidden = false, purpose, studentName = "No Student Selected" }: ControlTabProps) {

    return (
        <div className="flex flex-row gap-2 w-full justify-center h-[35px]">
            <div className={clsx("flex flex-row gap-2", isHidden ? "hidden" : "")}>
                <button className="h-[38px] w-[38px]">
                    <ArrowCircleLeft size={38} className="fill-white/50 hover:fill-white hover:scale-110 cursor-pointer transition-all duration-100" weight="fill" />
                </button>
                <div className="flex flex-row items-center gap-4 rounded-full bg-white/30 w-[300px] px-3 py-1">
                    <Button variant="transparent" className="px-0 text-[12px]">
                        Change {purpose}
                    </Button>
                    <div className="w-[1px] h-[80%] bg-white/30" />
                    <span className="text-white text-[14px] font-semibold truncate">
                        {studentName}
                    </span>
                </div>
                <button className="h-[38px] w-[38px]">
                    <ArrowCircleRight size={38} className="fill-white/50 hover:fill-white hover:scale-110 cursor-pointer transition-all duration-100" weight="fill" />
                </button>
            </div>
        </div>
    );
}
