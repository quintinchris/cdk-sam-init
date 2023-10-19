import * as cdk from "aws-cdk-lib";
import * as sam from "aws-cdk-lib/aws-sam";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
    ApiStackProps,
    DefinitionBodyPath,
    Handler,
    RUNTIMES,
    SamMicroserviceProps,
} from "./types";
import {
    createOutputUrl,
    createSamCfnApi, createSamCfnFunction,
    generateLambdaPath,
    generateLambdaUri,
    OPTIONS_PATH,
} from "./helpers";

export const RUNTIME = Runtime["NODEJS_18_X"].toString();

export class SamMicroservice extends Construct {
    public readonly api: sam.CfnApi;
    public readonly lambdas: sam.CfnFunction[];
    private REGION: string;
    private ACCOUNT_ID: string;

    constructor(scope: Construct, id: string, props?: SamMicroserviceProps) {
        super(scope, id, props);
        this.REGION = cdk.Stack.of(this).region;
        this.ACCOUNT_ID = cdk.Stack.of(this).account;

        this.api = createSamCfnApi(this, "", ...props.apiGateway);

        this.lambdas = createSamCfnFunction();

        const apiGw =

        props?.handlers?.forEach((handler: Handler) => {
            const samLambda = createSamLambda({
                construct: this,
                apiGwRef: apiGw.ref,
                ...handler,
            });

            apiGw.addDependsOn(samLambda);

            paths = {
                ...paths,
                [handler.path]: {
                    ...generateLambdaPath(
                        handler,
                        samLambda,
                        region,
                        accountId
                    ),
                },
            };

            const logGroup = new logs.CfnLogGroup(
                this,
                `${handler.name}LogGroup`,
                {
                    logGroupName: `${handler.name}LogGroup`,
                    retentionInDays: RetentionDays.ONE_YEAR,
                }
            );
        });

        apiGw.definitionBody = {
            openapi: "3.0.0",
            info: { title: apiGw.name },
            schemes: "https",
            servers: {
                variables: {
                    basePath: {
                        default: "/prod",
                    },
                },
            },
            "x-amazon-apigateway-policy": {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: ["execute-api:Invoke"],
                        Resource: "execute-api:/*",
                    },
                ],
            },
            paths: paths,
        };

        this.templateOptions.templateFormatVersion = "2010-09-09";

        this.api = apiGw;

        new cdk.CfnOutput(this, "API Gateway Url", {
            value: createOutputUrl(apiGw.ref, this.REGION),
            description: "HTTP endpoint to execute your API functions",
        });
    }
}


