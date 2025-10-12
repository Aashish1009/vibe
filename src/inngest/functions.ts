
import {Sandbox} from "@e2b/code-interpreter"

import { openai, createAgent, createTool, createNetwork ,type Tool,type Message, createState} from "@inngest/agent-kit";
import { inngest } from "./client";
import { getSandbox, lastAssistantMessage } from "./util";
import z from "zod";
import { PROMPT ,FRAGMENT_TITLE_PROMPT,RESPONSE_PROMPT} from "@/prompt";
import { prisma } from "@/lib/db";

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
      await sandbox.setTimeout(60_000*10*3);
      return sandbox.sandboxId
    }) 

    const previousMessages = await step.run("get-previous-messages",async ()=>{
      const formattedMessages:Message[]=[];

      const messages = await prisma.message.findMany({
        where:{projectId:event.data.projectId},
        orderBy:{createdAt:"desc"},
        take:5,
      })

      for(const message of messages){
        formattedMessages.push({
          type:"text",
          role:message.role==="ASSISTANT"?"assistant":"user",
          content:message.content
        })
      }
      return formattedMessages.reverse();

    })

    const state = createState<AgentState>({
      summary:"",
      files:{}
    },{
      messages:previousMessages
    })
    
      const codeAgent = createAgent<AgentState>({
      name: "codeagent",
      description: "an expert code agent",
      system: PROMPT,
      // gpt-4.1
      model: openai({ model: "gpt-4.1-mini" , defaultParameters:{
        temperature:1,
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
          handler:async({files},{step,network}:Tool.Options<AgentState>)=>{
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
      defaultState:state,
      router:async({network})=>{
        const summary = network.state.data.summary;
        if(summary){
          return;
        }

        return codeAgent;
      }
    })

  const result = await network.run(event.data.value,{state:state});

  const fragmentTitleGenerator = createAgent({
    name:"fragment-title-generator",
    description:"a fragment title generator",
    model:openai({ model: "gpt-4o-mini" }),
    system:FRAGMENT_TITLE_PROMPT,
  })

  const ResponseGenrator = createAgent({
    name:"response-generator",
    description:"a response generator",
    model:openai({ model: "gpt-4o-mini" }),
    system:RESPONSE_PROMPT,
  })

  const {output:fragmentTitleoutput} = await fragmentTitleGenerator.run(result.state.data.summary);
  const {output:responseoutput} = await ResponseGenrator.run(result.state.data.summary);

  const generateFragmentTitle = () => {
    if(fragmentTitleoutput[0].type!=="text"){
      return "Fragment";
    }
    if(Array.isArray(fragmentTitleoutput[0].content)){
      return fragmentTitleoutput[0].content.map((txt)=>txt).join("");
    }else{
      return fragmentTitleoutput[0].content
    }

  }

  const generateResponse = () => {
    if(responseoutput[0].type!=="text"){
      return "here you go";
    }
    if(Array.isArray(responseoutput[0].content)){
      return responseoutput[0].content.map((txt)=>txt).join("");
    }else{
      return responseoutput[0].content
    }

  }

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
        content:generateResponse() ,
        role:"ASSISTANT",
        type:"RESULT",
        fragment:{
          create:{
            sandBoxUrl:sandboxUrl,
            title:generateFragmentTitle(),
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


