import * as sam from "aws-cdk-lib/aws-sam";

export interface DefinitionBodyPath {
    [key: string]: any;
}

export interface SamMicroserviceProps {
    handlers: Handler[];
    apiGateway: SamApiProps;
    // envVariables?: Record<string, string>;
}

export type SamApiProps = Required<Pick<sam.CfnApiProps, "name">> &
    Partial<Omit<sam.CfnApiProps, "name">>;

export interface Handler {
    name: string;
    pathPrefix?: string;
    path: string;
    httpMethod: string;
    authorizer?: string;
    environmentVariables?: Record<string, string>;
}
