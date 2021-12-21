## [Comm Filter][comm-filter]
*Updates [COMM Filter](https://github.com/udnp/iitc-plugins) by [udnp](https://github.com/udnp).*  
Adds filters to the comm to remove specific logs.

Features by naf:
1. add inlined total MUs created in the backlog
1. add fracker as a filter
1. add virus detection and as a filter
   1. BugFix for Virus detection when 2 agents simultaneously destroy 2 resonators on the same portal
   1. side note: a virus applied on a portal with only one resonator will not be detected but who care?
1. add checkable filtering for all/faction/alert
1. add per agent total MUs created in the backlog
1. the #6 answer

## [Share selected portal][share-selected-portal] (only on android)
Adds a share button for the selected portal at the bottom left of the screen.  
I have copied the placement for the star of the bookmarks plugin, so one of the plugins will be drawn over the other one.

## [Force refresh][force-refresh]
*Updates [force refresh](https://github.com/ResistanceCN/iitc-plugins) by [balthild](https://github.com/balthild).*  
Not a lot of changes.  
I’ve replaced the text "refresh" by "↻", the refresh is extracted in a function, and I’ve used jQuery to add the button to the dom.

## [Portal Multi Export][portal-multi-export]
*Updates [Portal Multi Export](https://github.com/modkin/Ingress-IITC-Multi-Export).*  
The update URL is broken and replacing the content of the plugin by a web page.  

[comm-filter]: https://github.com/clavelm/iitc-plugins/releases/download/release/comm-filter.user.js
[share-selected-portal]: https://github.com/clavelm/iitc-plugins/releases/download/release/share-selected-portal.user.js
[force-refresh]: https://github.com/clavelm/iitc-plugins/releases/download/release/force-refresh.user.js
[portal-multi-export]: https://github.com/clavelm/iitc-plugins/releases/download/release/multi-export.user.js
