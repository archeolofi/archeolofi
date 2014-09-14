
// local
var SERVER_URL = "http://127.0.0.1:5000/";
// OpenShift
//var SERVER_URL = "http://archeolofi-feedingaliencat.rhcloud.com/";

var FILE_ICON = "images/icon.png"
var MONTHS = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
]

var logged_name = null;
var logged_auth = null;
var last_visited_id = null;
var last_visited_type = null;   // "ritrovamento" || "intervento"
var last_popupped_data = null;

// HTML MANAGEMENT
function login_message(text) {
    $("#login_situation")
        .html(text)
        .css("border", "1px solid #DDDDDD");
}

function register_message(text) {
    $("#register_error")
        .html(text)
        .css("border", "1px solid #DDDDDD");
}

function read_form(type) {
    if(type == "login") {
        var name = $("#name_login").val();
        var psw = $("#psw_login").val();
        if(!name || !psw) {
            login_message("Errore durante il login! Inserisci i campi richiesti");
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
            register_message("Errore durante la registrazione! Inserisci i campi richiesti");
            return false;
            }
        if(! /^.+@.+\..+$/.test(email)) {
            //alert("Email non valida");
            register_message("Errore durante la registrazione! Email non valida");
            return false;
        }
        return [name, psw, email];
    }
}

function pop_the_popup(data, e) {
    var obj = data.features[0].properties;
    last_popupped_data = obj;

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

function display_opengeo(data, back_id) {
    // basic info
    if(last_visited_type == "ritrovamento") {
        $("#basic_info").html(
              ' <span><b>Tipo:</b> ' + data[0]["tipo"] + '</span>'
            + ' <span><b>Definizione:</b> ' + data[0]["def"] + '</span>'
            + ' <span><b>Inizio:</b> ' + data[0]["sec_inizio_1"] + ' '
            +       data[0]["sec_inizio_2"] + ' ' + data[0]["sec_inizio_3"]
            + ' </span>'
            + ' <span><b>Fine:</b> ' + data[0]["sec_fine_1"] + ' '
            +       data[0]["sec_fine_2"] + ' ' + data[0]["sec_fine_3"]
            + ' </span>'
            + ' <span><b>Ubicazione:</b> ' + data[0]["ubicaz"] + '</span>'
        );

        $("#go_to_other_type").html(
              '<span>'
           // + '     vedi l\' '
            + '     <button data-theme="d" class="ui-btn ui-shadow ui-corner-all " >vedi area di intervento</button>'
            + '</span>'
        );

        $("#go_to_other_type button").click(function() {
            last_visited_id = data[0]["id_intervento"];
            last_visited_type = "intervento";
            prepare_info(data[0]["id_ritrov"]);
        });
    }
    else {
        $("#basic_info").html(
              ' <span><b>Tipo:</b> ' + data[0]["tipo"] + '</span>'
            + ' <span><b>Inizio:</b> ' + data[0]["inizio"] + '</span>'
            + ' <span><b>Fine:</b> ' + data[0]["fine"] + '</span>'
        );
        if(back_id) {
            $("#go_to_other_type").html(
                  '<span>'
                //+ '     torna al '
                + '     <button data-theme="d" class="ui-btn ui-shadow ui-corner-all " >torna al ritrovamento</button>'
                + '</span>'
            );

            $("#go_to_other_type button").click(function() {
                last_visited_id = back_id;
                last_visited_type = "ritrovamento";
                prepare_info();
            });
        }
    }

    // add new infos
    if("descr" in data[0]) {
        $("#descri").html(data[0]["descr"]);
        $("#description").show();
    }

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
            $("#image").append( "<a href='" + link + "' download> \
                    <img src='" + thumb + "'' alt='" + images[i]["descr"] + "'' /> \
                </a>");
        }
        $("#gallery").show();
    }
}

