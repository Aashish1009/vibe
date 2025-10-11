import { useState } from "react"
import { fragment } from "@/generated/prisma"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon,RefreshCcwIcon } from "lucide-react"
import { Hint } from "@/components/Hint";

interface Props{
    data:fragment;
}

const Fragmentcomponent = ({data}:Props) => {

  const [fragmentkey, setFragmentkey] = useState(0);
  const[copied, setCopied] = useState(false);

  const onrefresh = ()=>{
    setFragmentkey(prev=>prev+1);
  }
 
 const handlecopy = ()=>{
    navigator.clipboard.writeText(data.sandBoxUrl);
    setCopied(true);
    setTimeout(()=>{
        setCopied(false);
    },2000)
 }

  return (
    <div className="flex flex-col w-full h-full">
        <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
           <Hint text="refresh" side="bottom">
            <Button size="sm" variant="outline" onClick={onrefresh}>
            <RefreshCcwIcon />
           </Button>
           </Hint>
           <Hint text="click to copy" side="bottom" >
            <Button size="sm" variant="outline" onClick={handlecopy}
            className="flex-1 justify-start text-start font-normal"
            disabled={!data.sandBoxUrl || copied}
            >
            <span className="truncate">
                {data.sandBoxUrl}
            </span>
           </Button>
           </Hint>
           <Hint text="open in a new tab" side="bottom" align="start">
            <Button size="sm" variant="outline"
           onClick={()=>{
            if(!data.sandBoxUrl)  return;
            window.open(data.sandBoxUrl,"_blank");
           }}
           >
            <ExternalLinkIcon />
           </Button>
           </Hint>
        </div>
        <iframe src={data.sandBoxUrl}
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        className="h-full w-full"

       /> 
      
    </div>
  )
}

export default Fragmentcomponent
