import { InterviewTemplate, InterviewQuestion } from '@/store/types';

// Question type for runtime usage
export interface Question {
  id: string;
  text: string;
  type: 'open' | 'multiple_choice' | 'rating' | 'yes_no';
  options?: string[];
  required: boolean;
  order: number;
}

// Define the template with runtime questions array
export interface RuntimeTemplate extends Omit<InterviewTemplate, 'questions'> {
  questions: Question[];
}

// Define the template with serialized questions (for database)
export interface SerializedTemplate extends Omit<InterviewTemplate, 'questions'> {
  questions: string; // JSON string in database
}

/**
 * Serializes template questions for database storage
 */
export function serializeTemplateQuestions(template: Partial<RuntimeTemplate>): Partial<SerializedTemplate> {
  if (!template.questions) {
    return template as Partial<SerializedTemplate>;
  }
  
  return {
    ...template,
    questions: JSON.stringify(template.questions)
  } as Partial<SerializedTemplate>;
}

/**
 * Deserializes template questions from database format
 */
export function deserializeTemplateQuestions(template: SerializedTemplate): RuntimeTemplate {
  let questions: Question[] = [];
  
  try {
    if (typeof template.questions === 'string') {
      questions = JSON.parse(template.questions);
    } else if (Array.isArray(template.questions)) {
      // Handle case where questions might already be an array
      questions = template.questions as unknown as Question[];
    }
  } catch (error) {
    console.error('Error parsing template questions:', error);
  }
  
  return {
    ...template,
    questions
  };
}

/**
 * Validates a question object
 */
export function validateQuestion(question: Question): boolean {
  // Basic validation
  if (!question.text?.trim()) return false;
  
  // Validate multiple choice has options
  if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes questions before saving to database
 */
export function sanitizeQuestions(questions: Question[]): Question[] {
  return questions
    .filter(q => q.text.trim() !== '') // Remove questions with empty text
    .map((q, index) => ({
      id: q.id || `question-${Date.now()}-${index}`,
      text: q.text.trim(),
      type: q.type || 'open',
      options: q.type === 'multiple_choice' ? (q.options || []).filter(o => o.trim() !== '') : [],
      required: q.required ?? true,
      order: q.order ?? index
    }));
} 