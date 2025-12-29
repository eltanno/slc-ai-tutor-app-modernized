import {
    useGetChatQuery,
    useGetChatsQuery,
    useGetModelsQuery,
    useSendChatMutation
} from "../../services/OpenWebUiApi.ts";
import {Button} from "@mui/material";


const LlmList = () => {
    const chatId = "0f7b0766-b99e-4a16-8ed0-1922bb8680d7";
    const _models = useGetModelsQuery({});
    const _chats = useGetChatsQuery({});
    const _chat = useGetChatQuery(chatId);
    const [sendChat] = useSendChatMutation();

    return (
        <div>
            LLM List
            <Button onClick={async () => {
                await sendChat({messages: [{role: "user", content: "Hello"}], model: "jim-test"});
            }}>Send Chat</Button>
        </div>
    );
};

export default LlmList;
