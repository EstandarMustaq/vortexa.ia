import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// Importa o SyntaxHighlighter e registro de linguagens
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { github as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [profileVisible, setProfileVisible] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("chatHistory");
    if (savedChats) setChatHistory(JSON.parse(savedChats));
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const applyTheme = (selectedTheme) => {
    const isDarkMode = selectedTheme === "dark";
    const body = document.body;

    if (isDarkMode) {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const clearHistory = () => {
    setChatHistory([]);
    showAlert("Histórico excluído com sucesso!", "success");
  };

  const newChat = () => {
    setChatHistory([]);
  };

  const shareChat = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Histórico de Chat",
          text: "Confira meu histórico de chat com a Vortexa!",
          url: window.location.href,
        })
        .then(() => showAlert("Compartilhado com sucesso!", "success"))
        .catch((error) => showAlert("Erro ao compartilhar: " + error.message, "error"));
    } else {
      showAlert("Compartilhamento não suportado neste navegador.", "error");
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleProfileClick = () => {
    setProfileVisible(!profileVisible);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const queryInput = document.getElementById("queryInput");
    const userMessage = queryInput.value.trim();
    if (!userMessage) return;

    setChatHistory((prev) => [...prev, { user: userMessage, ai: "" }]);
    setLoading(true);
    queryInput.value = "";

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage }),
      });
      const result = await response.json();
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1].ai = result.response;
        return copy;
      });
    } catch (err) {
      console.error("Erro na requisição:", err);
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1].ai = "Desculpe, não consegui processar sua mensagem.";
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Vortexa</title>
      </Head>
      <div className="container">
        {/* Toggle Theme */}
        <button
          id="toggleTheme"
          className="btn btn-outline-light toggle-theme-btn"
          onClick={toggleTheme}
        >
          <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} icon`}></i>
        </button>

        {/* Toggle Sidebar */}
        <button
          id="toggleSidebar"
          className="btn btn-outline-light toggle-sidebar-btn"
          onClick={toggleSidebar}
        >
          <i className="bi bi-layout-sidebar-reverse icon"></i>
        </button>

        <h1>Vortexa</h1>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            className="btn btn-outline-light close-sidebar-btn mb-btn"
            onClick={toggleSidebar}
          >
            <i className="bi bi-x icon"></i>
          </button>
          <button className="btn btn-outline-light mb-btn" onClick={newChat}>
            <i className="bi bi-plus-circle icon me-2"></i>Novo Chat
          </button>
          <button
            className="btn btn-outline-light mb-btn"
            onClick={clearHistory}
          >
            <i className="bi bi-trash icon me-2"></i>Excluir Histórico
          </button>
          <button className="btn btn-outline-light" onClick={shareChat}>
            <i className="bi bi-share-fill icon me-2"></i>Compartilhar Chat
          </button>

          <div className="history-container" id="historyContainer">
            <h2 className="text-center mt-4">Histórico de Conversas</h2>
            <div id="history">
              {chatHistory.map((chat, index) => (
                <div key={index} className="history-message">
                  <div className="history-user-message">{chat.user}</div>
                  <div className="history-ai-message">{chat.ai}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-container">
            <button className="profile-button" onClick={handleProfileClick}>
              <span>Vortexa</span>
            </button>
            {profileVisible && (
              <div className="profile-info">
                <h5 className="d-flex align-items-center">Vortexa</h5>
                <p className="text-muted">Versão 0.7.3-beta</p>
                <p className="short-line-spacing">Powered by EstandarMustaq</p>
                <a
                  href="https://github.com/EstandarMustaq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-flex align-items-center github-profile-link"
                >
                  <div className="github-avatar-wrapper" style={{ marginRight: "8px" }}>
                    <Image
                      src="https://avatars.githubusercontent.com/EstandarMustaq"
                      alt="Foto de perfil do EstandarMustaq no GitHub"
                      width={32}
                      height={32}
                      className="github-avatar"
                    />
                  </div>
                  <span>GitHub Profile</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="chat-container" id="chatContainer" ref={chatContainerRef}>
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <div className="message user">
                <i className="bi bi-person-fill me-2"></i>
                {chat.user}
              </div>
              <div className="message ai">
                <i className="bi bi-brilliance me-2"></i>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "texto";
                      const codeText = String(children).replace(/\n$/, "");
                      return (
                        <div className="code-block-wrapper">
                          <div className="language-label">{language.toUpperCase()}</div>
                          <button
                            className="copy-button"
                            onClick={() => navigator.clipboard.writeText(codeText)}
                          >
                            <span className="bi bi-copy"></span> copiar o código
                          </button>
                          <SyntaxHighlighter
                            language={language}
                            style={codeStyle}
                            PreTag="div"
                            customStyle={{ margin: 0, paddingTop: "30px" }}
                          >
                            {codeText}
                          </SyntaxHighlighter>
                        </div>
                      );
                    },
                  }}
                >
                  {chat.ai}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Indicador de digitação */}
        {loading && (
          <div className="typing-indicator" id="typingIndicator">
            <i className="bi bi-gear fa-spin"></i> Vortexa está pensando...
          </div>
        )}

        {/* Input fixo no rodapé */}
        <form className="input-form" id="queryForm" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input-field"
            id="queryInput"
            placeholder="Mensagem Vortexa"
            disabled={loading}
            required
          />
          <button type="submit" className="send-button" disabled={loading}>
            {loading ? (
              <div className="spinner-border" role="status" aria-hidden="true"></div>
            ) : (
              <i className="bi bi-arrow-right-circle-fill icon"></i>
            )}
          </button>
        </form>

        {/* Alerta customizado */}
        {alert && (
          <div className={`alert-custom ${alert.type}`}>
            {alert.message}
            <button className="close-btn" onClick={() => setAlert(null)}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

