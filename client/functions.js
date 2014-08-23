function read_form() {
    var name = $("#name").val();
    var psw = $("#psw").val();
    var email = $("#email").val();
    return [name, psw, email];
}

// INDIANA SERVER
var server_url = "http://127.0.0.1:5000/";
var logged_auth = null;

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
            return data_response.responseText;
        }
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

function wms_proxy(bbox, width, height, x, y) {
    $.ajax({
        type: "GET",
        url: server_url + "api/proxy/" + bbox + '&' + width + '&' + height + '&' + x + '&' + y,
        success: function() {
            console.log("proxied.");
        },
        error: function() {
            console.log("ops, something went wrong..");
        },
        complete: function(data_response) {
            return data_response.responseText;
        }
    });
}

function testOpenGeo() {
    $.getJSON(
        "http://opengeo.eu/archeofi2/api/archeofi_api.php?rit_id=13&jsoncallback=?",
        function(data) {
            alert(data[0]["descr"]);
        }
    );
}

function testApi() {
    $.ajax({
        type:"GET",
        // url: "http://127.0.0.1:5000/api/indiana_user",
        // url: "http://opengeo.eu/archeofi2/api/archeofi_api.php?rit_id=13",
        url: "http://127.0.0.1:5000/api/cross_domain",
        datatype: "JSON",
        success: function(data) {
            alert(data);
        },
        error: function (response) {
            alert("ciao");
        }
    });
}
