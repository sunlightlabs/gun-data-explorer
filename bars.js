var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;a=Base64._utf8_encode(a);while(i<a.length){c=a.charCodeAt(i++);chr2=a.charCodeAt(i++);chr3=a.charCodeAt(i++);enc1=c>>2;enc2=((c&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64}else if(isNaN(chr3)){enc4=64}b=b+this._keyStr.charAt(enc1)+this._keyStr.charAt(enc2)+this._keyStr.charAt(enc3)+this._keyStr.charAt(enc4)}return b},decode:function(a){var b="";var c,chr2,chr3;var d,enc2,enc3,enc4;var i=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<a.length){d=this._keyStr.indexOf(a.charAt(i++));enc2=this._keyStr.indexOf(a.charAt(i++));enc3=this._keyStr.indexOf(a.charAt(i++));enc4=this._keyStr.indexOf(a.charAt(i++));c=(d<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;b=b+String.fromCharCode(c);if(enc3!=64){b=b+String.fromCharCode(chr2)}if(enc4!=64){b=b+String.fromCharCode(chr3)}}b=Base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var n=0;n<a.length;n++){var c=a.charCodeAt(n);if(c<128){b+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){b+=String.fromCharCode((c>>6)|192);b+=String.fromCharCode((c&63)|128)}else{b+=String.fromCharCode((c>>12)|224);b+=String.fromCharCode(((c>>6)&63)|128);b+=String.fromCharCode((c&63)|128)}}return b},_utf8_decode:function(a){var b="";var i=0;var c=c1=c2=0;while(i<a.length){c=a.charCodeAt(i);if(c<128){b+=String.fromCharCode(c);i++}else if((c>191)&&(c<224)){c2=a.charCodeAt(i+1);b+=String.fromCharCode(((c&31)<<6)|(c2&63));i+=2}else{c2=a.charCodeAt(i+1);c3=a.charCodeAt(i+2);b+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));i+=3}}return b}};

var data_ie_base_url = 'http://data.influenceexplorer.com/contributions/#';

var svg = d3.select('#chart').attr('width','100%').attr('height','100%');

var labels = [  {'label':'Gun Control','key':'ANTI-GUN','x':0},
            //{'label':'State','key':'abbr','x':75},
            {'label':'Gun Rights','key':'PRO-GUN','x':109}];

var default_ibHeader_html = d3.select('#ibHeader').html();

var state_names = {},
    avg_state,
    avg_federal;
var mini_margin = {top:10,right:5,bottom:20,left:5},
    mini_width = parseFloat(d3.select('.miniChartContainer').style('width')) - mini_margin.left - mini_margin.right,
    mini_height = parseFloat(d3.select('.miniChartContainer').style('height')) - mini_margin.top - mini_margin.bottom;

var mini_x = d3.scale.ordinal()
                .rangeRoundBands([0,mini_width],.1);

var mini_y = d3.scale.sqrt()
                .range([mini_height,0]);

var mini_xAxis = d3.svg.axis()
                    .scale(mini_x)
                    .orient('bottom');

var mini_yAxis = d3.svg.axis()
                    .scale(mini_y)
                    .orient('left')
                    .tickFormat(format);

var moneyPrecision = d3.format(',f');

function moneyFormat(s) {
    return '$'+moneyPrecision(s);
}


