import * as cdk from "aws-cdk-lib";
import * as sam from "aws-cdk-lib/aws-sam";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
    DefinitionBodyPath,
    Handler,
    SamApiProps,
    SamMicroserviceProps,
} from "./types";

const RUNTIME = Runtime["NODEJS_18_X"].toString();
const HANDLER_PATH_FROM_ROOT = "build/src/handlers/";

export class SamMicroservice extends Construct {
    public readonly api: sam.CfnApi;
    public readonly lambdas: sam.CfnFunction[];
    private REGION: string;
    private ACCOUNT_ID: string;

    constructor(
        scope: Construct,
        id: string,
        { apiGateway, handlers }: SamMicroserviceProps
    ) {
        super(scope, id);
        this.REGION = cdk.Stack.of(this).region;
        this.ACCOUNT_ID = cdk.Stack.of(this).account;

        this.api = this.createApi(apiGateway);

        this.lambdas = handlers.map((handler) => this.createLambda(handler));

        this.api.definitionBody = this.createOpenApiDefinitionBody(handlers);

        new cdk.CfnOutput(this, "API Gateway Url", {
            value: this.createOutputUrl(),
            description: "HTTP endpoint to execute your API functions",
        });
    }

    /**
     * Creates a SAM Lambda with a dedicated Log Group. This also creates a dependency between the API and the Lambda
     * @param name The name of the lambda handler
     * @param path The path to invoke the handler
     * @param httpMethod The HTTP method for the handler
     */
    private createLambda = ({ name, path, httpMethod }: Handler) => {
        const lambda = new sam.CfnFunction(this, name, {
            functionName: name,
            runtime: RUNTIME,
            handler: `${name}.handler`,
            tracing: Tracing.ACTIVE,
            codeUri: `${HANDLER_PATH_FROM_ROOT}${name}`,
            events: {
                [name]: {
                    type: "Api",
                    properties: {
                        path: path,
                        method: httpMethod.toLowerCase(),
                        restApiId: this.api.ref,
                    },
                },
            },
        });

        const logGroup = new logs.CfnLogGroup(this, `${name}LogGroup`, {
            logGroupName: `${name}LogGroup`,
            retentionInDays: RetentionDays.ONE_MONTH,
        });

        this.api.addDependency(lambda);

        return lambda;
    };

    /**
     * Creates the SAM API Gateway
     * @param name name of the API Gateway
     * @param stageName the stage name for the API Gateway
     * @param tracingEnabled Boolean value representing whether X-Ray should be enabled for this API
     */
    private createApi = ({
        name = "SamMicroserviceApi",
        stageName = "prod",
        tracingEnabled = true,
        ...rest
    }: SamApiProps) => {
        return new sam.CfnApi(this, name, {
            tracingEnabled,
            stageName,
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
                        name +
                        "}/prod"
                ),
                format: '{"requestTime":"$context.requestTime","requestId":"$context.requestId","httpMethod":"$context.httpMethod","path":"$context.path","routeKey":"$context.routeKey","status":"$context.status","requestTime":"$context.requestTime",}',
            },
            methodSettings: [
                {
                    CachingEnabled: false,
                    DataTraceEnabled: true,
                    MetricsEnabled: true,
                    HttpMethod: "*",
                    LoggingLevel: apigw.MethodLoggingLevel.INFO,
                    ResourcePath: "/*",
                },
            ],
            ...rest,
        });
    };

    private createOpenApiDefinitionBody = (handlers: Handler[]) => {
        return {
            openapi: "3.0.0",
            info: { title: this.api.name },
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
            paths: this.generateLambdaPaths(handlers),
        };
    };

    /**
     * Creates the "path" section of the template for the handler
     * @param handlers The Handlers in the API to create path in template for
     */
    private generateLambdaPaths = (handlers: Handler[]) => {
        return handlers.map((handler) => {
            return {
                [handler.path]: {
                    [handler.httpMethod.toLowerCase()]: {
                        operationId: handler.name,
                        "x-amazon-apigateway-integration": {
                            type: "aws_proxy",
                            httpMethod: handler.httpMethod.toUpperCase(),
                            passthroughBehavior: "never",
                            uri: this.generateLambdaUri(handler.name),
                        },
                        "x-amazon-apigateway-request-validator": "all",
                    },
                    ...this.OPTIONS_PATH,
                },
            };
        });
    };

    /**
     * Returns the URI of the Lambda
     * @param functionName name of the Lambda function
     */
    private generateLambdaUri = (functionName: string) => {
        return `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:${this.REGION}:${this.ACCOUNT_ID}:function:${functionName}/invocations`;
    };

    private createOutputUrl = () => {
        return `https://${this.api.ref}.execute-api.${this.REGION}.amazonaws.com/prod`;
    };

    private OPTIONS_PATH: DefinitionBodyPath = {
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
}
