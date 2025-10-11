"use client";



import { ResizablePanel,ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";
import MessageContainer from "../components/MessageContainer";
import { Suspense, useState } from "react";
import { fragment } from "@/generated/prisma";
import ProjectHeader from "../components/ProjectHeader";
import Fragmentcomponent from "../components/Fragmentcomponent";

interface Props{
    projectId:string;
}

export const ProjectView = ({projectId}:Props) => {

    const [activefragment, setActivefragment] = useState<fragment | null>(null);

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                     <Suspense fallback={<div>Loading...</div>}>
                        <ProjectHeader projectId={projectId} />
                    </Suspense>
               <Suspense fallback={<div>Loading...</div>}>
                <MessageContainer ProjectId={projectId}
                 activefragment={activefragment}
                setActivefragment={setActivefragment}
                />
               </Suspense>
                </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={50} >
            {activefragment && <Fragmentcomponent data={activefragment} />}
            </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