function getAverages(states) {
    avg_state = [ 
        {   
            stance: 'Rights'    , 
            val: d3.mean(states,function(s){ return get_or_zero(s,'state_PRO-GUN')}),
            url: 'http://data.influenceexplorer.com/contributions/#Y29udHJpYnV0b3JfaW5kdXN0cnk9UTEzJTJDJmdlbmVyYWxfdHJhbnNhY3Rpb25fdHlwZT1zdGFuZGFyZCZ0cmFuc2FjdGlvbl9uYW1lc3BhY2U9dXJuJTNBbmltc3AlM0F0cmFuc2FjdGlvbg=='
        },
        {   
            stance: 'Control'  , 
            val: d3.mean(states,function(s){ return get_or_zero(s,'state_ANTI-GUN')}),
            url: 'http://data.influenceexplorer.com/contributions/#Y29udHJpYnV0b3JfaW5kdXN0cnk9UTEyJTJDJmdlbmVyYWxfdHJhbnNhY3Rpb25fdHlwZT1zdGFuZGFyZCZ0cmFuc2FjdGlvbl9uYW1lc3BhY2U9dXJuJTNBbmltc3AlM0F0cmFuc2FjdGlvbg=='
        }
                    ];
    avg_federal = [
        {   
            stance:'Rights'    , 
            val: d3.mean(states,function(s){ return get_or_zero(s,'federal_PRO-GUN') }),
            url: 'http://data.influenceexplorer.com/contributions/#c2VhdD1mZWRlcmFsJTNBc2VuYXRlJTdDZmVkZXJhbCUzQWhvdXNlJmNvbnRyaWJ1dG9yX2luZHVzdHJ5PVExMyUyQyZnZW5lcmFsX3RyYW5zYWN0aW9uX3R5cGU9c3RhbmRhcmQmdHJhbnNhY3Rpb25fbmFtZXNwYWNlPXVybiUzQWZlYyUzQXRyYW5zYWN0aW9u'        },
        {   
            stance: 'Control'  , 
            val: d3.mean(states,function(s){ return get_or_zero(s,'federal_ANTI-GUN')}),
            url: 'http://data.influenceexplorer.com/contributions/#c2VhdD1mZWRlcmFsJTNBc2VuYXRlJTdDZmVkZXJhbCUzQWhvdXNlJmNvbnRyaWJ1dG9yX2luZHVzdHJ5PVExMiUyQyZnZW5lcmFsX3RyYW5zYWN0aW9uX3R5cGU9c3RhbmRhcmQmdHJhbnNhY3Rpb25fbmFtZXNwYWNlPXVybiUzQWZlYyUzQXRyYW5zYWN0aW9u'
        }
                    ];
}

d3.json('states.json', function(json) {
    _.each(json,function(d){
            state_names[d.abbreviation] = d.name
        });
    });

xright = d3.scale.sqrt()
    .range([0,200]);

xleft = d3.scale.sqrt()
    .range([0,-200]);

y = d3.scale.ordinal()
    .rangeRoundBands([15,800],1);

function get_or_zero(o,k) {
    if (o.hasOwnProperty(k)) {
        //console.log(k);
        return o[k];
    } else {
        //console.log(0);
        return 0.0;
    }
}

function format(e) { 
    if (e < 1000) { 
        return e; 
    } else if (e > 999 && e < 1000000) { 
        return e/1000+"K"; 
    } else {
        return e/1000000+"M"
    }}

var xNegAxis = d3.svg.axis()
                .scale(xleft)
                .orient("top")
                .tickSize(-800)
                .tickValues([10000,100000])
                .tickFormat(format);

var xAxis = d3.svg.axis()
                .scale(xright)
                .orient("top")
                .tickSize(-800)
                .tickValues([10000,100000,250000,500000,1000000,1500000,2000000,2500000])
                .tickFormat(format);

var xmax;
var states;


    states = d3.json('state_data_update.json', function(json) {
        states = json.sort(function(a,b) { 
            return get_or_zero(b,'PRO-GUN') - get_or_zero(a,'PRO-GUN');})
        draw(states);
        getAverages(states);
        initMinis(states);
    }); 
        //states = json.sort(function(a,b) { return b['PRO-GUN'] - a['PRO-GUN'];}) 

