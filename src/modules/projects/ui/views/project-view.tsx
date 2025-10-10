"use client";



import { ResizablePanel,ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";
import MessageContainer from "../components/MessageContainer";
import { Suspense } from "react";

interface Props{
    ProjectId:string;
}

export const ProjectView = ({ProjectId}:Props) => {


    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
               <Suspense fallback={<div>Loading...</div>}>
                <MessageContainer ProjectId={ProjectId} />
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