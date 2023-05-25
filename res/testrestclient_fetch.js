/*
 * Web engineering course - University of L'Aquila
 * RESTful resources testing code
 *  
 */

"use strict";
function TestRestClient_Fetch() {
    let bearer_token = null;
    let THIS = this;
    let runTests = true;

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


    let sendRestRequest = function (method, url, acceptType = null, payload = null, payloadType = null, authorization = null, abortcontroller = null) {

        let fetchparams = {
            "method": method,
            "body": payload,
            "headers": {}
        };


        //https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
        if (abortcontroller) {
            fetchparams.signal = abortcontroller.signal;
        } else {
            fetchparams.signal = AbortSignal.timeout(2000);
        }
        if (authorization)
            fetchparams.headers["Authorization"] = authorization;
        if (acceptType)
            fetchparams.headers["Accept"] = acceptType;
        if (payloadType)
            fetchparams.headers["Content-Type"] = payloadType;

        //https://developer.mozilla.org/en-US/docs/Web/API/fetch
        return fetch(url, fetchparams);
    };

    let logResponse = async function (response, out) {
        out.divider();
        out.log("RESPONSE: ");
        out.log("* Headers: ");
        for (let header of response.headers) {
            out.log("** " + header[0] + " = " + header[1]);
        }
        out.log("* Return status: " + response.status + " (" + response.statusText + ")");
        let responseText = await response.text();
        if (responseText !== null) {
            out.log(sanitizeHTML(responseText));
        }
        //capture returned bearer token
        if (response.headers.has("Authorization")) {
            THIS.setToken(response.headers.get("Authorization").substring("Bearer".length).trim());
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
            await logResponse(response, out);
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
