// Wstrzykuje ciemne tło do HTML renderowanego w iframe (srcdoc),
// aby treść admina (np. ogłoszenia) pasowała do ciemnego motywu platformy.
export function injectDarkBackground(html: string): string {
  const darkStyles = `<style>
    html, body {
      background: #0a0a0f !important;
      color: #f1f0f5 !important;
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 1rem;
    }
    * { box-sizing: border-box; }
    a { color: #a855f7; }
  </style>`;
  if (html.includes("</head>")) return html.replace("</head>", darkStyles + "</head>");
  if (html.includes("<body")) return html.replace("<body", darkStyles + "<body");
  return darkStyles + html;
}
