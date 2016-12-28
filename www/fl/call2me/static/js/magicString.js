/*
    Designed  by Ivan Dmitirev

    If you work with this code and have any questions,
    you can use my e-mail: ivas1256@yandex.ru
*/

var services = ["facebook messenger", "google hangouts", "google allo", "yahoo messenger", "facebook", "whatsapp", "viber", "skype", "telegram", "imessage", "slack", "snapchat", "line", "wechat", "kik", "icq", "imo.im", "kakaotalk", "linkedin", "vk", "ok", "phone", "e-mail"];
var statuses = ["online", "offline", "busy", "sport", "lunch"];
var actions = ["call", "message", "meet", "conference", "lunch"];
var what = ["drive", "file", "presentation"];
var keyWords = ["share", "message", "remind", "send", "save"];

var hashTagPattern = /#[a-zA-Z0-9_-]+(\s#\w+)*/;
var telephonePattern = /(\s\+\d(\(|-)[0-9]{3}(\)|-)[0-9]{7})|(\s[0-9]{11})|(\s\+[0-9]{11})|(\s\d(\(|-)[0-9]{3}(\)|-)[0-9]{3}(-[0-9]{2}){2})/;
var emailPattern = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
var urlPattern = /(https|http:\/\/)((?!facebook|fb|web\.|m\.)[\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.]*)*\/?/;
var FBPattern = /(https|http:\/\/)(([\w\.]+(facebook|fb))|((facebook|fb)))\.([a-z]{2,6}\.?)(\/[\w\.]*\?id=\d*|\/[\w\.]*)*\/?/;
var namePattern = /([A-ZА-Я]\w+(\s|$)){1,2}/;//used to determinate "whom" in Share, Send pattern
var fileNamePattern = /^\w+\.[a-zA-Z0-9]{2,6}$/;
var timePattern = /(in\s\d{1,2}\s(hours|mins))|(at\s\d{1,2}\s(pm|am|PM|AM))|(\d{1,2}:\d{1,2)/;

var shareRemindPattern = /(Share.*)((Call|Message|Meet|Conference|Lunch).*)/;
var shareSendPattern = /(Share.*)(Send(.*to.*))/;
var saveSharePattern = /((Save|(([A-ZА-Я]\w+(\s|$)){1,2})).*)((Share.*)(to.*))/;
var saveSendPattern = /((Save|(([A-ZА-Я]\w+(\s|$)){1,2})).*)((Send.*to)(.*))/;

var keys = [], values = [];
var counter = 1;
var ids = [];

//add new element
function addToken(key, value) {
    if (value != undefined) {
        if (value.trim() != "") {
            keys.push(key);
            values.push(value.trim());
        }
    }
}
//return element with key==key
function getToken(key) {
    return values[keys.indexOf(key)];
}

function printTokens(){
    keys.forEach(function (item,i, keys){
        console.log(counter + ")" + item + "={" + values[keys.indexOf(item)] + "}");
        keys[i] += "_READED";
        counter++;
    });
}

function printIds() {
    ids.forEach(function (item, i, keys) {
        console.log(i + ")" + item + "={" + item + "}");
    });
}

function GetQueryString() {
    var rez;
    keys.forEach(function (item, i, keys) {
        rez += item.replace("_READED", "") + "=" + encodeURIComponent(values[keys.indexOf(item)]) + "&";
    });
    return rez.replace("undefined", "");
}

function DoMagic() {
    var input = document.getElementById("magic-string-input").value;
    if (input === "")
        return;
    keys = []; values = []; counter = 1;    
    var arrayOfTokens = input.split(" ");

    if (arrayOfTokens.length == 1) {
        DoQuickSearch(input);
        printTokens();
        return;
    } else {
        var match = input.match(namePattern);
        if (match != null && FindVia(input) == "" && arrayOfTokens.length == 2 && input.indexOf("#") == -1) {
            DoQuickSearch(input);
            printTokens();

            return;
        }
    }

    if (services.indexOf(arrayOfTokens[0].toLowerCase()) == -1 && statuses.indexOf(arrayOfTokens[0].toLowerCase()) == -1 &&
        actions.indexOf(arrayOfTokens[0].toLowerCase()) == -1 && what.indexOf(arrayOfTokens[0].toLowerCase()) == -1 &&
        keyWords.indexOf(arrayOfTokens[0].toLowerCase()) == -1) {
        var tmp = services.indexOf(arrayOfTokens[0])

        var regexp = new RegExp(hashTagPattern);
        if ((regexp.test(arrayOfTokens[1]) || regexp.test(arrayOfTokens[2])) && FindVia(input) === "")
            DoMarkPattern(input);
        else
            DoSaveUpdatePattern(input);
    }
    else {
        var regexp = new RegExp(hashTagPattern);
        if (regexp.test(input) && input.indexOf("Send") == -1) {
            DoMarkPattern(input);
            console.log("Tokens:")
            printTokens();
            return;
        }

        var match;
        regexp = new RegExp(shareRemindPattern);
        if (regexp.test(input)) {
            console.log("input = {" + input + "}");
            console.log("It's ShareRemind pattern");
            match = input.match(shareRemindPattern);
            DoSharePattern(match[1]);
            DoRemindPattern(match[2] + " " + getToken("name") + " " + ChooseVia());
            console.log("Tokens:")
            printTokens();
            return;
        }

        regexp = new RegExp(shareSendPattern);
        if (regexp.test(input)) {
            console.log("input = {" + input + "}");
            console.log("It's ShareSend pattern");
            match = input.match(shareSendPattern);
            DoSharePattern(match[1]);
            addToken("note", match[3]);
            
            console.log("Tokens:")
            printTokens();
            return;
        }

        regexp = new RegExp(saveSharePattern);
        if (regexp.test(input)) {
            console.log("input = {" + input + "}");
            console.log("It's SaveShare pattern");
            match = input.match(saveSharePattern);
            DoSaveUpdatePattern(match[1]);
            DoSharePattern(match[7] + getToken("name") + " " + match[8] + " " + ChooseVia());
            console.log("Tokens:")
            printTokens();
            return;
        }

        regexp = new RegExp(saveSendPattern);
        if (regexp.test(input)) {
            console.log("input = {" + input + "}");
            console.log("It's SaveSend pattern");
            match = input.match(saveSendPattern);
            DoSaveUpdatePattern(match[1]);
            DoSendPattern(match[7] + getToken("name") + " " + match[8]);
            console.log("Tokens:")
            printTokens();
            return;
        }

        switch (arrayOfTokens[0].toLowerCase()) {
            case "share":
                DoSharePattern(input);
                break;
            case "send":
                DoSendPattern(input);
                break;
            case "save":
                DoSaveUpdatePattern(input);
                break;
            default:
                if (statuses.indexOf(arrayOfTokens[0].toLowerCase()) != -1)
                    DoStatusPattern(input);
                else
                    if (actions.indexOf(arrayOfTokens[0].toLowerCase()) != -1)
                        DoRemindPattern(input);
                    else {
                        console.error("Шаблон не распознан");
                    }
            break;
        }
    }
    console.log("Tokens:")
    printTokens();
}

function ChooseVia() {
    var via;
    if (getToken("via") != ("default" || undefined)) {
        via = getToken("phone");
        if (via == "default" || via == undefined) {
            via = getToken("facebook");
            if (via == "default" || via == undefined) {
                via = getToken("email");
                if (via == "default" || via == undefined)
                    via = getToken("website");
            }
        }
    } else
        via = getToken("via");
    return via;
}
    
function DoQuickSearch(input) {
    console.log("input = {" + input + "}");
    console.log("It's QuickSearch pattern");

    var json;
    var via = FindVia(input);
    if (via.indexOf('|') != -1) {
        tmp = via.split('|');
        //console.log(tmp[0] + "=" + "{" + tmp[1] + "}")
        id = GetContactId(tmp[1]);
        addToken(tmp[0], tmp[1]);
        json = GetContactId(tmp[1]);
        if(json != null)
            ids.push(json[0].id);
    } else {
        var match = input.match(hashTagPattern);
        if (match != null) {
            //console.log("hashtag= {" + match[0] + "}");
            addToken("hashtag", match[0]);
        } else {
            //console.log("name= {" + input + "}");            
            json = GetContactId(input);
            if (json != null)
                ids.push(json.contacts[0].id);
            addToken("name", input);
        }
    }

    if (json != null) {
        $(".js-search-alert").hide();
        $("div[data-alert='result'").show();

        document.getElementsByClassName('js-search-result-count')[0].innerText = json.contacts.length;

        t = document.getElementsByClassName('result-list js-search-result');
        json.contacts.forEach( function(item, i , _contacts){
            var elLi = document.createElement('li');
            elLi.setAttribute('data-id', item.id);

            var elDiv = document.createElement('div');
        
                elDiv.className = 'result-avatar';
                    var ela = document.createElement('a');
                    ela.href = '#';
                    ela.innerHTML = '<img src="' + item.avatar + '" alt="">';
                    var keys = Object.keys(item);
                    for(var ii = 0; ii< keys.length - 1; ii++)
                        ela.setAttribute('data-' + keys[ii], item[keys[ii]]);
                elDiv.appendChild(ela);
                elLi.appendChild(elDiv);

                elDiv = document.createElement('div');
                elDiv.className = 'result-name';
                elDiv.innerText = item.name;
                elDiv.setAttribute('onClick', 'ClickSearchAlerts(this.parentNode.getAttribute("data-id"))');
                elLi.appendChild(elDiv);

                elDiv = document.createElement('div');
                elDiv.className = 'result-phone';
                elDiv.innerText = item.phone;
                elDiv.setAttribute('onClick', 'ClickSearchAlerts(this.parentNode.getAttribute("data-id"))');
                elLi.appendChild(elDiv);

                elDiv = document.createElement('div');
                elDiv.className = 'result-social';
                    var fields = Object.keys(item.fields);
                    for (var j = 0; j < fields.length; j++) {
                        var key = fields[j];
                        var elA = document.createElement('a');
                        elA.setAttribute('src', '/static/content/imgs/services/' + key + '.svg');
                        elA.href = '#';
                        elA.setAttribute('alt', key);
                    
                        elDiv.appendChild(elA);
                    }
                elLi.appendChild(elDiv)

                elDiv = document.createElement('div');
                elDiv.className = 'result-options';
                    var elA = document.createElement('a');
                    elA.className = 'js-search-result-edit';
                    elA.href = '#';
                    keys = Object.keys(item);
                    for (var ii = 0; ii < keys.length - 1; ii++)
                        elA.setAttribute('data-' + keys[ii], item[keys[ii]]);
                    elA.innerHTML = '<img src="/static/imgs/icons/edit.svg" alt="">';
                elDiv.appendChild(elA);
                    elA = document.createElement('a');
                    elA.className = 'js-search-result-remove';
                    elA.href = '#';
                    elA.setAttribute('data-id', item.id);
                    elA.setAttribute('onClick', 'ClickDeleteAlerts(this.getAttribute("data-id"))')
                    elA.innerHTML = '<img src="/static/imgs/icons/delete.svg" alt="">';
                    elDiv.appendChild(elA);
                elLi.appendChild(elDiv);
            t[0].appendChild(elLi);
        });
    }
    else {
        $(".js-search-alert").hide();
        $("div[data-alert='result'").show();

        document.getElementsByClassName("js-search-result-count")[0].innerText = 0;
        console.error("Server returned empty json result");
    }
}

function DoSaveUpdatePattern(input) {
    console.log("input = {" + input + "}");
    console.log("It's SaveUpdate pattern");

    var match = input.match(/(S|s)(A|a)(V|v)(E|e)/)
    if(match != null)
        input = input.replace(match[0], "");
    match = input.match(telephonePattern);
    if(match != null)
        var phone = match[0];
    match = input.match(emailPattern);
    if(match != null)
        var email = match[0];
    match = input.match(urlPattern);
    if(match != null)
        var website = match[0];
    match = input.match(hashTagPattern);
    if (match != null)
        var tags = match[0];

    var match = input.match(FBPattern);
    var fb;
    if(match != null)
        if (match[8] != null)
            if (match[8].indexOf("profile.php") != -1)
                fb = match[0];
            else
                fb = ParseFBLink(match);
        else
            fb = ParseFBLink(match);

    var realFB;
    if (match != null)
        realFB = match[0];

    var strIndexes = [input.indexOf(phone), input.indexOf(email), input.indexOf(realFB), input.indexOf(website), input.indexOf(tags)];
        var minIndex = 999;
        for(var i = 0; i < strIndexes.length; i++){
            if (strIndexes[i] != -1 && strIndexes[i] < minIndex)
                minIndex = strIndexes[i];
        }
    var name = input.slice(0, minIndex);
    var note = input.replace(name, "").replace(phone, "").replace(email, "").replace(realFB, "").replace(website, "").replace(tags, "");

    addToken("name", name);
    addToken("phone", phone);
    addToken("email", email);
    addToken("facebook", fb);
    addToken("website", website);
    addToken("note", note);
    addToken("hashtag", tags);

    var json = GetContactId(name);
    if (json != null) {
        var id = json.contacts[0].id;
        ids.push(id);

        $("input.js-search-name").val(json.contacts[0].name);
        $("input.js-search-phone").val(getToken("phone") == json.contacts[0].phone ? json.contacts[0].phone : getToken("phone"));
        $("input.js-search-email").val(getToken("email") == json.contacts[0].email ? json.contacts[0].email : getToken("email"));
        $("input.js-search-tags").val(json.contacts[0].group);
        $("input.js-search-organization").val(getToken("organization") == json.contacts[0].organization ? json.contacts[0].organization : getToken("organization"));
    }
    else {
        $("input.js-search-name").val(getToken("name"));
        $("input.js-search-phone").val(getToken("phone"));
        $("input.js-search-email").val(getToken("email"));
        $("input.js-search-tags").val(getToken("hashtag"));
        console.error("Server return empty json result");
    }
    $(".js-search-alert").hide();
    $("div[data-alert='create']").show();
}

function ParseFBLink(match) {
    return "https://facebook.com" + match[8];
}

function DoSharePattern(input) {
    console.log("input = {" + input + "}");
    console.log("It's Share pattern");

    var parts = input.split("to");
    var service;
    var isUsed = false;
    services.forEach(function (item, i, services) {
        var i = parts[0].toLowerCase().indexOf(item)
        if (i != -1 && !isUsed) {
            isUsed = true;
            i = i === 0 ? 0 : i--;
            var currChar = "";
            var counter = 0;
            while (currChar != undefined && currChar != null && currChar != ' ') {
                currChar = parts[0].trim()[i];
                service += currChar;
                i++;

                if (currChar === ' ' && counter <= 2) {
                    if (service.toLowerCase().indexOf("google") != -1 ||
                        service.toLowerCase().indexOf("yahoo") != -1 ||
                        service.toLowerCase().indexOf("facebook") != -1 ||i == parts[0].toLowerCase().indexOf(item)) {
                        currChar = parts[0].charAt(i);
                        service += currChar;
                        i++;
                        counter++;
                    }
                }
            }
            service = service.replace(/undefined/g, '');
        }
    });

    var name = parts[0].replace(service, "").replace(/((S|s)(H|h)(A|a)(R|r)(E|e)\s)/, "");

    var via = FindVia(parts[1]);
    if (via == "") {
        isUsed = false;
        services.forEach(function (item, i, services) {
            var i = parts[1].toLowerCase().indexOf(item)
            if (i != -1 && !isUsed) {
                isUsed = true;
                i = i === 0 ? 0 : i--;
                var currChar = "";
                var counter = 0;
                    while (currChar != undefined && currChar != null && currChar != ' ' ) {
                        currChar = parts[1].trim()[i];
                        via += currChar;
                        i++;

                        if (currChar == ' ' && counter <= 2) {
                            if (via.toLowerCase().indexOf("google") != -1 ||
                                via.toLowerCase().indexOf("yahoo") != -1 ||
                                via.toLowerCase().indexOf("facebook") != -1 || i == parts[1].toLowerCase().indexOf(item)) {
                                currChar = parts[1].charAt(i);
                                via += currChar;
                                i++;
                                counter++;
                            }
                        }
                    }
                    via = via.replace(/undefined/g, '');
                }
            });
    }

    var match = parts[1].replace(via,"").match(namePattern);
    var whom;
    if (match != null)
        whom = match[0];
    var note = parts[1].replace(via, "").replace(whom, "").replace("by", "").replace("By", "");

    var note;
    addToken("name", name);
    addToken("service", service);
    addToken("whom", whom);
    
    if (via.indexOf('|') != -1) {
        tmp = via.split('|');
        note = parts[1].replace(tmp[1], "").replace(whom, "");
        //console.log(tmp[0] + "=" + "{" + tmp[1] + "}")
        addToken(tmp[0], tmp[1]);
    } else {
        note = parts[1].replace(via.trim(), "").replace(whom, "");
        //console.log("via= {" + via + "}");
        addToken("via", via);
    }
    addToken("note", note);

    var jsonName = GetContactId(name);
    var jsonWhom = GetContactId(whom);
    if(jsonName != null && jsonWhom != null){
        var idName = jsonName.contacts[0].id;
        var idWhom = jsonWhom.contacts[0].id;
        ids.push(idName);
        ids.push(idWhom);
    }
    else {
        console.error("Server returned empty json result");
    }
}

function DoRemindPattern(input) {
    console.log("input = {" + input + "}");
    console.log("It's Remind pattern");

    var action;
    var isUsed = false;
    actions.forEach(function (item, i, actions) {
        var i = input.toLowerCase().indexOf(item)
        if (i != -1 && !isUsed) {
            isUsed = true;
            i = i === 0 ? 0 : i--;
            var currChar = "";
            var counter = 0;
            while (currChar != undefined && currChar != null && currChar != ' ') {
                currChar = input.trim()[i];
                action += currChar;
                i++;

                if (currChar == ' ' && counter <= 2) {
                    if (i == input.toLowerCase().indexOf(item)) {
                        currChar = input.charAt(i);
                        action += currChar;
                        i++;
                        counter++;
                    }
                }
            }
            action = action.replace(/undefined/g, '');
        }
    });
    if (action == "") {
        console.error("Param [action] not detected");
    }

    var via = FindVia(input);
    if (via == "") {
        isUsed = false;
        services.forEach(function (item, i, services) {
            var i = input.toLowerCase().indexOf(item)
            if (i != -1 && !isUsed) {
                isUsed = true;
                i = i === 0 ? 0 : i--;
                var currChar = "";
                var counter = 0;
                while (currChar != undefined && currChar != null && currChar != ' ') {
                    currChar = input.trim()[i];
                    via += currChar;
                    i++;

                    if (currChar == ' ' && counter <= 2) {
                        if (via.toLowerCase().indexOf("google") != -1 ||
                            via.toLowerCase().indexOf("yahoo") != -1 ||
                            via.toLowerCase().indexOf("facebook") != -1 || i == input.toLowerCase().indexOf(item)) {
                            currChar = input.charAt(i);
                            via += currChar;
                            i++;
                            counter++;
                        }
                    }
                }
                via = via.replace(/undefined/g, '');
            }
        });
    }
    if (via == "") {
        console.error("Param [via] not detected");
    }

    var match = input.match(timePattern);
    var time;
    if (match != null)
        time = match[0];
    else {
        console.error("Param [time] not detected");
    }

    match = input.replace(action, "").replace(via, "").replace(time, "").match(namePattern);
    var name;
    if (match != null)
        name = match[0];
    else {
        console.error("Param [name] not detected");
    }

    var note;
    addToken("action", action);
    addToken("name", name);
    addToken("time", time);    
    if (via.indexOf('|') != -1) {
        tmp = via.split('|');
        //console.log(tmp[0] + "=" + "{" + tmp[1] + "}")
        note = input.replace(action, "").replace(tmp[1], "").replace(time, "").replace(name, "").replace("by", "").replace("By", "");
        addToken(tmp[0], tmp[1]);
    } else {
        //console.log("via= {" + via + "}");
        note = input.replace(action, "").replace(via.trim(), "").replace(time, "").replace(name, "").replace("by", "").replace("By", "");
        addToken("via", via);
    }
    addToken("note", note);

    var json = GetContactId(name);
    if (json != null) {
        var id = json.contacts[0].id;
        ids.push(id);
    }
    else {
        console.error("Server returned empty json result");
    }
}

function DoSendPattern(input) {
    console.log("input = {" + input + "}");
    console.log("It's Send pattern");

    var parts = input.split(" to ");
    var _what = parts[0].replace(/((S|s)(E|e)(N|n)(D|d)\s)/, "");
        var match = _what.match(fileNamePattern);
        if(match == null){
            var isMatch = false;
            var isUsed
            what.forEach( function (item, i , what) {
                if (_what.toLowerCase().indexOf(item) != -1) {
                    isMatch = true;
                    return;
                }
            });
            if (!isMatch) {
                console.error("Param [what] not detected");
            }
        }

    var via = FindVia(parts[1]);
    if (via === "") {
        services.forEach(function (item, i, services) {
            var i = parts[1].toLowerCase().indexOf(item)
            if (i != -1 && !isUsed) {
                isUsed = true;
                i = i === 0 ? 0 : i--;
                var currChar = "";
                var counter = 0;
                while (currChar != undefined && currChar != null && currChar != ' ') {
                    currChar = parts[1].trim()[i];
                    via += currChar;
                    i++;
                     
                    if (currChar == ' ' && counter <= 2) {
                        if (via.toLowerCase().indexOf("google") != -1 ||
                            via.toLowerCase().indexOf("yahoo") != -1 ||
                            via.toLowerCase().indexOf("facebook") != -1 || i == parts[1].toLowerCase().indexOf(item)) {
                            currChar = parts[1].charAt(i);
                            via += currChar;
                            i++;
                            counter++;
                        }
                    }
                }
                via = via.replace(/undefined/g, '');
            }
        });
    }

    match = parts[1].match(namePattern);
    var toSubject;//name || hashtag
    if (match != null) 
        toSubject = "name|" + match[0]
    else {
        match = parts[1].match(hashTagPattern);
        if (match != null)
            toSubject = "hashtag|" + match[0];
    }
        
    var note;
    //console.log("what= {" + _what + "}");
    addToken("what", _what);
    var tmp = toSubject.split('|');
    //console.log(tmp[0] + "=" + "{" + tmp[1] + "}");
    addToken(tmp[0], tmp[1]);
    if (via.indexOf('|') != -1) {
        tmp = via.split('|');
        note = parts[1].replace(match[0], "").replace(tmp[1], "").replace("by", "").replace("By", "");
        //console.log(tmp[0] + "=" + "{" + tmp[1] + "}")
        addToken(tmp[0], tmp[1]);
    } else {
        note = parts[1].replace(match[0], "").replace(via.trim(), "").replace("by", "").replace("By", "");
        //console.log("via= {" + via + "}");
        addToken("via", via);
    }
    //console.log("note = {" + note + "}");
    addToken("note", note);
    
    var json = GetContactId(name);
    if (json != null) {
        var id = json.contacts[0].id;
        ids.push(id);
    }
    else
        console.log("Server returned empty json result");
}

function FindVia(input) {
    var match = input.match(/(\+\d(\(|-)[0-9]{3}(\)|-)[0-9]{7})|([0-9]{11})|(\d(\(|-)[0-9]{3}(\)|-)[0-9]{3}(-[0-9]{2}){2})/);
    if (match != null) 
        return "phone|" + match[0]
    match = input.match(emailPattern);
    if(match != null)
        return "email|" + match[0]
    match = input.match(urlPattern);
    if(match != null)
        return "url|" + match[0]
    match = input.match(FBPattern);
    if (match != null)
        return "facebook|" + ParseFBLink(match[0]);

    return "";
}

function DoMarkPattern(input) {
    console.log("input = {" + input + "}");
    console.log("It's Mark pattern");

    var match = input.match(hashTagPattern);
    var tags, name;
    if(match != null)
        tags = match[0];
    match = input.match(namePattern);
    if (match != null)
        name = match[0];

    addToken("name", name);
    addToken("tags", tags);
    addToken("note", input.replace(name, "").replace(tags, ""));

    var json = GetContactId(name);
    if (json != null) {
        var id = json.contacts[0].id;
        ids.push(id);
    }
    else
        console.error("Server returned empty json result")
}

function DoStatusPattern(input) {
    console.log("input = {" + input + "}");
    console.log("It's Status pattern");

    var status;
    var isUsed = false;
    statuses.forEach(function (item, i, statuses) {
        var i = input.toLowerCase().indexOf(item)
        if (i != -1 && !isUsed) {
            isUsed = true;
            i = i === 0 ? 0 : i--;
            var currChar = "";
            var counter = 0;
            while (currChar != undefined && currChar != null && currChar != ' ') {
                currChar = input.trim()[i];
                status += currChar;
                i++;

                if (currChar == ' ' && counter <= 2) {
                    if (i == input.toLowerCase().indexOf(item)) {
                        currChar = input.charAt(i);
                        status += currChar;
                        i++;
                        counter++;
                    }
                }
            }
            status = status.replace(/undefined/g, '');
        }
    });

    var note = input.replace(status, "");

    addToken("status", status);
    addToken("note", note);
}

function GetContactId(valueForSearch) {
    console.log("Search for contact: {" + valueForSearch + "}");
    var q = valueForSearch;
    var ids;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "contacts/?action=search&q=" + q);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(null); 
    xhr.onreadystatechange = function () { 
        if (xhr.readyState != 4) return;

        if (xhr.status != 200)
            console.error(xhr.statusText);
        else {
            var j = JSON.parse(xhr.responseText);
            if (j["contacts"].length >= 1) {
                return j.contacts;
            }
            else
                return undefined;
        }
    }
}

