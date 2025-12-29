import type {ChatMessage} from "../../types/Conversation.ts";
import {Box, Paper, Typography} from '@mui/material';
import * as React from 'react';
import ChatMessageBox from "./ChatMessageBox.tsx";
import {Fragment} from "react";

const Conversation = ({messages, leftAvatarId, rightAvatarId}: {messages: ChatMessage[], leftAvatarId: string, rightAvatarId: string}) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <Box display="flex" flexDirection="column" height="100%" minHeight={0} position="relative">
      <Box ref={scrollRef} flex={1} minHeight={0} overflow={"auto"} display="flex" flexDirection="column" gap={1.5} px={2}>
        <>
          {messages.map((msg, idx) => {
            // Handle scenario messages specially
            if (msg.role === 'scenario') {
              return (
                <Fragment key={idx}>
                  <Box display="flex" justifyContent="center" my={2}>
                    <Paper
                      elevation={2}
                      sx={{
                        px: 3,
                        py: 1.5,
                        backgroundColor: '#fff3e0',
                        borderLeft: '4px solid #ff9800',
                        maxWidth: '80%'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          color: '#e65100',
                          textAlign: 'center'
                        }}
                      >
                        {msg.content}
                      </Typography>
                    </Paper>
                  </Box>
                </Fragment>
              );
            }

            // Handle regular messages
            const isUser = msg.role === 'user';
            return (<Fragment key={idx}><ChatMessageBox message={msg} avatarId={isUser ? leftAvatarId : rightAvatarId} isLeft={isUser} isFirstMessage={idx === 0} /></Fragment>);
          })}
           <div style={{height: 20}}>&nbsp;</div>
        </>
      </Box>
    </Box>
  );
};

export default Conversation;
