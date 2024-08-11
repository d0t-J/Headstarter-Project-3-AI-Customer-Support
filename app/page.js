"use client";
import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  IconButton,
  Tabs,
  Chip,
  Fab,
  Stack,
  Divider,
  Container,
} from "@mui/material";
import { LockOutlined, ChatBubble, Close, Add } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";

import bgImage from "./img/bg.jpg"

// Create a default theme
const defaultTheme = createTheme();

export default function SignInSide() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Ticket 1",
      messages: [
        {
          role: "assistant",
          content: "Hi. I am support Super man. How can I help you?",
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
        body: JSON.stringify([...messages, newMessage]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });

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
                      "I'm sorry but I encountered an error. Please try again later.",
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
            content: "Hi. I am support Super man. How can I help you?",
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
      !event.target.closest(".chat-box") &&
      !event.target.closest(".MuiFab-root") &&
      !event.target.closest(".MuiIconButton-root")
    ) {
      setOpenChat(false);
    }
  };

  const deleteChat = (id) => {
    setChats((chats) => {
      const updatedChats = chats.filter((chat) => chat.id !== id);
      if (activeChatId === id) {
        if (updatedChats.length > 0) {
          const newActiveChatId = updatedChats[0].id;
          setActiveChatId(newActiveChatId);
        } else {
          setActiveChatId(null);
          setOpenChat(false);
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
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url('https://imgur.com/wEgBkeP')",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "left",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: 4,
          }}
        >
          <Typography variant="h2" gutterBottom color="white">
            Welcome to Ask-E
          </Typography>
          <Typography variant="h5" paragraph color="white">
            Your personal Coding assistant!
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Ask any coding-related questions, and our support team will assist
            you.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                    <Link variant="body2" href="#">Forgot password?</Link>
                </Grid>
                <Grid item>
                    <Link variant="body2" href="#">
                      {"Don't have an account? Sign Up"}
                    </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Floating chat button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleChatToggle}
        sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(4),
          right: (theme) => theme.spacing(4),
        }}
      >
        {openChat ? <Close /> : <ChatBubble />}
      </Fab>

      {/* Chat box */}
      {openChat && (
        <Container
          maxWidth="xs"
          sx={{
            position: "fixed",
            bottom: (theme) => theme.spacing(12),
            right: (theme) => theme.spacing(4),
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 4,
            zIndex: 1000,
          }}
          className="chat-box"
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Typography variant="h5" gutterBottom>
              {activeChatId ? "Support Chat" : "No Active Chat"}
            </Typography>
            <IconButton edge="end" onClick={handleChatToggle}>
              <Close />
            </IconButton>
          </Box>

          <Tabs
            value={activeChatId}
            onChange={(e, newValue) => setActiveChatId(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              "& .MuiTabs-flexContainer": { alignItems: "center" },
              "& .MuiTab-root": { minHeight: "unset", py: 1, px: 2 },
            }}
            ref={tabsRef}
          >
            {chats.map((chat) => (
              <Stack
                direction="row"
                alignItems="center"
                key={chat.id}
                sx={{ cursor: "pointer" }}
              >
                <Chip
                  label={chat.name}
                  onClick={() => setActiveChatId(chat.id)}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteChat(chat.id)}
                  sx={{ ml: 1 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <IconButton onClick={createNewChat}>
              <Add />
            </IconButton>
          </Tabs>
          <Divider />
          <Box
            sx={{
              p: 2,
              height: "250px",
              overflowY: "auto",
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.role === "user" ? "grey.800" : "grey.400",
                    color:
                      msg.role === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                sx: { borderRadius: 4 },
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading}
              sx={{ ml: 1, p: 2, minWidth: 0 }}
            >
              Send
            </Button>
          </Box>
        </Container>
      )}
    </ThemeProvider>
  );
}
