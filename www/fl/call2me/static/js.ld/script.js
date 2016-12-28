
var console;
//Height of Content
var height = $(window).height() - ( $(".horizontal-nav").height() + $("header").height() + 65 + $("footer").height() );
    
/*jshint unused:false*/
function broken(r) {
    r.onerror='';
    r.src="/content/imgs/avatars/avatar.png";
    return false;
}

//Get contacts from backend
/*jshint unused:false*/
function contactsGet2() {
    var html ='<table><tr><td class="name">Name</td><td class="company">Company</td><td class="social">Social</td><td class="messengers">Messengers</td></tr>';

    $.get("http://app.call2me.pro/?action=getlist", function(json) {
        var obj = jQuery.parseJSON( json );
        var menu = '';

        $.each(obj.menu, function(i, item) {
            menu = menu + '<li><a href="#" class="show-group" data-group="group' + item.groupId + '">' + item.title + '</a></li>';
        });

        $("#contacts-groups ul").html(menu);

        $.each(obj.contacts, function(i, item) {
            html = html + '<tr class="contact-line group' + item.groupId + ' ' + item.class + '"><td class="name"><img onerror="broken(this);" src="/contacts/?action=getimage&id='+item.id+'" />' +
                        '<a href="/contacts/?action=getbyid&id='+item.id+'">'+item.name+'</a></td>' +
                        '<td class="company">'+item.org+'</td>' +
                        '<td class="social">'+item.phone+'</td>' +
                        '<td class="email">'+item.email+'</td></tr>';
        });
        html = html + '</table>';

      $("#contacts-data").html(html);
    }); 
    return false;
}

//Get contacts from backend
/*jshint unused:false*/
function contactsGet() {
    $.get("/contacts/?action=getList", function(json) {
        var json = jQuery.parseJSON( json );

        //Повесить сортировку после загрузки таблиц
        //$("#contacts-data").html(json);

        //var search = JSON.search(contacts, '//*[contains(name, "Ren")]/name');

        //$("#contacts-data").html(search);

        html = Defiant.render('groups', json);
        $("#groups-data").html(html);
        
        html2 = Defiant.render('contacts', json);
        $("#contacts-data").html(html2);

        //Повесить сортировку после загрузки таблиц
        //$("tbody").height( height - 52 );
    
        //Повесить сортировку после загрузки таблиц
        $("table").stupidtable();
        //Сразу отсортировать таблицу по алфовиту
        $("table").find("th").eq(0).click();
    }); 

    return false;
}

//Get groups from backend
/*jshint unused:false*/
function groupsGet() {
    $.get("/contacts/?action=getGroups", function(json) {

      $("#contacts-groups ul").html(json);
    }); 
    return false;
}

//Check Auth
function checkAuth() {
    $.get("http://lk.call2me.pro/contacts/check_auth.php", function(data) {
        
        $(".loading").hide();

        if(data === '0') {
            $("#contactsAuthorize").removeClass("hidden");
        } else {
            //groupsGet();
            contactsGet();

            $("#contacts .tab-menu").removeClass("hidden");
            $("#contacts .tab-content").removeClass("hidden");
        }
    });
}

