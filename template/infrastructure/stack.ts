import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SamMicroservice } from "./samMicroservice";
import { helloWorldHandlerConfig } from "../src/handlers/helloWorld/helloWorld";

const app = new cdk.App();
new SamMicroservice(app, "SamMicroserviceTemplate", {
    handlers: [helloWorldHandlerConfig],
    apiGateway: {
        name: "SamMicroservice",
    },
});
