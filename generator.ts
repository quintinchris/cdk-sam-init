import { copySync } from "fs-extra";

export function generateApp(appName: string, destinationPath: string) {
    console.log(`Creating a new app: ${appName}`);

    const appDirectory = `${destinationPath}/${appName}`;
    copySync("my-template", appDirectory);

    console.log(`App has been generated at: ${appDirectory}`);
}
