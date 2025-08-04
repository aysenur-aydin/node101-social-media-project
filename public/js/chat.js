const socket = io();
const currentUserId = document.currentScript.getAttribute('data-user-id');
const currentUsername = document.currentScript.getAttribute('data-username');

const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const messages = document.getElementById('messages-container');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat-message', input.value, (serverResponse) => {
      console.log('Server replied:', serverResponse);
    });
    input.value = '';
  }
});

socket.on('chat-message', (message) => {
  const item = document.createElement('li');
  const messageTime = new Date(message.createdAt).toLocaleTimeString();
  const isMine = message.senderId === currentUserId;

  item.className = isMine ? 'message-right' : 'message-left';

  item.innerHTML = `
    <div class="message-wrapper">
      <span class="message-sender">${
        isMine ? '' : message.senderUsername
      }</span>
      <p>${message.text}</p>
      <span class="message-time">${messageTime}</span>
    </div>
  `;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});