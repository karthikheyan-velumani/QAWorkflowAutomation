export interface TestStep {
    action: string;
    expectedResult: string;
}

export interface TestCase {
    id: number;
    name: string;
    steps: TestStep[];
}
