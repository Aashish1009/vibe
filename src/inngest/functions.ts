import { Agent, openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { success } from "zod";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event}) => {
      const codeAgent = createAgent({
      name: "codeagent",
      system: "You are an expert nextjs developer.  You write readable maintainable code. You are given a task to complete. You write simple nextjs snippet",
      model: openai({ model: "gpt-4o" }),

    });

    const { output } =await codeAgent.run(
  `summarize the following snippet :${event.data.value}`,
);

   
    return {output };
  },
);