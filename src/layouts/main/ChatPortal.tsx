import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { useCallback, useId, useEffect, useRef, useState } from "react";

interface ModalPortal {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  titleId: string;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  createdAt: string;
  translationKey?: string;
}

function Modal({ isOpen, onClose, children, titleId }: ModalPortal) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;

    const focusableSelector = [
      "button:not([disabled])",
      "input:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = getFocusableElements();

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        width: 360,
        maxWidth: "calc(100vw - 40px)",
        outline: "none",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

function ChatPortal() {
  const { t, i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "demo-1",
      text: "",
      translationKey: "chat.meow",
      sender: "other",
      createdAt: "2026-10-29T11:00:00",
    },
    {
      id: "demo-2",
      text: "",
      translationKey: "chat.meow",
      sender: "me",
      createdAt: "2026-10-29T11:01:00",
    },
    {
      id: "demo-3",
      text: "",
      translationKey: "chat.text1",
      sender: "other",
      createdAt: "2026-10-29T11:02:00",
    },
  ]);

  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldScrollRef.current = distanceFromBottom < 100;
  };

  useEffect(() => {
    if (!shouldScrollRef.current) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

    shouldScrollRef.current = false;
  }, [messages]);

  const sendMessage = () => {
    const text = message.trim();

    if (!text) return;

    shouldScrollRef.current = true;

    const newMessage: Message = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      sender: "me",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        title={t("chat.open")}
        className="button black large circle"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 999,
        }}
        aria-label={t("chat.open", {
          defaultValue: "Open Chat",
        })}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <i className="fa fa-commenting large" aria-hidden="true"></i>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} titleId={titleId}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "min(500px, calc(100vh - 40px))",
            minHeight: 0,
            overflow: "hidden",
            borderRadius: 8,
            boxShadow: "0 5px 25px rgba(0, 0, 0, 0.25)",
            background: "white",
          }}
        >
          {/* Header */}
          <div
            className="black"
            style={{
              padding: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <p
              id={titleId}
              className="large"
              style={{ margin: 0, color: "white" }}
            >
              {t("chat.title", { defaultValue: "Messages" })}
            </p>

            <button
              type="button"
              title={t("chat.close")}
              aria-label={t("chat.close", {
                defaultValue: "Close Chat",
              })}
              onClick={closeModal}
              className="button"
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            role="log"
            aria-label={t("chat.messageHistory", {
              defaultValue: "Message history",
            })}
            aria-live="polite"
            aria-relevant="additions"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "10px",
              background: "#f1f1f1",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`container round-large margin-bottom message ${msg.sender}`}
                style={{
                  width: "fit-content",
                  maxWidth: "85%",
                  overflowWrap: "anywhere",
                  marginLeft: msg.sender === "other" ? "0" : "auto",
                  background: msg.sender === "me" ? "#555" : "white",
                  color: msg.sender === "me" ? "white" : "black",
                  padding: "10px",
                  borderRadius: 8,
                }}
              >
                <p style={{ margin: "0 0 5px" }}>
                  {msg.translationKey ? t(msg.translationKey) : msg.text}
                </p>
                <time
                  dateTime={msg.createdAt}
                  style={{
                    display: "block",
                    textAlign: msg.sender === "me" ? "right" : "left",
                    fontSize: 12,
                    opacity: 0.7,
                  }}
                >
                  {formatTime(msg.createdAt)}
                </time>
              </div>
            ))}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexShrink: 0,
              borderTop: "1px solid #ddd",
              background: "white",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="input"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.placeholder")}
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="button gray"
              disabled={!message.trim()}
              aria-label={t("chat.send", {
                defaultValue: "Send",
              })}
            >
              <i className="fa fa-paper-plane" aria-hidden="true" />
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default ChatPortal;
