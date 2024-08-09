"use client";
import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import { Add } from '@mui/icons-material';
import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // const [messages, setMessages] = useState([
  //   {
  //     role: "assistant",
  //     content: "Hi. I am support Super man. How to help you?",
  //   },
  // ]);
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Ticket 1",
      messages: [
        {
          role: "assistant",
          content: "Hi. I am support Super man. How to help you?",
        },
      ],
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(1);
  const messagesEndRef = useRef(null);
  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];

  const sendMessage = async () => {
    if (!message.trim() || isLoading) {
      return;
    }
    setIsLoading(true);
    const newMessage = { role: "user", content: message };
    setMessage("");
    // setMessages((messages) => [
    //   ...messages,
    //   { role: "user", content: message },
    //   { role: "assistant", content: "" },
    // ]);

    setChats((chats) =>
      chats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                newMessage,
                { role: "assistant", content: "" },
              ],
            }
          : chat
      )
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify([...messages, { role: "user", content: message }]),
        body: JSON.stringify([...messages, newMessage]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      // let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        // result += text;
        // setMessages((messages) => {
        //   let lastMessage = messages[messages.length - 1];
        //   let otherMessages = messages.slice(0, messages.length - 1);
        //   return [
        //     ...otherMessages,
        //     {
        //       ...lastMessage,
        //       content: lastMessage.content + text,
        //     },
        //   ];
        // });
        setChats((chats) =>
          chats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg, index) =>
                    index === chat.messages.length - 1
                      ? { ...msg, content: msg.content + text }
                      : msg
                  ),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Error", error);
      // setMessage((messages) => [
      //   ...messages,
      //   {
      //     role: "assistant",
      //     content: "I'm sorry but I encountered an error.Please try again later",
      //   },
      // ]);

      setChats((chats) =>
        chats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    content:
                      "I'm sorry but I encountered an error. Please try again later",
                  },
                ],
              }
            : chat
        )
      );
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = () => {
    const newChatId = chats.length + 1;
    setChats([
      ...chats,
      {
        id: newChatId,
        name: `Ticket ${newChatId}`,
        messages: [
          {
            role: "assistant",
            content: "Hi. I am super man. How to help you?",
          },
        ],
      },
    ]);
    setActiveChatId(newChatId);
  };

  return (
    <Container>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
      >
        {/* Sidebar for Chat List */}
        <Box
          width="250px"
          height="100%"
          border="1px solid black"
          borderRadius="15px"
          p={2}
          mr={2}
        >
          <Button variant="contained" fullWidth onClick={createNewChat}>
            <Add/>
          </Button>
          <List>
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                button
                selected={chat.id === activeChatId}
                onClick={() => setActiveChatId(chat.id)}
              >
                <ListItemText primary={chat.name} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Box */}
        <Box
          width="750px"
          height="800px"
          display="flex"
          flexDirection="column"
          border="1px solid black"
          borderRadius="15px"
          p={2}
        >
          <Stack
            direction={"column"}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={
                    message.role === "assistant"
                      ? "primary.main"
                      : "secondary.main"
                  }
                  color="white"
                  borderRadius={14}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
