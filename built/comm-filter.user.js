// ==UserScript==
// @id             iitc-plugin-comm-filter@udnp
// @name           IITC plugin: COMM Filter
// @category       COMM
// @version        0.0.1.20160305.224237
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      none
// @downloadURL    none
// @description    [local-2016-03-05-224237] COMM Filter
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @include        https://www.ingress.com/mission/*
// @include        http://www.ingress.com/mission/*
// @match          https://www.ingress.com/mission/*
// @match          http://www.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'local';
plugin_info.dateTimeVersion = '20160305.224237';
plugin_info.pluginId = 'comm-filter';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.commfilter = (function() {
  var ID = 'PLUGIN_LOG_FILTER',
      DESCRIPTIONS = "log filter plug-in",
      dom = null,
      comm = {
        dom: null,
        channels: {}, // all, faction, alerts
        Channel: function(name) {
          return {
            name: name,
            dom: null, //TODO comm.dom.querySelector('#chat' + name)
            hasLogs: function() {
              if(this.dom && this.dom.querySelector('table')) {
                return true;
              } else {
                return false;
              }
            }
          };
        }
      },
      input = {
        oldValue: null,
        dom: null,
        create: function() {
          var dom = document.createElement('input');
          dom.type = 'text';
          dom.name = 'agent';
          dom.defaultValue = '';
          dom.placeholder = 'agent name';
          dom.addEventListener('keyup', function() {
            var channel = window.chat.getActive();
            
            if(this.isChanged() && comm.channels[channel].hasLogs()) {
              window.plugin.commfilter.renderLogs(channel);
            }
          }.bind(this));
          
          this.dom = dom;
          return this;
        },
        isChanged: function(){
          if(this.dom && this.dom.value !== this.oldValue){
            this.oldValue = this.dom.value; 
            return true;
          }
          else return false;
        }
      },
      reset = {
        dom: null,
        create: function() {
          var dom = document.createElement('button');
          dom.type = 'reset';
          dom.textContent = 'X';
          
          this.dom = dom;
          return this;
        }
      };
  
  //// copied from original code/chat.js @ rev.5298c98
  // renders data from the data-hash to the element defined by the given
  // ID. Set 3rd argument to true if it is likely that old data has been
  // added. Latter is only required for scrolling.
  var renderData = function(data, element, likelyWereOldMsgs) {
    var elm = $('#'+element);
    if(elm.is(':hidden')) return;

    // discard guids and sort old to new
  //TODO? stable sort, to preserve server message ordering? or sort by GUID if timestamps equal?
    var vals = $.map(data, function(v, k) { return [v]; });
    vals = vals.sort(function(a, b) { return a[0]-b[0]; });

    // render to string with date separators inserted
    var msgs = '';
    var prevTime = null;
    $.each(vals, function(ind, msg) {
      var nextTime = new Date(msg[0]).toLocaleDateString();
      if(prevTime && prevTime !== nextTime)
        msgs += chat.renderDivider(nextTime);
      msgs += msg[2];
      prevTime = nextTime;
    });

    var scrollBefore = scrollBottom(elm);
    //elm.html('<table>' + msgs + '</table>');
    elm.append(renderTableDom($(msgs)));
    chat.keepScrollPosition(elm, scrollBefore, likelyWereOldMsgs);
  }
  
  //// copied from original code/chat.js @ rev.5298c98
  // contains the logic to keep the correct scroll position.
  var keepScrollPosition = function(box, scrollBefore, isOldMsgs) {
    // If scrolled down completely, keep it that way so new messages can
    // be seen easily. If scrolled up, only need to fix scroll position
    // when old messages are added. New messages added at the bottom don’t
    // change the view and enabling this would make the chat scroll down
    // for every added message, even if the user wants to read old stuff.

    if(box.is(':hidden') && !isOldMsgs) {
      box.data('needsScrollTop', 99999999);
      return;
    }

    var logsTable = $('table', box);
    // box[0].offsetHeight - logsTable[0].offsetHeight
    var offset = box.outerHeight() - logsTable.outerHeight();

    if(offset > 0) {
      logsTable.css('margin-bottom', offset + 'px');
    }

    var statusView = $('.status', box); 
    statusView.text('');

    if(scrollBefore === 0 || isOldMsgs) {
      box.data('ignoreNextScroll', true);
      box.scrollTop(box.scrollTop() + (scrollBottom(box)-scrollBefore)
        + statusView.outerHeight());
      statusView.text('Now loading...');
    }
  }

  function renderTableDom(rowDoms) {
    var dF = document.createDocumentFragment();

    for(var i = 0; i < rowDoms.length; i++) {
      filterLogWithInput(rowDoms[i]);
      dF.appendChild(rowDoms[i]);
      
      var agentDom = rowDoms[i].querySelector('.nickname');
      if(agentDom) {
        agentDom.addEventListener('click', function(){
          var channel = window.chat.getActive();
          
          if(comm.channels[channel].hasLogs()) {
            input.dom.value = this.textContent;
            window.plugin.commfilter.renderLogs(channel);
          }
        });
      }
    }
    
    var oldTableDom = document.querySelector('#chat' + window.chat.getActive() + ' table'); 
    if(oldTableDom) {
      oldTableDom.parentElement.removeChild(oldTableDom);
      oldTableDom = null;
    }
    
    var tableDom = document.createElement('table'); 
    tableDom.appendChild(dF);
    
    return tableDom;
  }
  
  function filterLogWithInput(logRowDom) {
    if(!input.dom) return;
    filterLog(logRowDom, input.dom.value);
  }

  function filterLog(logRowDom, s) {
    var agentDom = logRowDom.querySelector('.nickname'); 
    if(!agentDom) return;
    
    if(agentDom.textContent.toLowerCase().search(s.toLowerCase()) !== 0) {
      logRowDom.hidden = true;
    } else {
      logRowDom.hidden = false;
    }
  }
  
  function renderLogs(channel) {
    switch(channel) {
      case 'all':
        window.chat.renderPublic(false);
        break;
        
      case 'faction':
        window.chat.renderFaction(false);
        break;
        
      case 'alerts':
        window.chat.renderAlerts(false);
        break;
        
      default:
        break;
    }
  }
  
  function clear() {
    input.dom.value = input.dom.defaultValue;
    input.oldValue = input.dom.value;
    
    var channel = window.chat.getActive();
    
    if(comm.channels[channel].hasLogs()) window.plugin.commfilter.renderLogs(channel);
    
    document.getElementById('chattext').value = '';
  }

  function setup() {
    // override original function following:
    window.chat.renderData = renderData;
    window.chat.keepScrollPosition = keepScrollPosition;
    
    dom = document.createElement('form');
    dom.id = ID;
    dom.addEventListener('reset', clear);

    input.create();
    dom.appendChild(input.dom);
    
    reset.create();
    dom.appendChild(reset.dom);
    
    comm.dom = document.getElementById('chat');
    comm.dom.insertBefore(dom, comm.dom.firstElementChild);

    comm.channels['all'] = new comm.Channel('all');
    comm.channels['faction'] = new comm.Channel('faction');
    comm.channels['alerts'] = new comm.Channel('alerts');

    for(var channel in comm.channels) {
      comm.channels[channel].dom = comm.dom.querySelector('#chat' + comm.channels[channel].name);
      
      if(comm.channels[channel].dom) {
        var dom = document.createElement('div');
        dom.className = 'status';
        comm.channels[channel].dom.insertBefore(dom, comm.channels[channel].dom.firstChildElement);
      }
    }
  }

  return {
    renderLogs: renderLogs,
    setup: setup
  };

}());

var setup = (function(plugin) {
  return function(){
    plugin.setup();
      
    $("<style>")
      .prop("type", "text/css")
      .html("#PLUGIN_LOG_FILTER>input {\n  width: 30%;\n  height: 24px;\n}\n\n#PLUGIN_LOG_FILTER>button {\n  padding: 2px;\n  min-width: 40px;\n  color: #FFCE00;\n  border: 1px solid #FFCE00;\n  background-color: rgba(8, 48, 78, 0.9);\n  text-align: center;\n}\n\n#chat {\n  padding-bottom: 24px;\n}\n\n#chatall>.status, #chatfaction>.status, #chatalerts>.status {\n  height: 20px;\n  text-align: center;\n  font-style: italic;\n}\n\n#chatall>table, #chatfaction>table, #chatalerts>table {\n  table-layout: auto;\n}\n\n#chatall>table td:nth-child(2),\n#chatfaction>table td:nth-child(2),\n#chatalerts>table td:nth-child(2) {\n  width: 15ex;\n}\n")
      .appendTo("head");
  };
}(window.plugin.commfilter));

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


