// HTML MANAGEMENT
function read_form(type) {
    var name = $("#name").val();
    var psw = $("#psw").val();
    if(!name || !psw) {
        alert("Inserisci i campi richiesti");
        return false;
    }
    if(type == "login") {
        return [name, psw];
    }
    else {
        var email = $("#email").val();
        if(! /^.+@.+\..+$/.test(email)) {
            alert("Email non valida");
            return false;
        }
        return [name, psw, email];
    }
}

function pop_the_popup(data, e) {
    console.log(data);
    var obj = data.features[0].properties;
    last_visited_id = obj.id_ritrovamento;

    // se il dato è punto o linea
    if (obj.id_ritrovamento != null) {
        $("#popup_ritrovamento h3").html(obj.definizione || null);
        $("#popup_ritrovamento p").html(obj.descrizione_min || null);
        $("#popup_ritrovamento #periodo").html(obj.periodo_fine || null);
        $("#popup_ritrovamento #tipologia_ritrov").html(obj.tipologia_ritrov || null);

        popup.setContent(
            $("#popup_ritrovamento").html()
        );
    }
    //se il dato è area
    else {
        $("#popup_intervento h3").html(obj.tipo_intervento || null);
        $("#popup_intervento time").html(obj.data_compilazione || null);
        $("#popup_intervento #metodo").html(obj.metodo || null);
        $("#popup_intervento #dir_scentifica").html(obj.dir_scentifica || null);
        $("#popup_intervento #ente_resp").html(obj.ente_resp || null);
        $("#popup_intervento #ente_schedatore").html(obj.ente_schedatore || null);
        $("#popup_intervento #esecutore_intervento").html(obj.esecutore_intervento || null);
        $("#popup_intervento #tipo_particella").html(obj.tipo_particella || null);

        popup.setContent(
            $("#popup_intervento").html()
        );
    }
    
    popup.setLatLng(e.latlng);
    map.openPopup(popup);
}

function display_opengeo(data) {
    alert("qui");
    // clean-up from the previous info displayed
    $("#image").empty();

    // add new infos
    $("#descri").html(data[0]["descr"]);

    var bibliography = data[0]["bibliografia"];
    alert(bibliography);
    for(var i=0, l=bibliography.length; i<l; i++) {
        var content = bibliography[i]["biblio"] + "&emsp;" + bibliography[i]["pagine"] + "<br />";
    }
    $("#biblio").html( content);

    var images = data[0]["images"];
    if(images.length > 0) {
        $("#titolo_imm").html('<hr />Immagini:<br />');

        for(var i=0, l=images.length; i<l; i++) {
            var link = opengeo_make_link(images[i]["link"]);
            var thumb = opengeo_make_link(images[i]["thumbnail"]);
            $("#image").append( "<a href='" + link + "' > \
                    <img src='" + thumb + "'' alt='" + images[i]["descr"] + "'' /> \
                </a>");
        }
    }
}


// PASSAGGIO IN #INFO CON ID
$(document).on('pagebeforeshow', '#home', function() {
    $(document).on('click', '#passinfo', function() {
        // store some data
        id = last_visited_id;
        
        //Change page
        $.mobile.changePage("#info");
    });
});

$(document).on('pageshow', '#info', function() {
    ask_opengeo(id);            //TODO: type?
});


// INDIANA SERVER
var server_url = "http://127.0.0.1:5000/";
var logged_auth = null;
var last_visited_id = null;
var id = null;

function register(name, psw, email) {
    $.ajax({
        type: "POST",
        url: server_url + "api/indiana_user",
        data: JSON.stringify({ "name": name, "psw": psw, "email": email }),
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
            alert("ok");
            return data.objects;
        },
        error: function() {
            alert("ops, something went wrong..");
        }
    });
}

function login(name, psw) {
    var auth = "Basic " + btoa(name + ":" + psw);
    $.ajax({
        type: "GET",
        url: server_url + "api/login/",
        headers: {
          "Authorization": auth
        },
        success: function() {
            console.log("successfully logged");
        },
        error: function() {
            alert("ops, something went wrong..");
        },
        complete: function(data_response) {
            logged = JSON.parse(data_response.responseText);
            if(logged) {
                logged_auth = auth;
                alert("User and psw saved.");
            }
        }
    });
}

