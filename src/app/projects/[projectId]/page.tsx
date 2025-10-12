import { ProjectView } from "@/modules/projects/ui/views/project-view"
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import {ErrorBoundary} from "react-error-boundary"

interface Props{
    params:Promise<{
        projectId:string
    }>
}


const page = async ({params}:Props) => {
    const {projectId} = await params

    const queryclient  = getQueryClient();
    void queryclient.prefetchQuery(trpc.messages.getMany.queryOptions({projectId}))
    void queryclient.prefetchQuery(trpc.projects.getOne.queryOptions({id:projectId}))
  return (
    <HydrationBoundary state={dehydrate(queryclient)}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
      <ProjectView projectId={projectId}/>
      </Suspense>
      </ErrorBoundary>
      </HydrationBoundary>
    
  )
}

export default page
