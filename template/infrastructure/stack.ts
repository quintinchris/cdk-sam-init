import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SamMicroservice } from "./samMicroservice";
import { helloWorldHandlerConfig } from "../src/handlers/helloWorld/helloWorld";
import { SamStack } from "./samStack";

const app = new cdk.App();

new SamStack(app, "SamMicroserviceStack", {
    handlers: [helloWorldHandlerConfig],
    apiGateway: {
        name: "SamMicroservice",
    },
});
