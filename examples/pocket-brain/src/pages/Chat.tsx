import ChatInterface from "../features/chat/Chat";

export default function Chat() {
  // The wrapper is needed here to apply `position: fixed`.
  // This breaks the chat out of the BaseLayout flow (which is used for the landing page)
  // and ensures it behaves like a standalone app that covers the entire viewport.
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <ChatInterface />
    </div>
  );
}
