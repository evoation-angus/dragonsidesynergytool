document.onload = getADCnames();
//Golbal Variables
var championIDtable = [];
var table
var counter = 0;

//
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

var previousElement = null;
function championSelect(element) {
    if (previousElement != null) {
        previousElement.style.boxShadow = "none";
    }
    previousElement = element;
    var name = element.name;
    console.log(name);
    var id = element.id;
    element.style.boxShadow = "0 0 0 3px #C9AA71";
    sendADCID(id);
    var output = "Selected: " + name
    console.log(output);
    document.getElementById("selected").innerHTML = output;
}


function sendADCID(id) {
    var info = { ChampID: id };
    $.ajax({
        type: "POST",
        url: "http://dragonsidedata-env-1.eba-mkdkawv2.ap-southeast-2.elasticbeanstalk.com/adcid",
        data: JSON.stringify(info),
        contentType: "application/json;",
        success: function (data) {
            console.log("Finished sending ID: " + id)
            setTable()
        }
    })
    console.log("Starting to get ADC")
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
            console.log(json);
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

//Runs GET request to retrieve names of other ADCs(off meta), then adds as html buttons
function getADCnames() {
    document.getElementById("supportTable").style.visibility = "hidden"
    $.ajax({
        type: "GET",
        url: "http://dragonsidedata-env-1.eba-mkdkawv2.ap-southeast-2.elasticbeanstalk.com/adcnames",
        success: function (data) {
            //Parse request data
            console.log(data);
            var response = JSON.parse(data);
            var list = response;
            var adcs = sortNames(list);
            var output = "";

            for (var i = 0; i < adcs.length; i += 2) {
                var name = adcs[i];
                var champID = adcs[i + 1];
                var champIcon = "https://ddragon.leagueoflegends.com/cdn/13.8.1/img/champion/" + name + ".png";
                if (name == "MonkeyKing") {
                    name = "Wukong"
                }
                output += '<div class="col-sm"><a href="#selected"><img src="' + champIcon + '" alt="" class="img-fluid" onclick="championSelect(this)"id="' + champID + '"' + ' name="' + name + '"></a><p>' + name + "</p></div>"
                //output += '<a class="dropdown-item"' + 'id="' + champID + '" ' + 'onclick="championSelect(this)"' + '>' + name + '</a>';
            }

            document.getElementById("champList").innerHTML = output;
        }
    })

}