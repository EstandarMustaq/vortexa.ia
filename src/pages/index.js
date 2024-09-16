// pages/index.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [theme, setTheme] = useState('dark'); // Tema atual
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [profileVisible, setProfileVisible] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Carregar histórico de chats do localStorage quando o componente é montado
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }

    // Carregar o tema do localStorage ou usar o tema padrão
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    // Salvar o histórico de chats no localStorage sempre que ele for atualizado
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const applyTheme = (selectedTheme) => {
    const isDarkMode = selectedTheme === 'dark';
    document.documentElement.style.setProperty('--bg-color', isDarkMode ? '#343a40' : '#f8f9fa');
    document.documentElement.style.setProperty('--text-color', isDarkMode ? '#ffffff' : '#000000');
    document.documentElement.style.setProperty('--chat-bg-color', isDarkMode ? '#495057' : '#ffffff');
    document.documentElement.style.setProperty('--border-color', isDarkMode ? '#6c757d' : '#dee2e6');
    document.documentElement.style.setProperty('--user-msg-bg', '#007bff');
    document.documentElement.style.setProperty('--user-msg-text', '#ffffff');
    document.documentElement.style.setProperty('--ai-msg-bg', isDarkMode ? '#6c757d' : '#e9ecef');
    document.documentElement.style.setProperty('--ai-msg-text', isDarkMode ? '#ffffff' : '#000000');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const clearHistory = () => {
    setChatHistory([]);
    showAlert('Histórico excluído com sucesso!', 'success');
  };

  const newChat = () => {
    document.getElementById('chatContainer').innerHTML = '';
  };

  const shareChat = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Histórico de Chat',
        text: 'Confira meu histórico de chat com a Vortexa!',
        url: window.location.href,
      })
      .then(() => showAlert('Compartilhado com sucesso!', 'success'))
      .catch((error) => showAlert('Erro ao compartilhar: ' + error.message, 'error'));
    } else {
      showAlert('Compartilhamento não suportado neste navegador.', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleProfileClick = () => {
    setProfileVisible(!profileVisible);
  };

  return (
    <>
      <Head>
        <title>Vortexa</title>
        <link rel="shortcut icon" href="../../public/ai-default-avatar.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="../../public/ai-default-logo.png" />
      </Head>
      <div className="container">
        <button id="toggleTheme" className="btn btn-outline-light toggle-theme-btn" onClick={toggleTheme}>
          <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'} icon`}></i>
        </button>
        <button id="toggleSidebar" className="btn btn-outline-light toggle-sidebar-btn" onClick={toggleSidebar}>
          <i className={`bi bi-layout-sidebar-reverse icon`}></i>
        </button>
        <h1 className="mb-4">
          <Image 
            src="/images/ai-default-logo.png" 
            alt="AI Avatar"
            width={42} 
            height={40} 
            className="me-1 mt-text"
          />
          Vortexa
        </h1>
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="btn btn-outline-light close-sidebar-btn mb-btn" onClick={toggleSidebar}>
            <i className="bi bi-x icon"></i>
          </button>
          <button className="btn btn-outline-light mb-btn" onClick={newChat}>
            <i className="bi bi-plus-circle icon me-2"></i>Novo Chat
          </button>
          <button className="btn btn-outline-light mb-btn" onClick={clearHistory}>
            <i className="bi bi-trash icon me-2"></i>Excluir Histórico
          </button>
          <button className="btn btn-outline-light" onClick={shareChat}>
            <i className="bi bi-share icon me-2"></i>Compartilhar Chat
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
              <Image
                src={'/images/ai-default-avatar.png'}
                alt="Profile Icon"
                width={24}
                height={24}
                className="me-1"
              />
              <span>Vortexa</span>
            </button>
            {profileVisible && (
              <div className="profile-info">
                <h5 className="d-flex align-items-center">
                  <Image
                    src={'/images/ai-default-logo.png'}
                    alt="Profile Image"
                    width={42}
                    height={42}
                    className="me-1"
                  />
                  Vortexa
                </h5>
                <p className="text-muted">Versão: 1.0</p>
                <p className="short-line-spacing"><span className="bi bi-sourceforge me-2 lab-logo"></span>by (e.m) · Estandar Mustaq</p>
              </div>
            )}
          </div>
        </div>
        <div className="chat-container" id="chatContainer"></div>
        <div className="typing-indicator" id="typingIndicator">
          <i className="bi bi-gear fa-spin"></i> Vortexa está pensando...
        </div>
        <form id="queryForm" className="input-group" onSubmit={handleSubmit}>
          <input type="text" className="form-control" id="queryInput" placeholder="Mensagem Vortexa" required />
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-arrow-up-circle-fill icon"></i>
            <div className="spinner-border" role="status" aria-hidden="true"></div>
          </button>
        </form>
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

  async function handleSubmit(event) {
    event.preventDefault();
    const queryInput = document.getElementById('queryInput');
    const chatContainer = document.getElementById('chatContainer');
    const typingIndicator = document.getElementById('typingIndicator');
    const sendButton = document.querySelector('button[type="submit"]');
    const icon = sendButton.querySelector('.icon');
    const spinner = sendButton.querySelector('.spinner-border');
    const userMessage = queryInput.value;

    // Adicionar a mensagem do usuário ao chat
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('message', 'user');
    userMessageElement.innerHTML = `<i class="bi bi-person-fill me-2" style="font-size: 20px;"></i>${userMessage}`;
    chatContainer.appendChild(userMessageElement);

    // Limpar o campo de entrada
    queryInput.value = '';

    // Mostrar o indicador de digitação e spinner de processamento
    typingIndicator.style.display = 'block';
    sendButton.classList.add('btn-processing');
    icon.style.display = 'none';
    spinner.style.display = 'inline-block';


    // Enviar a mensagem para a API
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userMessage })
    });

    const result = await response.json();
    const aiMessage = result.response;

    // Ocultar o indicador de digitação e spinner de processamento
    typingIndicator.style.display = 'none';
    sendButton.classList.remove('btn-processing');
    icon.style.display = 'inline-block';
    spinner.style.display = 'none';

    // Adicionar a resposta da IA ao chat
    const aiMessageElement = document.createElement('div');
    aiMessageElement.classList.add('message', 'ai');
    aiMessageElement.innerHTML = `<i class="bi bi-robot me-2" style="font-size: 20px;"></i>${aiMessage}`;
    chatContainer.appendChild(aiMessageElement);


    // Rolagem automática para o final
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Adicionar a mensagem ao histórico
    const newHistory = { user: userMessage, ai: aiMessage };
    setChatHistory((prevHistory) => [...prevHistory, newHistory]);
  }
}

