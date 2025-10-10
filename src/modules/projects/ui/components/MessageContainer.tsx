import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import MessageCard from "./MessageCard";
import MessageForm from "./MessageForm";
import { useEffect, useRef } from "react";

interface Props{
    ProjectId:string;
}

const MessageContainer = ({ProjectId}:Props) => {
  const bottomref = useRef<HTMLDivElement>(null);
    const trpc = useTRPC();
    const {data:messages} = useSuspenseQuery(trpc.messages.getMany.queryOptions({projectId:ProjectId}));

    useEffect(()=>{
      const lastAssistantMessage = messages.findLast((msg) => msg.role === "ASSISTANT");
      if(lastAssistantMessage){

      }
    },[messages])

  useEffect(()=>{
    bottomref.current?.scrollIntoView()
  },[messages.length])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto ">
      {messages?.map((message)=>(
        <MessageCard key={message.id} 
         content={message.content}
         role={message.role}
         fragment={message.fragment}
         createdAt={message.createdAt}
         isfragmentactive={false} 
         onfragmentclick={()=>{}}
         type={message.type}
        />
      ))}
      <div ref={bottomref} />
      </div>
    <div className="pt-1 p-3 relative">
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
       <MessageForm ProjectId={ProjectId}/>
    </div>
    </div>
  )
}

export default MessageContainer
