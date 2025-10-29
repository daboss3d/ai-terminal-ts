import { html } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";
// import { JSX } from "hono/jsx";

interface MainLayoutProps {
  children: PropsWithChildren | string | Element; //string
  title?: string;
  description?: string;
  scripts?: string;
  fullScreen?: boolean;
  head?: string;
}

// Add a timestamp or version to script URLs to bust cache
//const timestamp = Date.now();

export const MainLayout = ({
  children,
  title = "CardM8 - Digital Business Cards",
  description = "Create and share your digital business cards with CardM8",
  scripts = "",
  fullScreen = true,
  head = "",
}: MainLayoutProps) => {
  return html`
    <!DOCTYPE html>
    <html lang="en" class="scroll-smooth">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <!-- Custom Head Content -->
        ${head ? head : ""}
        <!-- Styles -->
        <link href="/static/styles.css" rel="stylesheet" />
        <!-- Scripts -->
        <!-- script type="module" src="/static/theme.js" defer></script> -->
        <script>
          console.log("Main layout loaded 1.1.4 -----");
        </script>

        <!-- Custom Scripts -->
        ${scripts ? html([scripts]) : ""}
      </head>
      <body class="h-[100dvh] ${fullScreen ? "flex flex-col" : ""} bg-background text-foreground ">
        <div id="app">${children}</div>
      </body>
    </html>
  `;
};
