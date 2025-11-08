const socket = io();

// Register user to a room on socket.io server
socket.emit('register-user', userId); 

let currentChatUserId = null;
function bindChatForm() {
    const chatForm = document.querySelector('.chat-form');
    const chatBox = document.querySelector('.chat-box');

    if (!chatForm || !chatBox) return;

    chatForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = new FormData(chatForm);

        const message = chatForm.message.value.trim();
        const media = chatForm.media.files[0]; // file selected or not

        //  Condition: if neither text nor image is given, return
        if (!message && !media) {
            alert("Please type a message or select an image to send.");
            return;
        }

        try {
            const response = await fetch('/send-message-socket', {
                method: 'POST',
                body: form
            });

            const data = await response.json(); // => { message, media, to, from, name }

            // Emit over socket
            socket.emit('send-msg', data);

            //  Clear inputs
            chatForm.message.value = '';
            chatForm.media.value = '';
        } catch (err) {
            console.error("Send failed:", err);
        }
    });

    currentChatUserId = chatForm.to.value;
}


// Message receive and show only if relevant
socket.on('receive-msg', (data) => {
    if (data.to === currentChatUserId || data.from === currentChatUserId) {
        const chatBox = document.querySelector('.chat-box');
        if (!chatBox) return;

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', data.from === userId ? 'you' : 'other');

        msgDiv.innerHTML = `
  <div class="message-content" style="background: none; padding: 0; border: none;">
    ${data.message ? `<p>${data.message}</p>` : ''}
    ${data.media ? `<img src="/uploads/${data.media}" width="150" class="chat-image" data-full="/uploads/${data.media}" style="border-radius: 10px;">` : ''}
  </div>
`;

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

