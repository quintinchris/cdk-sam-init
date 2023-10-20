import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SamMicroserviceProps } from "./types";
import { SamMicroservice } from "./samMicroservice";

export class SamStack extends Stack {
    constructor(scope: Construct, id: string, props: SamMicroserviceProps) {
        super(scope, id);
        this.templateOptions.templateFormatVersion = "2010-09-09";

        new SamMicroservice(this, "SamMicroserviceTemplate", props);
    }
}
