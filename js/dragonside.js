document.onload = getADCnames();
//Golbal Variables
var championIDtable = [];
var table
var counter = 0;
var adcNamesSorted = [];
var adcIdsSorted = [];

function setTable() {
    if (counter >= 1) {
        table.destroy();
    }

    table = $('#supportTable').DataTable({
        ajax: {
            type: "GET",
            url: "http://dragonsidedata-env-1.eba-mkdkawv2.ap-southeast-2.elasticbeanstalk.com/currentadc",
            dataSrc: "supports",
        },
        columns: [
            { "data": "name" },
            {
                "data": "occurences"

            },
            {
                data: null,
                render: function (data, type, row) {
                    return Math.round((row.wins / row.occurences) * 100) + "%";
                }
            }
        ],
        order: [[1, "desc"]],
        rowReorder: {
            selector: 'td:nth-child(2)'
        },
        responsive: true,
        language: {
            searchPlaceholder: "Search",
            search: ""
        },
    });
    counter++;
    document.getElementById("supportTable").style.visibility = "visible"
};


function championSelect(id) {
    element = document.getElementById(id);
    //console.log(element);
    var classList = document.getElementsByClassName("selected-adc");
    var oldElement = classList.item(0);
    if (oldElement != null) {
        oldElement.classList.remove("selected-adc");
    }
    if(element != null){
        element.className += " selected-adc";
        var name = element.name;
        sendADCID(id);
        var output = "Selected: " + name
        if(!document.getElementById("selected").classList == ''){
            document.getElementById("selected").classList.remove('red-text')
        }
        document.getElementById("selected").innerHTML = output;
    } else{
        var output = "Invalid Champion name"
        document.getElementById("selected").innerHTML = output;
        document.getElementById("selected").className += "red-text";
    }

    
    //console.log(name);
}


function sendADCID(id) {
    var info = { ChampID: id };
    $.ajax({
        type: "POST",
        url: "http://dragonsidedata-env-1.eba-mkdkawv2.ap-southeast-2.elasticbeanstalk.com/adcid",
        data: JSON.stringify(info),
        contentType: "application/json;",
        success: function (data) {
            //console.log("Finished sending ID: " + id)
            setTable()
        }
    })
    //console.log("Starting to get ADC")
}

function getADC() {
    $.ajax({
        type: "GET",
        url: "http://dragonsidedata-env-1.eba-mkdkawv2.ap-southeast-2.elasticbeanstalk.com/currentadc",
        success: function (data) {
            var response = JSON.parse(data);
            var supports = response.supports;
            var json = '{"data" : ';
            json += JSON.stringify(supports) + "}";
            //console.log(json);
        }
    })
}

function sortNames(list) {
    var namesToSort = [];
    for (var i = 0; i < list.length; i += 2) {
        var name = list[i];
        namesToSort.push(name);
    }
    namesToSort.sort();
    adcs = [];
    for (var i = 0; i < namesToSort.length; i++) {
        var name = namesToSort[i];
        var initialIndex = list.indexOf(name);
        var index = initialIndex + 1;
        adcs.push(name);
        adcs.push(list[index])
    }

    return adcs
}

function splitNameId(list) {
    var names = [];
    var ids = [];
    for (var i = 0; i < list.length; i++) {
        if (i % 2 == 0) {
            names.push(list[i]);
        }
        else {
            ids.push(list[i]);
        }
    }
    adcNamesSorted = names;
    adcIdsSorted = ids;
}

function findAdcId(name) {
    for (var i = 0; i < adcNamesSorted.length; i++) {
        if (name == adcNamesSorted[i]) {
            //console.log(adcIdsSorted[i]);
            return adcIdsSorted[i];
        }
    }
    return 0;
}
function removeExistingChampions(existingIds, adcList) {
    var newAdcList = [];
    //console.log(adcList);
    for(var j = 0; j < adcList.length; j+=2 ){
        var currentName = adcList[j];
        var currentId = adcList[j+1];
        if(existingIds.includes(currentId)){
            
            //console.log("true");
        } else{
            newAdcList.push(currentName);
            newAdcList.push(currentId);
            //console.log("false");
        }

    }
    //console.log(newAdcList);
    return newAdcList;


}
function getExistingIds(){
    var listOfElements = document.getElementsByClassName("champion");
    var listOfExistingIds = [];
    //console.log(listOfElements.length)
    for(var j = 0; j < listOfElements.length; j++){
        var listElement = listOfElements.item(j);
        var id = listElement.id;
        listOfExistingIds.push(id);
        
        //console.log(name);

    }
    //console.log(listOfExistingIds);
    return listOfExistingIds


}
//Runs GET request to retrieve names of other ADCs(off meta), then adds as html buttons
function getADCnames() {
    document.getElementById("supportTable").style.visibility = "hidden"
    $.ajax({
        type: "GET",
        url: "http://dragonsidedata-env-1.eba-mkdkawv2.ap-southeast-2.elasticbeanstalk.com/adcnames",
        success: function (data) {
            //Parse request data
            //console.log(data);
            var response = JSON.parse(data);
            var list = response;
            var adcs = sortNames(list);
            splitNameId(adcs);
            var output = "";
            var existingIds = getExistingIds();
            adcs = removeExistingChampions(existingIds, adcs);
            for (var i = 0; i < adcs.length; i += 2) {
                var name = adcs[i];
                var champID = adcs[i + 1];
                var champIcon = "https://ddragon.leagueoflegends.com/cdn/13.8.1/img/champion/" + name + ".png";
                if (name == "MonkeyKing") {
                    name = "Wukong"
                }
                output += '<div class="col-sm"><a href="#selected"><img src="' + champIcon + '" alt="" class="img-fluid" onclick="championSelect(this.id)"id="' + champID + '"' + ' name="' + name + '"></a><p>' + name + "</p></div>"
                //output += '<a class="dropdown-item"' + 'id="' + champID + '" ' + 'onclick="championSelect(this)"' + '>' + name + '</a>';
            }

            document.getElementById("champList").innerHTML = output;

            //Bloodhound
            
            var substringMatcher = function (strs) {
                return function findMatches(q, cb) {
                    var matches, substringRegex;
                    matches = [];
                    substrRegex = new RegExp(q, 'i');

                    $.each(strs, function (i, str) {
                        if (substrRegex.test(str)) {
                            matches.push(str);
                        }
                    });

                    cb(matches);
                };
            };

            $('#the-basics .typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
                {
                    name: 'adcNamesSorted',
                    source: substringMatcher(adcNamesSorted)
                });
        }
    })


}

$(".typeahead").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        const value = document.querySelector('#searchInput').value;
        //console.log(value);
        $('.typeahead').typeahead('close');
        var id = findAdcId(value);
        championSelect(id);


    }
});





