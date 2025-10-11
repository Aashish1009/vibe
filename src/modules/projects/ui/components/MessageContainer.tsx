import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import MessageCard from "./MessageCard";
import MessageForm from "./MessageForm";
import { useEffect, useRef } from "react";
import { fragment } from "@/generated/prisma";
import {MessageLoading} from "./MessageLoading";

interface Props{
    ProjectId:string;
    activefragment:fragment | null;
    setActivefragment:(fragment:fragment | null)=>void;
}

const MessageContainer = ({ProjectId,activefragment,setActivefragment}:Props) => {
  const bottomref = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<string | null>(null);
    const trpc = useTRPC();
    const {data:messages} = useSuspenseQuery(trpc.messages.getMany.queryOptions({projectId:ProjectId},{
      refetchInterval:5000
    }));

  useEffect(()=>{
    const lastAssistantMessage = messages.findLast((m)=> m.role === "ASSISTANT");
    if(lastAssistantMessage?.fragment && lastAssistantMessage.id!== lastAssistantMessageRef.current){
      setActivefragment(lastAssistantMessage.fragment)
      lastAssistantMessageRef.current = lastAssistantMessage.id
    }
    
  },[messages,setActivefragment])

  useEffect(()=>{
    bottomref.current?.scrollIntoView()
  },[messages.length])

  const lastmessage = messages[messages.length - 1];
  const isLastMessageByUser = lastmessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto ">
      {messages?.map((message)=>(
        <MessageCard key={message.id} 
         content={message.content}
         role={message.role}
         fragment={message.fragment}
         createdAt={message.createdAt}
         isfragmentactive={activefragment?.id === message.fragment?.id} 
         onfragmentclick={()=>{setActivefragment(message.fragment)}}
         type={message.type}
        />
      ))}
      {isLastMessageByUser && <MessageLoading />}
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
