import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Cpu, Bookmark, HelpCircle } from "lucide-react";
import { Artwork } from "../types";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AICuratorPanelProps {
  selectedArtwork: Artwork | null;
  activeThemeColor: string;
}

export default function AICuratorPanel({
  selectedArtwork,
  activeThemeColor,
}: AICuratorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: "Greetings, collector. I am your resident AI Curator & WebGL Mathematician. Ask me to critique the current piece, or explain how the mathematical viewport bowing deformation creates the cylindrical helix alignment.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll messages to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle asking a curator query
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/gemini/curate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textToSend,
          // Exclude first message (greetings) to keep prompt context clean
          chatHistory: messages
            .filter((m) => m.id !== "init")
            .map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failure contacting curator services.");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        text: data.text || "I was unable to formulate a curatorial opinion.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: `Error: ${err.message || "Failed to get reply."}. Please make sure you have configured your GEMINI_API_KEY inside Settings > Secrets.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText);
    }
  };

  // Build the context string based on the active artwork
  const activeArtworkTitle = selectedArtwork
    ? `"${selectedArtwork.title}" by ${selectedArtwork.artist} (Year ${selectedArtwork.year})`
    : "No artwork actively selected";

  return (
    <div
      id="ai-curator-panel"
      className="bg-neutral-950/85 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden w-full h-full text-white shadow-2xl flex flex-col font-sans"
    >
      {/* Panel Header */}
      <div className="bg-neutral-900 border-b border-white/10 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-pulse" style={{ color: activeThemeColor }} />
          <div>
            <h3 className="font-semibold tracking-wide text-xs uppercase text-white">
              AI Curator Co-Pilot
            </h3>
            <p className="text-[9px] text-neutral-400 truncate w-48" title={activeArtworkTitle}>
              Targeting: {selectedArtwork ? selectedArtwork.title : "Helix environment"}
            </p>
          </div>
        </div>
        <div
          className="px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono bg-white/5 text-neutral-400 border border-white/10"
        >
          Model: 2.5-Flash
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === "user"
                  ? "bg-neutral-800 border-white/10 text-white"
                  : "bg-neutral-900 text-purple-300"
              }`}
              style={{ borderColor: msg.sender !== "user" ? activeThemeColor + "44" : undefined }}
            >
              {msg.sender === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Cpu className="w-3.5 h-3.5" style={{ color: activeThemeColor }} />
              )}
            </div>

            {/* Message balloon */}
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-neutral-800 text-white rounded-tr-none"
                  : "bg-neutral-900/60 text-neutral-200 rounded-tl-none border border-white/5"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className="text-[8px] text-neutral-500 block text-right mt-1.5 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 mr-auto max-w-[85%]">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-neutral-900 border"
              style={{ borderColor: activeThemeColor + "44" }}
            >
              <Cpu className="w-3.5 h-3.5 animate-spin" style={{ color: activeThemeColor }} />
            </div>
            <div className="p-3 bg-neutral-900/60 border border-white/5 text-neutral-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 font-mono">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-75">●</span>
              <span className="animate-bounce delay-150">●</span>
              <span className="text-[10px]">Analyzing aesthetic properties...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Curatorial Prompt Triggers */}
      <div className="p-3 bg-neutral-900/40 border-t border-white/10 space-y-2 shrink-0">
        <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 block mb-1">
          Quick Inquiries
        </span>
        <div className="flex flex-wrap gap-1.5">
          {selectedArtwork ? (
            <>
              <button
                onClick={() =>
                  triggerQuickPrompt(
                    `Critically analyze the lighting, dynamic composition, and aesthetic mood of our selected piece: "${selectedArtwork.title}" by ${selectedArtwork.artist} (${selectedArtwork.year}).`
                  )
                }
                className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 transition text-neutral-300 text-left"
              >
                🎨 Critique active artwork
              </button>
              <button
                onClick={() =>
                  triggerQuickPrompt(
                    "How does the WebGL viewport bowing vertex shader geometry deform these 3D objects, and what feelings does that curvature evoke?"
                  )
                }
                className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 transition text-neutral-300 text-left"
              >
                📐 Explain shader physics
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                triggerQuickPrompt(
                  "Describe the architectural design, spacing, and rhythm of this 3D spiral cylindrical track."
                )
              }
              className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 transition text-neutral-200 text-left"
            >
              🏛️ Describe spiral rhythm
            </button>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 bg-neutral-900 border-t border-white/10 shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            selectedArtwork ? `Inquire about "${selectedArtwork.title}"...` : "Select a piece and chat..."
          }
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isTyping}
          className="p-2 rounded-xl transition text-neutral-950 disabled:opacity-50"
          style={{ backgroundColor: activeThemeColor }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
