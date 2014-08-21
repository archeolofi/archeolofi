var server_url = "http://127.0.0.1:5000/";
var logged_auth = null;

function read_form() {
    var name = $("#name").val();
    var psw = $("#psw").val();
    var email = $("#email").val();
    return [name, psw, email];
}

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
        type:"GET",
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

function post_a_comment(comment, poi) {
    $.ajax({
        type:"POST",
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
            alert("ops, something went wrong..");
        },
        complete: function(data_response) {
            alert(data_response.responseText);
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