function draw(states) {
        y.domain(states.map(function(d) { return d.id; }));
        maxes = [d3.max(states,function(s){return s['ANTI-GUN'];}),d3.max(states,function(s){return s['PRO-GUN'];})] 
        xmax = d3.max(maxes)
        xright.domain([0,xmax])
        xleft.domain([0,-xmax])
        .domain([0,d3.max(maxes)])

        gs = svg.selectAll('g')
                .data(states)
                .enter().append('g')
                .attr('id',function(d){ return 'row-'+d.id; })
                .attr('transform',function(d){return "translate(-130,"+(d.y0 = y(d.id))+")";})

        //anti-gun bars
        gs.append('rect')
            .classed('bar',true)
            .classed('control',true)
            .attr('height','10px')
            .attr('width',function(d){ return xright(get_or_zero(d,'ANTI-GUN')); })
            .attr('x',function(d){return 200 - xright(get_or_zero(d,'ANTI-GUN'));})
            .attr('y',0);

        gs.append('text')
                .attr('x',193)
                .attr('y',0)
                .attr('dx',-60)
                .attr('dy','.8em')
                .attr('class','bigBarLabel anti')
                .text(function(d){return moneyFormat(get_or_zero(d,'ANTI-GUN'));});

        //state labels
        gs.append('text')
          .attr('x',205)
          .attr('y',10)
          .attr('dx',6)
          .classed('stateLabel',true)
          .text(function(d) { return d.abbr; });
        
        //pro-gun bars
        gs.append('rect')
            .classed('bar',true)
            .classed('rights',true)
            .attr('height','10px')
            .attr('width',function(d){return xright(get_or_zero(d,'PRO-GUN'));})
            .attr('x',240)
            .attr('y',0)

        gs.append('text')
                .attr('x',377)
                .attr('y',0)
                .attr('dx',3)
                .attr('dy','.8em')
                .attr('class','bigBarLabel pro')
                .text(function(d){return moneyFormat(get_or_zero(d,'PRO-GUN'));});

        gs.append('rect')
            .classed('selectorMask',true)
            .attr('id',function(d){return 'selector-'+d.id;})
            .attr('height','10px')
            .attr('width','299px')
            .attr('x',131)
            .on('mouseover',function(d) {
                    d3.select('#selector-'+d.id).classed('darkened',true);
                    showValues(d);})
            .on('mouseout',function(d) {
                d3.select('#selector-'+d.id).classed('darkened',false); 
                if (d != focus ) {
                hideValues(d);}})
            .on('click',clickState);
    
        gnax = svg.append("g").attr("class","x axis").attr("transform","translate(70,30)");
        gax = svg.append("g").attr("class","x axis").attr("transform","translate(110,30)");
        gax.call(xAxis);
        gnax.call(xNegAxis); 

        labelRow = svg.append('g').attr("transform","translate(0,10)");

        labelRow.selectAll('text')
            .data(labels)
            .enter().append('text')
            .text(function(d){return d.label;})
            .classed('colLabel',true)
            .attr('y',0)
            .attr('x',function(d){return d.x;});

//    });
}

function showValues(d) {
    d3.selectAll('#row-'+d.id+' .bigBarLabel')
        .style('visibility','visible');
    //console.log('showValues');
}

function hideValues(d) {
    d3.selectAll('#row-'+d.id+' .bigBarLabel')
        .style('visibility','hidden');
    //console.log('hideValues');
}

//draw();
var focus;

function clickState(d){
    if (d === focus) {
        defaultInfoBox();
        unselectState(d);
    } else {
        if (focus) {
            unselectState(focus);
        }
        selectState(d);
    }
}

function get_or_hash(d, state_fed, industry){
    /*
    if (d.hasOwnProperty(k)){
        return d[k];
    } else {
        return '#'
    }*/
    params = 'contributor_industry=' + industry;
    params += '&recipient_state=' + d.abbr;
    params += '&general_transaction_type=standard';
    params += '&transaction_namespace=' + state_fed;
    console.log(params);
    return data_ie_base_url + Base64.encode(params);
}

function selectState(d){
    focus = d;
    showValues(d);
    d3.select('#selector-'+d.id)
        //.classed('darkened',false)
        .classed('selected',true);

    d3.select('#ibHeader')
        .html('<span>'+state_names[d.abbr]+'<span class="qualifier">By state and federal spending</span></span>');

    d_state = [ 
                {   
                    stance: 'Rights'  , 
                    val : get_or_zero(d,'state_PRO-GUN'), 
                    url : get_or_hash(d,'urn%3Animsp%3Atransaction','Q13')
                }, 
                {   
                    stance: 'Control'  , 
                    val : get_or_zero(d,'state_ANTI-GUN'), 
                    url : get_or_hash(d,'urn:nimsp:transaction','Q12')
                } 
                    ];
    d_federal = [
                {   
                    stance: 'Rights'  , 
                    val : get_or_zero(d,'federal_PRO-GUN'), 
                    url : get_or_hash(d,'urn:fec:transaction','Q13')
                }, 
                {   
                    stance: 'Control'  , 
                    val : get_or_zero(d,'federal_ANTI-GUN'), 
                    url : get_or_hash(d,'urn:fec:transaction','Q12')
                } 
                    ];

    updateMiniChart('stateMiniChart',d_state);
    updateMiniChart('federalMiniChart',d_federal);

    //updateCaption(d.abbr);
    
}

