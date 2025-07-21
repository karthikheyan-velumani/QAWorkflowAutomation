import { AzureIntegration } from './azureIntegration';
import * as path from 'path';

function printUsage() {
    console.log(`
Usage:
    1. Convert local file:
       npm run convert file <input-file> <output-file>
    
    2. Fetch from Azure DevOps:
       npm run convert azure <test-plan-id> <test-suite-id> <output-dir>
    
    3. Update test case automation status:
       npm run convert update <test-plan-id> <test-suite-id> <test-case-id> <test-name> <status>
    `);
    process.exit(1);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        printUsage();
    }

    const [mode, ...restArgs] = args;

    try {
        switch (mode) {
            case 'file':
                if (restArgs.length !== 2) {
                    console.error('For file mode, provide input and output file paths');
                    printUsage();
                }
                const [inputFile, outputFile] = restArgs;
                await AzureIntegration.convertTestToPrompt(
                    path.resolve(inputFile),
                    path.resolve(outputFile)
                );
                break;

            case 'azure':
                if (restArgs.length !== 3) {
                    console.error('For azure mode, provide test plan ID, test suite ID, and output directory');
                    printUsage();
                }
                const [planId, suiteId, outputDir] = restArgs;
                await AzureIntegration.fetchAndConvertTests(
                    parseInt(planId),
                    parseInt(suiteId),
                    path.resolve(outputDir)
                );
                break;

            case 'update':
                if (restArgs.length !== 5) {
                    console.error('For update mode, provide test plan ID, test suite ID, test case ID, test name, and status');
                    printUsage();
                }
                const [updatePlanId, updateSuiteId, testCaseId, testName, status] = restArgs;
                await AzureIntegration.updateTestCase(
                    parseInt(updatePlanId),
                    parseInt(updateSuiteId),
                    parseInt(testCaseId),
                    testName,
                    status as 'Passed' | 'Failed'
                );
                break;

            default:
                console.error('Invalid mode. Use "file", "azure", or "update"');
                printUsage();
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
