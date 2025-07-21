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

    async updateTestCaseAutomationDetails(testCaseId: number, automatedTestName: string): Promise<void> {
        // First get the work item to check available fields
        const testCase = await this.getTestCaseDetails(testCaseId);
        const fields = Object.keys(testCase.fields);

        const patch = [
            {
                op: 'replace',
                path: '/fields/Microsoft.VSTS.TCM.AutomationStatus',
                value: 'Automated'
            },
            {
                op: 'replace',
                path: '/fields/Microsoft.VSTS.TCM.AutomatedTestName',
                value: automatedTestName
            },
            {
                op: 'replace',
                path: '/fields/Microsoft.VSTS.TCM.AutomatedTestId',
                value: automatedTestName
            },
            {
                op: 'replace',
                path: '/fields/Microsoft.VSTS.TCM.AutomatedTestStorage',
                value: `tests/TC${testCaseId}_${automatedTestName}.spec.ts`
            },
            {
                op: 'replace',
                path: '/fields/Microsoft.VSTS.TCM.AutomatedTestType',
                value: 'Playwright'
            }
        ];

        // Try to find the correct field name for DateAutomated
        const dateAutomatedFields = [
            'Microsoft.VSTS.TCM.DateAutomated',
            'Microsoft.VSTS.TCM.AutomatedDate',
            'System.DateAutomated'
        ];

        const dateField = dateAutomatedFields.find(field => fields.includes(field));
        if (dateField) {
            patch.push({
                op: 'replace',
                path: `/fields/${dateField}`,
                value: new Date().toISOString()
            });
        } else {
            console.log('DateAutomated field not found in available fields:', fields);
        }

        const url = `${this.baseUrl}/wit/workitems/${testCaseId}?api-version=${this.config.apiVersion}`;
        await this.makePatchRequest(url, patch);
    }

    async updateTestPointStatus(testPlanId: number, testSuiteId: number, testCaseId: number, outcome: 'Passed' | 'Failed' | 'NotApplicable' | 'Blocked' | 'Paused'): Promise<void> {
        try {
            // First get the test point ID
            const pointsPath = `/test/Plans/${testPlanId}/Suites/${testSuiteId}/points`;
            const response = await this.makeRequest(pointsPath);

            console.log('Looking for test case ID:', testCaseId);

            const testPoint = response.value?.find((point: any) => point.testCase?.id.toString() === testCaseId.toString());
            if (!testPoint) {
                throw new Error(`Test point not found for test case ${testCaseId} in suite ${testSuiteId}`);
            }

            // Get test case details
            const testCase = await this.getTestCaseDetails(testCaseId);
            console.log('Test case details retrieved:', testCase.id);

            // Create a test run
            const createRunUrl = `${this.baseUrl}/test/runs?api-version=${this.config.apiVersion}`;
            const formattedTestName = `TC${testCaseId}_${testCase.fields['System.Title']}`;
            const runData = {
                name: `Automated Test Run - ${formattedTestName}`,
                plan: { id: testPlanId },
                pointIds: [testPoint.id],
                state: "InProgress",
                automated: true,
                type: "NoConfigRun",
                buildReference: {
                    id: "1",
                    name: "Playwright Test Run"
                }
            };

            console.log('Creating test run:', JSON.stringify(runData, null, 2));
            const run = await this.makePostRequest(createRunUrl, runData);
            console.log('Test run created:', run.id);

            // Create test result with required fields
            const createResultUrl = `${this.baseUrl}/test/Runs/${run.id}/results?api-version=${this.config.apiVersion}`;
            const resultData = [{
                testCase: {
                    id: testCaseId
                },
                testPoint: {
                    id: testPoint.id
                },
                testSuite: {
                    id: testSuiteId
                },
                priority: 2,
                outcome: outcome,
                state: "Completed",
                runBy: {
                    displayName: "Automated Test"
                },
                errorMessage: "",
                comment: "",
                failureType: "None",
                duration: 1, // 1 millisecond minimum
                startedDate: new Date().toISOString(),
                completedDate: new Date().toISOString()
            }];

            console.log('Creating test result:', JSON.stringify(resultData, null, 2));
            const result = await this.makePostRequest(createResultUrl, resultData);
            console.log('Test result created:', result);

            // Complete the run
            const updateRunUrl = `${this.baseUrl}/test/runs/${run.id}?api-version=${this.config.apiVersion}`;
            const completionData = [{
                op: "replace",
                path: "/state",
                value: "Completed"
            }];

            await this.makePatchRequest(updateRunUrl, completionData);
            console.log('Test run completed successfully');

        } catch (error) {
            console.error('Error in updateTestPointStatus:', error);
            throw error;
        }
    }

    private async makePatchRequest(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'PATCH',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json',
                },
            };

            const req = https.request(url, options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => responseData += chunk);
                res.on('end', () => {
                    console.log('Response Status:', res.statusCode);
                    console.log('Response Headers:', res.headers);
                    console.log('Response Body:', responseData);

                    if (res.statusCode !== 200 && res.statusCode !== 201) {
                        reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}\nResponse: ${responseData}`));
                        return;
                    }
                    try {
                        resolve(responseData ? JSON.parse(responseData) : {});
                    } catch (e) {
                        console.warn('Could not parse response as JSON:', e);
                        resolve(responseData);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Request error:', error);
                reject(error);
            });

            console.log('Making PATCH request to:', url);
            console.log('Request body:', JSON.stringify(data, null, 2));

            req.write(JSON.stringify(data));
            req.end();
        });
    }

    private async makePostRequest(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
            };

            const req = https.request(url, options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => responseData += chunk);
                res.on('end', () => {
                    console.log('Response Status:', res.statusCode);
                    console.log('Response Headers:', res.headers);
                    console.log('Response Body:', responseData);

                    if (res.statusCode !== 200 && res.statusCode !== 201) {
                        reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}\nResponse: ${responseData}`));
                        return;
                    }
                    try {
                        resolve(responseData ? JSON.parse(responseData) : {});
                    } catch (e) {
                        console.warn('Could not parse response as JSON:', e);
                        resolve(responseData);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Request error:', error);
                reject(error);
            });

            console.log('Making POST request to:', url);
            console.log('Request body:', JSON.stringify(data, null, 2));

            req.write(JSON.stringify(data));
            req.end();
        });
    }
}
