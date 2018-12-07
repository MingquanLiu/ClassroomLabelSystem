
(function ($) {
    "use strict";


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');
    var dbInit = false


    $('#submitbtn').on('click', function() {
        if (dbInit == false) {
            var config = {
                apiKey: "AIzaSyDUSIwpPgxrzim4lpnM0ATCRTsmC9lbzdk",
                authDomain: "classroomvideo-49965.firebaseapp.com",
                databaseURL: "https://classroomvideo-49965.firebaseio.com",
                projectId: "classroomvideo-49965",
                storageBucket: "classroomvideo-49965.appspot.com",
                messagingSenderId: "826703245914"
            };
            firebase.initializeApp(config);
            dbInit = true;
        }


        var username = $('#usernametxt').val();
        var password = $("#passwordtxt").val();
        var unameCheck = true;
        var passCheck = true;

        for(var i=0; i<username.length; i++) {
            if(validate(username[i]) == false){
                showValidate(username[i]);
                unameCheck=false;
            }
        }
        for(var j=0; j<password.length; j++) {
            if(validate(password[j]) == false){
                showValidate(password[j]);
                passCheck=false;
            }
        }

        if (unameCheck == true && passCheck == true) {
            let ref = firebase.database().ref().child('Users');
            ref.orderByChild("username").equalTo(username).once("value",snapshot => {
                let numChildren = snapshot.numChildren();
                if (numChildren == 0) {
                    $("#usernametxt").val("");
                    $("#passwordtxt").val("");
                    alert("Invalid username/password combination. Please try again!")
                }
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var dbUsername = childData['username'];
                    var dbPass = childData['password'];
                    if (dbUsername == username) {
                        if (dbPass == password) {
                            console.log("LOGIN SUCCESS")
                            // $("#loginstuff").remove();
                            // $("#loginheader").remove();
                            localStorage['userLoggedIn'] = username;
                            var windowVar = window.open("login/video-select.html",'_self');
                        } 
                    } 
                });
            });
        }
    });



    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        // if($(input).attr('type') == 'email' || $(input).attr('name') == 'username') {
        //     if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)(\]?)$/) == null) {
        //         return false;
        //     }
        // }
        // else {
        if(input.trim() == ''){
            return false;
        }
        else return true;
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);