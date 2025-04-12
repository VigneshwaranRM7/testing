import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import envConfig from "../config/env";
import CollaboratorBillingPlanModel from "../models/billing-plan.model";

const defaultPlans = [
    {
        plan_id: uuidv4(),
        name: "Basic Plan",
        price: 79,
        currency: "INR",
        plan_tag: "basic",
    },
    {
        plan_id: uuidv4(),
        name: "Rocket Plan",
        price: 99,
        currency: "INR",
        plan_tag: "rocket",
    },
];

const initBillingPlans = async () => {
    try {
        await mongoose.connect(envConfig.database.url);
        console.log("Connected to MongoDB");

        // Deactivate all existing plans
        await CollaboratorBillingPlanModel.updateMany({}, { is_active: false });

        // Create new plans
        for (const plan of defaultPlans) {
            await CollaboratorBillingPlanModel.create(plan);
            console.log(`Created plan: ${plan.name}`);
        }

        console.log("Successfully initialized billing plans");
        process.exit(0);
    } catch (error) {
        console.error("Error initializing billing plans:", error);
        process.exit(1);
    }
};

initBillingPlans();
