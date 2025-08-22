const supportsRawMode = process.stdin.isTTY;

if (supportsRawMode) {
  console.log("Raw mode supported");
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");

  let inText = "";

  console.log("--->", process.stdin.isRaw);

  for await (const chunk of Bun.stdin.stream()) {
    // chunk is Uint8Array
    // this converts it to text (assumes ASCII encoding)
    const chunkText = Buffer.from(chunk).toString();
    // console.log(`Chunk: ${chunkText}`);

    // check for ctrl+c
    if (chunkText === "\u0003") {
      process.exit();
    }
    // check for enter
    if (chunkText === "\r") {
      console.log(`Line: ${inText}`);
      inText = "";
    } else {
      inText += chunkText;
    }
  }
} else {
  console.log("Raw mode not supported");
  process.exit(1);
}
