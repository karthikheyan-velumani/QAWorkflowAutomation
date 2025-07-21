import { TestCase } from '../types/testCase';

export class PromptConverter {
    static convertToPrompt(testCase: TestCase): string {
        let markdown = '';
        testCase.steps.forEach((step, index) => {
            markdown += `Action ${index + 1}: ${step.action}\n`;
            markdown += `Expected Result ${index + 1}: ${step.expectedResult}\n\n`;
        });
        return markdown;
    }

    static convertToMarkdown(content: string): string {
        return content + '\n';
    }
}
