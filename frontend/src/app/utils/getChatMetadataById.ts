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

export interface ChatAction {
    title: string;
    prompt: string;
}

export interface ChatMetadata {
    id: string;
    model: string;
    unit: string;
    intro: string;
    description_html: string;
    youtube_video_id: string;
    avatar_id: string;
    max_turns?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resident: any;
    actions?: ChatAction[];
}

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