function setting_info() {
    /**
     * Add wms json informations to info page.
     */
    var obj = last_popupped_data;
    if(last_visited_type == "ritrovamento") {
        $("#json_definizione").html(obj.tipologia_ritrov + ": " + obj.definizione);
        $("#json_cronologia").html("<b>Cronologia: </b>" +
            obj.data_inizio + " " + obj.cono_ac_dc + " - "
            + obj.data_fine + " " + obj.crono_ac_dc_fine || null
        );
    }
    else if(last_visited_type == "intervento") {
        $("#json_approvazione").html("<b>Approvazione: </b>" + obj.approvazione || null);
        $("#json_catasto_foglio").html("<b>Catasto foglio: </b>" + obj.catasto_foglio || null);
        $("#json_catasto_particella").html("<b>Catasto particella: </b>" + obj.catasto_particella || null);
        $("#json_comune").html("<b>Comune: </b>" + obj.comune || null);
        $("#json_data_aggiornamento").html("<b>Data aggiornamento: </b>" + obj.data_aggiornamento || null);
        $("#json_motiv_intervento").html("<b>Motivo Intervento: </b>" + obj.motiv_intervento || null);
        $("#json_nome_compilatore").html("<b>Nome Compilatore: </b>" + obj.nome_compilatore || null);
        $("#json_ubicazione").html("<b>Ubicazione: </b>" + obj.ubicazione || null);
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

function edit_my_content(content_id) {
    var edit_buttons = (
         '<div class="edit_buttons">'
        +   '<button class="content_edit" name="' + content_id + '" value="modifica"></button>'
        +   '<button class="content_delete" name="' + content_id + '" value="cancella"></button>'
        +'</div>'
    )

    $(".edit_buttons .content_delete").click(function() {
        remove_content($(this).attr("name"));
        contents_refresh();
    });

    return edit_buttons;
}

function convert_time(epoch) {
    var date = new Date(1000 * epoch);
    var minutes = date.getMinutes().toString();
    return date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear()
            + ' ' + date.getHours() + ','
            + (minutes.length < 2 ? "0" + minutes : minutes);
}

function display_contents(contents) {
    /**
     * User contents.
     * 'contents' is a map with keys:
     * 'num_results', 'objects', 'page', 'total_pages'
     */
    console.log(contents);

    contents["objects"].forEach( function(entry) {
        console.log(entry);
        //data-role="fieldcontain"
        $("#contents").append(
                '<div  class="single_comment">'
            +   '   <div id="content_id" class="hidden">'
            +           entry["id_"]
            +   '   </div>'
            +   (entry["comment"] ? '<p class="view_text_comment">' + entry["comment"] + '</p>' : '')
            +   (entry["filename"] ? file_thumb(entry) : '')
            +   '   <div class="info_comment">'
            +   '       <div class="comment_properties">'
            +   '           <span class="comment_user">'
            +                   entry["user"]
            +   '           </span>'
            +   '           <span class="data_hours">'
            +                   convert_time(entry["creation_time"])
            +   '           </span>'
            +   (entry["user"] == logged_name ? edit_my_content(entry["id_"]) : '') 
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
            '<div class="layout_table">'
            +   '<table class="table_search" data-role="table" data-mode="reflow" class="ui-responsive">'
            +       '<tr>'
            +       '   <td class="td_title"><b>definizione</b></td>'
            +       '   <td class="date_table">' + data[i]["def"] + '</td>'
            +       '</tr>'
            +       '<tr>'
            +       '   <td class="td_title"><b>luogo</b></td>'
            +       '   <td class="date_table">' + data[i]["place"] + '</td>'
            +       '</tr>'
            +       '<tr>'
            +       '   <td class="td_title"><b>tipo</b></td>'
            +       '   <td class="date_table">' + data[i]["tipo"] + '</td>'
            +       '</tr>'
            +   '</table>'
            +   '<button data-icon="arrow-r" class="ui-btn ui-shadow ui-corner-all ui-icon-arrow-r ui-btn-icon-notext "'
            +   '        name="' + data[i]["id_ritrov"] + '" value="vai" ></button>'
            +'</div>'
        );
    }

    $("#search_result button").click(function() {
        last_visited_id = $(this).attr("name");
        last_visited_type = "ritrovamento";
        $.mobile.changePage("#info");
        // $(this).pagecontainer("change", "#info");
    });
}

function clear_info() {
    // wms json
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

    // opengeo json
    $("#basic_info").empty();
    $("#description").hide();
    $("#descri").empty();
    $("#bibliography").hide();
    $("#biblio").empty();
    $("#gallery").hide();
    $("#image").empty();
    $("#go_to_other_type").empty();

    // user contents
    $("#contents").empty();
}

function contents_refresh() {
    // TODO: mettere uno sleep e un'iconcina di caricamento
    $("#contents").empty();
    get_contents();
}

function check_log() {
    if(!logged_auth) {
        $(".user_logged").hide();
        $(".user_unlogged").show();
    }
    else {
        $(".user_logged").show();
        $(".user_unlogged").hide();
    }
}

// TODO: $(document).bind("pagebeforechange", function() {})
// pagechange
// pagechangefailed
$(document).on('pagebeforeshow', '#home', function() {
    check_log();
});

function prepare_info(back_id) {
    $("#test").html(last_visited_type + "    " +  last_visited_id);
    $("#result_comment").hide();

    check_log();
    clear_info();

    // wms data         (a big and or statement would be nicer, but less clear)
    if(last_popupped_data) {
        if("id_ritrovamento" in last_popupped_data) {
            if((last_visited_type == "ritrovamento") && (last_visited_id == last_popupped_data["id_ritrovamento"]))
                setting_info();
        }
        else if("id_interv_nuovo" in last_popupped_data) {
            if((last_visited_type == "intervento") && (last_visited_id == last_popupped_data["id_interv_nuovo"]))
                setting_info();
        }
    }

    // opengeo data
    ask_opengeo(last_visited_type, last_visited_id, back_id);

    // user contents
    get_contents();
}

$(document).on('pagebeforeshow', '#info', function() {
    prepare_info();

});


// OUR SERVER
function make_poi() {
    if(last_visited_type == "ritrovamento")
        return last_visited_id;
    else
        return -last_visited_id;
}

function register(name, psw, email) {
    $.ajax({
        type: "POST",
        url: SERVER_URL + "api/user",
        data: JSON.stringify({ "name": name, "psw": psw, "email": email }),
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
            $("form#user_data_register")[0].reset();
            login_message("Registrazione avvenuta! Adesso puoi loggarti");
            $("#register_error")
                .empty()
                .css("border", "");
            $.mobile.changePage("#login");
        },
        error: function() {
           register_message("Errore durante la registrazione! Il nome è già stato scelto");
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

            $("#login_situation")
                .empty()
                .css("border", "");
            $("#register_error")
                .empty()
                .css("border", "");

            // TODO: andare indietro a back, qui, invece che alla mappa
            $.mobile.changePage("#home");
        },
        error: function() {
            login_message("Errore durante il login!");
        }
    });
}

function post_a_comment(comment) {
    var poi = make_poi();

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
            contents_refresh();
            $("#result_comment").html("Commento aggiunto!")
        },
        error: function() {
            console.log("ops, something went wrong..");
            register_message("Errore! Commento non pubblicato");
            $("#result_comment").empty();
        }
    });
}

