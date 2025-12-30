/**
 * Types for chat metadata loaded from JSON configuration files.
 *
 * These types represent the structure of the scenario/conversation configuration
 * files used to define chat scenarios for the AI tutor.
 */

/**
 * An action button that can be shown to the user during a chat.
 *
 * Actions allow users to perform predefined prompts like physical actions
 * that wouldn't be conveyed through text.
 */
export interface ChatAction {
  /** Display title for the action button */
  title: string;
  /** The prompt text sent to the LLM when action is clicked */
  prompt: string;
}

/**
 * Resident (patient/client) information for the chat scenario.
 *
 * Contains the persona details for the AI-simulated resident.
 */
export interface Resident {
  /** Resident's name */
  name: string;
  /** Resident's age */
  age?: number;
  /** Medical conditions or relevant health information */
  conditions?: string[];
  /** Personality traits that affect conversation style */
  personality?: string;
  /** Background story or context */
  background?: string;
  /** Current situation or scenario context */
  situation?: string;
  /** Additional resident-specific data */
  [key: string]: unknown;
}

/**
 * Full chat metadata configuration loaded from JSON files.
 *
 * This represents a complete scenario configuration including the
 * resident persona, available actions, and chat settings.
 */
export interface ChatMetadata {
  /** Unique identifier for this chat scenario */
  id: string;
  /** The LLM model to use for this chat */
  model: string;
  /** Unit/module this chat belongs to */
  unit: string;
  /** Introduction text shown to the user before starting */
  intro: string;
  /** HTML description shown in the chat interface */
  description_html: string;
  /** YouTube video ID for instructional content (if any) */
  youtube_video_id?: string;
  /** Avatar identifier for the resident */
  avatar_id: string;
  /** Maximum number of turns allowed (undefined = unlimited) */
  max_turns?: number;
  /** Scene identifier for multi-scene scenarios */
  scene_id?: string;
  /** Resident persona configuration */
  resident: Resident;
  /** Available action buttons for the user */
  actions?: ChatAction[];
}

/**
 * Simplified chat metadata for grading requests.
 *
 * Contains only the fields needed for the grading LLM.
 */
export interface GradingChatMetadata {
  /** Unique identifier for this chat scenario */
  id: string;
  /** The LLM model used for this chat */
  model: string;
  /** Avatar identifier for the resident */
  avatar_id: string;
  /** Maximum number of turns allowed */
  max_turns?: number;
  /** Scene identifier for multi-scene scenarios */
  scene_id?: string;
  /** Unit/module this chat belongs to */
  unit: string;
  /** Introduction text */
  intro: string;
  /** Resident persona configuration */
  resident: Resident;
  /** Available action buttons */
  actions?: ChatAction[];
}
