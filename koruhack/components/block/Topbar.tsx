import { Button } from "../ui/button";
import { EnvelopeSimple, User } from "@phosphor-icons/react/dist/ssr";
import { ControlTab } from "./ControlTab";

export default function Topbar() {
    return (
        <div className="bg-primary w-full h-14 flex flex-row grid grid-cols-3 items-center shadow-md shadow-black/10">
            <div className="flex justify-start pl-4 w-fit">
                <Button className="text-[14px]">
                    MCV4U1
                </Button>
                <div className="flex flex-row gap-4 mx-8">
                    <Button variant="transparent" className="mx-0 px-0 text-[14px]">
                        Dashboard
                    </Button>
                    <Button variant="transparent" className="mx-0 px-0 text-[14px]">
                        Snapshots
                    </Button>
                </div>
            </div>
            <ControlTab purpose="Class" isHidden={true} />
            <div className="flex justify-end pr-4 w-[100px] gap-3 items-center w-full">
                <Button className="w-[35px]">
                    <EnvelopeSimple size={18} className="fill-white/50" weight="fill" />
                </Button>
                <Button className="text-[14px] font-semibold text-white/50">
                    Welcome, 
                    <span className="font-bold text-white">Mr. Meyers</span>
                    <User size={18} className="fill-white/50" weight="fill" />
                </Button>
            </div>
        </div>
    );
}