function get_contents() {
    poi = make_poi();
    console.log("contents poi: ", poi);

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

function upload(comment, form_data) {
    var poi = make_poi();
    var file_id = null;

    $.mobile.loading("show", {
        text: "contattando il server",
        textVisible: true,
        theme: "d"
    });
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
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
}

function upload2(poi, file_id, form_data) {
    // actually post the file
    $.mobile.loading("show", {
        text: "caricando il file",
        textVisible: true,
        theme: "d"
    });

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
            
            $("#result_comment").html("Contenuto aggiunto!");
            
            contents_refresh();
            // TODO: collapsible plugin?!
            // $( "#layout_contents" ).trigger( "expand" );
        },
        error: function(x, t, m) {
            console.log(t);
        },
        complete: function() {
            $.mobile.loading("hide");
        }
    });
}

function wms_proxy(bbox, width, height, x, y, e) {
    /**
     * Ask to our server to serve as a proxy and send us a json
     * (getFeatureInfo) from the wms server.
     */
    $.ajax({
        type: "GET",
        url: SERVER_URL + "api/proxy/" + bbox + '&' + width + '&' + height + '&' + x + '&' + y,
        success: function(data) {
            console.log("proxied.");
            console.log("wms: ", data);
            pop_the_popup(data, e);
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
}


// OPENGEO SERVER
function ask_opengeo(type, id, back_id) {
    if(type == "ritrovamento")
        var prefix = "rit_id=";
    else if(type == "intervento")
        var prefix = "interv_id=";
    else
        return;

    $.getJSON(
        "http://opengeo.eu/archeofi2/api/archeofi_api.php?" + prefix + id + "&jsoncallback=?",
        function(data) {
            console.log("opengeo: ", data);
            display_opengeo(data, back_id);
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
            console.log("research: ", data);
            list_search_result(data);
        }
    );
}
