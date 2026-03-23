// ==UserScript==
// @name        【月白】Itzagud Stats
// @description A tool to handle infos on Itzagud.
// @author      星空優月 & 💟 めぐ 🍫 みん (Megumin 💥) 💟
// @iconURL     https://www.itzagud.net/apple-touch-icon.png
// @match       *://www.itzagud.net/*
// @grant       none
// @run-at      document-start
// @version     0.3
// ==/UserScript==

(function () {
    'use strict';

    const cK = 'itz_ch_dat';
    function rC() {
        if (!document.body) return null;
        let n = null;
        let c = false;
        const txt = document.body.innerText || '';
        if (/claimed|owned|\+250 clams claimed|You already claimed/i.test(txt)) {c = true;}
        const m = txt.match(/resets?\s+in\s+(\d{1,2}):(\d{2}):(\d{2})/i);
        if (m) {
            const ms = (parseInt(m[1],10)*3600 + parseInt(m[2],10)*60 + parseInt(m[3],10)) * 1000;
            if (ms > 0 && ms <= 21600000) {
                n = Date.now() + ms;}}
        if (!n) {
            const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let nd;
            while ((nd = w.nextNode())) {
                const t = nd.textContent || '';
                if (/resets?\s+in/i.test(t)) {
                    let p = nd.parentElement;
                    while (p) {
                        const m2 = (p.innerText||'').match(/(\d{1,2}):(\d{2}):(\d{2})/);
                        if (m2) {
                            const ms = (parseInt(m2[1],10)*3600 + parseInt(m2[2],10)*60 + parseInt(m2[3],10)) * 1000;
                            if (ms > 0 && ms <= 21600000) { n = Date.now() + ms; break; }}
                        p = p.parentElement;}}
                if (n) break;}}
        return { n, c };}

    function gCS() {
        if (location.pathname.startsWith('/chat') && document.body) {
            const live = rC();
            if (live.n) {
                try { localStorage.setItem(cK, JSON.stringify(live)); } catch(e){}
                return live;}}
        try {
            const raw = localStorage.getItem(cK);
            if (raw) {
                const dat = JSON.parse(raw);
                if (Date.now() >= dat.n) {
                    return { n: null, c: false };}
                return dat;}
        } catch(e){}
        return { n: null, c: false };}

    let _lDR = 0;
    function wCP() {
        if (!location.pathname.startsWith('/chat')) return;
        const tR = () => {
            if (Date.now() - _lDR < 900) return;
            _lDR = Date.now();
            const l = rC();
            if (l.n !== null) {
                try { localStorage.setItem(cK, JSON.stringify(l)); } catch(e){}
                uCS();}};
        const at = () => { tR(); new MutationObserver(tR).observe(document.body, { childList: true, subtree: true, characterData: true }); };
        if (document.body) at(); else { document.addEventListener('DOMContentLoaded', at); setTimeout(at, 500); }}

    let _cT = null;
    function uCS() {
        if (_cT) { clearInterval(_cT); _cT = null; }
        const st = document.getElementById("itz-ch-st"), cd = document.getElementById("itz-ch-cd"), pb = document.getElementById("itz-ch-pb"), cdiv = document.getElementById("itz-ch-card");
        if (!st || !cd || !pb || !cdiv) return;
        const dat = gCS();

        cdiv.onclick = () => window.open('https://www.itzagud.net/chat', '_blank');
        if (dat.c) {
            st.textContent = "✅ CLAIMED! (+250)";
            st.style.color = "#4ade80";
            pb.style.background = "linear-gradient(to right, #4ade80, #22c55e)";
        } else {
            st.textContent = "❌ NOT CHATTED!";
            st.style.color = "#ef4444";
            pb.style.background = "linear-gradient(to right, #ef4444, #f97316)";
        }
        if (!dat.n) {
            st.textContent = "❓ Unknown Status";
            st.style.color = "#a1a1aa";
            cd.textContent = "Visit /chat to sync";
            cd.style.color = "#a1a1aa";
            pb.style.width = "0%";
            pb.style.background = "rgba(255,255,255,0.1)";
            return;}
        const TOT = 21600000;
        cd.style.color = "var(--itz-timer)";
        const tk = () => {
            const rm = dat.n - Date.now();
            if (rm <= 0) { clearInterval(_cT); uCS(); return; }
            cd.textContent = fMS(rm);
            pb.style.width = Math.min(100, ((TOT-rm)/TOT)*100) + '%';};
        tk();
        _cT = setInterval(tk, 1000);}

    function fC(endTime) {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return "Ended";
        return `${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`;}

    function fMS(ms) {
        if (ms <= 0) return "00:00:00";
        const s = Math.floor(ms/1000);
        return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

    async function fUD() {
        try { const r=await fetch("https://www.itzagud.net/api/me",{credentials:"include"}); const d=await r.json(); if(d.user) return d.user; } catch(e){}
        return null;}
    async function fSG() {
        try { const r=await fetch("https://www.itzagud.net/slots/api/giveaway",{credentials:"include"}); const d=await r.json(); if(d.ok) return d.items||[]; } catch(e){}
        return [];}
    async function fSE() {
        try { const r=await fetch("https://www.itzagud.net/slots/api/my-entries",{credentials:"include"}); const d=await r.json(); if(d.ok) return{oneHour:d.byKind.SLOTS_1H||0,twentyFourHour:d.byKind.SLOTS_24H||0}; } catch(e){}
        return {oneHour:0,twentyFourHour:0};}
    async function fT() {
        try { const r=await fetch("https://www.itzagud.net/api/tasks",{credentials:"include"}); const d=await r.json(); return d.tasks||[]; } catch(e){}
        return [];}

    function uPB(id, done, total) {
        const bar=document.getElementById(id), cnt=document.getElementById(id+"-counter");
        if (bar) bar.style.width=total>0?`${Math.min(100,(done/total)*100)}%`:"0%";
        if (cnt) cnt.textContent=`${done}/${total}`;}

    async function uUS() {
        const user=await fUD(), el=document.getElementById("itz-user-stats");
        if (!el||!user) return;
        el.innerHTML=`
            <div class="itz-user-card">
                <div class="itz-stat-row"><span>🪙 Points</span><span class="itz-val-points">${user.points.toLocaleString()}</span></div>
                <div class="itz-stat-row"><span>💵 Clams</span><span class="itz-val-clams">${user.clams.toLocaleString()}</span></div>
                <div class="itz-stat-row" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:5px;margin-top:2px;">
                    <span class="itz-val-luck">🍀 ${user.wheelDayEarned}/10</span>
                    <span class="itz-val-timer">⏰ ${fC(user.wheelNextAt)}</span>
                </div>
            </div>`;}

    async function uTC() {
        const tasks=await fT();
        let sTot=0,sDone=0,wTot=0,wDone=0;
        for (const t of tasks) {
            if (t.type.startsWith("STEAM")) { sTot++; if(!t.isAvailable&&t.availabilityReason==="MAX_COMPLETIONS_REACHED") sDone++; }
            else { wTot++; if(!t.isAvailable&&(t.availabilityReason==="COOLDOWN_ACTIVE"||t.availabilityReason==="MAX_COMPLETIONS_REACHED")) wDone++; }}
        uPB("itz-task-bar",sDone+wDone,sTot+wTot);
        const cnt=document.getElementById("itz-task-bar-counter");
        if (cnt) cnt.textContent=`📺 ${wDone}/${wTot} 🎮 ${sDone}/${sTot}`;}

    async function uSGD() {
        const [giveaways,entries]=await Promise.all([fSG(),fSE()]);
        const el=document.getElementById("itz-slot-giveaways");
        if (!el) return;
        let html=`<div class="itz-giveaway-grid">`;
        giveaways.forEach((g,idx)=>{
            const label=g.kind==="SLOTS_1H"?"1H":"24H";
            const tickets=g.kind==="SLOTS_1H"?entries.oneHour:entries.twentyFourHour;
            const total=g.totalEntries||0;
            const wR=total>0?((tickets/total)*100).toFixed(2):"0.00";
            const col=idx+1;
            const sIM=g.prize.imageUrl.match(/steam\/apps\/(\d+)\//);
            const link=sIM?`https://s.team/a/${sIM[1]}`:"https://www.itzagud.net/slots";
            html+=`
                <div class="itz-label" style="grid-column:${col};grid-row:1">${label}</div>
                <div style="grid-column:${col};grid-row:2"><img src="${g.prize.imageUrl}" alt="${g.prize.name}" class="itz-prize-img"></div>
                <div style="grid-column:${col};grid-row:3"><a href="${link}" target="_blank" class="itz-prize-name">${g.prize.name}</a></div>
                <div class="itz-meta-val" style="grid-column:${col};grid-row:4;color:#facc15;">⌛ ${fC(g.endsAt)}</div>
                <div class="itz-meta-val" style="grid-column:${col};grid-row:5;color:#93c5fd;">🎫 ${tickets.toLocaleString()}</div>
                <div class="itz-meta-val" style="grid-column:${col};grid-row:6;color:var(--itz-accent);">👥 ${total.toLocaleString()}</div>
                <div class="itz-meta-val" style="grid-column:${col};grid-row:7;color:var(--itz-luck);">📊 ${wR}%</div>`;});
        html+=`</div>`;
        el.innerHTML=html;}

    const iS = () => {
        if (document.getElementById("itzagud-styles")) return;
        const style=document.createElement("style");
        style.id="itzagud-styles";
        style.textContent=`
            @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
            :root{--itz-bg: rgba(9, 9, 11, 0.85);--itz-border: rgba(63, 63, 70, 0.4);--itz-glass: blur(12px);--itz-accent: #a78bfa;--itz-points: #fbbf24;--itz-clams: #ef4444;--itz-luck: #22c55e;--itz-timer: #38bdf8;--itz-font: 'Rajdhani', sans-serif;}
            #itzagud-widget{position: fixed;top: 50%;right: 20px;transform: translateY(-50%);z-index: 10000;width: 280px;font-family: var(--itz-font);background: var(--itz-bg);backdrop-filter: var(--itz-glass);-webkit-backdrop-filter: var(--itz-glass);border: 1px solid var(--itz-border);border-radius: 16px;padding: 16px;box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(167, 139, 250, 0.1);color: #f4f4f5;transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);}
            #itzagud-widget.itz-minimized {width: 52px;height: 52px;border-radius: 50%;padding: 0;gap: 0;justify-content: center;align-items: center;cursor: pointer;box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 10px rgba(167, 139, 250, 0.3);transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex;}
            #itzagud-widget.itz-minimized:hover {box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6), 0 0 15px rgba(167, 139, 250, 0.5);}
            #itzagud-widget.itz-minimized > *:not(#itz-minimized-content) {display: none !important;}
            #itz-minimized-content {display: none;width: 100%;height: 100%;align-items: center;justify-content: center;border-radius: 50%;}
            #itzagud-widget.itz-minimized #itz-minimized-content {display: flex;}
            #itz-minimized-content img {width: 32px;height: 32px;pointer-events: none;filter: drop-shadow(0 0 4px rgba(167, 139, 250, 0.4));transition: transform 0.2s;}
            #itzagud-widget.itz-minimized:hover #itz-minimized-content img {transform: scale(1.15);}
            .itz-section{margin-bottom: 16px;}
            .itz-section:last-child{margin-bottom: 0;}
            .itz-user-card{background: rgba(39, 39, 42, 0.5);border: 1px solid var(--itz-border);border-radius: 12px;padding: 12px;display: flex;flex-direction: column;gap: 8px;}
            .itz-stat-row{display: flex;justify-content: space-between;align-items: center;font-size: 14px;font-weight: 600;}
            .itz-val-points{color: var(--itz-points);}
            .itz-val-clams{color: var(--itz-clams);}
            .itz-val-luck{color: var(--itz-luck);}
            .itz-val-timer{color: var(--itz-timer);}
            .itz-giveaway-grid{display: grid;grid-template-columns: 1fr 1fr;gap: 8px 12px;background: rgba(24, 24, 27, 0.4);border: 1px solid var(--itz-border);border-radius: 12px;padding: 12px;text-align: center;}
            .itz-label{font-size: 13px;color: var(--itz-accent);font-weight: 700;margin-bottom: 4px;}
            .itz-prize-img{width: 100%;max-width: 100px;margin: 0 auto;aspect-ratio: 16/9;object-fit: cover;border-radius: 6px;box-shadow: 0 4px 8px rgba(0,0,0,0.3);}
            .itz-prize-name{display: block;font-size: 13px;font-weight: 700;color: var(--itz-luck);text-decoration: none;line-height: 1.2;margin: 6px 0;}
            .itz-prize-name:hover{opacity: 0.8;}
            .itz-meta-val{font-size: 13px;font-weight: 700;padding: 2px 0;}
            .itz-progress-container{display:flex;flex-direction:column;gap:4px;}
            .itz-progress-label{display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#a1a1aa;}
            .itz-progress-outer{height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);}
            .itz-progress-inner{height:100%;background:linear-gradient(to right,#6366f1,#4ade80);transition:width 0.3s ease;}
        `;
        document.head.appendChild(style);};

    function wg() {
        if (document.getElementById("itzagud-widget")) return;
        iS();
        const widget = document.createElement("div");
        widget.id = "itzagud-widget";
        let isMinimized = localStorage.getItem('itz_widget_minimized') === 'true';
        if (isMinimized) {widget.classList.add('itz-minimized');}
        const minContent = document.createElement("div");
        minContent.id = "itz-minimized-content";
        minContent.innerHTML = '<img src="https://www.itzagud.net/apple-touch-icon.png" style="width:32px; height:32px; border-radius:50%; pointer-events:none;">';
        widget.appendChild(minContent);
        const titleRow = document.createElement("div");
        titleRow.style = "display:flex; align-items:center; gap:8px; margin-bottom:16px; border-bottom:1px solid var(--itz-border); padding-bottom:10px; cursor:pointer; user-select:none; transition:opacity 0.2s;";
        titleRow.onmouseover = () => { titleRow.style.opacity = "0.8"; };
        titleRow.onmouseout  = () => { titleRow.style.opacity = "1"; };
        titleRow.innerHTML = `
            <img src="https://www.itzagud.net/apple-touch-icon.png" style="width:20px; height:20px; border-radius:50%; pointer-events:none;">
            <span style="font-weight:700; font-size:16px; letter-spacing:0.5px; color:var(--itz-accent); pointer-events:none;">ITZAGUD STATS</span>
        `;
        widget.appendChild(titleRow);

        let isDraggingOrMoved = false;

        widget.addEventListener("click", (e) => {
            if (isDraggingOrMoved) {
                e.preventDefault();
                e.stopPropagation();
                return;}
            if (widget.classList.contains('itz-minimized')) {
                widget.classList.remove('itz-minimized');
                localStorage.setItem('itz_widget_minimized', 'false');

                let currentX = parseInt(widget.style.left || 0, 10);
                let currentY = parseInt(widget.style.top || 0, 10);
                if (currentX + 280 > window.innerWidth) {
                    let safeX = Math.max(0, window.innerWidth - 300);
                    widget.style.left = safeX + "px";
                    localStorage.setItem('itz_widget_pos', JSON.stringify({x: safeX, y: currentY}));}}}, true);

        titleRow.addEventListener("click", (e) => {
            if (!isDraggingOrMoved && !widget.classList.contains('itz-minimized')) {
                widget.classList.add('itz-minimized');
                localStorage.setItem('itz_widget_minimized', 'true');}});

        (function makeDraggable() {
            let dragging = false, ox = 0, oy = 0;
            let startX = 0, startY = 0;
            try {
                const saved = localStorage.getItem('itz_widget_pos');
                if (saved) {
                    const pos = JSON.parse(saved);
                    let x = Math.max(0, Math.min(pos.x, window.innerWidth - 50));
                    let y = Math.max(0, Math.min(pos.y, window.innerHeight - 50));
                    widget.style.transition = "none";
                    widget.style.transform = "none";
                    widget.style.left = x + "px";
                    widget.style.top = y + "px";
                    widget.style.right = "auto";}
            } catch (e) {}

            const onDown = (e) => {
                if (e.button !== undefined && e.button !== 0) return;
                dragging = true;
                isDraggingOrMoved = false;
                startX = e.clientX;
                startY = e.clientY;

                const target = widget.classList.contains("itz-minimized") ? widget : titleRow;
                target.setPointerCapture(e.pointerId);
                target.style.cursor = "grabbing";

                const r = widget.getBoundingClientRect();
                ox = e.clientX - r.left;
                oy = e.clientY - r.top;

                widget.style.transition = "none";
                widget.style.transform = "none";
                widget.style.top = r.top + "px";
                widget.style.right = "auto";
                widget.style.left = r.left + "px";};

            const onMove = (e) => {
                if (!dragging) return;
                if (!isDraggingOrMoved && (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3)) {
                    isDraggingOrMoved = true;}
                if (isDraggingOrMoved) {
                    const x = Math.max(0, Math.min(e.clientX - ox, window.innerWidth - widget.offsetWidth));
                    const y = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - widget.offsetHeight));
                    widget.style.left = x + "px";
                    widget.style.top = y + "px";}};

            const onUp = (e) => {
                if (!dragging) return;
                dragging = false;
                const target = widget.classList.contains("itz-minimized") ? widget : titleRow;
                try {
                    target.releasePointerCapture(e.pointerId);
                } catch(err) {}
                target.style.cursor = "pointer";
                widget.style.transition = "";
                const r = widget.getBoundingClientRect();
                try {
                    localStorage.setItem('itz_widget_pos', JSON.stringify({x: r.left, y: r.top}));
                } catch(e){}
                setTimeout(() => { isDraggingOrMoved = false; }, 50);};

            titleRow.addEventListener("pointerdown", onDown);
            titleRow.addEventListener("pointermove", onMove);
            titleRow.addEventListener("pointerup", onUp);

            widget.addEventListener("pointerdown", (e) => { if (widget.classList.contains("itz-minimized")) onDown(e); });
            widget.addEventListener("pointermove", (e) => { if (widget.classList.contains("itz-minimized")) onMove(e); });
            widget.addEventListener("pointerup", (e) => { if (widget.classList.contains("itz-minimized")) onUp(e); });})();

        const mkPB = (id, label) => {
            const wrap = document.createElement("div");
            wrap.className = "itz-progress-container";
            wrap.innerHTML = `
                <div class="itz-progress-label">
                    <span>${label}</span>
                    <span id="${id}-counter">0/0</span>
                </div>
                <div class="itz-progress-outer">
                    <div id="${id}" class="itz-progress-inner" style="width:0%"></div>
                </div>`;
            return wrap;};

        const userStatsDiv = document.createElement("div");
        userStatsDiv.id = "itz-user-stats";
        userStatsDiv.className = "itz-section";
        userStatsDiv.innerHTML = '<div style="font-size:13px;color:#a1a1aa;text-align:center;">Loading user data...</div>';

        const taskSection = document.createElement("div");
        taskSection.className = "itz-section";
        taskSection.appendChild(mkPB("itz-task-bar", "Tasks"));

        const chatDiv = document.createElement("div");
        chatDiv.className = "itz-section";
        chatDiv.id = "itz-ch-card";
        chatDiv.style = "cursor:pointer; padding: 12px; background: rgba(39, 39, 42, 0.4); border: 1px dashed rgba(167, 139, 250, 0.4); border-radius: 12px; transition: all 0.2s;";
        chatDiv.onmouseover = () => { chatDiv.style.background = "rgba(167, 139, 250, 0.1)"; chatDiv.style.borderColor = "var(--itz-accent)"; };
        chatDiv.onmouseout = () => { chatDiv.style.background = "rgba(39, 39, 42, 0.4)"; chatDiv.style.borderColor = "rgba(167, 139, 250, 0.4)"; };

        chatDiv.innerHTML = `
            <div class="itz-stat-row" style="margin-bottom:6px;">
                <span>💬 Chat</span>
                <span id="itz-ch-st" style="font-weight:800;font-size:12px;">...</span>
            </div>
            <div class="itz-stat-row" style="margin-bottom:8px; font-size:11px;">
                <span style="color:#a1a1aa;">Resetting in</span>
                <span id="itz-ch-cd" class="itz-val-timer" style="font-size:13px; font-weight:700; letter-spacing:0.5px;">--:--:--</span>
            </div>
            <div class="itz-progress-container">
                <div class="itz-progress-outer" style="height:6px; border-radius: 3px; background:rgba(0,0,0,0.3);">
                    <div id="itz-ch-pb" class="itz-progress-inner" style="width:0%; border-radius: 3px;"></div>
                </div>
            </div>`;

        const slotGiveawaysDiv = document.createElement("div");
        slotGiveawaysDiv.id = "itz-slot-giveaways";
        slotGiveawaysDiv.className = "itz-section";
        slotGiveawaysDiv.innerHTML = '<div style="font-size:13px;color:#a1a1aa;text-align:center;">Loading giveaways...</div>';

        widget.appendChild(userStatsDiv);
        widget.appendChild(taskSection);
        widget.appendChild(chatDiv);
        widget.appendChild(slotGiveawaysDiv);
        document.body.appendChild(widget);}

    function bt() {
        wCP();
        wg();
        uUS(); uTC(); uSGD(); uCS();
        setInterval(uUS, 30 * 1000);
        setInterval(uTC, 5 * 60 * 1000);
        setInterval(uSGD, 60 * 1000);
        setInterval(uCS, 10 * 1000);}

    if (document.readyState === "complete" || document.readyState === "interactive") { bt(); } else { window.addEventListener("DOMContentLoaded", bt); window.addEventListener("load", bt); }
})();
