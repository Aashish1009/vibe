"use client";



import { ResizablePanel,ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";
import MessageContainer from "../components/MessageContainer";
import { Suspense, useState } from "react";
import { fragment } from "@/generated/prisma";
import ProjectHeader from "../components/ProjectHeader";
import Fragmentcomponent from "../components/Fragmentcomponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Fileexplorer } from "@/components/Fileexplorer";
import { UserControl } from "@/components/UserControl";

interface Props{
    projectId:string;
}

export const ProjectView = ({projectId}:Props) => {

    const [activefragment, setActivefragment] = useState<fragment | null>(null);
    const [tabstate, setTabstate] = useState<"preview" | "code">("preview");

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
            <ResizableHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel defaultSize={65} minSize={50} >
           <Tabs
           className="h-full gap-y-0"
              value={tabstate}
                onValueChange={(value) => setTabstate(value as "preview" | "code")}
                defaultValue="preview"
           >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
                <TabsList className="h-8 p-0 border rounded-md">
                    <TabsTrigger value="preview" className="rounded-md">
                     <EyeIcon /><span>demo</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="rounded-md">
                     <CodeIcon /><span>code</span>
                    </TabsTrigger>
               </TabsList>
               <div className="ml-auto flex items-center gap-x-2">
                   <Button asChild size={"sm"} variant={"default"}>
                    <Link href={"/pricing"}>
                    <CrownIcon /><span>Upgrade</span>
                    </Link>
                   </Button>
                   <UserControl />
               </div>
              </div>
              <TabsContent value="preview">
                {!!activefragment && <Fragmentcomponent data={activefragment} />}
              </TabsContent>
                <TabsContent value="code" className="min-h-0" >
                  {!!activefragment?.files &&(
                    <Fileexplorer files={activefragment.files as {[path: string]: string}}  />
                  )}
                </TabsContent>
                
           </Tabs>
            </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

