// send message to server /prompts
async function sendMessageToServer(
  message: string,
  stream: boolean = true
): Promise<string> {
  const response = await fetch("http://localhost:3001/prompts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: message }),
  });

  if (!response.body) {
    return "";
  }

  if (stream) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      result += decoder.decode(value);
    }
    return result;
  } else {
    const data = await response.json();
    return data.response;
  }
}

export { sendMessageToServer };
