
var SERVER_URL = "http://127.0.0.1:5000/";
var FILE_ICON = "images/document_icon.png"
var MONTHS = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
]

var logged_name = null;
var logged_auth = null;
var last_visited_id = null;
var last_visited_type = null;


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
    var obj = data.features[0].properties;

    if(obj.id_ritrovamento != null) {
        last_visited_id = obj.id_ritrovamento;
        last_visited_type = "ritrovamento";

        $("#popup_ritrovamento h3").html(obj.definizione || null);
        $("#popup_ritrovamento p").html(obj.descrizione_min || null);
        $("#popup_ritrovamento #periodo").html(obj.periodo_fine || null);
        $("#popup_ritrovamento #tipologia_ritrov").html(obj.tipologia_ritrov || null);

        popup.setContent(
            $("#popup_ritrovamento").html()
        );
    }
    else {
        last_visited_id = obj.id_interv_nuovo;
        last_visited_type = "intervento";

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


function opengeo_make_link(link) {
    return link.replace("/home/archeofi/homes", "http://opengeo.eu/archeofi2");
}

function display_opengeo(data) {
    
    
    
    // clean-up from the previous info displayed
    $("#descri").empty();
    $("#bibliography").hide();
    $("#biblio").empty();
    $("#gallery").hide();
    $("#image").empty();

    // add new infos
    $("#descri").html(data[0]["descr"]);

    var bibliography = data[0]["bibliografia"];
    if(bibliography) {
        for(var i=0, l=bibliography.length; i<l; i++) {
            var content = bibliography[i]["biblio"] + "&emsp;" + bibliography[i]["pagine"] + "<br />";
        }
        $("#biblio").html( content);
        $("#bibliography").show();
    }

    var images = data[0]["images"];
    if(images.length > 0) {
        for(var i=0, l=images.length; i<l; i++) {
            var link = opengeo_make_link(images[i]["link"]);
            var thumb = opengeo_make_link(images[i]["thumbnail"]);
            $("#image").append( "<a href='" + link + "' > \
                    <img src='" + thumb + "'' alt='" + images[i]["descr"] + "'' /> \
                </a>");
        }
        $("#gallery").show();
    }
}

function setting_info(data){
    //inserimento informazioni base da json
    
    $("#descri").empty();
    $("#json_definizione").empty();
    $("#json_ubicazione_punto").empty();
    $("#json_descrizione").empty();
    $("#json_cronologia").empty();
    $("#ubicazione_punto").empty();
    $("#json_approvazione").empty();
    $("#json_catasto_foglio").empty();
    $("#json_catasto_particella").empty();
    $("#json_comune").empty();
    $("#json_data_aggiornamento").empty();
    $("#json_motiv_intervento").empty();
    $("#json_nome_compilatore").empty();
    
    
    
    
    
    var obj = data.features[0].properties;

    if(obj.id_ritrovamento != null) {
        
        $("#json_definizione").html(obj.tipologia_ritrov +": " + obj.definizione  || null);
        $("#json_ubicazione").html("ubicazione: " + obj.precisazione_ubicazion || null);
        $("#json_descrizione").html("Descrizione: " + obj.descrizione || null);
        $("#json_cronologia").html("Cronologia: " + obj.data_inizio + " " + obj.cono_ac_dc + " - " + obj.data_fine + " " + obj.crono_ac_dc_fine || null);
        

        
    }
    else {
                                
        
        $("#json_ubicazione").html("ubicazione: " + obj.ubicazione || null);
        $("#json_approvazione").html("Approvazione: " + obj.approvazione || null);
        $("#json_catasto_foglio").html("Catasto foglio: " + obj.catasto_foglio || null);
        $("#json_catasto_particella").html("Catasto particella: " + obj.catasto_particella || null);
        $("#json_comune").html("Comune: " + obj.comune || null);
        $("#json_data_aggiornamento").html("Data aggiornamento: " + obj.data_aggiornamento || null);
        $("#json_motiv_intervento").html("Data aggiornamento: " + obj.motiv_intervento || null);
        $("#json_nome_compilatore").html("Data aggiornamento: " + obj.nome_compilatore || null);
        
        
        /*$("#popup_intervento h3").html(obj.tipo_intervento || null);
        $("#popup_intervento time").html(obj.data_compilazione || null);
        $("#popup_intervento #metodo").html(obj.metodo || null);
        $("#popup_intervento #dir_scentifica").html(obj.dir_scentifica || null);
        $("#popup_intervento #ente_resp").html(obj.ente_resp || null);
        $("#popup_intervento #ente_schedatore").html(obj.ente_schedatore || null);
        $("#popup_intervento #esecutore_intervento").html(obj.esecutore_intervento || null);
        $("#popup_intervento #tipo_particella").html(obj.tipo_particella || null); */

        
}
    

    
}

function file_thumb(entry) {
    // TODO: correggere in 'data:image/jpeg;base64,' + entry["photo_thumb"];
    var thumb = (
            '<a href="' + SERVER_URL + 'static/' + entry["filename"] + '">'
        +   '   <img src="'
        +   (entry["photo_thumb"] ? 'data:image;base64,' + entry["photo_thumb"] : FILE_ICON) + '" '
        +   '        alt="' + entry["file_description"] + '" />'
        +   '</a>\n'
    )
    return thumb;
}

function convert_time(epoch) {
    var date = new Date(1000 * epoch);
    var minutes = date.getMinutes().toString();
    return date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear()
            + ' ' + date.getHours() + ','
            + (minutes.length < 2 ? "0" + minutes : minutes);
}

function display_contents(contents) {
    // 'contents' is a map with keys: 'num_results', 'objects', 'page', 'total_pages'
    $("#contents").empty();

    console.log(contents);

    contents["objects"].forEach( function(entry) {
        console.log(entry);
//data-role="fieldcontain"
        $("#contents").append(
                '<div  class="single_comment">'
            +   '   <div id="content_id" class="hidden">'
            +           entry["id_"]
            +   '   </div>'
            +   (entry["comment"] ? '<span class="view_text_comment">' + entry["comment"] + '</span>' : '')
            +   (entry["filename"] ? file_thumb(entry) : '')
            +   '   <div class="info_comment">'
            +   '       <div class="comment_properties">'
            +   '           <span class="comment_user">'
            +                   entry["user"]
            +   '           </span>'
            +   '           <span class="data_hours">'
            +                   convert_time(entry["creation_time"])
            +   '           </span>'
            +   '       </div>'
            +   '       <div class="layout_like_dislike">'   
            +   '           <div class="like_button">'
            +   '               <button class="ui-btn ui-icon-like ui-btn-icon-notext ui-corner-all ui-nodisc-icon ui-btn-inline" '
            +   '                   onclick="like(' + entry["id_"] + ', true);">'
            +   '               mi piace'
            +   '               </button>'
            +   '               <button class="ui-btn ui-icon-dislike ui-btn-icon-notext ui-corner-all ui-nodisc-icon ui-btn-inline" '
            +   '                   onclick="like(' + entry["id_"] + ', false);">'
            +   '               non mi piace'
            +   '               </button>'
            +   '           </div>'
            +   '           <div class="like_dislike">'
            +   '               <span class="counter_like">'
            +   '                   +' + entry["like"]
            +   '               </span>'
            +   '               <span class="counter_dislike">'
            +   '                   -' + entry["unlike"]
            +   '               </span>'
            +   '           </div>'
            +   '       </div>'
            +   '   </div>'
            +   '</div>'
        );
    });
}

$(document).on('pageshow', '#info', function() {
    ask_opengeo(last_visited_type, last_visited_id);
    // TODO: risolvere problema doppi id
    get_contents(last_visited_id);

    if(!logged_auth) {
        $("#add_content").hide();
        $("#login_required").show();
    }
    else {
        $("#add_content").show();
        $("#login_required").hide();
    }
});


// INDIANA SERVER
function register(name, psw, email) {
    $.ajax({
        type: "POST",
        url: SERVER_URL + "api/indiana_user",
        data: JSON.stringify({ "name": name, "psw": psw, "email": email }),
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
            alert("Benvenuto " + name + "!\nAdesso puoi accedere");
            $("form#user_data")[0].reset();
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
        url: SERVER_URL + "api/login/",
        headers: {
          "Authorization": auth
        },
        success: function(logged) {
            console.log("successfully logged");
            if(logged) {
                logged_auth = auth;
                logged_name = name;
                alert("Ciao " + logged_name + "!");
            }
            $("form#user_data")[0].reset();
        },
        error: function() {
            alert("ops, something went wrong..");
        }
    });
}

function post_a_comment(poi, comment) {
    $.ajax({
        type: "POST",
        url: SERVER_URL + "api/content",
        headers: {
          "Authorization": logged_auth
        },
        data: JSON.stringify({ "comment": comment, "poi": poi }),
        dataType: "json",
        contentType: "application/json",
        success: function() {
            console.log("comment published!");
            $("form#content_form")[0].reset();
            get_contents(poi);
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
}

function get_contents(poi) {
    $.ajax({
        type: "GET",
        url: SERVER_URL + "api/content",
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
        success: function(received) {
            console.log("contents received.");
            display_contents(received);
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
}

function modify_comment(content_id, modified_content) {
    $.ajax({
        type: "PATCH",
        url: SERVER_URL + "api/content/" + content_id,
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
        url: SERVER_URL + "api/content/" + content_id,
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
    if(!logged_auth) {
        alert("per dire se ti piace o no, prima devi fare login");
        return;
    }
    $.ajax({
        type: "POST",
        url: SERVER_URL + "api/like",
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

function upload(poi, comment, form_data, file_description) {
    var file_id = null;

    // posting announcement
    $.ajax({
        type: "POST",
        url: SERVER_URL + "api/content",
        headers: {
          "Authorization": logged_auth
        },
        data: JSON.stringify ({
            "poi": poi,
            "comment": comment,
            "upload_announcement": true,
            "file_description": file_description
        }),
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
            console.log("file announced.");
            file_id = data["filename"];
            upload2(poi, file_id, form_data);
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
}

function upload2(poi, file_id, form_data) {
    // actually post the file
    $.ajax({
        type: "POST",
        url: SERVER_URL + "api/file/" + file_id,
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
            $("form#content_form")[0].reset();
            get_contents(poi);
        },
        error: function(x, t, m) {
            console.log(t);
        }
    });
}

function wms_proxy(bbox, width, height, x, y, e) {
    $.ajax({
        type: "GET",
        url: SERVER_URL + "api/proxy/" + bbox + '&' + width + '&' + height + '&' + x + '&' + y,
        success: function(data) {
            console.log("proxied.");
            console.log(data);
            pop_the_popup(data, e);
            setting_info(data); // aggiunta
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
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
