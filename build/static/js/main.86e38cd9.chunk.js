(this["webpackJsonpmastershane.github.io"]=this["webpackJsonpmastershane.github.io"]||[]).push([[0],{14:function(e,t,c){},15:function(e,t,c){},17:function(e,t,c){"use strict";c.r(t);var r=c(0),n=c(2),l=c.n(n),s=c(7),a=c.n(s),o=(c(14),c(1)),i=c(8),u=(c(15),{r:"Red",b:"Blue",g:"Green",y:"Yellow",w:"White"}),d={o:"Oasis",d:"Desert"},h=function(e){return{tiles:e.toLowerCase().split(",").map((function(e){var t={camels:[]};return e.split("").forEach((function(e){switch(e){case"r":case"b":case"g":case"y":case"w":t.camels.push(u[e]);break;case"o":case"d":t.hazard=d[e];break;default:throw new Error("Unsupported Character ".concat(e," found in camel string"))}})),t}))}},j=function(e){return e.split("").map((function(e){return{color:u[e]}}))},b=function(e){return e.tiles.map((function(e){if(e.hazard)switch(e.hazard){case"Oasis":return"o";case"Desert":return"d"}return e.camels.map(f).join("")})).join(",")},f=function(e){switch(e){case"Red":return"r";case"Green":return"g";case"Blue":return"b";case"White":return"w";case"Yellow":return"y"}},m=c(5),O=function(e,t){var c={Red:{first:0,second:0},Blue:{first:0,second:0},Green:{first:0,second:0},White:{first:0,second:0},Yellow:{first:0,second:0}},r=function(e){var t,c,r=e.length,n=[e.slice()],l=new Array(r).fill(0),s=1;for(;s<r;)l[s]<s?(t=s%2&&l[s],c=e[s],e[s]=e[t],e[t]=c,++l[s],s=1,n.push(e.slice())):(l[s]=0,++s);return n}(t),n=[];r.forEach((function(e){var t=function t(c,r){if(c>=e.length)return[];var n=e[c],l=[1,2,3].map((function(e){return{color:n.color,Roll:e,nextRolls:[]}}));return r&&r.forEach((function(e){return e.nextRolls=l})),t(c+1,l),l}(0),c=function e(t,c){var r=Object(m.a)(c);r.push(t),t.nextRolls.length?t.nextRolls.forEach((function(t){e(t,r)})):n.push(r)};t.forEach((function(e){return c(e,[])}))})),n.forEach((function(t){var r=p(e,t);c[r.first].first=c[r.first].first+1,c[r.second].second=c[r.second].second+1}));var l=function(e,t,c){return e*c+1*t+-1*(1-(e+t))};return Object.keys(c).map((function(e){var t=c[e],r=t.first/n.length,s=t.second/n.length;return{camel:e,firstPlaceOdds:r,secondPlaceOdds:s,fiveValue:l(r,s,5),threeValue:l(r,s,3),twoValue:l(r,s,2)}}))},p=function(e,t){var c={tiles:Object(m.a)(e.tiles.map((function(e){return{camels:Object(m.a)(e.camels),hazard:e.hazard}})))};t.forEach((function(e){x(c,e)}));for(var r=[],n=c.tiles.length-1;n>=0;n--)for(var l=c.tiles[n],s=l.camels.length-1;s>=0;s--)if(r.push(l.camels[s]),2===r.length)return{first:r[0],second:r[1]};throw Error("this code should not be reached")},x=function(e,t){var c=e.tiles.findIndex((function(e){return e.camels.indexOf(t.color)>-1})),r=e.tiles[c],n=r.camels.splice(r.camels.indexOf(t.color)),l=function(t){if(t>=e.tiles.length)for(var c=e.tiles.length-1;c<t;c++)e.tiles.push({camels:[]})},s=function(e,t){e.forEach((function(e){t.camels.push(e)}))},a=c+t.Roll;l(a);var o=e.tiles[a];if("Desert"===o.hazard){var i=e.tiles[a-1],u=i.camels;i.camels=[],s(n,i),s(u,i)}else if("Oasis"===o.hazard){var d=a+1;l(d),s(n,e.tiles[d])}else s(n,o)},v=function(){for(var e=[{color:"Red"},{color:"Green"},{color:"White"},{color:"Blue"},{color:"Yellow"}],t={tiles:[{camels:[]},{camels:[]},{camels:[]}]};e.length;){var c=g(e);t.tiles[c.Roll-1].camels.push(c.color)}return t},g=function(e){var t=Math.floor(Math.random()*e.length),c=e.splice(t,1)[0],r=Math.floor(3*Math.random())+1;return Object(o.a)(Object(o.a)({},c),{},{Roll:r})};var w=function(){var e=Object(n.useState)({boardInput:b(v()),diceInput:"rgbyw"}),t=Object(i.a)(e,2),c=t[0],l=t[1];return Object(r.jsxs)("div",{className:"container",children:[Object(r.jsx)("h1",{children:"Cameluculator"}),Object(r.jsx)("p",{children:'Enter a game state using camel code. Separate spaces with a ",". Camels stack so that the right most camel will be on top. Example: rw,,o,gby'}),Object(r.jsx)("h3",{children:"Key:"}),Object(r.jsxs)("ul",{children:[Object(r.jsx)("li",{children:"r: Red Camel"}),Object(r.jsx)("li",{children:"g: Green Camel"}),Object(r.jsx)("li",{children:"w: White Camel"}),Object(r.jsx)("li",{children:"b: Blue Camel"}),Object(r.jsx)("li",{children:"y: Yellow Camel"}),Object(r.jsx)("li",{children:"d: Desert"}),Object(r.jsx)("li",{children:"o: Oasis"})]}),Object(r.jsxs)("form",{onSubmit:function(e){!function(){var e=h(c.boardInput),t=j(c.diceInput),r=O(e,t);l(Object(o.a)(Object(o.a)({},c),{},{results:r}))}(),e.preventDefault()},children:[Object(r.jsxs)("div",{className:"form-group",children:[Object(r.jsx)("label",{className:"form-label",htmlFor:"camel-code",children:"Camel Code "}),Object(r.jsx)("input",{className:"form-control",type:"text",id:"camel-code",spellCheck:"false",value:c.boardInput,onChange:function(e){return l(Object(o.a)(Object(o.a)({},c),{},{boardInput:e.target.value}))}})]}),Object(r.jsxs)("div",{className:"form-group",children:[Object(r.jsx)("label",{htmlFor:"dice",children:"Remaining Dice "}),Object(r.jsx)("input",{className:"form-control",type:"text",id:"dice",spellCheck:"false",value:c.diceInput,onChange:function(e){return l(Object(o.a)(Object(o.a)({},c),{},{diceInput:e.target.value}))}})]}),Object(r.jsx)("br",{}),Object(r.jsx)("input",{className:"btn btn-primary",type:"submit",value:"Calculate!"}),c.results&&Object(r.jsxs)("select",{className:"form-select",onChange:function(e){var t=e.target.value.split("_"),r=t[0],n={color:r,Roll:parseInt(t[1])},s=h(c.boardInput);x(s,n);var a=c.diceInput.replace(f(r),"");a||(a="rwgby",s.tiles.forEach((function(e){return e.hazard=void 0})));var o=j(a),i=O(s,o);l({boardInput:b(s),diceInput:a,results:i})},value:"_",style:{marginTop:"10px"},children:[Object(r.jsx)("option",{selected:!0,disabled:!0,value:"_",children:"Select Next Roll"}),j(c.diceInput).map((function(e){return Object(r.jsxs)("optgroup",{label:e.color,children:[Object(r.jsx)("option",{value:e.color+"_1",children:e.color+" 1"}),Object(r.jsx)("option",{value:e.color+"_2",children:e.color+" 2"}),Object(r.jsx)("option",{value:e.color+"_3",children:e.color+" 3"})]})}))]})]}),Object(r.jsx)("br",{}),c.results&&Object(r.jsxs)("table",{className:"table table-bordered",children:[Object(r.jsx)("thead",{children:Object(r.jsxs)("tr",{children:[Object(r.jsx)("th",{children:"Camel"}),Object(r.jsx)("th",{children:"Five Value"}),Object(r.jsx)("th",{children:"Three Value"}),Object(r.jsx)("th",{children:"Two Value"}),Object(r.jsx)("th",{children:"First Place Odds"}),Object(r.jsx)("th",{children:"Second Place Odds"})]})}),Object(r.jsx)("tbody",{children:c.results.map((function(e){return Object(r.jsxs)("tr",{children:[Object(r.jsx)("th",{scope:"row",children:e.camel}),Object(r.jsx)("td",{children:+e.fiveValue.toFixed(3)}),Object(r.jsx)("td",{children:+e.threeValue.toFixed(3)}),Object(r.jsx)("td",{children:+e.twoValue.toFixed(3)}),Object(r.jsx)("td",{children:+e.firstPlaceOdds.toFixed(3)}),Object(r.jsx)("td",{children:+e.secondPlaceOdds.toFixed(3)})]},e.camel)}))})]})]})},C=function(e){e&&e instanceof Function&&c.e(3).then(c.bind(null,18)).then((function(t){var c=t.getCLS,r=t.getFID,n=t.getFCP,l=t.getLCP,s=t.getTTFB;c(e),r(e),n(e),l(e),s(e)}))};c(16);a.a.render(Object(r.jsx)(l.a.StrictMode,{children:Object(r.jsx)(w,{})}),document.getElementById("root")),C()}},[[17,1,2]]]);
//# sourceMappingURL=main.86e38cd9.chunk.js.map