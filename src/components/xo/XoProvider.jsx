'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { xoController } from '@/lib/xo/mascotController';
import { answer } from '@/lib/xo/answers';
import XoMascot from './XoMascot';
import XoBubble from './XoBubble';
import XoChatPanel from './XoChatPanel';

const XoContext = createContext(null);

export const useXo = () => useContext(XoContext);

let nextId = 1;

export default function XoProvider({ children }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const panelRef = useRef(null);
  const returnFocus = useRef(null);
  const openRef = useRef(false);

  const ask = useCallback((question) => {
    setMessages((m) => [...m, { id: nextId++, role: 'me', text: question }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId++, role: 'xo', ...answer(question) }]);
    }, 620);
  }, []);

  const replyText = useCallback((text) => {
    setMessages((m) => [...m, { id: nextId++, role: 'xo', text }]);
  }, []);

  const openChat = useCallback((prompt) => {
    if (!openRef.current) {
      returnFocus.current = document.activeElement;
      openRef.current = true;
      setChatOpen(true);
      xoController.chatOpened(panelRef.current);
    }
    if (prompt) ask(prompt);
  }, [ask]);

  const closeChat = useCallback(() => {
    openRef.current = false;
    setChatOpen(false);
    xoController.chatClosed();
    returnFocus.current?.focus?.({ preventScroll: true });
  }, []);

  const toggleChat = useCallback(() => {
    if (openRef.current) closeChat();
    else openChat();
  }, [closeChat, openChat]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && openRef.current) closeChat();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeChat]);

  const value = useMemo(() => ({
    openChat,
    say: (text, opts) => xoController.say(text, opts),
  }), [openChat]);

  return (
    <XoContext.Provider value={value}>
      {children}
      <XoMascot onToggleChat={toggleChat} chatOpen={chatOpen} />
      <XoBubble onOpenChat={openChat} />
      <XoChatPanel
        ref={panelRef}
        open={chatOpen}
        messages={messages}
        typing={typing}
        onAsk={ask}
        onReply={replyText}
        onClose={closeChat}
      />
    </XoContext.Provider>
  );
}
