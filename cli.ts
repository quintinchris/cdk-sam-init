import { Command } from "commander";
import { generateApp } from "./generator";

const program = new Command();

program
    .version("1.0.0")
    .description(
        "Generate a serverless application template with AWS SAM and CDK"
    );

program
    .requiredOption("--name <app-name>", "The name of the application")
    .option(
        "--destination <destination-path>",
        "The directory where the app will be generated",
        process.cwd()
    );
// .option(
//     "--language <programming-language>",
//     "The programming language to use",
//     "typescript"
// )
// .option(
//     "--template <template-name>",
//     "Choose a specific template",
//     "default"
// )
// .option("--verbose", "Print additional information or debugging messages");

program.parse(process.argv);

const options = program.opts();

generateApp(
    options.name,
    options.destination
    // options.language,
    // options.template,
    // options.verbose
);
