import unit1_conversation1 from '../../assets/new_json/unit1_conversation1.json'
import unit2_conversation1 from '../../assets/new_json/unit2_conversation1.json'
import unit2_conversation2 from '../../assets/new_json/unit2_conversation2.json'
import unit3_conversation1 from '../../assets/new_json/unit3_conversation1.json'
import unit3_conversation2 from '../../assets/new_json/unit3_conversation2.json'
import unit4_conversation1 from '../../assets/new_json/unit4_conversation1.json'
import unit4_conversation2 from '../../assets/new_json/unit4_conversation2.json'
import unit5_conversation1 from '../../assets/new_json/unit5_conversation1.json'
import unit5_conversation2 from '../../assets/new_json/unit5_conversation2.json'
import unit6_conversation1 from '../../assets/new_json/unit6_conversation1.json'
import unit6_conversation2 from '../../assets/new_json/unit6_conversation2.json'
import unit7_conversation1 from '../../assets/new_json/unit7_conversation1.json'
import unit8_conversation1 from '../../assets/new_json/unit8_conversation1.json'
import type { ChatMetadata, ChatAction } from '../types/ChatMetadata';

// Re-export for backward compatibility
export type { ChatMetadata, ChatAction };

export const CHAT_METADATA_LIST: ChatMetadata[] = [
    unit1_conversation1,
    unit2_conversation1,
    unit2_conversation2,
    unit3_conversation1,
    unit3_conversation2,
    unit4_conversation1,
    unit4_conversation2,
    unit5_conversation1,
    unit5_conversation2,
    unit6_conversation1,
    unit6_conversation2,
    unit7_conversation1,
    unit8_conversation1
];
//export const CHAT_METADATA_LIST: ChatMetadata[] = [unit1_conversation1, unit2_conversation2, unit4_conversation1];

export const getChatMetadataById = (id: string | undefined): ChatMetadata | undefined => {
    return CHAT_METADATA_LIST.find(chat => chat.id === id);
}
