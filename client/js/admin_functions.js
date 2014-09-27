
$(document).on('pagebeforeshow', '#user_contents', function() {
    get_every_content();
});

function get_every_content(page) {
    $.ajax({
        type: "GET",
        url: SERVER_URL + "api/content",
        data: {
            "page": page || 1
        },
        dataType: "json",
        contentType: "application/json",
        success: function(received) {
            console.log("contents received.");
            display_contents(received);
            display_pagenumbers(received);
        },
        error: function() {
            console.log("ops, something went wrong..");
        }
    });
}

function display_pagenumbers(received) {
    for(var i=1; i<=received["total_pages"]; i++) {
        if(i == received["page"]) {
            $(".page_numbers").append(i + ' ')
        }
        else {
            $(".page_numbers").append(
                '<a href="#" class="go_to_page" name="' + i + '">' + i + '</a> '
            )
        }
    }

    $(".page_numbers .go_to_page").click(function() {
        event.preventDefault();
        $("#contents").empty();
        $(".page_numbers").empty();
        console.log($(this).attr("name"));
        get_every_content($(this).attr("name"));
    });
}
