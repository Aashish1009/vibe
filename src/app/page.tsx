/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, {  useState } from 'react'
import { toast } from 'sonner'

const page =  () => {

  const [value,setvalue] = useState("")
  
const trpc = useTRPC();
const {data:messages} = useQuery(trpc.messages.getMany.queryOptions());
const createMessage = useMutation(trpc.messages.create.mutationOptions({
  onSuccess:()=>{
    toast.success("Message created")
  }
}));
  return (
    <div className='p-4 mx-auto'>
      <Input value={value} onChange={(e)=>setvalue(e.target.value)}/>
     <Button disabled={createMessage.isPending} onClick={()=>createMessage.mutate({value:value})}
     >Invoke</Button>
     {JSON.stringify(messages,null,2)}
    </div>
  )
}

export default page