function updateCaption(abbr) {
    caption = d3.select('#ibCaption');
    if (state_names.hasOwnProperty(abbr)){
        caption.html('<h2>Facts about '+state_names[abbr]+'</h2><p>These are the facts about '+state_names[abbr]+', Jack!</p>'); 
    } else {
        caption.html('<h2>Nationwide Facts</h2><p>These are some facts about the whole country!</p>');
    }
}

function defaultInfoBox() {
    d3.select('#ibHeader').html(default_ibHeader_html);
    updateMiniChart('stateMiniChart',avg_state);
    updateMiniChart('federalMiniChart',avg_federal);
    //updateCaption('NA');
}

function unselectState(d){
    d3.select('#selector-'+d.id)
        .classed('selected',false);
    focus = null;
    hideValues(d);
}

function updateMiniChart(sel,data){
    var msvg = d3.select('#'+sel);

    msvg.selectAll('.bar')
        .data(data)
        .transition()
        .attr("y",function(d) {return mini_y(d.val)})
        .attr("height",function(d) {return mini_height - mini_y(d.val)})


    msvg.selectAll('.ieDataLink')
        .data(data)
        .attr('xlink:href',function(d) { return d.url; });

    msvg.selectAll('.miniBarLabel')
        .data(data)
        .transition()
                .attr("x",function(d) {return mini_x(d.stance);})
                .attr("y", function(d) {return mini_y(d.val);})
                .text(function(d){return moneyFormat(d.val);})

}




function initMinis(states){

    mini_x.domain(['Control','Rights']);
    var mini_ymax = d3.max([  
            d3.max(states,function(s){return get_or_zero(s,'federal_ANTI-GUN');}),
            d3.max(states,function(s){return get_or_zero(s,'federal_PRO-GUN');}),
            d3.max(states,function(s){return get_or_zero(s,'state_ANTI-GUN');}),
            d3.max(states,function(s){return get_or_zero(s,'state_PRO-GUN');})]);

    mini_y.domain([0,mini_ymax]);

    function initMiniChart(sel,data) {
        var msvg = d3.select('#'+sel);

        msvg = msvg.attr("width",mini_width + mini_margin.left + mini_margin.right)
            .attr("height",mini_height + mini_margin.top + mini_margin.bottom)
          .append("g")
            .attr("transform","translate("+mini_margin.left+","+mini_margin.top+")");

        msvg.append('g')
                .attr("class","x mini-axis")
                .attr("transform","translate(0,"+mini_height+")")
                .call(mini_xAxis);

        /*
         msvg.append('g')
                .attr("class","y mini-axis")
                .call(mini_yAxis)
            .append('text')
                .attr('transform','rotate(-90)')
                .attr('y',6)
                .attr('dy',".71em")
                .style("text-anchor","end")
                .text("contributions");
                */

        msvg.selectAll('.bar')
            .data(data)
            .enter()
            .append('a')
			//.on("mouseover", function(d) {d3.select(sel+d.stance).style("fill","#000000")})
            .attr('class','ieDataLink')
            .attr('xlink:href',function(d){ return d.url; })
            .attr('xlink:show','new')
                .append("rect")
				.attr("id", function(d) {return sel+d.stance;})
                .attr("class",function(d){ return d.stance.toLowerCase() })
                .classed("bar",true)
                .attr("x",function(d) {return mini_x(d.stance);})
                .attr("width", mini_x.rangeBand())
                .attr("y", function(d) {return mini_y(d.val);})
                .attr("height",function(d) {return mini_height - mini_y(d.val)});

        msvg.selectAll('.miniBarLabel')
            .data(data)
            .enter()
            .append('text')
                .attr('class','miniBarLabel')
                .attr("x",function(d) {return mini_x(d.stance);})
                .attr("y", function(d) {return mini_y(d.val);})
                .text(function(d){return moneyFormat(d.val);})


    }

    initMiniChart('stateMiniChart',avg_state);
    initMiniChart('federalMiniChart',avg_federal);
    //updateCaption('NA');
};


