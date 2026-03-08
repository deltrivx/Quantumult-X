let body = $response.body || "";

if (!body || typeof body !== "string") {
$done({});
}

// ===== 1. 干掉百度系 scheme =====
body = body.replace(/baiduboxapp:\/\/[^"'\\s<)]+/gi, "");
body = body.replace(/bdapp:\/\/[^"'\\s<)]+/gi, "");
body = body.replace(/baiduhaokan:\/\/[^"'\\s<)]+/gi, "");
body = body.replace(/tieba:\/\/[^"'\\s<)]+/gi, "");

// ===== 2. 关闭常见唤起字段 =====
body = body.replace(/"openapp"\\s*:\\s*true/gi, '"openapp":false');
body = body.replace(/"invokeApp"\\s*:\\s*true/gi, '"invokeApp":false');
body = body.replace(/"launchApp"\\s*:\\s*true/gi, '"launchApp":false');
body = body.replace(/"smartapp"\\s*:\\s*true/gi, '"smartapp":false');
body = body.replace(/"openBox"\\s*:\\s*true/gi, '"openBox":false');
body = body.replace(/"wiseopen"\\s*:\\s*true/gi, '"wiseopen":false');
body = body.replace(/"appGuide"\\s*:\\s*true/gi, '"appGuide":false');
body = body.replace(/"showApp"\\s*:\\s*true/gi, '"showApp":false');

// ===== 3. 清空常见跳转 URL / deeplink =====
body = body.replace(/"schemaUrl"\\s*:\\s*"[^"]*"/gi, '"schemaUrl":""');
body = body.replace(/"scheme"\\s*:\\s*"[^"]*"/gi, '"scheme":""');
body = body.replace(/"deeplink"\\s*:\\s*"[^"]*"/gi, '"deeplink":""');
body = body.replace(/"appUrl"\\s*:\\s*"[^"]*"/gi, '"appUrl":""');
body = body.replace(/"appurl"\\s*:\\s*"[^"]*"/gi, '"appurl":""');
body = body.replace(/"downloadUrl"\\s*:\\s*"[^"]*"/gi, '"downloadUrl":""');

// ===== 4. 去掉常见文案，减少页面继续构建按钮 =====
const textPatterns = [
/打开App/gi,
/立即打开/gi,
/App内打开/gi,
/百度APP内打开/gi,
/下载百度APP/gi,
/立即下载/gi,
/去App查看/gi,
/去百度APP查看/gi,
/打开百度APP/gi,
/安装百度APP/gi
];
textPatterns.forEach(p => body = body.replace(p, ""));

// ===== 5. 禁掉常见函数名 =====
body = body.replace(/invokeApp/gi, "invokeApp_disabled");
body = body.replace(/openApp/gi, "openApp_disabled");
body = body.replace(/launchApp/gi, "launchApp_disabled");
body = body.replace(/openBox/gi, "openBox_disabled");
body = body.replace(/wiseOpen/gi, "wiseOpen_disabled");
body = body.replace(/jumpToApp/gi, "jumpToApp_disabled");
body = body.replace(/callApp/gi, "callApp_disabled");

// ===== 6. 注入更激进的 CSS，压浮层 / 底栏 / 按钮 =====
const injectCSS = `
<style>
/* 常见 app 引导、底栏、弹窗、悬浮按钮 */
[class*="openapp"], [id*="openapp"],
[class*="open-app"], [id*="open-app"],
[class*="invoke"], [id*="invoke"],
[class*="launch"], [id*="launch"],
[class*="smartapp"], [id*="smartapp"],
[class*="appBtn"], [id*="appBtn"],
[class*="app-btn"], [id*="app-btn"],
[class*="callApp"], [id*="callApp"],
[class*="download-app"], [id*="download-app"],
[class*="downloadApp"], [id*="downloadApp"],
[class*="openBox"], [id*="openBox"],
[class*="wiseopen"], [id*="wiseopen"],
[class*="appGuide"], [id*="appGuide"],
[class*="schema"], [id*="schema"],
[class*="deeplink"], [id*="deeplink"],
[class*="dialog"], [class*="popup"], [class*="modal"],
[class*="banner"], [class*="bottom"], [class*="float"],
[id*="dialog"], [id*="popup"], [id*="modal"],
[id*="banner"], [id*="bottom"], [id*="float"] {
display: none !important;
visibility: hidden !important;
opacity: 0 !important;
pointer-events: none !important;
max-height: 0 !important;
overflow: hidden !important;
}

/* 防止 body 被弹窗锁滚动 */
html, body {
overflow: auto !important;
position: static !important;
}
</style>
`;

// ===== 7. 注入 JS，二次清理动态节点 =====
const injectJS = `
(function() {
const kill = () => {
const keywords = [
'openapp','open-app','invoke','launch','smartapp','appbtn','callapp',
'download-app','downloadapp','openbox','wiseopen','appguide',
'schema','deeplink','dialog','popup','modal','banner','bottom','float'
];

const all = document.querySelectorAll('*');
all.forEach(el => {
const s = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
const t = (el.innerText || '').toLowerCase();
const hitClass = keywords.some(k => s.includes(k));
const hitText =
t.includes('打开app') ||
t.includes('立即打开') ||
t.includes('下载百度app') ||
t.includes('app内打开') ||
t.includes('去app查看') ||
t.includes('打开百度app');

if (hitClass || hitText) {
el.style.setProperty('display', 'none', 'important');
el.style.setProperty('visibility', 'hidden', 'important');
el.style.setProperty('opacity', '0', 'important');
el.removeAttribute('onclick');
el.href = 'javascript:void(0)';
}
});
};

kill();
setInterval(kill, 1200);
})();
</script>
`;

if (body.includes("</head>")) {
body = body.replace("</head>", injectCSS + injectJS + "</head>");
} else if (body.includes("<body")) {
body = injectCSS + injectJS + body;
} else {
body = injectCSS + injectJS + body;
}

$done({ body });
