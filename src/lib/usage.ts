import {RateLimiterPrisma} from "rate-limiter-flexible"

import { prisma } from "./db"
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS=2;
const DURATION = 30*24*60*60;
const GENERATION_POINTS=1;
const PROPOINTS =100;

export const getusageTracker =async ()=>{

    const {has} = await auth();
    const hasProaccess = has({plan:"pro"})

    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: hasProaccess?PROPOINTS:FREE_POINTS,
        duration: DURATION,
    })
    return usageTracker
}

export const consumeCredits = async () =>{
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    const usageTracker = await getusageTracker();
    const result = await usageTracker.consume(userId,GENERATION_POINTS);
    return result
}

export const getUsageStatus = async () => {
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    const usageTracker = await getusageTracker();
    const result = await usageTracker.get(userId);
    return result
}