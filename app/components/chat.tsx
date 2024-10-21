"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [threadId, setThreadId] = useState("");
  const [showDemoButtons, setShowDemoButtons] = useState(false);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // create a new threadID when chat component created
  useEffect(() => {
    const createThread = async () => {
      try {
        const res = await fetch(`/api/assistants/threads`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setThreadId(data.threadId);
          setInputDisabled(false); // Enable input when thread is ready
          setShowDemoButtons(true); // Show demo buttons when thread is ready
        } else {
          console.error("Failed to create thread:", res.statusText);
        }
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };
    createThread();
  }, []);

  const sendMessage = async (text) => {
    if (!threadId) {
      console.error("Thread ID is not set. Cannot send message.");
      return;
    }

    setInputDisabled(true);
    try {
      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputDisabled(false); // Re-enable input if there's an error
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setShowDemoButtons(false);
    scrollToBottom();
  };

  const handleDemoClick = async (text) => {
    if (!threadId) {
      console.error("Thread ID is not set. Cannot send demo message.");
      return;
    }

    setUserInput(text);
    sendMessage(text);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text },
    ]);
    setUserInput("");
    setShowDemoButtons(false);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // handleReadableStream
  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
    stream.on("end", handleRunCompleted); // Re-enable input when response is completed
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  /* Utility Helpers */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showDemoButtons && (
        <div className={styles.demoButtons}>
          <button onClick={() => handleDemoClick("Wie kannst du mir helfen?")} disabled={inputDisabled}>
            Wie kannst du mir helfen?
          </button>
          <button onClick={() => handleDemoClick("Was ist die BayernCloud?")} disabled={inputDisabled}>
            Was ist die BayernCloud?
          </button>
          <button onClick={() => handleDemoClick("Welche Systeme sind angebunden?")} disabled={inputDisabled}>
          Welche Systeme sind angebunden?
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ihre Fragen zur BayernCloud Tourismus..."
          disabled={inputDisabled}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled || !userInput.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
