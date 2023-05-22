/*
 * Web engineering course - University of L'Aquila
 * RESTful resources testing code
 *  
 */


"use strict";

function TestRestClient(base) {
    let bearer_token = null;
    let THIS = this;
	let baseURI = base;

  
    this.getToken = function () {
        return bearer_token;
    };

    let setToken = function (token) {
        bearer_token = token;
    };

    let extractTokenFromHeader = function (header) {
        return header.substring("Bearer".length).trim();
    };

    let sendRestRequest = function (method, url, callback, acceptType = null, payload = null, payloadType = null, authorization = null, async = true) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, async);
        if (authorization !== null)
            xhr.setRequestHeader("Authorization", authorization);
        if (payloadType !== null)
            xhr.setRequestHeader("Content-Type", payloadType);
        if (acceptType !== null)
            xhr.setRequestHeader("Accept", acceptType);
        if (async) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    callback(xhr);
                }
            };
        }		
        xhr.send(payload);
        if (!async) {
            callback(xhr);
		}
    };


    let makeResponseCallback = function (params) {
        return function (xhr) {            
			console.log("RESPONSE: ");
            console.log("* Headers: ");
            let headers = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
			headers.forEach((line) => {
				let parts = line.split(": ");
				let name = parts.shift();
				let value = parts.join(": ");
				console.log("** " + name + " = " + value);
			});
			console.log("* Return status: " + xhr.status + " (" + xhr.statusText + ")");
			if (xhr.responseText != null) {
				console.log(xhr.responseText);
			}
			if (xhr.getResponseHeader("Authorization") !== null) {
				let token = extractTokenFromHeader(xhr.getResponseHeader("Authorization"));
				console.log("got bearer token: " + token);
				setToken(token);
			}            
        };
    };
  
    let execute_and_dump = function (params, responseCallback = null, async = false) {
        
        responseCallback = makeResponseCallback(params);      
		console.log(params.description);
		console.log("REQUEST: ");
		console.log("* Metodo: " + params.method);
		console.log("* URL: " + params.url);
		if (params.acceptType !== null) {
			console.log("* Accept: " + params.acceptType);
		}
		if (params.authorization !== null) {
			console.log("* Authorization: " + params.authorization);
		}            
		switch (params.method.toUpperCase()) {
			case "POST":
			case "PUT":		
			case "PATCH":		
				console.log("* Payload: "+params.payload);
				console.log("* Tipo payload: " + params.payloadType);
				break;             
			default:
				break;
		}				
        sendRestRequest(params.method, params.url, responseCallback, params.acceptType, params.payload, params.payloadType, params.authorization, async);
    };

    ///////////////////// public object methods


    this.doTests = function () {
		
		let dummy_json_entry = "{\"venditore\":{\"ragioneSociale\":\"MWT\",\"partitaIVA\":\"123456789\",\"via\":\"\",\"citta\":\"L'Aquila\",\"civico\":\"\"},\"intestazione\":{\"ragioneSociale\":\"Acquirente 505\",\"partitaIVA\":\"123456789505\",\"via\":\"\",\"citta\":\"Roma\",\"civico\":\"\"},\"numero\":1234,\"data\":\"08/10/2020\",\"prodotti\":[{\"codice\":\"P505-0\",\"descrizione\":\"Prodotto P505-0\",\"quantita\":1,\"unita\":\"N\",\"prezzoUnitario\":0.0,\"sconto\":0,\"prezzoTotale\":0.0,\"iva\":22},{\"codice\":\"P505-1\",\"descrizione\":\"Prodotto P505-1\",\"quantita\":1,\"unita\":\"N\",\"prezzoUnitario\":10.0,\"sconto\":0,\"prezzoTotale\":10.0,\"iva\":22},{\"codice\":\"P505-2\",\"descrizione\":\"Prodotto P505-2\",\"quantita\":1,\"unita\":\"N\",\"prezzoUnitario\":20.0,\"sconto\":0,\"prezzoTotale\":20.0,\"iva\":22},{\"codice\":\"P505-3\",\"descrizione\":\"Prodotto P505-3\",\"quantita\":1,\"unita\":\"N\",\"prezzoUnitario\":30.0,\"sconto\":0,\"prezzoTotale\":30.0,\"iva\":22},{\"codice\":\"P505-4\",\"descrizione\":\"Prodotto P505-4\",\"quantita\":1,\"unita\":\"N\",\"prezzoUnitario\":40.0,\"sconto\":0,\"prezzoTotale\":40.0,\"iva\":22}],\"modalitaPagamento\":\"CONTANTI\",\"totali\":{\"22\":{\"imponibile\":100.0,\"imposta\":0.0,\"generale\":0.0}},\"totaleGenerale\":{\"imponibile\":100.0,\"imposta\":0.0,\"generale\":100.0}}";
        
		execute_and_dump({
			description: "1 -- Lista entries (JSON)",
			url: baseURI + "/fatture",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: null
		});
		
		execute_and_dump({
			description: "1bis -- Numero entries (JSON)",
			url: baseURI + "/fatture/count",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: null
		});
		
		execute_and_dump({
			description: "3 -- Singola entry (JSON)",
			url: baseURI + "/fatture/2020/1234",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: null
		});
		
		execute_and_dump({
			description: "5 -- Filtraggio collection tramite parametri GET",
			url: baseURI + "/fatture?partitaIVA=8574557",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: null
		});
		
		execute_and_dump({
			description: "6 -- Creazione entry",
			url: baseURI + "/fatture",
			method: "POST",
			payload: dummy_json_entry,
			payloadType:  "application/json",
			acceptType: "application/json",
			authorization: null
		});
		
		execute_and_dump({
			description: "7 -- Aggiornamento entry",
			url: baseURI + "/fatture/2020/12345",
			method: "PUT",
			payload: dummy_json_entry,
			payloadType:  "application/json",
			acceptType: null,
			authorization: null
		});
		
		execute_and_dump({
			description: "8 -- Eliminazione entry",
			url: baseURI + "/fatture/2020/12345",
			method: "DELETE",
			payload: null,
			payloadType:  null,
			acceptType: null,
			authorization: null
		});
		
		execute_and_dump({
			description: "9 -- Dettaglio entry (JSON",
			url: baseURI + "/fatture/2020/12345/elementi",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: null
		});
		
		execute_and_dump({
			description: "10 -- Login",
			url: baseURI + "/auth/login",
			method: "POST",
			payload: "username=u&password=p",
			payloadType:  "application/x-www-form-urlencoded",
			acceptType: null,
			authorization: null
		});
		
		execute_and_dump({
			description: "11a -- Collezione per anno (richiesta soggetta ad autenticazione)",
			url: baseURI + "/fatture/2020",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: "Bearer " + THIS.getToken()
		});
		
		execute_and_dump({
			description: "11b -- Collezione per anno (tentativo senza autenticazione)",
			url: baseURI + "/fatture/2020",
			method: "GET",
			payload: null,
			payloadType:  null,
			acceptType: "application/json",
			authorization: null
		});	  
	};


    /////////////////////
  
}
