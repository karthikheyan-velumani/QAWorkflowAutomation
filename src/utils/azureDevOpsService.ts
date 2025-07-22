import * as https from 'https';
import { TestCase, TestStep } from '../types/testCase';

export interface AzureDevOpsConfig {
    pat: string;
    organization: string;
    project: string;
    apiVersion: string;
}

export class AzureDevOpsService {
    private baseUrl: string;
    private auth: string;

    constructor(private config: AzureDevOpsConfig) {
        this.baseUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis`;
        this.auth = Buffer.from(`:${config.pat}`).toString('base64');
    }

    private async makeRequest(path: string, useQuery: boolean = true): Promise<any> {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
            };

            const separator = path.includes('?') ? '&' : '?';
            const url = `${this.baseUrl}${path}${useQuery ? `${separator}api-version=${this.config.apiVersion}` : ''}`;
            console.log('Making request to:', url);

            https.get(url, options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            console.error('API Error:', {
                                statusCode: res.statusCode,
                                statusMessage: res.statusMessage,
                                data: data
                            });
                            reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}`));
                            return;
                        }
                        const parsed = JSON.parse(data);
                        console.log('API Response:', JSON.stringify(parsed, null, 2));
                        resolve(parsed);
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        reject(e);
                    }
                });
            }).on('error', (err) => {
                console.error('Network error:', err);
                reject(err);
            });
        });
    } async getTestCases(testSuitePlanId: number, testSuiteId: number): Promise<TestCase[]> {
        // First, get all test points in the test suite
        const path = `/test/Plans/${testSuitePlanId}/Suites/${testSuiteId}/points`;
        console.log('Fetching test points from suite...');
        const response = await this.makeRequest(path);

        const testCases: TestCase[] = [];
        const processedIds = new Set();

        if (!response.value || !Array.isArray(response.value)) {
            console.error('Unexpected response format:', response);
            throw new Error('Invalid response format from Azure DevOps API');
        }

        console.log(`Found ${response.value.length} test points`);

        for (const point of response.value) {
            const testCaseId = point.testCase?.id;
            if (testCaseId && !processedIds.has(testCaseId)) {
                processedIds.add(testCaseId);
                console.log('Processing test case:', testCaseId);
                try {
                    const testCaseDetails = await this.getTestCaseDetails(testCaseId);
                    testCases.push(this.convertToTestCase(testCaseDetails));
                } catch (error) {
                    console.error(`Error processing test case ${testCaseId}:`, error);
                }
            }
        }

        return testCases;
    }

    private async getTestCaseDetails(testCaseId: number): Promise<any> {
        if (!testCaseId) {
            throw new Error('Invalid test case ID');
        }
        // Get work item details for the test case
        const path = `/wit/workitems/${testCaseId}?$expand=all`;
        console.log(`Fetching details for test case ${testCaseId}...`);
        return this.makeRequest(path);
    } private convertToTestCase(azureTestCase: any): TestCase {
        const steps: TestStep[] = [];

        // Log the available fields for debugging
        console.log('Available fields:', Object.keys(azureTestCase.fields));

        // Try different possible field names for steps
        const stepsField = azureTestCase.fields['Microsoft.VSTS.TCM.Steps'] ||
            azureTestCase.fields['System.Description'] ||
            azureTestCase.fields['Microsoft.VSTS.Common.Steps'];

        if (stepsField) {
            console.log('Found steps field:', stepsField);

            // Parse the steps XML
            const stepMatches = stepsField.match(/<step[^>]*>.*?<\/step>/gs);

            if (stepMatches) {
                stepMatches.forEach((stepMatch: string) => {
                    const paramStrings = stepMatch.match(/<parameterizedString[^>]*>(.*?)<\/parameterizedString>/g);

                    if (paramStrings && paramStrings.length >= 2) {
                        const actionMatch = paramStrings[0].match(/<parameterizedString[^>]*>(.*?)<\/parameterizedString>/);
                        const expectedMatch = paramStrings[1].match(/<parameterizedString[^>]*>(.*?)<\/parameterizedString>/);

                        if (actionMatch && expectedMatch) {
                            steps.push({
                                action: this.cleanHtml(actionMatch[1]),
                                expectedResult: this.cleanHtml(expectedMatch[1])
                            });
                        }
                    }
                });
            }
        }

        // Include the test case ID in the name
        const testCaseId = azureTestCase.id;
        const testCaseTitle = azureTestCase.fields['System.Title'];
        return {
            id: testCaseId,
            name: `TC${testCaseId}_${testCaseTitle}`,
            steps
        };
    }

    private cleanHtml(html: string): string {
        return html
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/"/g, '') // Remove quotes
            .trim();
    }
}