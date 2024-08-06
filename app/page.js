"use client";
import { Box, Button, Stack, TextField } from "@mui/material";
import { ST } from "next/dist/shared/lib/utils";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi. I am support Super man. How to help you?",
    },
  ]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
    >
      <Stack direction={"column"}>
        <Stack direction={"column"} spacing={2}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display={flex}
              justifyContent={
                messages.role === "assisstant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  messages.role === "assisstant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color={white}
                borderRadius={16}
                p={2}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField label="message" fullWidth />
          <Button variant="outlined">Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
