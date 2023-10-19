import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sam from "aws-cdk-lib/aws-sam";

export interface DefinitionBodyPath {
    [key: string]: any;
}

export interface SamMicroserviceProps {
    name: string;
    handlers: Handler[];
    apiGateway: sam.CfnApiProps;
    // apiGateway: {
    //     logLevel: apigw.MethodLoggingLevel;
    //     cacheTtl: number;
    // };
    // envVariables?: Record<string, string>;
}

export interface Handler {
    name: string;
    pathPrefix?: string;
    path: string;
    httpMethod: string;
    authorizer?: string;
    environmentVariables?: Record<string, string>;
}

export const RUNTIMES = lambda.Runtime;

export const TRACING = lambda.Tracing;
