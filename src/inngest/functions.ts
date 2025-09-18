
import {Sandbox} from "@e2b/code-interpreter"

import { Agent, openai, createAgent, createTool, createNetwork ,type Tool} from "@inngest/agent-kit";
import { inngest } from "./client";
import { getSandbox, lastAssistantMessage } from "./util";
import z from "zod";
import { PROMPT } from "@/prompt";

interface AgentState{
  summary:string;
  files:{[path:string]:string};
}

export const codeAgentfunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event,step}) => {
     
    const sandboxId = await step.run("get-sandbox-id",async ()=>{
      const sandbox = await Sandbox.create("vibe-nextjs-aashish1234");
      return sandbox.sandboxId
    }) 
    
      const codeAgent = createAgent<AgentState>({
      name: "codeagent",
      description: "an expert code agent",
      system: PROMPT,
      model: openai({ model: "gpt-5-nano" , defaultParameters:{
        temperature:0.1,
      }}),
      tools:[
        createTool({
          name:"terminal",
          description:"use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler:async({command},{step})=>{
            return await step?.run("terminal",async()=>{
               const buffers = {stdout:"",stderr:""};
                try {
                  const sandbox = await getSandbox(sandboxId);
                  const result  = await sandbox.commands.run(command,{
                    onStdout:(data:string)=>{
                      buffers.stdout += data;
                    },
                    onStderr:(data:string)=>{
                      buffers.stderr += data;
                    }
                  });
             return result.stdout;
                } catch (error) {
                  console.error(`command failed: ${error} \n stderr: ${buffers.stderr} \n stdout: ${buffers.stdout}`);
                  return `command failed: ${error} \n stderr: ${buffers.stderr} \n stdout: ${buffers.stdout}`;
                }

          })}
        }),
        createTool({
          name:"createOrUpdatefile",
          description:"create or update a file",
          parameters: z.object({
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
            }))
        }),
          handler:async({files},{step,network}:Tool.options<AgentState>)=>{
           const newfiles = await step?.run("createOrUpdatefile",async()=>{
            try {
              const updatedfiles = network.state.data.files || {};
              const sandbox = await getSandbox(sandboxId);
              for(const file of files){
                await sandbox.files.write(file.path,file.content);
                updatedfiles[file.path] = file.content;
              }
            return updatedfiles;
            } catch (error) {
              return "Error ," + error;
            }
           })

           if(typeof newfiles === "object"){
            network.state.data.files = newfiles;
          }
        }

      }),
      createTool({
        name:"readfile",
        description:"read a file",
        parameters: z.object({
          files: z.array(z.string())
        }),
        handler:async({files},{step})=>{
          return await step?.run("readfile",async()=>{
            try {
              const sandbox = await getSandbox(sandboxId);
              const contents=[];
              for(const file of files){
                const content = await sandbox.files.read(file);
                contents.push({path:file,content});
              }
           return JSON.stringify(contents);
            } catch (error) {
              return "Error ," + error;
            }
        })}
      })
      ],
      lifecycle:{
        onResponse: async({result,network})=>{

          const lastAssistanttextmessage = lastAssistantMessage(result);
           
          if(lastAssistanttextmessage && network){
            if(lastAssistanttextmessage.includes("<task_summary>")){
                network.state.data.summary = lastAssistanttextmessage;
            }
        }
        return result;
      }
    }
    }); 

    const network = createNetwork<AgentState>({
     name:"coding-network",
      description:"a network to manage coding tasks",
      agents:[codeAgent],
      maxIter:10,
      router:async({network})=>{
        const summary = network.state.data.summary;
        if(summary){
          return;
        }

        return codeAgent;
      }
    })

  const result = await network.run(event.data.value);
  const isError = !result.state.data.summary||Object.keys(result.state.data.files||{}).length === 0;

const sandboxUrl = await step.run("get-sandbox-url",async ()=>{
  const sandbox = await getSandbox(sandboxId);
  const host =  sandbox.getHost(3000);
  return `http://${host}`
})


await step.run("save-result",async()=>{
  if(isError){
      return await prisma.message.create({
        data:{
          projectId:event.data.projectId,
          content:"Something went wrong",
          role:"ASSISTANT",
          type:"ERROR",
        }
      })
  }
    return await prisma.message.create({
      data:{
        projectId:event.data.projectId,
        content:result.state.data.summary ,
        role:"ASSISTANT",
        type:"RESULT",
        fragment:{
          create:{
            sandBoxUrl:sandboxUrl,
            title:"fragment",
            files:result.state.data.files 
          }
        }
      }
    })
})
   
    return {
      url:sandboxUrl ,
      title:"fragment",
      files:result.state.data.files,
      summary:result.state.data.summary,

    };
  },
);


