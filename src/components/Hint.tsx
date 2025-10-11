import { Tooltip, TooltipContent,TooltipProvider,TooltipTrigger } from "./ui/tooltip";

interface hintProps{
    children:React.ReactNode;
    text:string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
}

export const Hint = ({children,text,side="top",align="center"}:hintProps) => {
  return (
    <TooltipProvider>
    <Tooltip>
        <TooltipTrigger asChild>
            {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} >
           <p>{text}</p>
        </TooltipContent>
    </Tooltip>
    </TooltipProvider>
  )

}