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
  useBreakpointValue,
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
  const observerTarget = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [shouldObserve, setShouldObserve] = useState(true);

  // Responsive values
  const containerWidth = useBreakpointValue({ base: "100%", md: "768px", lg: "100vw" });
  const containerHeight = useBreakpointValue({ base: "100vh", md: "100vh" });
  const messageWidth = useBreakpointValue({ base: "90%", md: "70%", lg: "100%" });
  const containerMargin = useBreakpointValue({ base: 0, md: "auto" });
  const mainPadding = useBreakpointValue({ base: 2, md: 4, lg: 6 });

  const scrollToLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Load messages logic remains the same
  const loadMessages = useCallback(async () => {
    if (chatState.isLoading || !shouldObserve) return;

    setChatState(prev => ({ ...prev, isLoading: true }));
    setShouldObserve(false);

    try {
      const data = await fetchChatMessages(chatState.currentPage);
      if (data.chats.length === 0) {
        setChatState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      setChatState((prevState) => ({
        ...prevState,
        from: prevState.from || data.from,
        to: prevState.to || data.to,
        name: prevState.name || data.name,
        messages: [...prevState.messages, ...data.chats],
        currentPage: prevState.currentPage + 1,
        isLoading: false,
      }));

      setTimeout(scrollToLastMessage, 100);
    } catch (error) {
      setChatState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: "Failed to load messages. Please try again.",
      }));
    }
  }, [chatState.isLoading, chatState.currentPage, shouldObserve, scrollToLastMessage]);

  // Observer effect remains the same
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && shouldObserve) {
          loadMessages();
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverTarget = observerTarget.current;
    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [loadMessages, shouldObserve]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop < 100) {
      setShouldObserve(true);
    }
  }, []);

  const renderMessage = (message: Message, index: number, messages: Message[]) => (
    <Flex
      key={message.id}
      ref={index === messages.length - 1 ? lastMessageRef : undefined}
      width={messageWidth}
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
        <Text width="100%" fontSize={{ base: "sm", md: "md" }}>
          {message.message}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} textAlign="right">
          {message.time.slice(10, -3)}
        </Text>
      </Box>
    </Flex>
  );

  const renderMessagesWithDateHeaders = () => {
    const messagesByDate = groupMessagesByDate(chatState.messages);

    return Object.entries(messagesByDate).map(([date, messages]) => (
      <Box key={date} width="100%">
        <Flex align="center" justify="center" my={4}>
          <Divider flex="1" borderColor="grey" />
          <Text mx={4} fontSize={{ base: "xs", md: "sm" }} color="gray.500" fontWeight="medium">
            {date}
          </Text>
          <Divider flex="1" borderColor="grey" />
        </Flex>
        {messages.map((msg, idx) => renderMessage(msg, idx, messages))}
      </Box>
    ));
  };

  const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
    return messages.reduce((acc: Record<string, Message[]>, message: Message) => {
      const dateKey = formatMessageDate(message.time);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(message);
      return acc;
    }, {});
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <Box
      height={containerHeight}
      width="100vw"
      display="flex"
      justifyContent="center"
      bg="#f5f5f5"
    >
      <Box
        width={containerWidth}
        height="100%"
        m={containerMargin}
        display="flex"
        flexDirection="column"
        bg="#fbf9f3"
        borderRadius={{ base: 0, md: "3xl" }}
      >
        <Box p={mainPadding}>
          <Flex alignItems="center" w="100%" mb={4}>
            <Image src="/Back.png" width={6} height={6} cursor="pointer" />
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="600" flex={1} mx={2} color="black">
              Trip 1
            </Text>
            <Image src="/edit-05.png" width={6} height={6} cursor="pointer" />
          </Flex>
          
          <Flex bg="#fbf9f3" color="white" alignItems="center" mb={4}>
            <Image src="/Group 5.png" boxSize={{ base: 10, md: 12 }} />
            <Box flex={1} pl={4}>
              <Text fontSize={{ base: "md", md: "lg" }} color="black" display="flex">
                From &nbsp;<span>{chatState.from}</span>
              </Text>
              <Text fontSize={{ base: "md", md: "lg" }} color="black" display="flex">
                To &nbsp;<span>{chatState.to}</span>
              </Text>
            </Box>
            <Image src="/dots-vertical.png" width={6} height={6} cursor="pointer" />
          </Flex>
        </Box>

        <Divider borderColor="grey" />

        <VStack
          ref={messagesContainerRef}
          flex={1}
          p={mainPadding}
          overflowY="auto"
          onScroll={handleScroll}
          spacing={4}
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
          <div ref={observerTarget}>
            {chatState.isLoading && (
              <Text color="gray.500" textAlign="center">Loading more messages...</Text>
            )}
          </div>
          {renderMessagesWithDateHeaders()}
        </VStack>

        {chatState.error && <Text color="red.500" p={mainPadding}>{chatState.error}</Text>}
        
        <Box p={mainPadding}>
          <Box display="flex" bg="white" alignItems="center" borderRadius="md">
            <Input
              placeholder="Reply to @Shubhainder"
              _placeholder={{ color: "grey" }}
              bg="white"
              color="black"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
            />
            <Popover placement="top">
              <PopoverTrigger>
                <Button bg="white" _hover={{ bg: "gray.100" }}>
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
                <PopoverCloseButton />
                <PopoverBody p={0}>
                  <Image
                    src="/Click.png"
                    alt="Attachment options"
                    borderRadius="md"
                    objectFit="cover"
                  />
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Button bg="white" _hover={{ bg: "gray.100" }}>
              <Image src="/send-03.png" boxSize={5} />
            </Button>
          </Box>
        </Box>

        
      </Box>
    </Box>
  );
};

export default ChatScreen;