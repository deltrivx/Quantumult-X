let body = $response.body || "";

// 仅处理 HTML / JS 文本
if (!body || typeof body !== "string") {
$done({});
}

// 1. 去掉常见百度 App Scheme
body = body.replace(/baiduboxapp:\/\/[^"'\\s<)]+/gi, "");
body = body.replace(/bdapp:\/\/[^"'\\s<)]+/gi, "");
body = body.replace(/baiduhaokan:\/\/[^"'\\s<)]+/gi, "");
body = body.replace(/tieba:\/\/[^"'\\s<)]+/gi, "");

// 2. 抹掉常见唤起字段
body = body.replace(/"openapp"\\s*:\\s*true/gi, '"openapp":false');
body = body.replace(/"invokeApp"\\s*:\\s*true/gi, '"invokeApp":false');
body = body.replace(/"launchApp"\\s*:\\s*true/gi, '"launchApp":false');
body = body.replace(/"smartapp"\\s*:\\s*true/gi, '"smartapp":false');
body = body.replace(/"openBox"\\s*:\\s*true/gi, '"openBox":false');
body = body.replace(/"wiseopen"\\s*:\\s*true/gi, '"wiseopen":false');

// 3. 清理常见 schema / deeplink 字段
body = body.replace(/"schemaUrl"\\s*:\\s*"[^"]*"/gi, '"schemaUrl":""');
body = body.replace(/"scheme"\\s*:\\s*"[^"]*"/gi, '"scheme":""');
body = body.replace(/"deeplink"\\s*:\\s*"[^"]*"/gi, '"deeplink":""');
body = body.replace(/"appUrl"\\s*:\\s*"[^"]*"/gi, '"appUrl":""');
body = body.replace(/"appurl"\\s*:\\s*"[^"]*"/gi, '"appurl":""');

// 4. 删除页面里常见“打开App”按钮文案
body = body.replace(/打开App/gi, "");
body = body.replace(/立即打开/gi, "");
body = body.replace(/App内打开/gi, "");
body = body.replace(/百度APP内打开/gi, "");
body = body.replace(/下载百度APP/gi, "");

// 5. 干掉常见唤起函数名（温和版）
body = body.replace(/invokeApp/gi, "invokeApp_disabled");
body = body.replace(/openApp/gi, "openApp_disabled");
body = body.replace(/launchApp/gi, "launchApp_disabled");
body = body.replace(/openBox/gi, "openBox_disabled");
body = body.replace(/wiseOpen/gi, "wiseOpen_disabled");

// 6. 注入一段前端样式，隐藏常见“打开App”按钮/条
const injectCSS = `
<style>
[class*="openapp"], [id*="openapp"],
[class*="open-app"], [id*="open-app"],
[class*="invoke"], [id*="invoke"],
[class*="launch"], [id*="launch"],
[class*="smartapp"], [id*="smartapp"],
[class*="appBtn"], [id*="appBtn"],
[class*="callApp"], [id*="callApp"] {
display: none !important;
visibility: hidden !important;
opacity: 0 !important;
pointer-events: none !important;
}
</style>
`;

if (body.includes("</head>")) {
body = body.replace("</head>", injectCSS + "</head>");
} else {
body = injectCSS + body;
}

$done({ body });
