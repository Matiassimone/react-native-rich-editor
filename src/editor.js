function getContentCSS() {
    return `
    <style>
        li {
          overflow: visible;
          position: relative;
          top: 0px;
          margin-left: 1em;
        }
        ul {
          list-style-position: outside;
          overflow: visible;
          position: relative;
          padding: 0px;
          margin: 0px;
          top: 0px;
          left: 0px;
        }
        ol {
          list-style-position: outside;
          overflow: visible;
          position: relative;
          padding: 0px;
          margin: 0px;
          top: 0px;
          left: 0.8em;
        }
        video {max-width: 98%;margin-left:auto;margin-right:auto;display: block;}
        img {max-width: 98%;vertical-align: middle;}
        table {width: 100% !important;}
        table td {width: inherit;}
        table span { font-size: 12px !important; }
        .x-todo li {list-style:none;}
        .x-todo-box {position: relative; left: -24px;}
        .x-todo-box input{position: absolute;}
        blockquote{border-left: 6px solid #ddd;padding: 5px 0 5px 10px;margin: 15px 0 15px 15px;}
        hr{display: block;height: 0px; border: 0;border-top: 1px solid #ccc; margin: 15px 0; padding: 0;}
        pre{padding: 10px 5px 10px 10px;margin: 15px 0;display: block;line-height: 18px;background: #F0F0F0;border-radius: 3px;font-size: 13px; font-family: 'monaco', 'Consolas', "Liberation Mono", Courier, monospace; white-space: pre; word-wrap: normal;overflow-x: auto;}
    </style>
    `;
  }

  function createHTML(options = {}) {
    const {
        backgroundColor = '#FFF',
        color = '#000033',
        placeholderColor = '#a9a9a9',
        contentCSSText = '',
        cssText = '',
        pasteAsPlainText = false,
        pasteListener = false,
        keyDownListener = false,
        keyUpListener = false,
        autoCapitalize = 'off',
        defaultParagraphSeparator = 'div',
        // When first gaining focus, the cursor moves to the end of the text
        firstFocusEnd = true,
    } = options;
    //ERROR: HTML height not 100%;
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="user-scalable=1.0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
    <style>
        * {outline: 0px solid transparent;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-touch-callout: none;box-sizing: border-box;}

        html, body {
          width: 100%;
          height: 100%;
          overflow: visible;
          padding: 0px;
          margin: 0px;
          right: 0px,
          top: 0px;
          font-family: Arial, Helvetica, sans-serif;
          font-size:1em;
        }
        body {
          width: 100%;
          height: 100%;
          overflow: visible;
          padding: 0px;
          margin: 0px;
          right: 0px,
          top: 0px;
          background-color: ${backgroundColor};
        }

        .content {
          font-family: Arial, Helvetica, sans-serif;
          color: ${color};
          width: 100%;
          height: 100%;
          overflow: visible;
          padding: 0px;
          margin: 0px;
          right: 0px,
          top: 0px;
        }
        .pell {
          width: 100%;
          height: 100%;
          overflow: visible;
          padding: 0.1em;
          margin: 0.1em;
          right: 0px,
          top: 0px;
        }
        .pell-content {
          outline: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          padding: 0px;
          margin: 0px;
          right: 0px,
          top: 0px;
          margin-right: 0.8em;

          ${contentCSSText}
        }
    </style>

    <style>
        [placeholder]:empty:before { content: attr(placeholder); color: ${placeholderColor}; }
        [placeholder]:empty:focus:before { content: attr(placeholder);color: ${placeholderColor}; }
    </style>
    ${getContentCSS()}
    <style>
        ${cssText}
    </style>
  </head>

  <body>
    <div class="content">
        <div id="editor" class="pell"></div>
    </div>

  <script>
    var __DEV__ = !!${window.__DEV__};
    var _ = (function (exports) {
        var anchorNode, focusNode, anchorOffset, focusOffset, _focusCollapse = false, cNode;
        var _log = console.log;
        var placeholderColor = '${placeholderColor}';
        var _randomID = 99;
        var generateId = function (){
            return "auto_" + (++ _randomID);
        }

        var body = document.body, docEle = document.documentElement;
        var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        var formatBlock = 'formatBlock';
        var editor = null, o_height = 0;
        function addEventListener(parent, type, listener) {
            return parent.addEventListener(type, listener);
        };
        function appendChild(parent, child) {
            return parent.appendChild(child);
        };
        function createElement(tag) {
            return document.createElement(tag);
        };
        function queryCommandState(command) {
            return document.queryCommandState(command);
        };
        function queryCommandValue(command) {
            return document.queryCommandValue(command);
        };
        function query(command){
            return document.querySelector(command);
        }
        function querys(command){
            return document.querySelectorAll(command);
        }

        function exec(command) {
            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return document.execCommand(command, false, value);
        };

        function asyncExec(command){
            var args = Array.prototype.slice.call(arguments);
            setTimeout(function(){
                exec.apply(null, args);
            }, 0);
        }

        function _postMessage(data){
            exports.window.postMessage(JSON.stringify(data));
        }
        function postAction(data){
            editor.content.contentEditable === 'true' && _postMessage(data);
        };

        exports.isRN && (
            console.log = function (){
                var data = Array.prototype.slice.call(arguments);
                __DEV__ && _log.apply(null, data);
                __DEV__ && postAction({type: 'LOG', data});
            }
        )

        function formatParagraph(async){
            (async ? asyncExec: exec)(formatBlock, '<' + editor.paragraphSeparator + '>' );
        }

        function getNodeByClass(node, className){
            return node ? (node.nodeType === Node.ELEMENT_NODE && node.classList.contains(className)? node : getNodeByClass(node.parentNode, className)): node;
        }

        function getNodeByName(node, name){
            return node? (node.nodeType === Node.ELEMENT_NODE && node.nodeName === name? node: getNodeByName(node.parentNode, name)): node;
        }

        function setCollapse(node){
            var selection = window.getSelection();
            selection.selectAllChildren(node);
            selection.collapseToEnd();
        }

        function checkboxNode(node){
            return getNodeByClass(node, 'x-todo');
        }

        function execCheckboxList (node, html){
            var html = createCheckbox(node ? node.innerHTML: '');
            var HTML = "<ol class='x-todo'><li>"+ html +"</li></ol>"
            var foNode;
            if (node){
                node.innerHTML = HTML;
                foNode = node.firstChild;
            } else {
                exec("insertHTML", HTML);
            }

            foNode && setTimeout(function (){
                setCollapse(foNode);
            });
        }

        var _checkboxFlag = 0; // 1 = add checkbox; 2 = cancel checkbox
        function cancelCheckboxList(box){
            _checkboxFlag = 2;
            exec("insertOrderedList");
            setCollapse(box);
        }

        function createCheckbox(end){
            var html = '<span contenteditable="false" class="x-todo-box"><input type="checkbox"></span>';
            if (end && typeof end !== 'boolean'){
                html += end;
            } else if(end !== false){
                html += "<br/>"
            }
            return html;
        }

        function insertCheckbox (node){
            var li = getNodeByName(node, 'LI');
            li.insertBefore(document.createRange().createContextualFragment(createCheckbox(false)), li.firstChild);
            setCollapse(node);
        }

        function getCheckbox (node){
            return getNodeByClass(node, "x-todo-box");
        }

        function saveSelection(){
            var sel = window.getSelection();
            anchorNode = sel.anchorNode;
            anchorOffset = sel.anchorOffset;
            focusNode = sel.focusNode;
            focusOffset = sel.focusOffset;
        }

        function focusCurrent(){
            editor.content.focus();
            try {
                var selection = window.getSelection();
                if (anchorNode){
                    if (anchorNode !== selection.anchorNode && !selection.containsNode(anchorNode)){
                        _focusCollapse = true;
                        selection.collapse(anchorNode, anchorOffset);
                    }
                } else if(${firstFocusEnd} && !_focusCollapse ){
                    _focusCollapse = true;
                    selection.selectAllChildren(editor.content);
                    selection.collapseToEnd();
                }
            } catch(e){
                console.log(e)
            }
        }

        var _keyDown = false;
        function handleChange (event){
            var node = anchorNode;
            if (_keyDown){
                if(_checkboxFlag === 1 && checkboxNode(node)){
                    _checkboxFlag = 0;
                    var sib = node.previousSibling;
                    if (!sib || sib.childNodes.length > 1){
                        insertCheckbox(node);
                    }
                } else if(_checkboxFlag === 2){
                    _checkboxFlag = 0;
                    var sp = createElement(editor.paragraphSeparator);
                    var br = createElement('br');
                    sp.appendChild(br);
                    setTimeout(function (){
                        if (!node.classList.contains("x-todo-box")){
                            node = node.parentNode.previousSibling;
                        }
                        node.parentNode.replaceChild(sp, node);
                        setCollapse(sp);
                    });
                }
            }
        }

        /* ******************************************************************
        * Actions Guide
        * *******************************************************************
        *
        * Custom = Set if you prefer parse the result into the Js response
        *          with the following structure.
        *
        *          {name: "String", value: "Value"}
        *
        *
        * Name = Name that appear in the Js response.
        *
        *
        * State = Function called each time when a style is introduced or
        *         when the position was changed.
        *
        *
        * Result = Function called when is fired that action.
        *
        ****************************************************************** */

        var Actions = {
            _caretPos: {
              custom: true,
              name: 'caretPos',
              state: function() {
                  var selection = window.getSelection();
                  var range = selection.getRangeAt(0);
                  var rect = range.getClientRects()[0];

                  return rect;
              },
              result: function() {
                return exec('_caretPos');
            }},

            bold: {
              custom: true,
              name: 'bold',
              state: function() {
                return queryCommandState('bold');
              },
              result: function() {
                exec('bold');
              },
            },

            italic: {
              custom: true,
              name: 'italic',
              state: function() {
                return queryCommandState('italic');
              },
              result: function() {
                return exec('italic');
              },
            },

            underline: {
              custom: true,
              name: 'underline',
              state: function() {
                return queryCommandState('underline');
              },
              result: function() {
                exec('underline');
              },
            },

            strike: {
              custom: true,
              name: 'strike',
              state: function() {
                return queryCommandState('strikeThrough');
              },
              result: function() {
                exec('strikeThrough')

                for (const strike of document.querySelectorAll("strike")) {
                  const s = document.createElement("s");

                  while (strike.firstChild) {
                    s.appendChild(strike.firstChild);
                  }

                  strike.parentNode.insertBefore(s , strike);
                  strike.parentNode.removeChild(strike);
                }
              }
            },

            color: {
              custom: true,
              name: 'color',
              state: function() {
                for (const font of document.querySelectorAll("font")) {
                  const span = document.createElement("span");
                  const color = font.getAttribute("color");

                  if (color) {
                    span.style.color = color;
                  };

                  while (font.firstChild) {
                    span.appendChild(font.firstChild);
                  };

                  font.parentNode.insertBefore(span, font);
                  font.parentNode.removeChild(font);
                }

                return document.queryCommandValue('foreColor');
              },
              result: function(color) {
                exec('foreColor', color);

                for (const font of document.querySelectorAll("font")) {
                  const span = document.createElement("span");
                  const color = font.getAttribute("color");

                  if (color) {
                    span.style.color = color;
                  };

                  while (font.firstChild) {
                    span.appendChild(font.firstChild);
                  };

                  font.parentNode.insertBefore(span, font);
                  font.parentNode.removeChild(font);
                }

                return document.queryCommandValue('foreColor');
              },
            },

            fontFamily: {
              custom: true,
              name: 'fontFamily',
              state: function() {
                  return queryCommandValue('fontName');
              },
              result: function(fontName) {
                  return exec('fontName', fontName);
              }
            },

            fontSize: {
              custom: true,
              name: 'fontSize',
              state: function() {
                var el = document.getElementById('content');
                var style = window.getComputedStyle(el, null).getPropertyValue('font-size');
                var fontSize = parseFloat(style);

                return JSON.parse(fontSize);
              },
              result: function(size) {
                return exec('fontSize', size);
              },
            },

            backgroundColor: {
              custom: true,
              name: 'backgroundColor',
              state: function() {
                return queryCommandState('hiliteColor');
              },
              result: function(color) {
                return exec('hiliteColor', color);
              },
            },

            justifyCenter: {
              custom: true,
              name: 'textAlign',
              state: function() {
                return queryCommandState('justifyCenter') ? 'center' : false;
              },
              result: function() {
                return exec('justifyCenter');
              }
            },

            justifyLeft: {
              custom: true,
              name: 'textAlign',
              state: function() {
                return queryCommandState('justifyLeft') ? 'left' : false;
              },
              result: function() {
                return exec('justifyLeft');
              }
            },

            justifyRight: {
              custom: true,
              name: 'textAlign',
              state: function() {
                return queryCommandState('justifyRight') ? 'right' : false;
              },
              result: function() {
                return exec('justifyRight');
              }
            },

            justifyFull: {
              custom: true,
              name: 'textAlign',
              state: function() {
                return queryCommandState('justifyFull') ? 'justify' : false;
              },
              result: function() {
                return exec('justifyFull');
              }
            },

            heading1: { state: function() { return queryCommandValue(formatBlock) === 'h1'; }, result: function() { return exec(formatBlock, '<h1>'); }},
            heading2: { state: function() { return queryCommandValue(formatBlock) === 'h2'; }, result: function() { return exec(formatBlock, '<h2>'); }},
            heading3: { state: function() { return queryCommandValue(formatBlock) === 'h3'; }, result: function() { return exec(formatBlock, '<h3>'); }},
            heading4: { state: function() { return queryCommandValue(formatBlock) === 'h4'; }, result: function() { return exec(formatBlock, '<h4>'); }},
            heading5: { state: function() { return queryCommandValue(formatBlock) === 'h5'; }, result: function() { return exec(formatBlock, '<h5>'); }},
            heading6: { state: function() { return queryCommandValue(formatBlock) === 'h6'; }, result: function() { return exec(formatBlock, '<h6>'); }},
            paragraph: { state: function() { return queryCommandValue(formatBlock) === 'p'; }, result: function() { return exec(formatBlock, '<p>'); }},
            quote: { result: function() { return exec(formatBlock, '<blockquote>'); }},
            removeFormat: { result: function() { return exec('removeFormat'); }},
            orderedList: {
                state: function() { return !checkboxNode(window.getSelection().anchorNode) && queryCommandState('insertOrderedList'); },
                result: function() { if (!!checkboxNode(window.getSelection().anchorNode)) return;return exec('insertOrderedList'); }
            },
            unorderedList: {
                state: function() { return queryCommandState('insertUnorderedList');},
                result: function() { if (!!checkboxNode(window.getSelection().anchorNode)) return; return exec('insertUnorderedList');}
            },
            code: { result: function() { return exec(formatBlock, '<pre>'); }},
            line: { result: function() { return exec('insertHorizontalRule'); }},
            redo: { result: function() { return exec('redo'); }},
            undo: { result: function() { return exec('undo'); }},
            indent: { result: function() { return exec('indent'); }},
            outdent: { result: function() { return exec('outdent'); }},
            outdent: { result: function() { return exec('outdent'); }},

            link: {
                result: function(data) {
                    data = data || {};
                    var title = data.title;
                    // title = title || window.prompt('Enter the link title');
                    var url = data.url || window.prompt('Enter the link URL');
                    if (url){
                        exec('insertHTML', "<a href='"+ url +"'>"+(title || url)+"</a>");
                    }
                }
            },
            image: {
                result: function(url, style) {
                    if (url){
                        exec('insertHTML', "<img style='"+ (style || '')+"' src='"+ url +"'/>");
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            html: {
                result: function (html){
                    if (html){
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            text: { result: function (text){ text && exec('insertText', text); }},
            video: {
                result: function(url, style) {
                    if (url) {
                        var thumbnail = url.replace(/.(mp4|m3u8)/g, '') + '-thumbnail';
                        var html = "<br><div style='"+ (style || '')+"'><video src='"+ url +"' poster='"+ thumbnail + "' controls><source src='"+ url +"' type='video/mp4'>No video tag support</video></div><br>";
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            checkboxList: {
                state: function(){return checkboxNode(window.getSelection().anchorNode)},
                result: function() {
                    if (queryCommandState('insertOrderedList')) return;
                    var pNode;
                    if (anchorNode){
                        pNode = anchorNode.parentNode;
                        if (anchorNode === editor.content) pNode = null;
                    }

                    if (anchorNode === editor.content || queryCommandValue(formatBlock) === ''){
                        formatParagraph();
                    }
                    var box = checkboxNode(anchorNode);
                    if (!!box){
                        cancelCheckboxList(box.parentNode);
                    } else {
                        !queryCommandState('insertOrderedList') && execCheckboxList(pNode);
                    }
                }
            },
            content: {
                setDisable: function(dis){ this.blur(); editor.content.contentEditable = !dis},
                setHtml: function(html) { editor.content.innerHTML = html; },
                getHtml: function() { return editor.content.innerHTML; },
                blur: function() { editor.content.blur(); },
                focus: function() { focusCurrent(); },
                postHtml: function (){ postAction({type: 'CONTENT_HTML_RESPONSE', data: editor.content.innerHTML}); },
                setPlaceholder: function(placeholder){ editor.content.setAttribute("placeholder", placeholder) },

                setContentStyle: function(styles) {
                    styles = styles || {};
                    var bgColor = styles.backgroundColor, color = styles.color, pColor = styles.placeholderColor;
                    if (bgColor && bgColor !== body.style.backgroundColor) body.style.backgroundColor = bgColor;
                    if (color && color !== editor.content.style.color) editor.content.style.color = color;
                    if (pColor && pColor !== placeholderColor){
                        var rule1="[placeholder]:empty:before {content:attr(placeholder);color:"+pColor+";}";
                        var rule2="[placeholder]:empty:focus:before{content:attr(placeholder);color:"+pColor+";}";
                        try {
                            document.styleSheets[1].deleteRule(0);document.styleSheets[1].deleteRule(0);
                            document.styleSheets[1].insertRule(rule1); document.styleSheets[1].insertRule(rule2);
                            placeholderColor = pColor;
                        } catch (e){
                            console.log("set placeholderColor error!")
                        }
                    }
                },

                commandDOM: function (command){
                    try {new Function("$", command)(exports.document.querySelector.bind(exports.document))} catch(e){console.log(e.message)};
                },
                command: function (command){
                    try {new Function("$", command)(exports.document)} catch(e){console.log(e.message)};
                }
            },

            init: function (){
                setInterval(Actions.UPDATE_HEIGHT, 150);
                Actions.UPDATE_HEIGHT();
            },

            UPDATE_HEIGHT: function() {

                // That make a infinity scroll height grow.
                // var height = Math.max(docEle.scrollHeight, body.scrollHeight);

                var height = body.scrollHeight;

                if (o_height !== height){
                    _postMessage({type: 'OFFSET_HEIGHT', data: o_height = height});
                }
            }
        };

        var init = function init(settings) {

            var paragraphSeparator = settings[defaultParagraphSeparatorString];
            var content = settings.element.content = createElement('div');
            content.id = 'content';
            content.contentEditable = true;
            content.spellcheck = false;
            content.autocapitalize = '${autoCapitalize}';
            content.autocorrect = 'off';
            content.autocomplete = 'off';
            content.className = "pell-content";
            content.oninput = function (_ref) {

                // Rules Markdown Regex expressions.
                let numberedListRegex = /^[0-9]+[)|.]+\&nbsp;$/
                let bulletListRegex = /^[*|-]+\&nbsp;$/
                let numberedSur = /^[0-9]+[)|.]$/
                let bulletSur = /^[*|-]$/

                // Find lasted HTML Node.
                let lastedChild = _ref.target.lastChild;
                while (lastedChild.hasChildNodes() && lastedChild.lastChild.innerHTML) {
                    lastedChild = lastedChild.lastChild;
                }
                let lastedChildInnerContent = lastedChild.innerHTML;

                // Remove remaining character.
                if(lastedChild.tagName === 'LI'){
                    let lastedChildText = lastedChild.textContent;
                    let lastedCharacter = lastedChildText[0];
                    let lastedTwoCharacters = lastedCharacter + lastedChildText[1];

                    if(numberedSur.test(lastedTwoCharacters) || bulletSur.test(lastedCharacter)) {
                        let firstParentDiv = lastedChild;

                        // Look the first DIV in the HTML Tree,
                        while (firstParentDiv.tagName !== 'DIV') {
                          firstParentDiv = firstParentDiv.parentNode;
                        }

                        // If it has no siblings,
                        // it means that it is a list at the beginning of the html,
                        // therefore there is no need to remove the container DIV.
                        if(firstParentDiv.previousSibling) {
                          firstParentDiv.replaceWith(...firstParentDiv.childNodes);
                        }

                        // Remove remaining character.
                        lastedChild.textContent = '';

                        // Clear any current selection
                        const selection = window.getSelection();
                        selection.removeAllRanges();

                        // Select LI.
                        const range = document.createRange();
                        range.selectNodeContents(lastedChild);
                        selection.addRange(range);
                    }
                }

                // Fire action in case match any markdown rule.
                if(bulletListRegex.test(lastedChildInnerContent)) {
                    Actions['unorderedList'].result();
                }
                if(numberedListRegex.test(lastedChildInnerContent)) {
                    Actions['orderedList'].result();
                }


                if ((anchorNode === void 0 || anchorNode === content) && (queryCommandValue(formatBlock) === '') && !lastedChildInnerContent){
                    formatParagraph(true);
                } else if (content.innerHTML === '<br>') content.innerHTML = '';

                saveSelection();
                handleChange(_ref);
                settings.onChange();
            };
            appendChild(settings.element, content);

            if (settings.styleWithCSS) exec('styleWithCSS');
            exec(defaultParagraphSeparatorString, paragraphSeparator);

            var actionsHandler = [];
            for (var k in Actions){
                if (typeof Actions[k] === 'object' && Actions[k].state){
                    actionsHandler[k] = Actions[k]
                }
            }

            /* ******************************************************************
            * handler()
            * *******************************************************************
            *
            * Function called each time when a styles is updated or when the
            * caret position was changed, to update the Reactive Menu.
            *
            ****************************************************************** */

            function handler() {
              var activeTools = [];

              for(var k in actionsHandler){
                let state = Actions[k].state();

                if ( state ) {
                  if ( Actions[k].custom ){
                    activeTools.push({name: Actions[k].name, value: state});

                  } else {
                    activeTools.push(k)
                  }
                }
              };

              postAction({type: 'SELECTION_CHANGE', data: activeTools});
            };

            var _handleStateDT = null;
            function handleState(){
                clearTimeout(_handleStateDT);
                _handleStateDT = setTimeout(function (){
                    handler();
                    saveSelection();
                }, 50);
            }

            function handleSelecting(event){
                event.stopPropagation();
                handleState();
            }

            function postKeyAction(event, type){
                postAction({type: type, data: {keyCode: event.keyCode, key: event.key}});
            }
            function handleKeyup(event){
                _keyDown = false;
                if (event.keyCode === 8) handleSelecting (event);
                ${keyUpListener} && postKeyAction(event, "CONTENT_KEYUP")
            }
            function handleKeydown(event){
                _keyDown = true;
                 handleState();
                if (event.key === 'Enter'){
                    var box;
                    if (queryCommandValue(formatBlock) === 'blockquote'){
                        console.log('delete?: Enter -> blockquote')
                        // formatParagraph(true);
                    } else  if (anchorNode.innerHTML === '<br>' && anchorNode.parentNode !== editor.content){
                        // setCollapse(editor.content);
                    } else if (queryCommandState('insertOrderedList') && !!(box = checkboxNode(anchorNode))){
                        var node = anchorNode && anchorNode.childNodes[1];
                        if (node && node.nodeName === 'BR'){
                            cancelCheckboxList(box.parentNode);
                            event.preventDefault();
                        } else{
                            // add checkbox
                            _checkboxFlag = 1;
                        }
                    }
                }
                ${keyDownListener} && postKeyAction(event, "CONTENT_KEYDOWN");
            }
            function handleFocus (){
                postAction({type: 'CONTENT_FOCUSED'});
                handler();
            }
            function handleBlur (){
                postAction({type: 'SELECTION_CHANGE', data: []});
                postAction({type: 'CONTENT_BLUR'});
            }
            function handleClick(event){
                var ele = event.target;
                if (ele.nodeName === 'INPUT' && ele.type === 'checkbox'){
                    // Set whether the checkbox is selected by default
                    if (ele.checked) ele.setAttribute('checked', '');
                    else ele.removeAttribute('checked');
                }
            }
            addEventListener(content, 'touchcancel', handleSelecting);
            addEventListener(content, 'mouseup', handleSelecting);
            addEventListener(content, 'touchend', handleSelecting);
            addEventListener(content, 'keyup', handleKeyup);
            addEventListener(content, 'click', handleClick);
            addEventListener(content, 'keydown', handleKeydown);
            addEventListener(content, 'blur', handleBlur);
            addEventListener(content, 'focus', handleFocus);
            addEventListener(content, 'paste', function (e) {
                // get text representation of clipboard
                var text = (e.originalEvent || e).clipboardData.getData('text/plain');

                /*
                  This piece of code allows you to paste text with all styles uncomment if your code
                  supports fonts family and others styles when you paste text.


                  ${pasteListener} && postAction({type: 'CONTENT_PASTED', data: text});

                  if (${pasteAsPlainText}) {
                      insert here the code bellow...
                  }
                */

                // cancel paste
                e.preventDefault();
                // insert text manually
                exec("insertText", text);
            });

            var message = function (event){
                var msgData = JSON.parse(event.data), action = Actions[msgData.type];
                if (action ){
                    if ( action[msgData.name]){
                        var flag = msgData.name === 'result';
                        // insert image or link need current focus
                        flag && focusCurrent();
                        action[msgData.name](msgData.data, msgData.options);
                        flag && handleState();
                    } else {
                        action(msgData.data, msgData.options);
                    }
                }
            };
            document.addEventListener("message", message , false);
            window.addEventListener("message", message , false);
            document.addEventListener('mouseup', function (event) {
                event.preventDefault();
                Actions.content.focus();
                handleSelecting(event);
            });
            return {content, paragraphSeparator: paragraphSeparator};
        };

        var _handleCTime = null;
        editor = init({
            element: document.getElementById('editor'),
            defaultParagraphSeparator: '${defaultParagraphSeparator}',
            onChange: function (){
                clearTimeout(_handleCTime);
                _handleCTime = setTimeout(function(){
                    var html = Actions.content.getHtml();
                    postAction({type: 'CONTENT_CHANGE', data: html});
                }, 50);
            }
        })
        return {
            sendEvent: function (type, data){
                event.preventDefault();
                event.stopPropagation();
                var id = event.currentTarget.id;
                if ( !id ) event.currentTarget.id = id = generateId();
                _postMessage({type, id, data});
            }
        }
    })({
        window: window.ReactNativeWebView || window.parent,
        isRN: !!window.ReactNativeWebView ,
        document: document
    });
  </script>
  </body>
  </html>
  `;
  }

  const HTML = createHTML();
  export {HTML, createHTML, getContentCSS};
