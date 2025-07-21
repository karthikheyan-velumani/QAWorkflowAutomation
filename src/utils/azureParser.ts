import { TestCase, TestStep } from '../types/testCase';

export class AzureTestParser {
    static parseAzureFormat(content: string, id: number): TestCase {
        const lines = content.split('\n').filter(line => line.trim());
        const steps: TestStep[] = [];
        let currentStep: Partial<TestStep> = {};
        let name = '';

        lines.forEach(line => {
            line = line.trim();

            if (line.startsWith('Action:')) {
                if (currentStep.action) {
                    steps.push(currentStep as TestStep);
                    currentStep = {};
                }
                currentStep.action = line.replace('Action:', '').trim();
            } else if (line.startsWith('Expected')) {
                currentStep.expectedResult = line.replace(/Expected [Rr]esults?:/, '').trim();
                steps.push(currentStep as TestStep);
                currentStep = {};
            }
        });

        // Add the last step if it exists
        if (currentStep.action && currentStep.expectedResult) {
            steps.push(currentStep as TestStep);
        }

        return {
            id,
            name: name || 'Unnamed Test Case',
            steps
        };
    }
}
