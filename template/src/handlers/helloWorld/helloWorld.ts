import { APIGatewayProxyHandler } from "aws-lambda";

export const helloWorldHandlerConfig = {
    name: "helloWorld",
    path: "/hello",
    httpMethod: "GET",
};

export const handler: APIGatewayProxyHandler = async () => {
    return {
        statusCode: 200,
        body: "hello world!",
    };
};
