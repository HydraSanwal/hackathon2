// Docusaurus Chat Integration Script
// This script integrates the chat widget into Docusaurus pages

(function() {
  // Wait for the page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatWidget);
  } else {
    initializeChatWidget();
  }

  // Chat Icon Component
  class ChatIcon {
    constructor() {
      this.isOpen = false;
      this.createIcon();
      this.addEventListeners();
    }

    createIcon() {
      // Create the chat icon element
      this.iconElement = document.createElement('div');
      this.iconElement.id = 'chatbot-icon';
      this.iconElement.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-color: #4f46e5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 10000;
          transition: all 0.3s ease;
        ">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3.02 16.32L2 22L7.68 20.98C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
            <path d="M9.5 14.5C9.5 14.5 7.5 14.5 7.5 12C7.5 9.5 9.5 9.5 9.5 9.5C9.5 9.5 11.5 9.5 11.5 12C11.5 14.5 9.5 14.5 9.5 14.5ZM14.5 14.5C14.5 14.5 12.5 14.5 12.5 12C12.5 9.5 14.5 9.5 14.5 9.5C14.5 9.5 16.5 9.5 16.5 12C16.5 14.5 14.5 14.5 14.5 14.5Z" fill="#4f46e5"/>
          </svg>
        </div>
      `;

      document.body.appendChild(this.iconElement);
    }

    addEventListeners() {
      this.iconElement.addEventListener('click', () => {
        this.toggleChatPanel();
      });
    }

    toggleChatPanel() {
      if (this.isOpen) {
        this.closeChatPanel();
      } else {
        this.openChatPanel();
      }
    }

    openChatPanel() {
      this.isOpen = true;
      if (!document.getElementById('chatbot-panel')) {
        const chatPanel = document.createElement('div');
        chatPanel.id = 'chatbot-panel';
        chatPanel.innerHTML = `
          <div id="chatbot-container" style="
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            z-index: 10000;
            overflow: hidden;
          ">
            <div id="chatbot-header" style="
              background-color: #4f46e5;
              color: white;
              padding: 15px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <span>Book Assistant</span>
              <button id="close-chat" style="
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
              ">&times;</button>
            </div>
            <div id="chat-messages" style="
              flex: 1;
              padding: 15px;
              overflow-y: auto;
              background-color: #f9fafb;
            "></div>
            <div id="chat-input-container" style="
              padding: 15px;
              border-top: 1px solid #e5e7eb;
              background-color: white;
            ">
              <div style="display: flex; gap: 10px;">
                <input
                  type="text"
                  id="chat-input"
                  placeholder="Ask about the book..."
                  style="
                    flex: 1;
                    padding: 10px 15px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                  "
                >
                <button id="send-message" style="
                  background-color: #4f46e5;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  padding: 10px 15px;
                  cursor: pointer;
                ">Send</button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(chatPanel);

        // Add event listeners to the panel
        document.getElementById('close-chat').addEventListener('click', () => this.closeChatPanel());
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.sendMessage();
          }
        });
      }

      document.getElementById('chatbot-panel').style.display = 'block';
    }

    closeChatPanel() {
      this.isOpen = false;
      const panel = document.getElementById('chatbot-panel');
      if (panel) {
        panel.style.display = 'none';
      }
    }

    async sendMessage() {
      const inputElement = document.getElementById('chat-input');
      const message = inputElement.value.trim();

      if (!message) return;

      // Add user message to chat
      this.addMessageToChat(message, 'user');
      inputElement.value = '';

      try {
        // Call backend API
        const response = await fetch('https://shimmering-respect-environment.up.railway.app/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            session_id: window.chatSessionId || null
          })
        });

        const data = await response.json();

        // Store session ID for future messages
        if (data.session_id && !window.chatSessionId) {
          window.chatSessionId = data.session_id;
        }

        // Add bot response to chat
        this.addMessageToChat(data.response, 'bot');
      } catch (error) {
        console.error('Error sending message:', error);
        this.addMessageToChat('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
      }
    }

    addMessageToChat(message, sender) {
      const messagesContainer = document.getElementById('chat-messages');

      const messageElement = document.createElement('div');
      messageElement.style.cssText = `
        margin-bottom: 15px;
        padding: 10px 12px;
        border-radius: 8px;
        max-width: 80%;
        word-wrap: break-word;
      `;

      if (sender === 'user') {
        messageElement.style.cssText += `
          background-color: #4f46e5;
          color: white;
          margin-left: auto;
          text-align: right;
        `;
      } else {
        messageElement.style.cssText += `
          background-color: #e0e7ff;
          color: #3730a3;
          margin-right: auto;
          text-align: left;
        `;
      }

      messageElement.textContent = message;
      messagesContainer.appendChild(messageElement);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function initializeChatWidget() {
    // Create and inject the chat widget
    new ChatIcon();

    // Initialize context menu for text selection
    initializeContextMenu();
  }

  function initializeContextMenu() {
    let selectedText = '';

    // Listen for text selection
    document.addEventListener('mouseup', function() {
      selectedText = window.getSelection().toString().trim();
    });

    // Listen for right-click on selected text
    document.addEventListener('contextmenu', function(e) {
      if (selectedText) {
        // Prevent default context menu
        e.preventDefault();

        // Create custom context menu
        createCustomContextMenu(e, selectedText);
      }
    });
  }

  function createCustomContextMenu(event, text) {
    // Remove any existing context menu
    const existingMenu = document.getElementById('chatbot-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'chatbot-context-menu';
    contextMenu.innerHTML = `
      <div style="
        position: fixed;
        top: \${event.clientY}px;
        left: \${event.clientX}px;
        background-color: white;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        padding: 5px 0;
      ">
        <div
          id="ask-chatbot-option"
          style="
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            color: #1f2937;
          "
          onmouseover="this.style.backgroundColor='#f3f4f6'"
          onmouseout="this.style.backgroundColor='white'"
        >
          Ask chatbot about this
        </div>
      </div>
    `;

    document.body.appendChild(contextMenu);

    // Add click event to the option
    document.getElementById('ask-chatbot-option').addEventListener('click', function() {
      // Open chat panel and send the selected text
      openChatWithText(text);
      contextMenu.remove();
    });

    // Remove context menu when clicking elsewhere
    document.addEventListener('click', function removeMenu(e) {
      if (!contextMenu.contains(e.target)) {
        contextMenu.remove();
        document.removeEventListener('click', removeMenu);
      }
    });
  }

  function openChatWithText(text) {
    // If chat panel doesn't exist, create it by simulating a click on the icon
    if (!document.getElementById('chatbot-panel')) {
      const icon = document.getElementById('chatbot-icon');
      if (icon) {
        icon.click();
      }
    } else {
      document.getElementById('chatbot-panel').style.display = 'block';
    }

    // Add the selected text to the input field
    setTimeout(() => {
      const inputElement = document.getElementById('chat-input');
      if (inputElement) {
        inputElement.value = text;
      }
    }, 100);
  }
})();