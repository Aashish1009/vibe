/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { use } from 'react'
import { toast } from 'sonner'

const page =  () => {
  
const trpc = useTRPC();

const invoke = useMutation(trpc.invoke.mutationOptions({
  onSuccess:()=>{
    toast.success("Event Sent")
  }
}));
  return (
    <div className='p-4 mx-auto'>
     <Button onClick={()=>invoke.mutate({text:"Ashish"})}
     >Invoke</Button>
    </div>
  )
}

export default page
