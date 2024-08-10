"use client";
import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Add, ChatBubble, Close } from "@mui/icons-material";
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
  const [openChat, setOpenChat] = useState(false);
  const messagesEndRef = useRef(null);
  const tabsRef = useRef(null);

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

  const handleChatToggle = () => {
    setOpenChat((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (
      openChat &&
      event.target.closest(".chat-box") === null &&
      event.target.closest(".MuiFab-root") === null
    ) {
      setOpenChat(false);
    }
  };

  const deleteChat = (id) => {
    setChats((chats) => {
      const updatedChats = chats.filter((chat) => chat.id !== id);
      if (activeChatId === id) {
        if (updatedChats.length > 0) {
          const newActiveChatId = updatedChats[updatedChats.length - 1].id;
          setActiveChatId(newActiveChatId);
        } else {
          setActiveChatId(null);
          setOpenChat(true);
        }
      }
      return updatedChats;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openChat]);

  useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.scrollTo({
        left: tabsRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [chats.length]);

  return (
    <Container>
      <Box width="100vw" height="100vh" display="flex" flexDirection="column">
        <Typography variant="h2" align="center" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          Ask Away!!
        </Typography>

        <Fab
          color="primary"
          onClick={handleChatToggle}
          sx={{
            position: "fixed",
            bottom: 18,
            right: 18,
          }}
        >
          <ChatBubble />
        </Fab>
      </Box>

      {openChat && (
        <Box
          className="chat-box"
          width="400px"
          height="600px"
          display="flex"
          flexDirection="column"
          position="fixed"
          borderRadius="15px"
          bgcolor="background.paper"
          sx={{
            boxShadow: 10,
            p: 2,
            zIndex: 1200,
            bottom: 16,
            right: 16,
          }}
        >
          {/* Title Bar */}
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" gutterBottom>
              {" "}
              {`Ticket ${activeChatId}`}
            </Typography>
            <IconButton edge="end" onClick={handleChatToggle}>
              <Close />
            </IconButton>
          </Box>
          {/* Ticket Tabs */}
          <Box
            ref={tabsRef}
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            <Tabs variant="scrollable" scrollButtons="auto">
              <Toolbar>
                {chats.map((chat) => (
                  <Chip
                    key={chat.id}
                    label={
                      chat.name.length > 10
                        ? `${chat.name.slice(0, 10)}...`
                        : chat.name
                    }
                    onClick={() => setActiveChatId(chat.id)}
                    onDelete={(event) => {
                      event.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    variant={chat.id === activeChatId ? "filled" : "outlined"}
                    sx={{ marginRight: 1 }}
                  />
                ))}
                <IconButton onClick={createNewChat}>
                  <Add />
                </IconButton>
              </Toolbar>
            </Tabs>
          </Box>
          <Divider />
          {/* Message Box */}
          <Box
            display="flex"
            flexDirection="column"
            flexGrow={1}
            overflow="auto"
            p={1}
          >
            <Stack direction={"column"} spacing={2}>
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
                    p={2}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>
          <Stack direction={"row"} spacing={2} mt={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading}
              variant="contained"
            >
              {isLoading ? "Sending" : "Send"}
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}