function UpdateContact() {
    console.log("Update contact: {" + getToken("name_READED") + "}");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "contacts/?action=updateContact");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(GetQueryString());
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;

        if (xhr.status != 200)
            console.error(xhr.statusText);
        else {
            var j = JSON.parse(xhr.responseText);
            if (j["error"] == "true") {
                console.error(j);
            }
        }
    }
}

function CreateContact() {
    console.log("Create contact: {" + getToken("name_READED") + "}");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "contacts/?action=createContact");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(GetQueryString());
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;

        if (xhr.status != 200)
            console.error(xhr.responseText);
        else {
            var j = JSON.parse(xhr.responseText);
            if (j["error"] == "true") {
                console.error(j);
            }
        }
    }
}

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

//Handlers
var idClickedAlert;
//use: onclick="ClickSearchAlerts(this.parentNode.getAttribute("data-id"))"
function ClickSearchAlerts(id) {
    idClickedAlert = id;
    var el = document.querySelector('li[data-id="' + id + '"]');
    document.getElementById('input').value = el.getElementsByClassName('result-name')[0].innerText;
    document.getElementsByClassName("search-alerts js-search-alert")[0].setAttribute('style', 'display: none');
}

//use: onclick="ClickDeleteAlerts(this)"
function ClickDeleteAlerts(id) {
    if (confirm("Realy delete contact?")) {
        var el = document.querySelector('li[data-id="' + id + '"]');
        el.remove();
        //backend.send(delete + id);
        console.log('Contact ' + id + ' deleted');
    }
}

