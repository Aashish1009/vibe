"use client";



import { ResizablePanel,ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";
import MessageContainer from "../components/MessageContainer";
import { Suspense, useState } from "react";
import { fragment } from "@/generated/prisma";
import ProjectHeader from "../components/ProjectHeader";

interface Props{
    ProjectId:string;
}

export const ProjectView = ({ProjectId}:Props) => {

    const [activefragment, setActivefragment] = useState<fragment | null>(null);

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                     <Suspense fallback={<div>Loading...</div>}>
                        <ProjectHeader ProjectId={ProjectId} />
                    </Suspense>
               <Suspense fallback={<div>Loading...</div>}>
                <MessageContainer ProjectId={ProjectId}
                 activefragment={activefragment}
                setActivefragment={setActivefragment}
                />
               </Suspense>
                </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={50} >
            Todo
            </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

