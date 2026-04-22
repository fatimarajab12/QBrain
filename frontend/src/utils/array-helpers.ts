import { Feature } from '@/types/feature';
import { TestCase } from '@/types/test-case';

export function removeDuplicateFeatures(features: Feature[]): Feature[] {
  const seen = new Map<string, Feature>();
  
  for (const feature of features) {
    const key = `${feature.name.toLowerCase().trim()}-${feature.description?.toLowerCase().trim().substring(0, 100) || ''}`;
    
    if (!seen.has(key)) {
      seen.set(key, feature);
    }
  }
  
  return Array.from(seen.values());
}

export function removeDuplicateTestCases(testCases: TestCase[]): TestCase[] {
  const seen = new Map<string, TestCase>();
  
  for (const testCase of testCases) {
    const key = `${testCase.title.toLowerCase().trim()}-${testCase.expectedResult?.toLowerCase().trim().substring(0, 100) || ''}`;
    
    if (!seen.has(key)) {
      seen.set(key, testCase);
    }
  }
  
  return Array.from(seen.values());
}

