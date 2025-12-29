import {
    useGetChatQuery,
    useGetChatsQuery,
    useGetModelsQuery,
    useSendChatMutation
} from "../../services/OpenWebUiApi.ts";
import {Button} from "@mui/material";


const LlmList = ({}) => {
    const chatId = "0f7b0766-b99e-4a16-8ed0-1922bb8680d7";
    const models = useGetModelsQuery({});
    const chats = useGetChatsQuery({});
    const chat = useGetChatQuery(chatId);
    const [sendChat] = useSendChatMutation();

    console.log("models", models.data);
    console.log("chats", chats.data);
    console.log("chat", chat.data);

    return (
        <div>
            LLM List
            <Button onClick={async () => {
                const res = await sendChat({messages: [{role: "user", content: "Hello"}], model: "jim-test"});
                console.log(res);
            }}>Send Chat</Button>
        </div>
    );
};

export default LlmList;