function post_a_comment(poi, comment) {
    $.ajax({
        type: "POST",
        url: server_url + "api/content",
        headers: {
          "Authorization": logged_auth
        },
        data: JSON.stringify({ "comment": comment, "poi": poi }),
        dataType: "json",
        contentType: "application/json",
        success: function() {
            console.log("comment published!");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            return data_response.responseText;
        }
    });
}

function get_contents(poi) {
    $.ajax({
        type: "GET",
        url: server_url + "api/content",
        data: {
            "q": JSON.stringify({
                "filters": [{
                    "name": "poi",
                    "op": "==",
                    "val": poi
                }]
            })
        },
        dataType: "json",
        contentType: "application/json",
        success: function() {
            console.log("contents received.");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            received = JSON.parse(data_response.responseText);
            print_contents(received);
        }
    });
}

function print_contents(contents) {
    // 'contents' is an array with keys: 'num_results', 'objects', 'page', 'total_pages'
    contents["objects"].forEach(function(entry) {
        console.log(entry);
        if(entry["photo_thumb"]) {
            console.log("c'è un'immagine");
            var thumb = new Image();
            thumb.src = 'data:image;base64,' + entry["photo_thumb"];
            // thumb.src = 'data:image/jpeg;base64,' + entry["photo_thumb"];
        }
        else {
            console.log("non c'è nessuna immagine");
        }

        document.write(
            entry["comment"] + "<br />" +
            entry["file_description"] + "<br />"
        );
        document.body.appendChild(thumb);
        document.write("<hr />");
    });
}

function modify_comment(content_id, modified_content) {
    $.ajax({
        type: "PATCH",
        url: server_url + "api/content/" + content_id,
        headers: {
          "Authorization": logged_auth
        },
        data: JSON.stringify ({
            "comment": modified_content
        }),
        contentType: "application/json",
        success: function() {
            console.log("content modified.");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            return data_response.responseText;
        }
    });
}

function remove_content(content_id) {
    $.ajax({
        type: "DELETE",
        url: server_url + "api/content/" + content_id,
        headers: {
          "Authorization": logged_auth
        },
        contentType: "application/json",
        success: function() {
            console.log("content deleted.");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            return data_response.responseText;
        }
    });
}

function like(content_id, do_like) {
    $.ajax({
        type: "POST",
        url: server_url + "api/like",
        headers: {
          "Authorization": logged_auth
        },
        data: JSON.stringify ({
            "content_id": content_id,
            "do_like": do_like
        }),
        contentType: "application/json",
        success: function() {
            console.log("liked.");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            return data_response.responseText;
        }
    });
}

function upload(poi, form_data, file_description) {
    var file_id = null;

    // posting announcement
    $.ajax({
        type: "POST",
        url: server_url + "api/content",
        headers: {
          "Authorization": logged_auth
        },
        data: JSON.stringify ({
            "upload_announcement": true,
            "poi": poi,
            "file_description": file_description
        }),
        dataType: "json",
        contentType: "application/json",
        success: function() {
            console.log("file announced.");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            received = JSON.parse(data_response.responseText);
            file_id = received["filename"];
            upload2(file_id, form_data);
        }
    });
}

function upload2(file_id, form_data) {
    // actually post the file
    $.ajax({
        type: "POST",
        url: server_url + "api/file/" + file_id,
        headers: {
          "Authorization": logged_auth
        },
        data: form_data,
        async: false,
        cache: false,
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        dataType: 'json',
        success: function() {
            console.log("file uploaded.");
        },
        error: function(x, t, m) {
            console.log(t);
        }
    });
}

function wms_proxy(bbox, width, height, x, y,e) {
    $.ajax({
        type: "GET",
        url: server_url + "api/proxy/" + bbox + '&' + width + '&' + height + '&' + x + '&' + y,
        //async: false,
        success: function(data) {
            console.log("proxied.");
            pop_the_popup(data, e);
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            received = JSON.parse(data_response.responseText);
            return data_response.responseText;
        }
        
    });
    return last_visited_id;
}


// OPENGEO SERVER
function ask_opengeo(type, id) {
    if(type == "ritrovamento")
        var prefix = "rit_id=";
    else if(type == "intervento")
        var prefix = "interv_id=";
    else
        return;
    $.getJSON(
        "http://opengeo.eu/archeofi2/api/archeofi_api.php?" + prefix + id + "&jsoncallback=?",
        function(data) {
            console.log(data);
            display_opengeo(data);
        }
    );
}

function opengeo_make_link(link) {
    return link.replace("/home/archeofi/homes", "http://opengeo.eu/archeofi2");
}
