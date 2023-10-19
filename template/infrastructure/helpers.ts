import { DefinitionBodyPath, Handler } from "./types";
import * as sam from "aws-cdk-lib/aws-sam";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Tracing } from "aws-cdk-lib/aws-lambda";
import { RUNTIME } from "./samMicroservice";

/**
 * The default path for the OPTIONS route, required for CORS.
 */
export const OPTIONS_PATH: DefinitionBodyPath = {
    options: {
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
            200: {
                description: "Ok",
                headers: {
                    "Access-Control-Allow-Origin": "'*'",
                    "Access-Control-Allow-Headers": "'*'",
                    "Access-Control-Allow-Credentials": "'*'",
                },
            },
        },
        "x-amazon-apigateway-integration": {
            type: "mock",
            contentHandling: "CONVERT_TO_TEXT",
            passthroughBehavior: "never",
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
            responses: {
                default: {
                    statusCode: 200,
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers":
                            "'*'",
                        "method.response.header.Access-Control-Allow-Origin":
                            "'*'",
                        "method.response.header.Access-Control-Allow-Credentials":
                            "'*'",
                    },
                },
            },
        },
    },
};

export const generateLambdaUri = (
    functionName: string,
    region: string,
    accountId: string
) => {
    return `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${accountId}:function:${functionName}/invocations`;
};

/**
 * Creates the "path" section of the template for the handler
 * @param handler The Handler to create path template for
 * @param lambda The actual lambda function
 * @param region The region the function will exist in
 * @param accountId The AWS Account ID the function will exist in
 */
export const generateLambdaPath = (
    handler: Handler,
    lambda: sam.CfnFunction,
    region: string,
    accountId: string
): DefinitionBodyPath => {
    return {
        [handler.httpMethod.toLowerCase()]: {
            operationId: handler.name,
            "x-amazon-apigateway-integration": {
                type: "aws_proxy",
                httpMethod: handler.httpMethod.toUpperCase(),
                passthroughBehavior: "never",
                uri: generateLambdaUri(
                    lambda.functionName ?? "",
                    region,
                    accountId
                ),
            },
            "x-amazon-apigateway-request-validator": "all",
        },
        ...OPTIONS_PATH,
    };
};

/**
 *
 * @param apiGwId
 * @param region
 */
export const createOutputUrl = (apiGwId: string, region: string) => {
    return `https://${apiGwId}.execute-api.${region}.amazonaws.com/prod`;
};

/**
 *
 * @param scope
 * @param id
 * @param props
 */
export const createSamCfnApi = (scope: Construct, id: string, props: sam.CfnApiProps) => {
    return new sam.CfnApi(scope, id, {
        tracingEnabled: true,
        stageName: "prod",
        auth: {
            addDefaultAuthorizerToCorsPreflight: false,
        },
        cors: {
            allowHeaders: "'*'",
            allowMethods: "'*'",
            allowOrigin: "'*'",
        },
        accessLogSetting: {
            destinationArn: cdk.Fn.sub(
                "arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:ApiGw-Access-Logs-${" +
                scope?.apiGwName +
                "}/prod"
            ),
            format: '{"requestTime":"$context.requestTime","requestId":"$context.requestId","httpMethod":"$context.httpMethod","path":"$context.path","routeKey":"$context.routeKey","status":"$context.status","requestTime":"$context.requestTime",}',
        },
        methodSettings: [
            {
                CachingEnabled: false,
                DataTraceEnabled: true,
                HttpMethod: "*",
                LoggingLevel: props?.apiGwProps.logLevel,
                MetricsEnabled: true,
                ResourcePath: "/*",
            },
        ],
    });
};

type createSamCfnFunctionProps = Handler & {
    construct: Construct;
    restApiId: string;
};

/**
 *
 * @param construct
 * @param restApiId
 * @param name
 * @param path
 * @param httpMethod
 */
export const createSamCfnFunction = ({
    construct,
    restApiId,
    name,
    path,
    httpMethod,
}: createSamCfnFunctionProps) => {
    return new sam.CfnFunction(construct, name, {
        functionName: name,
        runtime: RUNTIME,
        handler: `${name}.handler`,
        tracing: Tracing.ACTIVE,
        codeUri: `build/${name}`,
        events: {
            [name]: {
                type: "Api",
                properties: {
                    path: path,
                    method: httpMethod.toLowerCase(),
                    restApiId,
                },
            },
        },
    });
};
