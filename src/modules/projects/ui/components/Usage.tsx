import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Props{
    points:number,
    msBeforenext:number
}

export const Usage = ({points,msBeforenext}:Props) =>{

  const {has } = useAuth();
  const hasProaccess = has?.({plan:"pro"});
  return (

    <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
        <div className="flex items-center gap-x-2">
          <div>
            <p className="text-sm">
              {points} {hasProaccess? "":"free"} credit remaining
            </p>
            <p className="text-xs text-muted-foreground">
             Reset in {" "}  {formatDuration( 
                intervalToDuration({
                start:new Date(),
                end:new Date(Date.now()+msBeforenext)
                }),
               {format:["months","days","hours"]}
            )}
            </p>
          </div>
         {!hasProaccess && (
            <Button asChild size={"sm"} variant={"outline"} className="ml-auto">
            <Link href="/pricing">
             <CrownIcon />Upgrade
            </Link>
          </Button>
         )}
        </div>
    </div>
  )
}