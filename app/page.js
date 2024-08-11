"use client";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { Close, Add, Send, AutoMode } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

// Create a default theme
const defaultTheme = createTheme();

export default function Page() {
  const { user, isLoaded, isSignedIn } = useUser();
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
          content:
            "Hi. Welcome to Ask-E, your personal support assistant. How can I assist you today?",
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
      const response = await fetch("/api/groq", {
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
    scrollToBottom();
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    //if(!messagesEndRef.current) return;
    //messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
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
            content:
              "Hi. Welcome to Ask-E, your personal support assistant. How can I assist you today?",
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

  // useEffect(() => {
  //   console.log('Message change')
  //   scrollToBottom();
  // }, [messages]);

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

  useEffect(() => {
    if (!user) return;
    let newChats = [];
    chats.forEach((chat) => {
      let reChat = { ...chat };
      reChat.messages = [...chat.messages];
      reChat.messages[0].content = `Hi ${user.fullName}, Welcome to Ask-E, your personal support assistant. How can I assist you today?`;
      newChats.push(reChat);
    });
    console.log("newChats", newChats);
    setChats(newChats);
  }, [user]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        width={"100vw"}
        height={"100vh"}
        alignItems={"center"}
        className="bgGradientLight"
      >
        <Typography
          fontSize={"5rem"}
          fontWeight={800}
          className="font-raleway h1Gradient"
        >
          AskE Helpdesk
        </Typography>
        <SignedOut>
          <Box
            display={"flex"}
            alignItems={"center"}
            className="font-raleway h1Gradient animationParent"
            fontWeight={600}
            position={"relative"}
            sx={{ "&:hover .animateWidth": { width: "50px" } }}
          >
            <SignInButton>
              <Typography
                fontWeight={900}
                className="h1Gradient"
                mr={1}
                sx={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Sign In
              </Typography>
            </SignInButton>{" "}
            for better experience
            <Box
              position={"absolute"}
              width={"0rem"}
              height={"2.5px"}
              bgcolor={"green"}
              bottom={0}
              left={0}
              className="bgGradient smoothTransition animateWidth"
            ></Box>
          </Box>
        </SignedOut>
        <SignedIn>
          <Box
            display={"flex"}
            alignItems={"center"}
            className="font-raleway h1Gradient animationParent"
            fontWeight={600}
            position={"relative"}
            sx={{ "&:hover .animateWidth": { width: "60px" } }}
          >
            Signed in with {user?.emailAddresses[0].emailAddress}.
            <SignOutButton>
              <Typography
                fontWeight={900}
                className="h1Gradient"
                ml={1}
                sx={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Sign Out
              </Typography>
            </SignOutButton>
            <Box
              position={"absolute"}
              width={"0rem"}
              height={"2.5px"}
              bgcolor={"green"}
              bottom={0}
              right={0}
              className="bgGradient smoothTransition animateWidth"
            ></Box>
          </Box>
        </SignedIn>
        <Box
          width={0.75}
          height={1}
          mt={3}
          borderRadius={"40px 40px 0px 0px"}
          p={0.5}
          pb={0}
          className="bgGradient"
        >
          <Box
            display={"flex"}
            alignItems={"end"}
            width={1}
            height={1}
            borderRadius={"35px 35px 0px 0px"}
            overflow={"hidden"}
            position={"relative"}
            bgcolor={"rgba(255,255,255,0.75)"}
          >
            <Box
              display={"flex"}
              p={2}
              sx={{
                backgroundImage:
                  "linear-gradient(to bottom, rgba(255,255,255,0.5) 60%, transparent 100%);",
              }}
              pb={"3rem"}
              position={"absolute"}
              top={0}
              left={0}
              width={1}
              zIndex={1}
              gap={1}
            >
              {chats.map((chat, index) => (
                <Box
                  className="bgGradient"
                  p={"2px"}
                  borderRadius={5}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  key={index}
                >
                  <Box
                    px={1}
                    py={0.5}
                    bgcolor={"rgba(255,255,255,0.5)"}
                    borderRadius={8}
                    display={"flex"}
                    alignItems={"center"}
                    gap={0.25}
                    sx={{ cursor: "pointer" }}
                  >
                    <Typography color={"rgba(0,0,0,0.6)"}>
                      {chat.name}
                    </Typography>
                    {chats.length > 1 ? (
                      <Close
                        fontSize="medium"
                        sx={{
                          padding: 0.5,
                          borderRadius: "10px",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.5)" },
                        }}
                        onClick={() => deleteChat(chat.id)}
                      />
                    ) : null}
                  </Box>
                </Box>
              ))}
              <Box
                className="bgGradient"
                p={"2px"}
                borderRadius={5}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                onClick={createNewChat}
              >
                <Box
                  px={1}
                  py={0.5}
                  bgcolor={"rgba(255,255,255,0.5)"}
                  borderRadius={8}
                  display={"flex"}
                  alignItems={"center"}
                  gap={0.25}
                  sx={{ cursor: "pointer" }}
                  height={1}
                >
                  <Add fontSize="small" color="rgba(0,0,0,0.6)" />
                </Box>
              </Box>
            </Box>
            <Box
              display={"flex"}
              p={2}
              width={1}
              position={"absolute"}
              bottom={"1rem"}
              gap={1}
              zIndex={2}
            >
              <Box
                width={1}
                p={"3px"}
                className="bgGradient"
                borderRadius={"20px"}
                position={"relative"}
              >
                <input
                  placeholder="Hi, I would like help with..."
                  style={{
                    zIndex: "3",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    height: "100%",
                    borderRadius: "18px",
                    padding: "0.5rem 1rem",
                    color: "rgba(0,0,0,0.6)",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
                />
              </Box>
              <Box
                className="bgGradient"
                p={"3px"}
                borderRadius={"20px"}
                onClick={sendMessage}
              >
                <Box
                  display={"flex"}
                  p={2}
                  bgcolor={"rgba(255,255,255,0.6)"}
                  borderRadius={"17px"}
                  sx={{
                    aspectRatio: "1/1",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.4)" },
                  }}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Send sx={{ color: "rgba(0,0,0,0.6)" }} />
                </Box>
              </Box>
            </Box>
            <Box
              width={1}
              height={"6rem"}
              position={"absolute"}
              bottom={0}
              left={0}
              zIndex={1}
              sx={{
                backgroundImage:
                  "linear-gradient(to top, rgba(255,255,255,0.5) 60%, transparent 100%);",
              }}
            ></Box>

            <Box
              display={"flex"}
              flexDirection={"column"}
              position={"absolute"}
              overflow={"scroll"}
              bottom={0}
              left={0}
              width={1}
              height={1}
              p={1}
              py={10}
            >
              {chats[activeChatId - 1]?.messages.map((message, index) =>
                message.role === "assistant" ? (
                  <Box
                    display={"flex"}
                    width={1}
                    justifyContent={"start"}
                    p={1}
                    key={index}
                    ref={
                      chats[activeChatId - 1]?.messages.length - 1 === index
                        ? messagesEndRef
                        : null
                    }
                  >
                    <Box
                      display={"flex"}
                      p={"2px"}
                      className="bgGradient"
                      borderRadius={"15px"}
                      maxWidth={0.4}
                    >
                      <Box
                        display={"flex"}
                        p={"2px"}
                        bgcolor={"rgba(255,255,255,0.6)"}
                        borderRadius={"14px"}
                      >
                        <Typography
                          className="font-raleway bgGradient"
                          sx={{
                            p: 1,
                            borderRadius: "13px",
                            color: "rgba(255,255,255,1)",
                            fontWeight: "500",
                          }}
                        >
                          {message.content || (
                            <AutoMode
                              fontSize="small"
                              className="animate-spin"
                            />
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    display={"flex"}
                    width={1}
                    justifyContent={"end"}
                    p={1}
                    key={index}
                    ref={
                      chats[activeChatId - 1]?.messages.length - 1 === index
                        ? messagesEndRef
                        : null
                    }
                  >
                    <Box
                      display={"flex"}
                      p={"2px"}
                      className="bgGradient"
                      borderRadius={"14px"}
                    >
                      <Box
                        bgcolor={"rgba(255,255,255,0.6)"}
                        borderRadius={"14px"}
                      >
                        <Typography
                          className="font-raleway h1Gradient"
                          sx={{
                            p: 1,
                            color: "rgba(0,0,0,0.4)",
                            fontWeight: "600",
                          }}
                        >
                          {message.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
