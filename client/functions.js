
// local
var SERVER_URL = "http://127.0.0.1:5000/";
// OpenShift
//var SERVER_URL = "http://indiana-feedingaliencat.rhcloud.com/";

var FILE_ICON = "images/document_icon.png"
var MONTHS = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
]

var logged_name = null;
var logged_auth = null;
var last_visited_id = null;
var last_visited_type = null;   // "ritrovamento" or "intervento"
var id_ritrovamento = null;
var id_intervento = null;


// HTML MANAGEMENT
function ReloadPage() {
   location.reload();
}

function read_form(type) {
    if(type == "login") {
        var name = $("#name_login").val();
        var psw = $("#psw_login").val();
        if(!name || !psw) {
            //alert("Inserisci i campi richiesti");
            $("#login_situation").html("Errore durante il Login! Inserisci i campi richiesti" || null)
            return false;
            }
        return [name, psw];
    }
    if(type == "register") {
        var name = $("#name_register").val();
        var psw = $("#psw_register").val();
        var email = $("#email").val();
        if(!name || !psw) {
            //alert("Inserisci i campi richiesti");
            $("#register_error").html("Errore durante la registrazione! Inserisci i campi richiesti" || null)
            return false;
            }
        if(! /^.+@.+\..+$/.test(email)) {
            //alert("Email non valida");
            $("#register_error").html("Errore durante la registrazione! E-mail non valida!");
            return false;
        }
        return [name, psw, email];
    }
}
function pop_the_popup(data, e) {
    var obj = data.features[0].properties;
    id_ritrovamento = obj.id_ritrovamento;
    id_intervento = obj.id_intervento;

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
    
    $("back_ritrovamento").hide();
    
    $("#descri").empty();
    $("#bibliography").hide();
    $("#biblio").empty();
    $("#gallery").hide();
    $("#image").empty();

    // add new infos
    $("#descri").html(data[0]["descr"]);

    var bibliography = data[0]["bibliografia"];
    if(bibliography) {
        var content = ""
        for(var i=0, l=bibliography.length; i<l; i++) {
            content += bibliography[i]["biblio"] + "&emsp;" + bibliography[i]["pagine"] + "<br />";
        }
        $("#biblio").html(content);
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
    $("#json_ubicazione").empty();
    $("#json_cronologia").empty();
    
    $("#json_approvazione").empty();
    $("#json_catasto_foglio").empty();
    $("#json_catasto_particella").empty();
    $("#json_comune").empty();
    $("#json_data_aggiornamento").empty();
    $("#json_motiv_intervento").empty();
    $("#json_nome_compilatore").empty();

    var obj = data.features[0].properties;
    if(obj.id_ritrovamento != null) {
        
        $("#go_intervento").show();
        $("#go_ritrovamento").hide();
        $("#json_definizione").html(obj.tipologia_ritrov + ": " + obj.definizione);
        $("#json_ubicazione").html("<b>Ubicazione: </b>" + obj.precisazione_ubicazion || null);
        $("#json_cronologia").html("<b>Cronologia: </b>" +
            obj.data_inizio + " " + obj.cono_ac_dc + " - "
            + obj.data_fine + " " + obj.crono_ac_dc_fine || null
        );
        
        var obj = data.features[1].properties;
        $("#json_ubicazione").html("<b>Ubicazione: </b>" + obj.ubicazione || null);
        $("#json_approvazione").html("<b>Approvazione: </b>" + obj.approvazione || null);
        $("#json_catasto_foglio").html("<b>Catasto foglio: </b>" + obj.catasto_foglio || null);
        $("#json_catasto_particella").html("<b>Catasto particella: </b>" + obj.catasto_particella || null);
        $("#json_comune").html("<b>Comune: </b>" + obj.comune || null);
        $("#json_data_aggiornamento").html("<b>Data aggiornamento: </b>" + obj.data_aggiornamento || null);
        $("#json_motiv_intervento").html("<b>Motivo Intervento: </b>" + obj.motiv_intervento || null);
        $("#json_nome_compilatore").html("<b>Nome Compilatore: </b>" + obj.nome_compilatore || null);
        $("#info_json_intervento").hide();
    }
    else {
        $("#go_intervento").hide();
        $("#go_ritrovamento").show();
        $("#json_ubicazione").html("<b>Ubicazione: </b>" + obj.ubicazione || null);
        $("#json_approvazione").html("<b>Approvazione: </b>" + obj.approvazione || null);
        $("#json_catasto_foglio").html("<b>Catasto foglio: </b>" + obj.catasto_foglio || null);
        $("#json_catasto_particella").html("<b>Catasto particella: </b>" + obj.catasto_particella || null);
        $("#json_comune").html("<b>Comune: </b>" + obj.comune || null);
        $("#json_data_aggiornamento").html("<b>Data aggiornamento: </b>" + obj.data_aggiornamento || null);
        $("#json_motiv_intervento").html("<b>Motivo Intervento: </b>" + obj.motiv_intervento || null);
        $("#json_nome_compilatore").html("<b>Nome Compilatore: </b>" + obj.nome_compilatore || null);

    }
}


function file_thumb(entry) {
    // TODO: correggere in 'data:image/jpeg;base64,' + entry["photo_thumb"];
    var thumb = (
            '<a href="' + SERVER_URL + 'contents/' + entry["filename"] + '" download>'
        +   '   <img src="'
        +   (entry["photo_thumb"] ? 'data:image;base64,' + entry["photo_thumb"] : FILE_ICON) + '" '
        +   '" />'
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

function list_search_result(data) {

    for(var i=0, l=data.length; i<l; i++) {
        $("#search_result").append(
            '<table>'
            +   '<tr>'
            +   '   <td>definizione</td>'
            +   '   <td>' + data[i]["def"] + '</td>'
            +   '   <td rowspan="3">'
            +   '       <input type="button" data-theme="d" data-icon="arrow-u" data-iconpos="notext"'
            +   '               name="' + data[i]["id_ritrov"] + '" value="vai" />'
            +   '   </td>'
            +   '</tr>'
            +   '<tr>'
            +   '   <td>luogo</td>'
            +   '   <td>' + data[i]["place"] + '</td>'
            +   '</tr>'
            +   '<tr>'
            +   '   <td>tipo</td>'
            +   '   <td>' + data[i]["tipo"] + '</td>'
            +   '</tr>'
            +'</table>'
        );
    }

    $("#search_result input").click(function() {
        last_visited_id = $(this).attr("name");
        last_visited_type = "ritrovamento";
        $.mobile.changePage("#info");
        // $(this).pagecontainer("change", "#info");
    });
}

$(document).on('pageshow', '#home', function() {
    if(!logged_auth) {
        $(".user_logged").hide();
        $(".user_unlogged").show();
    }
    else {
        $(".user_logged").show();
        $(".user_unlogged").hide();
    }
});

$(document).on('pageshow', '#info', function() {
    $("#test").html(last_visited_type + "    " +  last_visited_id);

    ask_opengeo(last_visited_type, last_visited_id);
    // TODO: risolvere problema doppi id
    get_contents(last_visited_id);

    if(!logged_auth) {
        $(".user_logged").hide();
        $(".user_unlogged").show();
    }
    else {
        $(".user_logged").show();
        $(".user_unlogged").hide();
    }

    if(last_visited_type == "intervento") {
        $("#go_ritrovamento").show();
        $("#go_intervento").hide();
    }
    else {
        $("#go_ritrovamento").hide();
        $("#go_intervento").show();
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
            //alert("Benvenuto " + name + "!\nAdesso puoi accedere");
            $("form#user_data_register")[0].reset();
            $("#login_situation").html("Registrazione avvenuta! Adesso puoi loggarti!");
            $("#register_error").empty();
            $.mobile.changePage( "#login" );
        },
        error: function() {
            //alert("ops, something went wrong..");
            $("#register_error").html("Errore durante la registrazione! Campi errati!");
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
            }
            $("form#user_data_login")[0].reset();
            $(".username.user_logged").html(logged_name);
            $(".user_unlogged").hide();
            $(".user_logged").show();

            $("#login_situation").empty();
            $("#register_error").empty();

            // TODO: andare indietro a back, qui, invece che alla mappa
            $.mobile.changePage("#home");
        },
        error: function() {
            $("#login_situation").html("Errore durante il Login! Username e/o password errate!")
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
            $("#result_comment").html("Commento Aggiunto!" || null)
            
        },
        error: function() {
            console.log("ops, something went wrong..");
            $("#result_comment").html("Errore! Commento non pubblicato" || null)
            $("#result_comment").empty();
            
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

function upload(poi, comment, form_data) {
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
            
        }),
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
            console.log("file announced.");
            file_id = data["filename"];
            $("form#content_form")[0].reset();
            upload2(poi, file_id, form_data);
            $("#result_comment").html("Commento Aggiunto!" || null)
            get_contents(poi);
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
            
            //get_contents(poi);
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

function remote_search(type, question) {
    $("#search_result").html("");
    console.log(type);
    if(type == "by_position")
        var prefix = "ubi";
    else if(type == "by_type")
        var prefix = "tipo";
    else
        return;

    $.getJSON(
        "http://opengeo.eu/archeofi2/api/archeofi_api.php?rit_search_" + prefix + "=" + question + "&jsoncallback=?",
        function(data) {
            console.log(data);
            list_search_result(data);
        }
    );
}
