import { TreeItem } from "@/types";

import { Sidebar,SidebarContent,SidebarGroup,SidebarGroupContent,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarMenuSub,SidebarProvider,SidebarRail} from "@/components/ui/sidebar"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { Collapsible,CollapsibleContent,CollapsibleTrigger } from "./ui/collapsible";



interface Props {
    data: TreeItem[];
    value?: string | null;
    onSelect?: (value: string) => void;
}

export const TreeView = ({data,value,onSelect}:Props) =>{
   return(
    <SidebarProvider>
        <Sidebar collapsible="none" className="w-full">
         <SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                     {data.map((item,index) => (
                         <Tree key={index} item={item} selectedValue={value} onSelect={onSelect} parentpath="" /> 
                     ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
         <SidebarRail />
        </Sidebar>
    </SidebarProvider>
   )
}

interface TreeProps {
    item: TreeItem;
    selectedValue?: string | null;
    onSelect?: (value: string) => void;
    parentpath: string;
}
const Tree  = ({item,selectedValue,onSelect,parentpath}:TreeProps) =>{
     const [name,...items] = Array.isArray(item) ? item : [item];
     const currentpath = parentpath ? `${parentpath}/${name}` : name;

     if(!Array.isArray(item) || item.length === 1){
        const isSelected = selectedValue === currentpath;

        return (
            <SidebarMenuButton
                isActive={isSelected}
                className="data-[active=true]:bg-transparent"
                onClick={()=>onSelect?.(currentpath)}
            >
                <FileIcon />
               <span className="truncate">
                  {name}
               </span>
            </SidebarMenuButton>
        )
    }

    return (
     <SidebarMenuItem>
        <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
        >
        <CollapsibleTrigger asChild>
        <SidebarMenuButton>
            <ChevronRightIcon className="transition-transform"/>
            <FolderIcon />
            <span className="truncate">{name}</span>
        </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
         <SidebarMenuSub>
            {items.map((subitem,index) => (
                <Tree
                key={index}
                item={subitem}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentpath={currentpath}
                />
            ))}
         </SidebarMenuSub>
        </CollapsibleContent>
        </Collapsible>
     </SidebarMenuItem>
    )
}

