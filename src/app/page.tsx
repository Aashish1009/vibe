/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { use, useState } from 'react'
import { toast } from 'sonner'

const page =  () => {

  const [value,setvalue] = useState("")
  
const trpc = useTRPC();

const invoke = useMutation(trpc.invoke.mutationOptions({
  onSuccess:()=>{
    toast.success("Event Sent")
  }
}));
  return (
    <div className='p-4 mx-auto'>
      <Input value={value} onChange={(e)=>setvalue(e.target.value)}/>
     <Button disabled={invoke.isPending} onClick={()=>invoke.mutate({value:value})}
     >Invoke</Button>
    </div>
  )
}

export default page
