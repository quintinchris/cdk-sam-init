import { copySync } from "fs-extra";

const TEMPLATE_LOCATION = "./template"

export function generateApp(appName: string, destinationPath: string) {
    console.log(`Creating a new SAM & CDK app: ${appName}`);

    const appDirectory = `${destinationPath}/${appName}`;
    try {
        copySync(TEMPLATE_LOCATION, appDirectory);
    } catch (e) {
        console.log(e);
        // TODO handle error
    }


    console.log(`App has been generated at: ${appDirectory}`);
}
