/*
 * Web engineering course - University of L'Aquila
 * RESTful resources testing code
 *  
 */

"use strict";
function TestRestClient_XHR() {
    let bearer_token = null;
    let THIS = this;
    let runTests = true;

//test requests to perform


    let htmlReserved = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    function replacePairs(s, pairs) {
        var re = new RegExp(Object.keys(pairs).join("|"), "gi");
        return s.replace(re, (m) => pairs[m.toLowerCase()]);
    }

    function sanitizeHTML(s) {
        return replacePairs(s, htmlReserved);
    }


    let sendRestRequest = function (method, url, acceptType = null, payload = null, payloadType = null, authorization = null) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.timeout = 2000; //request timeout 2 seconds
            xhr.open(method, url, true);
            if (authorization)
                xhr.setRequestHeader("Authorization", authorization);
            if (payloadType)
                xhr.setRequestHeader("Content-Type", payloadType);
            if (acceptType)
                xhr.setRequestHeader("Accept", acceptType);
            xhr.onload = function () {
                resolve(xhr);
            };
            xhr.onerror = function () { //handles request errors (NOT error status codes)
                reject("Network error");
            };
            xhr.ontimeout = (e) => { //handles request timeout
                reject("Request timeout");
            };
            xhr.send(payload);
        });
    };

    let logResponse = function (xhr, out) {
        out.divider();
        out.log("RESPONSE: ");
        out.log("* Headers: ");
        let headers = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
        headers.forEach((line) => {
            let parts = line.split(": ");
            let name = parts.shift();
            let value = parts.join(": ");
            out.log("** " + name + " = " + value);
        });
        out.log("* Return status: " + xhr.status + " (" + xhr.statusText + ")");
        if (xhr.responseText !== null) {
            out.log(sanitizeHTML(xhr.responseText));
        }
        //capture returned bearer token
        if (xhr.getResponseHeader("Authorization") !== null) {
            THIS.setToken(xhr.getResponseHeader("Authorization").substring("Bearer".length).trim());
        }
    };

    let logRequest = function (params, out) {
        out.heading(params.description);
        out.log("REQUEST: ");
        out.log("* Method: " + params.method);
        out.log("* URL: " + params.url);
        if (params.acceptType !== null) {
            out.log("* Accept: " + params.acceptType);
        }
        if (params.authorization) {
            out.log("* Authorization: " + params.authorization);
        }
        switch (params.method.toUpperCase()) {
            case "POST":
            case "PUT":
            case "PATCH":
                out.log("* Payload: " + params.payload);
                out.log("* Payload type: " + params.payloadType);
                break;
            default:
                break;
        }
    };

    let patchRequest = function (params) {
        if (params.authorization === true)
            params.authorization = "Bearer " + THIS.getToken();
        if (!params.method)
            params.method = "GET";
        return params;
    };

    let execute = function (params) {
        params = patchRequest(params);
        //https://developer.mozilla.org/en-US/docs/Web/API/Response
        return sendRestRequest(params.method, params.url, params.acceptType, params.payload, params.payloadType, params.authorization);
    };

    let execute_and_dump = async function (params, out) {
        if (out.constructor.name !== "WebConsole")
            throw "Only WebConsole output is currently supported";
        params = patchRequest(params);
        logRequest(params, out);
        try {
            let response = await execute(params);
            logResponse(response, out);
        } catch (e) {
            out.error(e);
        }
    };

    ///////////////////// public object methods

    //returns the current bearer token
    this.getToken = function () {
        return bearer_token;
    };

    //sets the bearer token
    this.setToken = function (token) {
        bearer_token = token;
    };

    this.doTests = async function (tests, out) {
        runTests = true;
        for (let params of tests) {
            if (runTests)
                await execute_and_dump(params, out);
        }
    };

    this.stopTests = function () {
        runTests = false;
    };


    this.test = function (params, out) {
        return execute_and_dump(params, out);
    };

    this.call = function (params) {
        return execute(params);
    };
}
