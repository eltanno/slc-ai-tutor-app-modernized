/**
 * TypeScript types for chat grading responses from slc-tutor-evaluator LLM
 */

export interface RequiredDisclosure {
    disclosure: string;
    achieved: boolean;
    context: string;
}

export interface EndCondition {
    condition: string;
    completed: boolean;
    evidence: string;
}

export interface CommunicationQuality {
    empathy_score: number;
    active_listening_score: number;
    clarity_score: number;
    patience_score: number;
    professionalism_score: number;
    overall_score: number;
    comments: string;
}

export interface AreaForImprovement {
    area: string;
    example: string;
    suggestion: string;
}

export interface ChatGradingResponse {
    required_disclosures: RequiredDisclosure[];
    end_conditions: EndCondition[];
    communication_quality: CommunicationQuality;
    strengths: string[];
    areas_for_improvement: AreaForImprovement[];
    overall_summary: string;
    recommendations: string[];
}
