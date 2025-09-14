
import {Sandbox} from "@e2b/code-interpreter"

import { Agent, openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { get } from "http";
import { getSandbox } from "./util";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step}) => {
     
    const sandboxId = await step.run("get-sandbox-id",async ()=>{
      const sandbox = await Sandbox.create("vibe-nextjs-aashish1234");
      return sandbox.sandboxId
    }) 
    
      const codeAgent = createAgent({
      name: "codeagent",
      system: "You are an expert nextjs developer.  You write readable maintainable code. You are given a task to complete. You write simple nextjs snippet",
      model: openai({ model: "gpt-4o" }),

    }); 

    const { output } =await codeAgent.run(
  `summarize the following snippet :${event.data.value}`,
);

const sandboxUrl = await step.run("get-sandbox-url",async ()=>{
  const sandbox = await getSandbox(sandboxId);
  const host =  sandbox.getHost(3000);
  return `http://${host}`
})
   
    return {output,sandboxUrl };
  },
);