export const helloWorldHandlerConfig = {
    name: "helloWorld",
    path: "/hello",
    httpMethod: "GET",
}

export const handler = async () => {
    return "hello world!";
};