$.fn.textWidth = function (text, font) {
    //from: http://stackoverflow.com/questions/1582534/calculating-text-width/15302051#15302051
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};

$(document).ready(function () {
    $(".form-btn.js-search-cancel").click(function () {
        $("div[data-alert='create']").hide();
    });

    $(".form-btn.js-search-update").click(function () {
        UpdateContact();
    });

    $(".form-btn.save.js-search-save").click(function () {
        CreateContact();
    });

    var isTagTyping = false;
    var tagValue;
    $("#magic-string-input").on("input", function () {
        var input = $("#magic-string-input").val();
        var match = /#($|\s)/.exec(input);

        if (match != null)
            //if (input.slice(input.length - 1, input.length) === " ") {
            //    isTagTyping = false;
            //    $(".search-hash.js-search-alert").hide();
            //}
            //else
        {
            input = input.substring(0, match.index+1);
        }

        

        if (isTagTyping) {
            tagValue += input.slice(input.length - 1, input.length);
            if (input.slice(input.length - 1, input.length) === " ") {
                tagValue = '';
                isTagTyping = false;
                $(".search-hash.js-search-alert").hide();
            }
            else
                return;
        }

        if (input.slice(input.length - 1, input.length) === '#') {
            isTagTyping = true;
            tagValue += '#';
            $.ajax({
                url: "TODO",//TODO url 
                context: document.body
            }).done(function (data) {
                var json = JSON.parse(data);
                json.hastags.forEach(function (item, i, _tags) {
                    $(".search-hash.js-search-alert.li").append("<a href=\"#\">" + item + "</a>");
                });
            });

            var i = Number( $.fn.textWidth(input, '16px arial') ) + 23;
            $(".search-hash.js-search-alert").show();
            $(".search-hash.js-search-alert").css('margin-left', i + "px");
            return;
        }
        DoMagic();
    });

    $(".search-hash-result").on("click", function () {
        var tmp = $("#magic-string-input").val();
        tagValue = tagValue.replace(/undefined/g, '');
        var s = tagValue + "((?![\\s\\S])|\\s)";
        var re = new RegExp(s, "g");
        var match = re.exec(tmp);
       // alert(re.lastIndex - match[0].length, match.lastIndex);
        $("#magic-string-input").val(tmp.replaceAt(re.lastIndex - match[0].length, this.innerText) + ' ');
        tagValue = '';
    });
});

