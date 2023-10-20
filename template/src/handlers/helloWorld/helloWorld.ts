export const helloWorldHandlerConfig = {
    name: "helloWorld",
    path: "/hello",
    httpMethod: "GET",
};

export const handler = async () => {
    return {
        statusCode: 200,
        body: "hello world!",
    };
};
