

import {useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import TextareaAutosize from "react-textarea-autosize"
import {z} from "zod"
import { ArrowUpIcon,Loader2Icon } from 'lucide-react'; 
import { useState } from 'react';
import {toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form ,FormField } from '@/components/ui/form';
import { Usage } from './Usage';
import { useRouter } from "next/navigation"; // ✅ App Router compatible



interface Props{
    ProjectId:string;
}



const formSchema = z.object({
        value:z.string().min(1,{message:"value cannot be empty"}).max(10000,{message:"value is too long"}),
    })


const MessageForm = ({ProjectId}:Props) => {

    const trpc = useTRPC();
    const router = useRouter();
  const queryclient = useQueryClient();

  const {data:usage} = useQuery(trpc.usage.status.queryOptions());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  })



  const createMessage = useMutation(trpc.messages.create.mutationOptions(
    {
      onSuccess : () =>{
        form.reset();
        queryclient.invalidateQueries(trpc.messages.getMany.queryOptions({projectId:ProjectId}))
        queryclient.invalidateQueries(trpc.usage.status.queryOptions());

      },
      onError : (error) =>{
        toast.error(error.message)
        if(error.data?.code==="TOO_MANY_REQUESTS"){
          router.push("/pricing");
        }
      }
    }
  ))

  const ispending = createMessage.isPending;
  const isbuttondisable = ispending || !form.formState.isValid;

  const [isFocused,setIsFocused] = useState(false);
  const showUsage = !!usage;

  

  const onsubmit = async (values:z.infer<typeof formSchema>)=>{
    await createMessage.mutateAsync({
       value:values.value,
        projectId:ProjectId,
       
    })
  }
  return (
    <Form {...form}>
      {showUsage && (<Usage points={usage.remainingPoints} msBeforenext={usage.msBeforeNext} />)}
      <form onSubmit={form.handleSubmit(onsubmit)}
      className={cn("relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",isFocused && "shadow-xs",showUsage && "rounded-t-none")}
      >
        <FormField 
          name='value'
          render={ ({ field }) => (
            <TextareaAutosize 
            {...field}
            disabled={ispending}
            onFocus={()=>setIsFocused(true)}
            onBlur={()=>setIsFocused(false)}
            minRows={2}
            maxRows={8}
            className='pt-4 resize-none w-full bg-transparent outline-none border-none'
            placeholder='Type your message...'
            onKeyDown={(e)=>{
              if(e.key==="Enter" && (e.metaKey || e.ctrlKey)){
                e.preventDefault()
                form.handleSubmit(onsubmit)(e)
            }}}
            />
          )}
        />
        <div className='flex gap-2 items-end justify-between pt-2'>
          <div className='text=[10px] text-muted-foreground font-mono'>
            <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-border font-mono text-[10px] font-medium  text-muted-foreground px-1.5 bg-muted'>
             <span>&#8984;</span>enter
            </kbd>
            &nbsp;to submit
          </div>
          <Button 
          disabled={isbuttondisable}
          className={cn("size-8  rounded-full",isbuttondisable && "bg-muted-foreground border")}
          >
            {ispending ?(<Loader2Icon className="animate-spin size-4" /> ):(  <ArrowUpIcon />)}
            
          </Button>
        </div>

      </form>
    </Form>
    
    )
  }
export default MessageForm