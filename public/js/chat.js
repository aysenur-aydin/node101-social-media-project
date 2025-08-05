const socket = io();
const currentUserId = document.currentScript.getAttribute('data-user-id');
const currentUsername = document.currentScript.getAttribute('data-username');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const messageContainer = document.getElementById('messages-container');

function renderMessages(messages) {
  messages.forEach((message) => {
    const item = document.createElement('li');
    const messageTime = new Date(message.createdAt).toLocaleTimeString();
    const isMine = message.from._id === currentUserId;
    item.className = isMine ? 'message-right' : 'message-left';

    item.innerHTML = `
      <div class="message-wrapper">
        <span class="message-sender">${isMine ? '' : message.from.username}</span>
        <p>${message.text}</p>
        <span class="message-time">${messageTime}</span>
      </div>
    `;
    messageContainer.appendChild(item);
  });
  window.scrollTo(0, document.body.scrollHeight);
}

async function loadChatHistory(element, toUserId) {
  messageContainer.innerHTML = '';
  form.dataset.toUserId = toUserId;
  document.querySelectorAll('.chat-card').forEach((el) => el.classList.remove('active'));
  element.classList.add('active');

  const response = await fetch(`/chat/messages?friendId=${toUserId}`);
  const messages = await response.json();

  if (messages.length > 0) {
    renderMessages(messages);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value;
  const toUserId = form.dataset.toUserId;

  if (message.trim() !== '' && toUserId) {
    socket.emit('private_message', { toUserId, message }, (serverResponse) => {
      console.log('Server replied:', serverResponse);
    });
    input.value = '';
  }
});

socket.on('new_private_message', ({ fromUserId, fromUsername, isMine, message, createdAt }) => {
  if (!isMine && form.dataset.toUserId !== fromUserId) {
    console.log(`A new message arrived from: ${fromUserId}`);
    return;
  }
  const item = document.createElement('li');
  const messageTime = new Date(createdAt).toLocaleTimeString();

  item.className = isMine ? 'message-right' : 'message-left';

  item.innerHTML = `
    <div class="message-wrapper">
      <span class="message-sender">${isMine ? '' : fromUsername}</span>
      <p>${message}</p>
      <span class="message-time">${messageTime}</span>
    </div>
  `;
  messageContainer.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
