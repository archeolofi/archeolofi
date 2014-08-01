$(document).bind('pageinit', function() {
    
    var item;
    
    $ajax({
        url:"feed.xml ",
        method:"GET",
        dataType:"xml",
        success : function(data){
            console.("Success: " + data );
            
            item = $(data).find("item");
            
            var htmlContent = "";
            for( var i=0; i<$(item).length, i++){
                var title= $(item[i]).find("title").text();
                
                htmlContent += "<li><a href='#page2' class="enrty-line" class=<h2>" +title+ "</h2></li>"
                )    
            }
            
            $("news-list").html(htmlcontent);
            $("news-list)-listview('refresh');
        },
        error : function(err) {
            console.log("Error: " + err);
        }
    });
        
    $(document).on("click", ".entry-link", function() {
        var selected = $(this).data("itemid");
        
        var content= "<h2>" + $(item[selected].find("title")
        
        $("#entry-content").html(selected);
    

});
    
    