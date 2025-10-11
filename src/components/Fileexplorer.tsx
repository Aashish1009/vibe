import { CopyCheckIcon,CopyIcon } from "lucide-react";
import { useState, Fragment, useMemo, useCallback } from "react";
import { Hint } from "./Hint";
import { Button } from "./ui/button";
import { CodeView } from "./Code-view"; 
import {ResizableHandle,ResizablePanel,ResizablePanelGroup} from "@/components/ui/resizable"

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem,  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./TreeView";

type filecollection = {[path: string]: string}; 

function getlanguageFromextension(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() ;
    return extension || "text";
}
interface fileBreadCrumpProps{
    filepath: string;
}

const FileBreadCrump = ({filepath}: fileBreadCrumpProps) => {
      const pathsegments = filepath.split("/");
      const maxsegments = 4;

    const renderBreadcrumbItem = () => {
        if(pathsegments.length<=maxsegments){
            return pathsegments.map((segment, index) => {
               const islast = index === pathsegments.length - 1;
               return (
                <Fragment key={index}>
                    <BreadcrumbItem>
                    {islast?(
                        <BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage>
                    ):(<span className="text-muted-foreground">
                        {segment}
                    </span>)}
                    </BreadcrumbItem>
                    {!islast && <BreadcrumbSeparator />}
                </Fragment>
               )
            })     
        }else{
            const firstSegment = pathsegments[0];
            const lastSegment = pathsegments[pathsegments.length - 1];
            return (
                <>
                <BreadcrumbItem>
                <span className="text-muted-foreground">
                    {firstSegment}
                </span>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                 <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                {lastSegment}
                </BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbItem>
                </>
            )
        }
    }

    return (
        <Breadcrumb>
        <BreadcrumbList>
        {renderBreadcrumbItem()}
        </BreadcrumbList>
        </Breadcrumb>
    )
}


interface fileexplorerprops {
    files: filecollection;
}

export const Fileexplorer = ({files}: fileexplorerprops) => {
    
    const [copied,setcopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(()=>{
        const filekeys = Object.keys(files);
        return filekeys.length > 0 ? filekeys[0] : null;
    }); 

    const treedata = useMemo(()=>{
        return convertFilesToTreeItems(files);
    },[files])
    
    const handlefileSelect = useCallback((filepath: string) => {
        
         if(files[filepath]){
            setSelectedFile(filepath);
         }
    },[files])

   const handlecopy = useCallback(()=>{
    if(selectedFile){
        navigator.clipboard.writeText(files[selectedFile]);
        setcopied(true);
        setTimeout(()=>{
            setcopied(false);
        },2000)
    }
   },[files,selectedFile])
    
    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel minSize={30} defaultSize={30} className="bg-sidebar">
                <TreeView  data={treedata} value={selectedFile} onSelect = {handlefileSelect}/>
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel minSize={50} defaultSize={70} >
                {selectedFile && files[selectedFile] ?(
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                            <FileBreadCrump filepath={selectedFile} />
                            <Hint text="copy to clipboard" side="bottom">
                                <Button size={"icon"} variant={"outline"} className="ml-auto" onClick={handlecopy}
                                    disabled={copied}
                                    >
                                   {copied? <CopyCheckIcon />:<CopyIcon />}
                                </Button>
                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView code={files[selectedFile]} language={getlanguageFromextension(selectedFile)} />
                        </div>
                    </div>
                ):(
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        select a file to view its content
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

