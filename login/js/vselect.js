$(document).ready(function() {

	var config = {
        apiKey: "AIzaSyDUSIwpPgxrzim4lpnM0ATCRTsmC9lbzdk",
        authDomain: "classroomvideo-49965.firebaseapp.com",
        databaseURL: "https://classroomvideo-49965.firebaseio.com",
        projectId: "classroomvideo-49965",
        storageBucket: "classroomvideo-49965.appspot.com",
        messagingSenderId: "826703245914"
    };
    firebase.initializeApp(config);
    debugger;

    var ref = firebase.database().ref().child('Assignments');
    var username = localStorage['userLoggedIn'];
    console.log(username);


    ref.orderByKey().equalTo(username).once("value",snapshot => {
    	debugger;
        let numChildren = snapshot.numChildren();
        console.log("NumChildren: "+numChildren);
        if (numChildren == 0) {
        	//user does not have an array of video assignments in db
            alert(username+" has no assigned videos. Please contact your administrator!")
        }
        var data = snapshot.val();
        var assignments = data[username];

        for (videoID in assignments) {
        	let videoURL = assignments[videoID];
        	let header = $('<h3>' + videoID + '</h3>');
        	let p = $('<p>' + videoURL + '</p>');
        	let li = $('<li></li>');

        	header.addClass('vselect-item-header');
        	p.addClass("vselect-item-para");
        	li.addClass('vselect-item');
        	li.append(header);
        	li.append(p);
        	li.on('click', function () {
        		localStorage['videoURL'] = videoURL;
        		localStorage['videoID'] = videoID;
        		var windowVar = window.open("../website.html",'_self');
        	});

        	$('#videolist').append(li);
        }
    });

});