/* eslint-disable @typescript-eslint/no-unused-vars */
import {Box, Typography} from "@mui/material";
import AvatarImg from "../avatar-img/AvatarImg.tsx";
import ReactMarkdown from "react-markdown";
import type {ChatMessage} from "../../types/Conversation.ts";

const bubbleStyles = {
    left: {
        alignSelf: 'flex-start',
        background: '#e3f2fd',
        color: '#222',
        borderRadius: '20px 20px 20px 6px',
        margin: '8px 0',
        padding: '12px 18px',
        maxWidth: '60%',
        minWidth: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        position: 'relative',
        wordBreak: 'break-word',
    },
    right: {
        alignSelf: 'flex-end',
        background: '#f1f8e9',
        color: '#222',
        borderRadius: '20px 20px 6px 20px',
        margin: '8px 0',
        padding: '12px 18px',
        maxWidth: '60%',
        minWidth: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        position: 'relative',
        wordBreak: 'break-word',
    }
};

const bubbleTailStyles = {
    left: {
        content: '""',
        position: 'absolute',
        left: -10,
        bottom: 8,
        width: 16,
        height: 16,
        background: '#e3f2fd',
        borderRadius: '50%',
        zIndex: 0,
    },
    right: {
        content: '""',
        position: 'absolute',
        right: -10,
        bottom: 8,
        width: 16,
        height: 16,
        background: '#f1f8e9',
        borderRadius: '50%',
        zIndex: 0,
    }
};

const ChatMessageBox = ({message, isLeft, avatarId, fullWidth, isFirstMessage}: {message: ChatMessage, isLeft: boolean, avatarId: string, fullWidth?:boolean, isFirstMessage?: boolean}) => {
    const bubbleStyle = {...bubbleStyles[isLeft ? 'left' : 'right']};
    const isSystem = message.role === 'system';
    //const isError = isSystem && message.content.startsWith("Error:");

    const robotAvatarId = "19";

    if(fullWidth){
        bubbleStyle["maxWidth"] = "calc(100% - 120px)";
        bubbleStyle["minWidth"] = "calc(100% - 120px)";
    }

    return (
        <Box
            display="flex"
            flexDirection={(isLeft ? 'row' : 'row-reverse') as 'row' | 'row-reverse'}
            alignItems="flex-end"
            justifyContent={'flex-start'}
            gap={1.5}
            width="100%"
        >
            {/* Avatar */}
            <AvatarImg
                avatarId={isSystem && !isFirstMessage ? robotAvatarId :avatarId}
                direction={isLeft ? 'right' : 'left'}
                size={100}
            />
            {/* Bubble */}
            <Box sx={bubbleStyle}>
                <ReactMarkdown
                    children={isSystem && isFirstMessage ? "Hello" : message.content}
                    components={{
                        p: ({node, ...props}) => <Typography variant="body1" sx={{
                            whiteSpace: 'pre-line',
                            textAlign: 'left',
                            mb: 1
                        }} {...props} />,
                        li: ({node, ...props}) => <li style={{marginLeft: 1, textAlign: 'left'}} {...props} />,
                        code: ({node, ...props}) => <Box component="code" sx={{
                            fontFamily: 'monospace',
                            bgcolor: '#eee',
                            px: 0.5,
                            py: 0.2,
                            borderRadius: 1
                        }} {...props} />,
                    }}
                />
                <Box component="span" sx={bubbleTailStyles[isLeft ? 'left' : 'right']}/>
            </Box>
        </Box>
    );
}

export default ChatMessageBox;
