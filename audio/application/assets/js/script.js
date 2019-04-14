
$(document).ready(function() 
 {


	//Global Vars
	var finderNav_tabindex = 0;
	var i = 0;
	


	var status_player = "stop";
	var volume = navigator.volumeManager;
	var status = "default";
	var debug = false;
	var lastDir = "";
	var playlist = [];
	var playlist_status = "";
	var playlist_title = 0;

	var player = new Audio();
	player.mozAudioChannelType='content';
	player.type = "audio/mpeg";
	player.preload="none";

	var window_status = false;







function finder()
{
var filelist = navigator.getDeviceStorages('sdcard');

for(var i = 0; i< filelist.length; i++)
{
	// Let's browse all the images available
	var cursor = filelist[i].enumerate();

	cursor.onsuccess = function () {
	if(cursor.result.name !== null) {
	var file = cursor.result;

	// Once we found a file we check if there is other results
	// Then we move to the next result, which call the cursor
	// success with the next file as result.
	if(file.type.match('audio/*'))
	{

		finderNav_tabindex++;
		var str = file.name;

		//find slash and replace with white space
		var rest = str.substring(0, str.lastIndexOf("/") + 1);
		rest = rest.replace(/ |\//g," ");



		var dir = str.split('/');
		file_name = dir[dir.length-1];
		source_dir = dir[2];
		dir = dir[dir.length-2];



		

			if(lastDir != dir)
			{
			$("div#app-list").append('<div class="dir items-container">'+dir+'</div>');		
			}
			$("div#app-list").append('<div class="items" tabindex="'+finderNav_tabindex+'" data-search="'+rest+'" data-content="'+file_name+'">'+file_name+'</div>');		
			lastDir = dir
			}
		

		this.continue();
		
		$('body').find('div#finder div.items').first().focus()


		}
	}



	cursor.onerror = function () 
	{
		alert("No file found: " + this.error); 
	}



	}
}



finder()



////////////////////////
//NAVIGATION
/////////////////////////



	function nav (move) {
		if(status != "volume_control")
		{
			var selected_button = $("div#finder div:focus")[0];
			i = $(selected_button).attr("tabindex")
			var items = document.querySelectorAll('.items');
			if(move == "+1" && i < finderNav_tabindex)
			{
			i++

			if(i <= finderNav_tabindex)
			{
				var items = document.querySelectorAll('.items');
				var targetElement = items[i];
				targetElement.focus();
				$("div#debugger").text(i)

			}
			}

			if(move == "-1" &&  i > 0)
			{
			i--
			if(i >= 0)
			{
				var items = document.querySelectorAll('.items');
				var targetElement = items[i];
				targetElement.focus();
				$("div#debugger").text(i)

			}
			}
	}

	}



function nav_dirs(param)
{
	if(param == "down")
	{
		var selected_button = $("div#finder div:focus")[0];
		var next_dir = $(selected_button).nextAll('.dir:first').next().focus();
	}


	if(param == "up")
	{
		var selected_button = $("div#finder div:focus")[0];
		var prev_dir = $(selected_button).prevAll(".dir")[1];
		$(prev_dir).next().focus()
	}

}


//////////////////
//PLAY
//////////////////


function play_sound()


{
	player.src =  "";

	$("div#time").css("opacity","0")
	var selected_button = $("div#finder div:focus")[0];
	if(selected_button != "undefined")
	{
		var source = selected_button.getAttribute('data-content');
		

		var finder = new Applait.Finder({ type: "sdcard", debugMode: false });
		finder.search(source);

		finder.on("fileFound", function (file, fileinfo, storageName) {
			var mysrc = URL.createObjectURL(file);
				
	
			player.src =  mysrc;
						player.play();





			//time duration
			$(player).on("loadedmetadata", function(){

			setInterval(function() { 
						var time = player.duration - player.currentTime; 
						var minutes = parseInt(time / 60, 10);
						var seconds_long = parseInt(time % 60,10);
						var seconds;
						if(seconds_long < 10)
						{
							seconds = "0"+seconds_long;
						}
						else
						{
							seconds = seconds_long;
						}
						$("div#time").text(minutes+":"+seconds);

						
			}, 1000);
	

			});

			player.ondurationchange = function() {
				setTimeout(function(){
					$("div#time").css("opacity","1");
				},2000);
			};

			$('div.items').removeClass('active')
			$(selected_button).addClass('active')
			
			URL.revokeObjectURL(file);

				})

		}

}







function seeking(param)
{
var step = 10;
player.pause();
	if(param == "forward")
	{
		player.currentTime = player.currentTime - step++

	}


	if(param == "backward")
	{
				player.currentTime = player.currentTime + step++


	}
	player.play();

}





function pause_sound()
{
	if (player.paused && player.currentTime > 0 && !player.ended && window_status == flae) {
         player.play();
     } else {
         player.pause();
     }
}


function volume_control(param)
{
		
		if(status == "volume_control")
	{



	if(param == "up")
	{
		volume.requestUp()

		   setTimeout(function() {
        status = "default";
    }, 2000);


	}



	if(param == "down")
	{
	volume.requestDown()

	setTimeout(function() {
        status = "default";
    }, 2000);
	}

}



}


function add_playlist()
{
	var selected_button = $("div#finder div:focus")[0];
	var source = selected_button.getAttribute('data-content');

	if($(selected_button).hasClass('playlist-item') == true)
	{
		$(selected_button).removeClass('playlist-item')
		playlist.splice($.inArray(source, playlist),1);
	}
	else
	{
		$(selected_button).addClass('playlist-item')
		playlist.push(source)
	}

}


function play_playlist(param)
{
if(playlist.length == 0)
{
	alert("no playlist available");
	return;
}
	playlist_status = "playing";
	var source = playlist[param];


	var finder = new Applait.Finder({ type: "sdcard", debugMode: false });
	finder.search(source);

	finder.on("fileFound", function (file, fileinfo, storageName) {

		var mysrc = URL.createObjectURL(file);
		//time duration
		$(player).on("loadedmetadata", function(){


		setInterval(function() { 
					var time = player.duration -player.currentTime; 
					var minutes = parseInt(time / 60, 10);
					var seconds = parseInt(time % 60,10);
					$("div#time").text(minutes+":"+seconds);
		}, 1000);


		});
		
		player.src =  mysrc;
		
		if(status_player == "play")
		{
			player.pause();
		}
		
		player.play();
		status_player = "play";


		$('div.items').removeClass('active')
		$("body").find("div[data-content='" + source + "']").addClass('active');


		player.mozAudioChannelType='content';
		URL.revokeObjectURL(file);
})





}


function show_man()
{
	$("div#man-page").css('display','block')
	window_status = true;
}

function close_man()
{
	$("div#man-page").css('display','none')
	window_status = false;
}


function player_ended()
{
	$("div#time").text("");
	playlist_title++
	if(playlist_status == "playing")
	{

		if(playlist_title > playlist.length-1)
		{
			player.src="";
		}
		if(playlist_title <= playlist.length-1)
		{
			play_playlist(playlist_title)
		}


	}
	
}


function player_play_run()
{

}


function player_seeking_run()
{
	player.muted=true;
	player.volume=0;
}




	//////////////////////////
	////KEYPAD TRIGGER////////////
	/////////////////////////



	function handleKeyDown(evt) {


			switch (evt.key) {


	        case 'Enter':
	        play_sound()
	        break;


			case '0':
			show_man()
			break

			case '1':
			add_playlist()
			break

			case '4':
			play_playlist(0)
			break

			case '2':
			nav_dirs("up")
			break


			case '5':
			nav_dirs("down")
			break;



			case 'ArrowDown':
				nav("+1")
				volume_control("down");
			break; 


			case 'ArrowUp':
				nav("-1")
				volume_control("up");
			break; 

			case 'ArrowLeft':
				seeking("backward");
			break; 

			case 'ArrowRight':
				seeking("forward")
			break; 


			case 'SoftRight':
				status = "volume_control";
				volume.requestShow();

			break;

			case 'SoftLeft':
				pause_sound();
				close_man();
			break;
 

		}

	};



	document.addEventListener('keydown', handleKeyDown);
	player.addEventListener('ended', player_ended);
	player.addEventListener('playing', player_play_run);
	player.addEventListener('seeking', player_seeking_run);




	//////////////////////////
	////BUG OUTPUT////////////
	/////////////////////////
if(debug == true)
{

	$(window).on("error", function(evt) {

	console.log("jQuery error event:", evt);
	var e = evt.originalEvent; // get the javascript event
	console.log("original event:", e);
	if (e.message) { 
	    alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
	} else {
	    alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
	}
	});
}

});






