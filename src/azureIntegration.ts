import { AzureTestParser } from './utils/azureParser';
import { PromptConverter } from './utils/promptConverter';
import { AzureDevOpsService, AzureDevOpsConfig } from './utils/azureDevOpsService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

export class AzureIntegration {
    private static getConfig(): AzureDevOpsConfig {
        dotenv.config();

        const required = ['AZURE_DEVOPS_PAT', 'AZURE_DEVOPS_ORG', 'AZURE_DEVOPS_PROJECT', 'AZURE_DEVOPS_API_VERSION'];
        const missing = required.filter(key => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return {
            pat: process.env.AZURE_DEVOPS_PAT!,
            organization: process.env.AZURE_DEVOPS_ORG!,
            project: process.env.AZURE_DEVOPS_PROJECT!,
            apiVersion: process.env.AZURE_DEVOPS_API_VERSION!
        };
    }

    static async fetchAndConvertTests(testSuitePlanId: number, testSuiteId: number, outputDir: string): Promise<void> {
        try {
            const config = this.getConfig();
            const azureService = new AzureDevOpsService(config);

            // Fetch test cases from Azure DevOps
            const testCases = await azureService.getTestCases(testSuitePlanId, testSuiteId);

            // Create output directory if it doesn't exist
            await fs.mkdir(outputDir, { recursive: true });

            // Process each test case
            for (const testCase of testCases) {
                const prompt = PromptConverter.convertToPrompt(testCase);
                const markdown = PromptConverter.convertToMarkdown(prompt);

                // Create a filename with test case ID and sanitized name, ensuring the ID only appears once
                const sanitizedName = testCase.name
                    .replace(/[^a-z0-9]/gi, ' ')
                    .trim()
                    .replace(/\s+/g, '-');

                // Remove TC{id} if it exists in the name to avoid duplication
                const nameWithoutId = sanitizedName.replace(new RegExp(`TC${testCase.id}[-_]?`, 'i'), '');
                const filename = `TC${testCase.id}-${nameWithoutId}` + ' Steps.md';

                const outputPath = path.join(outputDir, filename);
                await fs.writeFile(outputPath, markdown);

                console.log(`Created test steps file: ${filename}`);
            }

            console.log('Successfully processed all test cases');
        } catch (error) {
            console.error('Error processing test cases:', error);
            throw error;
        }
    }

    static async convertTestToPrompt(inputPath: string, outputPath: string): Promise<void> {
        try {
            // Read the input file
            const content = await fs.readFile(inputPath, 'utf-8');

            // Extract test case ID from filename (assumes format like TC123_Name)
            const baseFilename = path.basename(inputPath);
            const idMatch = baseFilename.match(/^TC(\d+)_/);
            const testCaseId = idMatch ? parseInt(idMatch[1]) : 0;

            // Parse the Azure format
            const testCase = AzureTestParser.parseAzureFormat(content, testCaseId);

            // Convert to prompt format
            const prompt = PromptConverter.convertToPrompt(testCase);

            // Convert to markdown
            const markdown = PromptConverter.convertToMarkdown(prompt);

            // Write to output file
            await fs.writeFile(outputPath, markdown);

            console.log(`Successfully converted test case to prompt format at ${outputPath}`);
        } catch (error) {
            console.error('Error converting test case:', error);
            throw error;
        }
    }

    static async updateTestCase(testPlanId: number, testSuiteId: number, testCaseId: number, testName: string, status: 'Passed' | 'Failed'): Promise<void> {
        try {
            const config = this.getConfig();
            const azureService = new AzureDevOpsService(config);

            // Update automation details
            await azureService.updateTestCaseAutomationDetails(testCaseId, testName);

            // Update execution status
            await azureService.updateTestPointStatus(testPlanId, testSuiteId, testCaseId, status);

            console.log(`Successfully updated test case ${testCaseId} with automation details and status ${status}`);
        } catch (error) {
            console.error('Error updating test case:', error);
            throw error;
        }
    }
}
