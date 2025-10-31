import { html } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";
// import { JSX } from "hono/jsx";
import { jsxRenderer } from 'hono/jsx-renderer';
import { type JSX, Fragment } from 'hono/jsx';

/*
  interface MainLayoutProps {
const ProviderRow = (props: { provider: Provider }): JSX.Element => {
  return (
    <div class="flex mt-1 items-center gap-4 p-2 hover:bg-gray-100 rounded cursor-pointer">
      <div class="min-w-[200px] font-medium">{props.provider.name}</div>
      <div class="flex-1">{props.provider.name}</div>
      <div class="flex-1">{props.provider.baseUrl}</div>
      <div class="w-12 text-right text-gray-500">28</div>

      <button class="action-btn w-8" data-action="delete" data-provider-id={props.provider.id}>
        {Icon_delete}
      </button>

      <button class="action-btn w-8" data-action="edit" data-provider-id={props.provider.id}>
        {Icon_edit}
      </button>
    </div>
  );
};
  children: PropsWithChildren | string | Element; //string
  title?: string;
  description?: string;
  scripts?: string;
  fullScreen?: boolean;
  head?: string;
}
*/


// Add a timestamp or version to script URLs to bust cache
//const timestamp = Date.now();

//export const MainLayout = ({
//  children,
//  title = "CardM8 - Digital Business Cards",
//  description = "Create and share your digital business cards with CardM8",
//  scripts = "",
//  fullScreen = true,
//  head = "",
//}: MainLayoutProps) => {
//  return html`
//    <!DOCTYPE html>
//    <html lang="en" class="scroll-smooth">
//      <head>
//        <meta charset="UTF-8" />
//        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//        <title>${title}</title>
//        <meta name="description" content="${description}" />
//        <!-- Custom Head Content -->
//        ${head ? head : ""}
//        <!-- Styles -->
//        <link href="/static/styles.css" rel="stylesheet" />
//        <!-- Scripts -->
//        <!-- script type="module" src="/static/theme.js" defer></script> -->
//        <script>
//          console.log("Main layout loaded 1.1.4 -----");
//        </script>
//
//        <!-- Custom Scripts -->
//        ${scripts ? html([scripts]) : ""}
//      </head>
//      <body class="h-[100dvh] ${fullScreen ? "flex flex-col" : ""} bg-background text-foreground ">
//        <div id="app">${children}</div>
//      </body>
//    </html>
//  `;
//};


type MainLayoutProps = {
  children: JSX.Element | JSX.Element[];
  title?: string;
  description?: string;
  scripts?: string;
  fullScreen?: boolean;
  head?: string;
}


export const MainLayout = ({
  children,
  title = "CardM8 - Digital Business Cards",
  description = "Create and share your digital business cards with CardM8",
  scripts,
  fullScreen = true,
  head,
}: MainLayoutProps) => {
  return (
    <html lang="en" class="scroll-smooth">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Custom head HTML — dangerously */}
        {head && <Fragment dangerouslySetInnerHTML={{ __html: head }} />}

        <link href="/static/build.css" rel="stylesheet" />

        {/* Script injection */}
        {scripts && <Fragment dangerouslySetInnerHTML={{ __html: scripts }} />}
      </head>

      <body class={`h-[100dvh] ${fullScreen ? "flex flex-col" : ""} bg-background text-foreground`}>
        <div id="app">{children}</div>
      </body>
    </html>
  );
};

