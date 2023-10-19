## cdk-sam-init

A CLI to generate an app built with SAM and CDK


### Problem Statement

CDK and SAM have a weird relationship. They support each other, kinda. CDK has a aws-sam library for constructs that align with the SAM specification, however there's only support for L1 constructs.

On the other side of the coin, the sam cli offers the ability to run and debug your lambdas and API's locally, but doesn't support most L2 constructs built with CDK.

There is a middle ground where you can have your infrastructure defined with CDK and the local debugging that SAM provides, that (subjectively) offers the best DX within this landscape.

So this CLI attempts to get you building in this landscape faster, by spitting out an application that can be run locally with SAM and also offer the IAAC management of CDK.

While both the `aws-sam-cli` and `cdk` offer `init` commands, oftentimes developers working with AWS may want to have both in order to use the `sam` cli for local testing, but also `cdk` for managing IAAC.

This CLI generates an application for you that has both configured and initialized to enable faster development.

### Usage

`npx cdk-sam-init --name APP_NAME`

### Roadmap
- [ ] ENV variable support
- [ ] sam-sync support
- [ ] Support other languages (python, go, c#, java)

#### Template Roadmap
- [ ] Authorizer support
- [ ] Middleware handlers
- [ ] Integration with other L2 Constructs