$(document).mouseup(function (e) {
    var container = $(".js-search-alert");

    if (!container.is(e.target)
        && container.has(e.target).length === 0) 
    {
        container.hide();
    }
});
//Handlers

testValues = ["Mark https://web.facebook.com/zuck ceo@fb.com", "Mark 7(999)123-45-67", "Mark 79991234567 note", "Mark 7-999-123-45-67 mail@mail.ru", "Mark 7(999)123-45-67 https://www.facebook.com/profile.php?id=100012178176923 simple mark", "David 79991234567 david@mail.ru https://facebook.com/david David from meeting.", "David david@mail.ru 79991234567 David from meeting.", "David Simon", "#contacts", "79991234567", "david@mail.ru", "Share Mark Viber to Tiffany@gmail.com", "Share Mark Viber to Tiffany WhatsApp", "Share Mark to TIffany WhatsApp hello", "Share Mark Skype to TIffany WhatsApp hello", "Mark #Facebook", "Mark #Facebook #tag #moreTags", "Mark #Facebook #tag #moreTags #realyManyHashTags", "Mark #Facebook #tag #moreTags note", "Send presentation to Mark by e-mail@post.com subject check it please", "Send presentation to #investors by e-mail.gmail.com.", "Send picture.jpg to David email@greatDomen.net Look at this!", "Call Mark in 30 mins by WhatsApp", "Meet David at 5 PM at Times Square NY", "Share Mark to Tiffany@gmail.com Call in 30 mins", "Share Mark Telegram to Viber Send invitation to Party", "Save Mark zuck@fb.com Share to David"]
var t2 = ["Meet David at 5 PM at Times Square NY", "Share Mark to Tiffany@gmail.com Call in 30 mins", "Share Mark Telegram to Viber Send invitation to Party", "Send invitation.txt to Mark party WhatsApp", "Save Mark zuck@fb.com Share to David"];
function Test() {
    for (var i = 0; i < t2.length; i++) {
        document.getElementById("input").value = t2[i];
        DoMagic();
    }
}