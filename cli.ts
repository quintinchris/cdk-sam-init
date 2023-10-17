import { generateApp } from "./generator";

if (process.argv.length <= 2) {
    console.log(
        "No arguments provided. Usage: cdk-sam-init <app-name> [destination-path]"
    );
    process.exit(1);
}

const [_, __, appName, destinationPath = process.cwd()] = process.argv;

generateApp(appName, destinationPath);
