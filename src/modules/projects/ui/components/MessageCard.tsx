import { Card } from "@/components/ui/card";
import { fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

interface UserMessageProps {
    content: string;
}

interface AssistantMessageProps {
    content: string;
    fragment: fragment | null; 
    createdAt: Date;
    isfragmentactive: boolean;
    onfragmentclick: (fragment:fragment) => void;
    type: MessageType;
}

interface FragmentCardProps {
    fragment: fragment;
    isfragmentactive: boolean;
    onfragmentclick: (fragment:fragment) => void;
}

const FragmentCard = ({ fragment, isfragmentactive, onfragmentclick }: FragmentCardProps) => {
    return (
        <button className={cn("flex items-start gap-2 border rounded-lg bg-muted w-fit p-3 hoverbg-secondary transition-colors", isfragmentactive && "border-primary text-primary bg-primary")}
        onClick={() => onfragmentclick(fragment)}
        >
           <Code2Icon className="size-4 mt-0.5"/>
           <div className="flex flex-col flex-1">
            <span className={cn(
            "font-medium text-sm line-clamp-1",
            isfragmentactive && "text-white"
          )}>
                {fragment.title}
            </span>
            <span className={cn("text-sm text-muted-foreground", isfragmentactive && "text-white")}>
              preview
            </span>
           </div>
           <div className="flex items-center justify-center mt-0.5">
            <ChevronRightIcon className={cn("size-4", isfragmentactive && "text-white")}/>
           </div>
        </button>
    )
}

const AssistantMessage = ({ content, fragment, createdAt, isfragmentactive, onfragmentclick, type }: AssistantMessageProps) => {
  return(
    <div className={cn("flex flex-col group px-2 pb-4",type==="ERROR" &&"text-red-500")}>
     <div className="flex items-center gap-2 mb-2 pl-2">
        <Image src={"/logo.svg"} width={18} height={18} alt={"logo"}  className="shrink-0"/>
        <span className="text-sm font-medium">
           vibe
        </span>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {format(createdAt,"HH:mm 'on ' MMM dd, yyyy")}
        </span>

     </div>
     <div className="pl-8.5 flex flex-col gap-y-4">
        <span>
            {content}
        </span>
        {fragment && type==="RESULT" && (
            <FragmentCard 
            fragment={fragment} 
            isfragmentactive={isfragmentactive} 
            onfragmentclick={onfragmentclick}
            />
            )}
     </div>

    </div>
  )

}

const UserMessage = ({ content }: UserMessageProps) => {
    return <div className="flex justify-end pb-4 pr-2 pl-10">
        <Card className="rounded-lg bg-muted shadow-none border-none max-w-[80%] break-words" >
            {content}
        </Card>
    </div>;
}

interface MessageCardProps {
    content: string;
    role: MessageRole;
    fragment: fragment | null; // Replace 'any' with the actual type if available
    createdAt: Date;
    isfragmentactive: boolean;
    onfragmentclick: (fragment:fragment) => void;
    type: MessageType;
}

const MessageCard = ({content, role, fragment, createdAt, isfragmentactive, onfragmentclick, type}: MessageCardProps) => {

    if(role==="ASSISTANT"){
        return (
            <AssistantMessage content={content} 
            fragment={fragment}
            createdAt={createdAt}
            isfragmentactive={isfragmentactive}
            onfragmentclick={onfragmentclick}
            type={type}
            />
        )
    }
  return (
    <div>
        <UserMessage content={content} />
    </div>
  )
}

export default MessageCard
