const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const introResponses = [
  "Hello, I'm Vera. I'm here to listen and help you through your thoughts.",
  "Hi there, I'm Vera — your mental health companion. How are you feeling today?",
  "Welcome. I'm Vera. You can talk to me about anything on your mind."
];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, "user-message");
  input.value = "";

  if (/hi|hello|hey/i.test(userMessage) && /vera/i.test(userMessage)) {
    const response = introResponses[Math.floor(Math.random() * introResponses.length)];
    setTimeout(() => addMessage(response, "bot-message"), 500);
    return;
  }

  const botResponse = await getVeraResponse(userMessage);
  setTimeout(() => addMessage(botResponse, "bot-message"), 700);
});

function addMessage(text, className) {
  const message = document.createElement("div");
  message.className = `chat-message ${className}`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Updated getVeraResponse function with debugging logs
async function getVeraResponse(message) {
  try {
    console.log('Sending message to backend:', message);  // Debug log
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      console.error('Error: Response not OK', res.statusText);  // Error log if response is not successful
      return "Something went wrong with the server. Please try again later.";
    }

    const data = await res.json();
    console.log('Received response:', data);  // Debug log
    return data.reply;
  } catch (err) {
    console.error('Error in API call:', err);  // Debug log
    return "Hmm, something went wrong. Want to try again?";
  }
}
