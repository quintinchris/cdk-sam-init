## cdk-sam-init

A CLI to generate an app built with SAM and CDK


### Problem Statement

While both the `aws-sam-cli` and `cdk` offer `init` commands, oftentimes developers working with AWS may want to have both in order to use the `sam` cli for local testing, but also `cdk` for managing IAAC.

This CLI generates an application for you that has both configured and initialized to enable faster development.

### Get Started

`npx cdk-sam-init`