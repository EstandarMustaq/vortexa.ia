import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [profileVisible, setProfileVisible] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(""); // controla o texto do input
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

  // Envia a mensagem do usuário à IA
  const sendUserMessage = async (userMessage) => {
    setChatHistory((prev) => [...prev, { user: userMessage, ai: "" }]);
    setLoading(true);

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
  };

  // Ao submeter o formulário
  async function handleSubmit(event) {
    event.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage) return;
    setInputValue("");                   // limpa o input
    await sendUserMessage(userMessage);   // envia para IA
  }

  // Copia texto para a área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => showAlert("Texto copiado para a área de transferência!", "success"),
      () => showAlert("Falha ao copiar o texto.", "error")
    );
  };

  // Reenvia a última mensagem do usuário
  const handleResubmit = (previousUserMessage) => {
    sendUserMessage(previousUserMessage);
  };

  return (
    <>
      <Head>
        <title>Vortexa</title>
      </Head>
      <div className="container">
        {/* Toggle Sidebar */}
        <button
          id="toggleSidebar"
          className="btn toggle-sidebar-btn"
          onClick={toggleSidebar}
        >
          <i className="bi bi-layout-sidebar-inset-reverse icon"></i>
        </button>

        {/* Toggle Theme */}
        <button
          id="toggleTheme"
          className="btn toggle-theme-btn"
          onClick={toggleTheme}
        >
          <i
            className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-fill"} icon`}
          ></i>
        </button>

        <h1>Vortexa</h1>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <button className="btn close-sidebar-btn mb-btn" onClick={toggleSidebar}>
            <i className="bi bi-x-circle-fill icon"></i>
          </button>
          <button className="btn mb-btn" onClick={newChat}>
            <i className="bi bi-plus-circle-fill icon me-2"></i>Novo Chat
          </button>
          <button className="btn mb-btn" onClick={clearHistory}>
            <i className="bi bi-trash3-fill icon me-2"></i>Excluir Histórico
          </button>
          <button className="btn" onClick={shareChat}>
            <i className="bi bi-share-fill icon me-2"></i>Compartilhar Chat
          </button>

          <div className="history-container" id="historyContainer">
            <h2 className="text-center mt-4 mb-4" style={{ fontSize: "1.5rem" }}>
              Histórico de Conversas
            </h2>
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
              <i className="bi bi-brilliance me-2" style={{ fontSize: "1.4em" }}></i>
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
            <div key={index} className="chat-pair">
              {/* Mensagem do Usuário */}
              <div className="message user">
                <i className="bi bi-person-fill me-2"></i>
                {chat.user}
              </div>

              {/* Mensagem da IA */}
              <div className="message ai">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  skipHtml={true}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "texto";
                      const codeText = String(children).replace(/\n$/, "");
                      return (
                        <div className="code-block-wrapper">
                          <div className="language-label">{language.toLowerCase()}</div>
                          <button
                            className="copy-button"
                            onClick={() => navigator.clipboard.writeText(codeText)}
                          >
                            <span className="bi bi-copy me-1"></span>copiar
                          </button>
                          <SyntaxHighlighter
                            language={language}
                            style={codeStyle}
                            PreTag="div"
                            customStyle={{ margin: 0, paddingTop: "34px", borderRadius: "12px", fontFamily: "Consolas, Courier News, monospace" }}
                          >
                          {/* Exibe o código formatado */}
                            {codeText}
                          </SyntaxHighlighter>
                        </div>
                      );
                    },
                  }}
                >
                  {chat.ai}
                </ReactMarkdown>

                {/* Ícones de copiar e reenviar */}
                <div className="ai-footer-icons">
                  {/* Copiar toda a resposta da IA */}
                  <button
                    className="footer-icon-btn"
                    title="Copiar resposta da IA"
                    onClick={() => copyToClipboard(chat.ai)}
                  >
                    <i className="bi bi-copy"></i>
                  </button>

                  {/* Reenviar a mesma mensagem do usuário */}
                  <button
                    className="footer-icon-btn"
                    title="Reenviar mensagem do usuário"
                    onClick={() => handleResubmit(chat.user)}
                  >
                    <i className="bi bi-arrow-repeat" style={{ fontSize: "1.4rem" }}></i>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Typing-indicator dentro do chat-container */}
          {loading && (
            <div className="message ai typing-indicator">
              <i className="bi bi-brilliance me-2" style={{ fontSize: "1.6rem" }}></i>
              <span className="dot dot1"></span>
              <span className="dot dot2"></span>
              <span className="dot dot3"></span>
            </div>
          )}
        </div>

        {/* Input fixo no rodapé */}
        <form className="input-form" id="queryForm" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input-field"
            id="queryInput"
            placeholder="Pergunte alguma coisa"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            required
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="on"
            spellCheck="false"
            aria-label="Digite sua pergunta"
            aria-describedby="queryInputHelp"
          />
          <button
            type="submit"
            className="send-button"
            disabled={loading || !inputValue.trim()} /* desabilita se vazio ou carregando */
          >
            {loading ? (
              <div className="spinner-border" role="status" aria-hidden="true"></div>
            ) : (
              <i className="bi bi-arrow-right icon"></i>
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

