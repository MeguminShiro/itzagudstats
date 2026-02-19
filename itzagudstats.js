// ==UserScript==
// @name        【月白】Itzagud Stats
// @description A tool to handle infos on Itzagud.
// @author      星空優月 & 💟 めぐ 🍫 みん (Megumin 💥) 💟
// @iconURL     https://www.itzagud.net/apple-touch-icon.png
// @match       *://www.itzagud.net/*
// @grant       none
// @run-at      document-start
// @version     0.1
// ==/UserScript==

(function () {
    'use strict';
    const iS = () => {
        if (document.getElementById("itzagud-styles")) return;
        const style = document.createElement("style");
        style.id = "itzagud-styles";
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
            :root {--itz-bg: rgba(9, 9, 11, 0.85);--itz-border: rgba(63, 63, 70, 0.4);--itz-glass: blur(12px);--itz-accent: #a78bfa;--itz-points: #fbbf24;--itz-clams: #ef4444;--itz-luck: #22c55e;--itz-timer: #38bdf8;--itz-font: 'Rajdhani', sans-serif;}
            #itzagud-widget {position: fixed;top: 50%;right: 20px;transform: translateY(-50%);z-index: 10000;width: 280px;font-family: var(--itz-font);background: var(--itz-bg);backdrop-filter: var(--itz-glass);-webkit-backdrop-filter: var(--itz-glass);border: 1px solid var(--itz-border);border-radius: 16px;padding: 16px;box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(167, 139, 250, 0.1);color: #f4f4f5;transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);}
            .itz-section {margin-bottom: 16px;}
            .itz-section:last-child {margin-bottom: 0;}
            .itz-user-card {background: rgba(39, 39, 42, 0.5);border: 1px solid var(--itz-border);border-radius: 12px;padding: 12px;display: flex;flex-direction: column;gap: 8px;}
            .itz-stat-row {display: flex;justify-content: space-between;align-items: center;font-size: 14px;font-weight: 600;}
            .itz-val-points { color: var(--itz-points); }
            .itz-val-clams { color: var(--itz-clams); }
            .itz-val-luck { color: var(--itz-luck); }
            .itz-val-timer { color: var(--itz-timer); }
            .itz-giveaway-grid {display: grid;grid-template-columns: 1fr 1fr;gap: 8px 12px;background: rgba(24, 24, 27, 0.4);border: 1px solid var(--itz-border);border-radius: 12px;padding: 12px;text-align: center;}
            .itz-label {font-size: 13px;color: var(--itz-accent);font-weight: 700;margin-bottom: 4px;}
            .itz-prize-img {width: 100%;max-width: 100px;margin: 0 auto;aspect-ratio: 16/9;object-fit: cover;border-radius: 6px;box-shadow: 0 4px 8px rgba(0,0,0,0.3);}
            .itz-prize-name {display: block;font-size: 13px;font-weight: 700;color: var(--itz-luck);text-decoration: none;line-height: 1.2;margin: 6px 0;}
            .itz-prize-name:hover { opacity: 0.8; }
            .itz-meta-val {font-size: 13px;font-weight: 700;padding: 2px 0;}`;
        document.head.appendChild(style);};

    function fC(endTime) {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return "Ended";
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hrs}h ${mins}m`;}

    async function fUD() {
        try {
            const res = await fetch("https://www.itzagud.net/api/me", { method: "GET", credentials: "include" });
            const data = await res.json();
            if (data.user) return data.user;
        } catch (err) { console.warn("Failed to fetch user data:", err); }
        return null;}

    async function fSG() {
        try {
            const res = await fetch("https://www.itzagud.net/slots/api/giveaway", { method: "GET", credentials: "include" });
            const data = await res.json();
            if (data.ok) return data.items || [];
        } catch (err) { console.warn("Failed to fetch slot giveaways:", err); }
        return [];}

    async function fSE() {
        try {
            const res = await fetch("https://www.itzagud.net/slots/api/my-entries", { method: "GET", credentials: "include" });
            const data = await res.json();
            if (data.ok) {
                return { oneHour: data.byKind.SLOTS_1H || 0, twentyFourHour: data.byKind.SLOTS_24H || 0 };}
        } catch (err) { console.warn("Failed to fetch slot entries:", err); }
        return { oneHour: 0, twentyFourHour: 0 };}

    async function uUS() {
        const user = await fUD();
        const container = document.getElementById("itz-user-stats");
        if (!container || !user) return;
        const wC = fC(user.wheelNextAt);
        container.innerHTML = `
            <div class="itz-user-card">
                <div class="itz-stat-row">
                    <span>🪙 Points</span>
                    <span class="itz-val-points">${user.points.toLocaleString()}</span>
                </div>
                <div class="itz-stat-row">
                    <span>💵 Clams</span>
                    <span class="itz-val-clams">${user.clams.toLocaleString()}</span>
                </div>
                <div class="itz-stat-row" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; margin-top: 2px;">
                    <span class="itz-val-luck">🍀 ${user.wheelDayEarned}/10</span>
                    <span class="itz-val-timer">⏰ ${wC}</span>
                </div>
            </div>
        `;}

    async function uSGD() {
        const giveaways = await fSG();
        const entries = await fSE();
        const container = document.getElementById("itz-slot-giveaways");
        if (!container) return;
        let html = `<div class="itz-giveaway-grid">`;
        giveaways.forEach((g, idx) => {
            const label = g.kind === "SLOTS_1H" ? "1H" : "24H";
            const tickets = g.kind === "SLOTS_1H" ? entries.oneHour : entries.twentyFourHour;
            const totalEntries = g.totalEntries || 0;
            const wR = totalEntries > 0 ? ((tickets / totalEntries) * 100).toFixed(2) : "0.00";
            const col = idx + 1;
            const sIM = g.prize.imageUrl.match(/steam\/apps\/(\d+)\//);
            const sID = sIM ? sIM[1] : null;
            const link = sID ? `https://s.team/a/${steamId}` : "https://www.itzagud.net/slots";
            html += `
                <div class="itz-label" style="grid-column:${col}; grid-row:1;">${label}</div>
                <div style="grid-column:${col}; grid-row:2;">
                    <img src="${g.prize.imageUrl}" alt="${g.prize.name}" class="itz-prize-img">
                </div>
                <div style="grid-column:${col}; grid-row:3;">
                    <a href="${link}" target="_blank" class="itz-prize-name">${g.prize.name}</a>
                </div>
                <div class="itz-meta-val" style="grid-column:${col}; grid-row:4; color:#facc15;">⌛ ${fC(g.endsAt)}</div>
                <div class="itz-meta-val" style="grid-column:${col}; grid-row:5; color:#93c5fd;">🎫 ${tickets.toLocaleString()}</div>
                <div class="itz-meta-val" style="grid-column:${col}; grid-row:6; color:var(--itz-luck);">📊 ${wR}%</div>
            `;});
        html += `</div>`;
        container.innerHTML = html;}

    function wg() {
        if (document.getElementById("itzagud-widget")) return;
        iS();
        const widget = document.createElement("div");
        widget.id = "itzagud-widget";
        widget.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px; border-bottom:1px solid var(--itz-border); padding-bottom:10px;">
                <img src="https://www.itzagud.net/favicon.ico" style="width:20px; height:20px;">
                <span style="font-weight:700; font-size:16px; letter-spacing:0.5px; color:var(--itz-accent);">ITZAGUD STATS</span>
            </div>

            <div id="itz-user-stats" class="itz-section">
                <div style="font-size: 13px; color: #a1a1aa; text-align: center;">Loading user data...</div>
            </div>

            <div id="itz-slot-giveaways" class="itz-section">
                <div style="font-size: 13px; color: #a1a1aa; text-align: center;">Loading giveaways...</div>
            </div>
        `;
        document.body.appendChild(widget);}

    function bt() {wg();uUS();uSGD();setInterval(uUS, 30 * 1000);setInterval(uSGD, 60 * 1000);}

    if (document.readyState === "complete" || document.readyState === "interactive") {bt();} else {window.addEventListener("DOMContentLoaded", bt);window.addEventListener("load", bt);}
})();
