import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  Text,
  Input,
  Flex,
  Image,
  Divider,
  
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
   
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import { fetchChatMessages } from "../api/ChatApi";
import { ChatState, Message } from "../types/chat";
import { formatMessageDate } from "../utils/dateUtils";

const initialChatState: ChatState = {
  from: "",
  to: "",
  name: "",
  messages: [],
  currentPage: 0,
  isLoading: false,
  error: null,
};

const ChatScreen: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>(initialChatState);
  const initialized = useRef(false);

  const loadMessages = useCallback(async () => {
    try {
      const data = await fetchChatMessages(chatState.currentPage);
      setChatState((prevState) => ({
        ...prevState,
        from: data.from || prevState.from,
        to: data.to || prevState.to,
        name: data.name || prevState.name,
        messages: [...prevState.messages, ...data.chats],
        currentPage: prevState.currentPage + 1,
        isLoading: false,
      }));
    } catch (error) {
      setChatState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: "Failed to load messages. Please try again.",
      }));
    }
  }, [chatState.currentPage]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadMessages();
    }
  }, [loadMessages]);

  const renderMessage = (message: Message) => (
    <Flex
      key={message.id}
      width={320}
      justify={message.sender.self ? "flex-end" : "flex-start"}
      mb={4}
    >
      {!message.sender.self && (
        <Image
          src={message.sender.image}
          alt="Sender"
          width="24px"
          height="24px"
          boxSize="24px"
          borderRadius="full"
          mr={2}
        />
      )}
      <Box
        bg={message.sender.self ? "#1b64d5" : "white"}
        color={message.sender.self ? "white" : "black"}
        borderRadius="lg"
        borderTopLeftRadius={message.sender.self ? "0.5rem" : "0px"}
        borderBottomRightRadius={message.sender.self ? "0px" : "0.5rem"}
        p={2}
        maxWidth="80%"
      >
        <Text width="100%" fontSize="sm">
          {message.message}
        </Text>
        <Text fontSize="xs" textAlign="right">
          {message.time.slice(10, -3)}
        </Text>
      </Box>
    </Flex>
  );

  const groupMessagesByDate = (
    messages: Message[]
  ): Record<string, Message[]> => {
    return messages.reduce(
      (acc: Record<string, Message[]>, message: Message) => {
        const dateKey = formatMessageDate(message.time);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(message);
        return acc;
      },
      {}
    );
  };

  const renderMessagesWithDateHeaders = () => {
    const messagesByDate = groupMessagesByDate(chatState.messages);

    return Object.entries(messagesByDate).map(([date, messages]) => (
      <Box key={date} width="100%">
        <Flex align="center" justify="center" my={4}>
          <Divider flex="1" borderColor="grey" />
          <Text mx={4} fontSize="sm" color="gray.500" fontWeight="medium">
            {date}
          </Text>
          <Divider flex="1" borderColor="grey" />
        </Flex>
        {messages.map(renderMessage)}
      </Box>
    ));
  };

  return (
    <Box m={5} border="1px solid black" borderRadius="3xl" p={2} bg="#fbf9f3">
      <Box display="flex" alignItems="center" w="100%">
        <Image src="/Back.png" width={6} height={6} />
        <Text fontSize="2xl" fontWeight="600" flex={1} m={2} color="black">
          Trip 1
        </Text>
        <Image src="/edit-05.png" justifyContent="end" width={6} height={6} />
      </Box>
      <Box bg="#fbf9f3" color="white" p={4} alignItems="center" display="flex">
        {/* <Text fontSize="xl" color="black">{chatState.name}</Text>  */}
        <Image src="/Group 5.png" boxSize={12} />
        <Box flex={1} pl={4}>
          <Text fontSize="lg" color="black" display="flex">
            From &nbsp;
            <span>{` ${chatState.from}`}</span>
          </Text>
          <Text fontSize="lg" color="black" display="flex">
            To &nbsp;
            <span>{` ${chatState.to}`}</span>
          </Text>
        </Box>
        <Image src="/dots-vertical.png" width={6} height={6} />
      </Box>
      <Divider flex="1" borderColor="grey" />

      <VStack
        spacing={4}
        p={4}
        maxHeight="55vh"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#718096",
            borderRadius: "24px",
          },
        }}
      >
        {renderMessagesWithDateHeaders()}
      </VStack>
      {chatState.error && <Text color="red.500">{chatState.error}</Text>}
      <Box mb={12}>
        <Box display="flex" bg="white" alignItems="center">
          <Input
            placeholder="Reply to @Shubhainder"
            _placeholder={{ color: "grey" }}
            mt={2}
            bg="white"
            color="black"
            border="black"
          />

          <Popover placement="top">
            <PopoverTrigger>
              <Button>
                {" "}
                <Image src="/paperclip.png" boxSize={5} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              bg="transparent"
              border="none"
              boxShadow="none"
              width="fit-content"
              _focus={{ boxShadow: "none" }}
            >
              {/* <PopoverArrow /> */}
              <PopoverCloseButton />
              <PopoverBody p={0}>
                <Box position="relative">
                  <Image
                    src="/Click.png"
                    alt="Popover Image"
                    borderRadius="md"
                    objectFit="cover"
                  />
                </Box>
              </PopoverBody>{" "}
            </PopoverContent>
          </Popover>
          <Image src="/send-03.png" boxSize={5} />
        </Box>
      </Box>
      <Divider
        w="8rem"
        m="auto"
        borderBottomWidth="3.5px"
        borderColor="black"
        borderRadius="xl"
        opacity="1"
      />
    </Box>
  );
};

export default ChatScreen;
