import { AzureIntegration } from './azureIntegration';
import * as path from 'path';
import * as fs from 'fs/promises';

interface TestDetails {
    PlanID: string;
    SuiteID: string;
}

async function main() {
    try {
        // Read test details from JSON file in root directory
        const testDetailsPath = path.join(__dirname, '..', 'TestDetails.json');
        const testDetailsContent = await fs.readFile(testDetailsPath, 'utf-8');
        const testDetails: TestDetails = JSON.parse(testDetailsContent);

        // Create output directory name based on the test IDs
        const outputDir = path.join(__dirname, '..', 'test-steps');

        console.log(`Fetching test case details from Azure DevOps...`);
        console.log(`Plan ID: ${testDetails.PlanID}`);
        console.log(`Test Suite ID: ${testDetails.SuiteID}`);
        console.log(`Output Directory: ${outputDir}`);

        await AzureIntegration.fetchAndConvertTests(
            parseInt(testDetails.PlanID),
            parseInt(testDetails.SuiteID),
            outputDir
        );

        console.log('Successfully completed test case conversion');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
