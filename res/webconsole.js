/*
 * Web engineering course - University of L'Aquila
 *  
 */

"use strict";
function WebConsole(containerid) {
    let container = document.getElementById(containerid);
    let loglines = 0;
    let id = null;
    let THIS = this;


    this.clear = function () {
        container.textContent="";
    };

    this.log = function (...args) {
        let arg;
        for (arg of args)
            container.appendChild(generateLogLine(arg, "line"));
    };

    this.success = function (...args) {
        let arg;
        for (arg of args)
            container.appendChild(generateLogLine(arg, "line", "success"));
    };

    this.error = function (...args) {
        let arg;
        for (arg of args)
            container.appendChild(generateLogLine(arg, "line", "error"));
    };

    this.heading = function (title) {
        container.appendChild(generateLogLine(title, "heading"));
    };

    this.divider = function () {
        container.appendChild(generateLogLine(null, "divider"));
    };

    let generateLogLine = function (s, c = "line", ec = null) {
        let line = container.ownerDocument.createElement("div");
        line.className = c;
        if (ec)
            line.classList.add(ec);
        line.id = id + "-" + (++loglines);
        if (s)
            line.innerHTML = s;
        return line;
    };

    let randomID = function () {
        let rid = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < 12; i++) {
            rid += characters.charAt(Math.floor(Math.random() * 36));
        }
        return rid;
    };

    let init = function () {
        container.classList.add("webconsole");
        if (container.id)
            id = container.id;
        else
            id = randomID();
        container.innerHtml = "";
    };

    init();
}