$(document).ready( function() {

    //Detect hash and then open tab
    var hash = location.hash;

    if(hash === '') {
        hash = '#contacts';
    }

    $(".horizontal-nav .active").removeClass("active");
    $('a[href*="'+hash+'"]').addClass("active");

    $(".tabs-container > .active").removeClass("active");
    $(hash).addClass("active");
    //detect hash


    //SingIn
    $(".singin").on("click", function(){
        $(".dropdown-menu").fadeToggle();
    });

    //Main tabs switch
    $(".tabs-anchor").on("click", function(e){
        e.preventDefault();
        var anchor = $(this).data("anchor");

        $(".horizontal-nav .active").removeClass("active");
        $(this).addClass("active");

        $(".tabs-container > .active").removeClass("active");
        $("#" + anchor).addClass("active");
    });

    //Signatrue tabs switch
    $(".signature-anchor").on("click", function(){
        var anchor = $(this).data("anchor");

        $("#signature .active").removeClass("active");
        $(this).addClass("active");

        $(".signature-content .active").removeClass("active");
        $("#" + anchor).addClass("active");
    });


    //Singin in Google contacts
    $("#contactsAuth").on("click", function () {
        var h = 500,
        w = 500;
        var modal = window.open('http://lk.call2me.pro/contacts/?action=auth', '', 'scrollbars=1,height='+Math.min(h, screen.availHeight)+',width='+Math.min(w, screen.availWidth)+',left='+Math.max(0, (screen.availWidth - w)/2)+',top='+Math.max(0, (screen.availHeight - h)/2));

        function disp(){

            $.get("http://lk.call2me.pro/contacts/window_close.php", function(data) {
             if(data === '1') {
                window.clearInterval(tm);
                modal.close();

                $("#contactsAuthorize").addClass("hidden");
                $("#contacts .tab-menu").removeClass("hidden");
                $("#contacts .tab-content").removeClass("hidden");

                //groupsGet();
                contactsGet();
              }
            });
        }

        var tm = window.setInterval( disp ,1000);

    });

    /*
    $("#magic-string-input").keypress(function (e) {
      if (e.which === 13) {
        var magic = $(this).val().split(" ");
        if( magic.length < 3) {
            $("#helper").text('Please Enter at least Phone, Name and Family Name');
        }
        else {
           var regex = /((8|\+7)-?)?\(?\d{3}\)?-?\d{1}-?\d{1}-?\d{1}-?\d{1}-?\d{1}-?\d{1}-?\d{1}/g;
            if (regex.exec(magic[0])) {
                var data = {phoneNumber: magic[0], givenName: magic[1], familyName: magic[2], email: magic[3], orgTitle: magic[4], orgName: magic[5], groupMembershipInfo: 6};
                $.ajax({
                    type: 'POST',
                    url: '/contacts/?action=add',
                    data: data, // or JSON.stringify ({name: 'jonas'}),
                    success: function() { $("#helper").text('Now please update the page to see the result :)'); },
                    contentType: "application/x-www-form-urlencoded"
                });

            } else {
                $("#helper").text('Check the phone: ' + magic[0]);
            }
        }
      }
    });
    */

    $("#magic-string-input").on("focus", function(){
        $(".search-alerts").fadeIn();
    });

    $("#magic-string-input").on('keypress keyup keydown change', function() {
        var value = $(this).val();
        value = value.trim();

        if(value.length > 0) {
            $(".search-lens").fadeOut();
            $(".search-cancel").fadeIn();
        } else {
            $(".search-lens").fadeIn();
            $(".search-cancel").fadeOut();
        }

        value = value.replace(/[+|\-|(|)]/g, '');
        var valueArr = value.split(' ');
        var phone = '', name = '', group = '', facebook = '';

        $.each(valueArr, function(index, item) {
            if(item !== '') {
                if(!isNaN(item)) {
                    phone += item;
                } else if(item.indexOf('#') === 0) {
                    group = item.replace(/[#]/g, '');
                } else if( (item.indexOf('https://facebook') + 1) || (item.indexOf('https://www.facebook') + 1) ) {
                    facebook += item + ' ';
                } else {
                    name += item + ' ';
                }
            }
        });

        $("#showName").text(name);
        $("#showGroup").text(group);
        $("#showPhone").text(phone);
        $("#showFacebook").text(facebook);
    });

    $(".search-cancel").on('click', function(e) {
        e.preventDefault();
        $("#magic-string-input").val('');
        $(".search-lens").fadeIn();
        $(".search-cancel").fadeOut();
        $(".search-alerts").fadeOut();
    });

    //Set Content's Height
    $(".tab-menu").css("height", height);
    $(".tab-content").css("height", height);
    $(".tab-content").find('tbody').css("height", height - $(".tab-content").find('thead').height());
    $(".tab").css("height", height);


    /*
     * Replace all SVG images with inline SVG
     */
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'));
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });


    $(".singin").on("click", function(){
        $(".dropdown-menu").fadeToggle();
    });


    $("form").on("submit", function(e){
        e.preventDefault();

        var form = $(this).serialize();
        var next = $(this).data("next");
        var url = $(this).data("url");
        var hideForm = $(this);

        if(next == "code-form") {
            $(".resend-val").val( $(".send-val").val() );
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: form,
            dataType: "json",
            success: function(json) {
                if(json.error === "true") {
                    $("#error").text(json.errorText).fadeIn();
                    console.log('error');
                } else if(next.length > 0) {
                    hideForm.hide();
                    $("." + next).fadeIn();
                    console.log('next');
                } else {
                    document.location.href = "/account/";
                    console.log('redirect');
                }
            }
        });

        return false;
    });

    $(".show").on("click", function(e){
        e.preventDefault();
        
        var form = $(this).data("form");

        $(".form").hide();
        $("." + form).fadeIn("fast");
    });
});



//Choose the group from left menu
//"groupAll" is default group
var currentGroup = "#contacts-data tbody tr";

$(document).on("click", ".show-group", function(){
    var group = "." + $(this).data("group");
    
    if( group == '.all') {
        $("#contacts-data tbody tr").fadeIn();
        currentGroup = "#contacts-data tbody tr";
    } else {
        //We have to wait before current group become hidden
        $(currentGroup).fadeOut(0, function(){
            $(group).fadeIn();
        }); 
        currentGroup = group;
    }

});



$(document).on("click", ".openProfile", function(e){
    $(".iphone-wrapper").fadeIn('fast');

    var id = $(this).data("id");
    var name = $(this).data("name");
    var company = $(this).data("company");
    var position = $(this).data("position");
    var group = $(this).data("group");
    var phone = $(this).data("phone");
    var email = $(this).data("email");
    var avatar = $(this).data("avatar");

    $("#insertName").val(name).trigger('input');
    $("#insertPosition").val(position).trigger('input');
    $("#insertCompany").val(company).trigger('input');
    $("#insertGroup").val("#"+group).trigger('input');
    $("#insertPhone").val(phone).trigger('input');
    $("#insertEmail").val(email).trigger('input');
    //$("#insertAvatar").attr("src", "/contacts/?action=getimage&id="+avatar);
    $(".contact-line").removeClass("active");
    $(".line" + id).addClass("active");
});

$(document).on("click", ".profileClose", function(e){
    $(".iphone-wrapper").fadeOut('fast');
});