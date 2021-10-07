// ==UserScript==
// @id             iitc-plugin-comm-filter@udnp
// @author         udnp
// @name           IITC plugin: COMM Filter
// @category       COMM
// @version        0.5.8
// @description    COMM Filter
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://github.com/clavelm/iitc-plugins/raw/dist/comm-filter.meta.js
// @downloadURL    https://github.com/clavelm/iitc-plugins/raw/dist/comm-filter.user.js
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'dw235';
plugin_info.dateTimeVersion = '2021-10-07-171005';
plugin_info.pluginId = 'comm-filter';
//END PLUGIN AUTHORS NOTE

// use own namespace for plugin
window.plugin.commfilter = (function() {
  'use strict';
  var ID = 'PLUGIN_COMM_FILTER',
    DESCRIPTIONS = "COMM Filter plug-in",
    config = {
      filter: {
        virus    : true,
        fracker  : true,
        deployed : true,
        captured : true,
        linked   : true,
        created  : true,
        destroyed: true,
        public   : true,
        faction  : true,
        alert    : true
      }
      // filtering_between_agents_and_actions: 'OR' // AND, OR
    },
    // inputAgent,
    // inputAction,
    inputAgentsOrPortals,
    filterSwitches = [];

  var Input = (function Input() {
    var Constr = function(textboxDom) {
      var textbox = {
        dom: textboxDom
      };

      Object.defineProperties(this, {
        name        : {
          get: function() {
            return textbox.dom ? textbox.dom.name : null;
          },
          set: function(value) {
            if(textbox.dom) {
              textbox.dom.name = value;
            }
          }
        },
        value       : {
          get: function() {
            return textbox.dom ? textbox.dom.value : null;
          },
          set: function(value) {
            if(textbox.dom) {
              textbox.dom.value = value;
            }
          },
        },
        defaultValue: {
          get: function() {
            return textbox.dom ? textbox.dom.defaultValue : null;
          },
          set: function(value) {
            if(textbox.dom) {
              textbox.dom.defaultValue = value;
            }
          },
        }
      });
      this.defaultValue = '';
      this.value = this.defaultValue;
      this.oldValue = null;
      this.fireInputEvent = function() {
        if(textbox.dom) {
          textbox.dom.dispatchEvent(new Event('input', {
            bubbles: true
          }));
        }
      };
    };

    Constr.prototype = {
      constructor: Input,

      get wordsList() {
        return this.value.trim().split(/\s+/);
      },

      clear: function() {
        this.oldValue = this.value;
        this.value = this.defaultValue;
        this.fireInputEvent();

        //TODO related to issue#5
        //document.getElementById('chattext').value = '';
      },

      isValueChanged: function() {
        if(this.value !== this.oldValue) {
          this.oldValue = this.value;
          return true;
        } else {
          return false;
        }
      },

      isWordsListChanged: function() {
        var oldWordsList = (this.oldValue !== null) ? this.oldValue.trim().split(/\s+/) : null;

        if(!this.isValueChanged()) {
          return false;
        }
        if(!oldWordsList) {
          if(this.value.trim() === '') {
            return false;
          } else {
            return true;
          }
        }
        if(oldWordsList.length !== this.wordsList.length) {
          return true;
        } else {
          for(var i = 0; i < oldWordsList.length; i++) {
            if(oldWordsList[ i ] !== this.wordsList[ i ]) {
              return true;
            }
          }

          return false;
        }
      }
    };

    return Constr;
  })();

  var FilterSwitch = (function FilterSwitch() {
    var Constr = function(action) {
      if(!action) {
        return null;
      }

      var switchDom = document.createElement('input');
      switchDom.type = 'checkbox';

      Object.defineProperties(this, {
        name   : {
          get: function() {
            return switchDom ? switchDom.name : null;
          },
          set: function(val) {
            if(switchDom) {
              switchDom.name = val;
            }
          }
        },
        checked: {
          get: function() {
            return switchDom ? switchDom.checked : null;
          },
          set: function(val) {
            if(switchDom) {
              switchDom.checked = val;
            }
          }
        }
      });

      this.name = action;
      this.checked = config.filter[ action ];

      this.dom = document.createElement('label');
      this.dom.className = 'switch';
      this.dom.textContent = action;
      this.dom.insertBefore(switchDom, this.dom.firstChild);
    };

    Constr.prototype = {
      constructor: FilterSwitch,

      toggle: function() {
        if(this.checked) {
          config.filter[ this.name ] = true;
        } else {
          config.filter[ this.name ] = false;
        }
      }
    };

    return Constr;
  })();

  function filterAgent(log, agent) {
    if(checkWordPrefix(agent.toLowerCase(), log.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  function filterPortal(log, portal) {
    if(checkWord(portal.toLowerCase(), log.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  function filterOutDeployed(log) {
    if(!config.filter.deployed) {
      return isDeployedLog(log);
    }

    return false;
  }

  function isDeployedLog(log) { //naf: now used only for resonator deployed, not fracker
    if(checkWordPrefix('deployed a Resonator', log.trim())) { //naf: not to mess up with the special case 'deployed a Fracker'
      return true;
    } else {
      return false;
    }
  }

  function filterOutCaptured(log) {
    if(!config.filter.captured) {
      return isCapturedLog(log);
    }

    return false;
  }

  function isCapturedLog(log) {
    if(checkWordPrefix('captured', log.trim())) {
      return true;
    } else {
      return false;
    }
  }

  function filterOutLinked(log) {
    if(!config.filter.linked) {
      return isLinkedLog(log);
    }

    return false;
  }

  function isLinkedLog(log) {
    if(checkWordPrefix('linked', log.trim())) {
      return true;
    } else {
      return false;
    }
  }

  function filterOutCreated(actionlogdom, agentdesc) { //Naf
    var res = isCreatedLog(actionlogdom, agentdesc); //Naf Check before test for MUs addition
    if(!config.filter.created) {
      return res; //Naf
    }
    return false;
  }

  function isCreatedLog(actionlogdom, agentdesc) { //Naf
    var log = actionlogdom.textContent; //Naf
    if(checkWordPrefix('created', log.trim())) {
      var mmu = log.split('+')[ 1 ]; //Naf
      mmu = mmu.split(' ')[ 0 ]; //Naf
      MUs = MUs + parseInt(mmu); //Naf
      actionlogdom.innerHTML = actionlogdom.innerHTML + " / Total: " + MUs + " MUs"; //Naf: use innerHTML rather than textContent
      if(MUTable.hasOwnProperty(agentdesc)) {
        MUTable[ agentdesc ] = MUTable[ agentdesc ] + parseInt(mmu);
      } else {
        MUTable[ agentdesc ] = parseInt(mmu);
        MUTableAgentSelected[ agentdesc ] = true;
      }
      return true;
    } else {
      return false;
    }
  }


  //naf diplay total MU captured per agent
  //window.plugin.commfilter.toggleSelectedMU = function(agentid) {
  function toggleSelectedMU() {
    console.log("now toggling");
    var agentNumber = 0;
    var agentID = "";
    var selectedText;
    var totalMUSelected = 0;
    for(var agentDesc in MUTable) {
      agentID = "Agent_" + agentNumber;
      agentNumber++;
      if(MUTable.hasOwnProperty(agentDesc)) {
        if(document.getElementById(agentID).checked) {
          document.getElementById(agentID + "_SMU").style.visibility = 'visible';
          totalMUSelected += MUTable[ agentDesc ];
          console.log(agentID + " is checked. TotalMUSelected is currently:" + totalMUSelected);
        } else {
          document.getElementById(agentID + "_SMU").style.visibility = 'hidden';
          console.log(agentID + " is not checked. TotalMUSelected is still:" + totalMUSelected);
        }
      }
    }
    document.getElementById('total_MU_selected').innerText = totalMUSelected + " MUs";
    console.log("Total selectected: " + totalMUSelected);
  };

  function totalMUCapturedShow() {
    var out = '';
    var totalMU = 0;
    var totalMUSelected = 0;
    out = "<div style='width:100%;border:1px solid;margin-bottom:3px;'><h4 style='text-align:center;margin:0;'>Select agents to see total</h4></div>";
    out += "<div style='width:100%;border:1px solid;margin-bottom:3px;'>";
    out += "<form id='total_captured_MUs'><table>";
    out += "<tr><td>Agent</td><td></td><td></td><td align='right'>Selected</td></tr>"
    var agentNumber = 0;
    var agentID = "";
    for(var agentDesc in MUTable) {
      if(MUTable.hasOwnProperty(agentDesc)) {
        agentID = "Agent_" + agentNumber;
        agentNumber++;
        out += '<tr><td>' + agentDesc + '</td><td><input id="' + agentID + '" type="checkbox"';
        if(MUTableAgentSelected[ agentDesc ]) {
          out += " checked>";
          totalMUSelected += MUTable[ agentDesc ];
        } else {
          out += ">";
        }
        out += "</td><td align='right'>" + MUTable[ agentDesc ] + " MUs</td><td id='" + agentID + "_SMU' align='right'>" + MUTable[ agentDesc ] + " MUs</td></tr>";
        totalMU += MUTable[ agentDesc ];
      }
    }
    out += '<tr><td>total MUs</td><td></td><td>' + totalMU + ' MUs</td><td id="total_MU_selected" align="right">' + totalMUSelected + ' MUs</td></tr>';
    out += "</table></form></div>";
    dialog({
      id   : 'total_captured_MUs',
      html : out,
      title: 'Total MUs captured by agents'
    });
    agentNumber = 0;
    agentID = "";
    for(var agentDesc in MUTable) {
      if(MUTable.hasOwnProperty(agentDesc)) {
        agentID = "Agent_" + agentNumber;
        agentNumber++;
        document.getElementById(agentID).addEventListener('change', function() {
          toggleSelectedMU();
        }, true);
      }
    }
  }

  function filterOutDestroyed(log) {
    if(!config.filter.destroyed) {
      return isDestroyedLog(log);
    }

    return false;
  }

  function isDestroyedLog(log) {
    if(checkWordPrefix('destroyed', log.trim())) {
      return true;
    } else {
      return false;
    }
  }

  function filterOutFaction(actionlogdom) {
    if(!config.filter.faction) {
      return isFactionLog(actionlogdom);
    }

    return false;
  }

  function isFactionLog(actionlogdom) {
    var log = actionlogdom.textContent;
    if(checkWordPrefix(/\[faction\]/, log.trim())) {
      return true;
    } else {
      return false;
    }
  }

  function filterOutPublic(log) {
    if(!config.filter.public) {
      return isPublicLog(log);
    }

    return false;
  }

  function isPublicLog(log) {
    if(checkWordPrefix(/\[public\]/, log.trim())) {
      return true;
    } else {
      return false;
    }
  }

  function filterOutAlert(log) {
    if(!config.filter.alert) {
      return isAlertLog(log);
    }

    return false;
  }

  function isAlertLog(log) {
    if(checkWordPrefix('your', log.trim().toLowerCase())) { //Naf: TODO Should filter [SECURE] as well in public comm as an alert?
      return true;
    } else {
      return false;
    }
  }

  //Naf: Fracker implementation
  function filterOutFracker(log) {
    if(!config.filter.fracker) {
      return isFrackerLog(log);
    }
    return false;
  }

  function isFrackerLog(log) {
    if(checkWordPrefix('deployed', log.trim())) {
      if(checkWord('Fracker', log.trim())) {
        return true;
      }
    }
    return false;
  }

  //Naf: Virus filter implementation
  function filterOutVirus(log) {
    if(!config.filter.virus) {
      return isVirusLog(log);
    }
    return false;
  }

  function isVirusLog(log) {
    if(checkWordPrefix('used a Virus', log.trim())) {
      return true;
    }
    return false;
  }


  function checkWord(s, word) {
    if(word.search(s) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  function checkWordPrefix(prefix, word) {
    if(word.search(prefix) === 0) {
      return true;
    } else {
      return false;
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

  function insertStatusViewTo(channelDom) {
    var dom = document.createElement('div');
    dom.className = 'status';
    channelDom.insertBefore(dom, channelDom.firstChildElement);
  }

  function setup() {
    var commDom = document.getElementById('chat');
    if(!commDom) {
      return;
    }

    $("<style>")
    .prop('type', 'text/css')
    .html('\
#PLUGIN_COMM_FILTER {\
  display: flex;\
  align-items: center;\
  padding: 0 0.5ex;\
}\
\
#chat:not(.expand) > #PLUGIN_COMM_FILTER {\
  position: absolute;\
  right: 30px;\
  width: 30%;\
  z-index: 1;\
  background: rgba(8, 48, 78, 0.9);\
}\
\
#chat:not(.expand) > #PLUGIN_COMM_FILTER > .switchgroup {\
  display: none;\
}\
\
#chat:not(.expand) {\
  padding-bottom: 0;\
}\
\
#chat {\
  padding-bottom: 26px;\
}\
\
#PLUGIN_COMM_FILTER .title {\
  height: 26px;\
  padding-right: 0.5ex;\
  flex: none; /* for Android K WebView */\
  display: inline-flex;\
  align-items: center;\
}\
\
#PLUGIN_COMM_FILTER > select {\
  margin: 0 1ex;\
}\
\
#PLUGIN_COMM_FILTER > .switchgroup {\
  overflow-x: auto;\
  align-self: stretch;\
  display: inline-flex;\
  align-items: center;\
}\
\
#PLUGIN_COMM_FILTER .switch {\
  white-space: nowrap;\
  margin-left: 1.2ex;\
  flex: none; /* for Android K WebView */\
  display: inline-flex;\
  align-items: center;\
  padding: 0.5ex 0;\
}\
\
#PLUGIN_COMM_FILTER > input[name=agents_or_portals] {\
  flex-grow: 1;\
  flex-shrink: 0;\
  flex-basis: auto;\
  width: 16ex;\
}\
\
#PLUGIN_COMM_FILTER > input[name=agents_or_portals]:focus ~ .switchgroup {\
  display: none;\
}\
\
#PLUGIN_COMM_FILTER > button {\
  padding: 2px;\
  min-width: 40px;\
  color: #FFCE00;\
  border: 1px solid #FFCE00;\
  background-color: rgba(8, 48, 78, 0.9);\
  text-align: center;\
}\
\
#chatall > .status, #chatfaction > .status, #chatalerts > .status {\
  height: 20px;\
  text-align: center;\
  font-style: italic;\
}\
\
#chatall > table, #chatfaction > table, #chatalerts > table {\
  table-layout: auto;\
}\
\
#chatall > table td:nth-child(2),\
#chatfaction > table td:nth-child(2),\
#chatalerts > table td:nth-child(2) {\
  width: 15ex;\
}\
\
/* hack chat.js divider */\
#chatall > table tr.divider,\
#chatfaction > table tr.divider,\
#chatalerts > table tr.divider {\
  border-top: solid 1px #bbb;\
}\
\
#chatall > table tr.divider > td,\
#chatfaction > table tr.divider > td,\
#chatalerts > table tr.divider > td {\
  padding-top: 3px;\
}\
\
#chatall > table tr.divider summary,\
#chatfaction > table tr.divider summary,\
#chatalerts > table tr.divider summary {\
  box-sizing: border-box;\
  padding-left: 2ex;\
}\
')
    .appendTo('head');

    /* #chatcontrols */
    // refreshing filtered logs on COMM tabs changed
    document.getElementById('chatcontrols').addEventListener('click', function() {
      renderLogs(window.chat.getActive());
    });

    /* #chat */
    if(window.isSmartphone()) {
      // in order to provide common UI as same as Desktop mode for Android.
      commDom.classList.add('expand');
    }

    /* #chatall, #chatfaction, #chatalerts */
    var channelsDoms = [commDom.querySelector('#chatall'),
      commDom.querySelector('#chatfaction'),
      commDom.querySelector('#chatalerts')
    ];

    channelsDoms.forEach(function(dom) {
      if(dom) {
        insertStatusViewTo(dom);
      }
    });

    // filtering by agent name clicked/tapped in COMM
    commDom.addEventListener('click', function(event) {
      if(!event.target.classList.contains('nickname')) {
        return;
      }

      // tentative: to avoid a problem on Android that causes cached chat logs reset,
      //            call event.stopPropagation() in this.
      //            So IITC original action that inputs @AGENT_NAME automatically
      //            to the #chattext box is blocked.
      //TODO related to issue#5
      event.stopPropagation();

      if(!inputAgentsOrPortals.value) {
        inputAgentsOrPortals.value = event.target.textContent + ' ';
      } else {
        inputAgentsOrPortals.value = inputAgentsOrPortals.value + ' ' + event.target.textContent + ' ';
      }

      inputAgentsOrPortals.fireInputEvent();
    });

    /* header#ID */
    var rootDom = document.createElement('header');
    rootDom.id = ID;

    /* b.title[title=DESCRIPTIONS] Filter */
    var titleDom = document.createElement('b');
    titleDom.className = 'title';
    titleDom.textContent = 'Filter';
    titleDom.title = DESCRIPTIONS;
    rootDom.appendChild(titleDom);

    /* input[type=text][name=agents_or_portals][placeholder="agents or portals"] */
    var textboxDom = document.createElement('input');
    textboxDom.type = 'text';
    textboxDom.name = 'agents_or_portals';
    textboxDom.placeholder = 'agents or portals';
    rootDom.appendChild(textboxDom);
    rootDom.addEventListener('input', function(event) {
      if(event.target === textboxDom) {
        if(inputAgentsOrPortals.isWordsListChanged()) {
          renderLogs(window.chat.getActive());
        }
      }
    });

    /* button[type=button] */
    var resetButtonDom = document.createElement('button');
    resetButtonDom.type = 'button';
    resetButtonDom.textContent = 'X';
    rootDom.appendChild(resetButtonDom);
    resetButtonDom.addEventListener('click', function() {
      inputAgentsOrPortals.clear();
    });

    inputAgentsOrPortals = new Input(textboxDom);

    /* button[type=button] */ //Naf add total MU captured button to display new dialog
    var totalMUButtonDom = document.createElement('button');
    totalMUButtonDom.type = 'button';
    totalMUButtonDom.textContent = 'MUs';
    rootDom.appendChild(totalMUButtonDom);
    totalMUButtonDom.addEventListener('click', function() {
      totalMUCapturedShow();
    });

    /* span.switchgroup */
    var switchesDom = document.createElement('span');
    switchesDom.className = 'switchgroup';

    /* input[type=text][name=agents_or_portals][placeholder="agents or portals"] */
    filterSwitches = [
      new FilterSwitch('fracker'),
      new FilterSwitch('virus'),
      new FilterSwitch('deployed'),
      new FilterSwitch('captured'),
      new FilterSwitch('linked'),
      new FilterSwitch('created'),
      new FilterSwitch('destroyed'),
      new FilterSwitch('public'),
      new FilterSwitch('faction'),
      new FilterSwitch('alert')
    ];

    for(var i = 0; i < filterSwitches.length; i++) {
      switchesDom.appendChild(filterSwitches[ i ].dom);
    }

    rootDom.appendChild(switchesDom);
    rootDom.addEventListener('change', function(event) {
      for(var i = 0; i < filterSwitches.length; i++) {
        if(event.target.name === filterSwitches[ i ].name) {
          filterSwitches[ i ].toggle();
          renderLogs(window.chat.getActive());
          break;
        }
      }
    });

    commDom.insertBefore(rootDom, commDom.firstElementChild);
  }

  return {
    filterAgent       : filterAgent,
    filterPortal      : filterPortal,
    filterOutAlert    : filterOutAlert,
    filterOutCaptured : filterOutCaptured,
    filterOutCreated  : filterOutCreated,
    filterOutDeployed : filterOutDeployed,
    filterOutDestroyed: filterOutDestroyed,
    filterOutFaction  : filterOutFaction,
    filterOutLinked   : filterOutLinked,
    filterOutPublic   : filterOutPublic,
    filterOutVirus    : filterOutVirus,
    filterOutFracker  : filterOutFracker,
    get input() {
      return inputAgentsOrPortals;
    },
    setup: setup
  };

}());

var setup = function() {
  if(!window.chat) {
    return;
  }

  /*
   * override following functions for the window.chat
   */
  //// based on original iitc/code/chat.js @ rev.5298c98
  // renders data from the data-hash to the element defined by the given
  // ID. Set 3rd argument to true if it is likely that old data has been
  // added. Latter is only required for scrolling.
  window.chat.renderData = function(data, element, likelyWereOldMsgs) {
    var elm = $('#' + element);
    if(elm.is(':hidden')) {
      return;
    }

    // discard guids and sort old to new
    //TODO? stable sort, to preserve server message ordering? or sort by GUID if timestamps equal?
    var vals = $.map(data, function(v, k) {
      return [v];
    });
    vals = vals.sort(function(a, b) {
      return a[ 0 ] - b[ 0 ];
    });

    // render to string with date separators inserted
    var msgs = '';
    var prevTime = null;
    $.each(vals, function(ind, msg) {
      var nextTime = new Date(msg[ 0 ]).toLocaleDateString();
      if(prevTime && prevTime !== nextTime) {
        msgs += chat.renderDivider(nextTime);
      }
      msgs += msg[ 2 ];
      prevTime = nextTime;
    });

    var scrollBefore = scrollBottom(elm);
    if(!window.plugin.commfilter) {
      elm.html('<table>' + msgs + '</table>');
    } else {
      elm.append(chat.renderTableDom($(msgs)));
    }
    chat.keepScrollPosition(elm, scrollBefore, likelyWereOldMsgs);
  }

  //// based on original iitc/code/chat.js @ rev.5298c98
  // contains the logic to keep the correct scroll position.
  window.chat.keepScrollPosition = function(box, scrollBefore, isOldMsgs) {
    // If scrolled down completely, keep it that way so new messages can
    // be seen easily. If scrolled up, only need to fix scroll position
    // when old messages are added. New messages added at the bottom don’t
    // change the view and enabling this would make the chat scroll down
    // for every added message, even if the user wants to read old stuff.

    if(box.is(':hidden') && !isOldMsgs) {
      box.data('needsScrollTop', 99999999);
      return;
    }

    chat.fitLogsTableToBox(box);
    var statusView = $('.status', box);
    statusView.text('');

    if(scrollBefore === 0 || isOldMsgs) {
      box.data('ignoreNextScroll', true);
      box.scrollTop(box.scrollTop() + (scrollBottom(box) - scrollBefore) +
        statusView.outerHeight());
      statusView.text('Now loading...');
    }
  }

  //// based on original iitc/code/chat.js @ rev.5298c98
  window.chat.renderDivider = function(text) {
    return '<tr class="divider"><td colspan="3"><summary>' + text + '</summary></td></tr>';
  }

  /*
   * append following functions for the window.chat
   */
  window.chat.fitLogsTableToBox = function(box) {
    var logsTable = $('table', box);
    if(!logsTable) {
      return;
    }

    // box[0].offsetHeight - logsTable[0].offsetHeight
    var offset = box.outerHeight() - logsTable.outerHeight();

    if(offset > 0) {
      logsTable.css('margin-bottom', offset + 'px');
    } else {
      logsTable.css('margin-bottom', '0');
    }
  }

  $('#chatcontrols a:first').click(function() {
    window.chat.fitLogsTableToBox($('#chat > div:visible'));
  });

  window.chat.renderTableDom = function(rowDoms) {
    var dF = document.createDocumentFragment();
    MUs = 0;              //Naf: for total MU created
    MUTable = new Array(); //Naf: implementing total MUs per agent
    MUTableAgentSelected = new Array(); //Naf: Total MUs per selected agent
    lastVirusFound = '';  //Naf: for virus detection
    lastLogAgent = ''; //Naf: for Virus detection

    for(var i = 0; i < rowDoms.length - 1; i++) { //Naf: for virus detection, pass current line and the following
      chat.filter(rowDoms[ i ], rowDoms[ i + 1 ]);
      dF.appendChild(rowDoms[ i ]);
    }
    chat.filter(rowDoms[ rowDoms.length - 1 ], null); //Naf: then pass last line
    dF.appendChild(rowDoms[ rowDoms.length - 1 ]);

    var oldTableDom = document.querySelector('#chat' + window.chat.getActive() + ' table');
    if(oldTableDom) {
      oldTableDom.parentElement.removeChild(oldTableDom);
      oldTableDom = null;
    }

    var tableDom = document.createElement('table');
    tableDom.appendChild(dF);

    return tableDom;
  }

  window.chat.filter = function(rowDom, nextActionDom) {
    var filter = window.plugin.commfilter;

    if(!filter || !filter.input) {
      return;
    }
    if(!rowDom || rowDom.classList.contains('divider')) {
      lastVirusFound = '';
      return;
    }
    if(!nextActionDom || nextActionDom.classList.contains('divider')) {
      nextActionLogDom = '';
    } else {
      nextActionLogDom = nextActionDom.cells[ 2 ].textContent;
    }


    var wordsList = filter.input.wordsList;
    var agentLogDom = rowDom.cells[ 1 ].querySelector('.nickname');
    var agentLogDesc = rowDom.cells[ 1 ].innerHTML;
    var actionLogDom = rowDom.cells[ 2 ];
    var actionLogAgentsDomList = actionLogDom.querySelectorAll('.pl_nudge_player, .pl_nudge_me');
    var portalsDomList = rowDom.cells[ 2 ].querySelectorAll('.help');

    //Naf Start with Agent Filtering in order to get right MUs count. And optimizing perf as well :-)
    for(var i = wordsList.length - 1; -1 < i; i--) {
      // filtering agent
      if(!(agentLogDom && filter.filterAgent(agentLogDom.textContent, wordsList[ i ]))) {
        rowDom.hidden = true;
        return;
      }
    }

    //Naf: Check for Virus here, comparing rowDom with nextrowDom in order to detect  virus only once
    if(nextActionLogDom != '') { //Naf: else we do not care as the last log received
      if(lastVirusFound == '') { //Naf: no virus yet found
        if(actionLogDom.textContent.trim().search('destroyed a Resonator') === 0) { //Naf: May be a virus?
          if(actionLogDom.textContent == nextActionLogDom) { //Naf: may be a virus?
            if(agentLogDom == lastLogAgent) { //Naf: Yay! a virus! (hopefully)
              lastVirusFound = actionLogDom.textContent;
              actionLogDom.innerHTML = '<span style=\"color: #f88; background-color: #500;\">used a Virus on<\/span> ' + actionLogDom.innerHTML.substring(actionLogDom.innerHTML.search(' on ') + 3);
            } else { //Naf: not the same agent ==> Not a virus
              lastVirusFound = '';
            }
          } else {
            lastVirusFound = '';
          }
        } else {
          if(lastVirusFound != actionLogDom.textContent) {
            lastVirusFound = '';
          } else {
            //Naf: still the same virus --> do nothing
          }
        }
      } else {
        if(lastVirusFound != actionLogDom.textContent) {
          lastVirusFound = '';
        } else {
          //Naf: still the same virus --> do nothing
        }
      }
    }

    lastLogAgent = agentLogDom;

    if(chat.getActive() === 'all') {
      //var actionLog = actionLogDom.textContent; // Naf; actionLogDom may have been modified in some function; textContent to be reevaluated
      if(filter.filterOutCaptured(actionLogDom.textContent) ||
        filter.filterOutVirus(actionLogDom.textContent) ||
        filter.filterOutFracker(actionLogDom.textContent) ||
        filter.filterOutDeployed(actionLogDom.textContent) ||
        filter.filterOutLinked(actionLogDom.textContent) ||
        //Naf: pass action log object in order to modify text to inline total MU created
        //Naf: as well as the agent in order to build the per agent total MU created
        filter.filterOutCreated(actionLogDom, agentLogDesc) ||
        filter.filterOutDestroyed(actionLogDom.textContent) ||
        filter.filterOutFaction(actionLogDom) || //Naf pass object for debug purposes
        filter.filterOutPublic(actionLogDom.textContent) ||
        filter.filterOutAlert(actionLogDom.textContent)) {
        rowDom.hidden = true;
        // AND filtering

        //rowDom.cells[2] = actionLogDom; //Naf set the text in case it has changed
        return;
      }
      //rowDom.cells[2] = actionLogDom; //Naf set the text in case it has changed
    } else if(chat.getActive() === 'alerts') {
      var actionLog = actionLogDom.textContent;
      if(filter.filterOutFaction(actionLogDom) || //Naf pass object for debug purposes
        filter.filterOutPublic(actionLog)) {
        rowDom.hidden = true;
        // AND filtering
        return;
      }
      rowDom.cells[ 2 ] = actionLogDom; //Naf set the text in case it has changed
    }

    for(var i = wordsList.length - 1; -1 < i; i--) {
      // filtering agent
      if(agentLogDom && filter.filterAgent(agentLogDom.textContent, wordsList[ i ])) {
        rowDom.hidden = false;
        return;
      }
      if(actionLogAgentsDomList.length) {
        for(var j = 0; j < actionLogAgentsDomList.length; j++) {
          if(filter.filterAgent(actionLogAgentsDomList[ j ].textContent, '@' + wordsList[ i ])) {
            rowDom.hidden = false;
            return;
          }
        }
      }

      // filtering portal
      // OR filtering
      if(portalsDomList.length) {
        for(var j = 0; j < portalsDomList.length; j++) {
          if(filter.filterPortal(portalsDomList[ j ].textContent, wordsList[ i ])) {
            rowDom.hidden = false;
            return;
          }
        }
      }

      rowDom.hidden = true;
    }
  }

  window.plugin.commfilter.setup();
};

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

