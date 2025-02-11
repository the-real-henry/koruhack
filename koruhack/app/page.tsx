"use client"
import { CreateClassTab } from "@/components/block/CreateClassTab";

export default function Home() {
  return (
    <main className="flex flex-col w-full h-full justify-center items-center pb-20">
      <div className="flex flex-col justify-center items-center gap-12">
        <div className="flex flex-col w-full h-full justify-center items-center">
          <h1 className="text-black text-[40px] font-cherryBomb">Welcome, Mr. Meyers</h1>
          <span className="text-black/50 text-[13px] font-semibold ">
            Create a new class with the button below
          </span>
        </div>
        <CreateClassTab />
      </div>
    </main>
  );
}

