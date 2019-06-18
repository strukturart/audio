
$(document).ready(function() 
 {


	//Global Vars
	var finderNav_tabindex = 0;
	var i = 0;
	


	var status_player = "stop";
	var volume = navigator.volumeManager;
	var status = "player";//player, volume, podcast
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
	var i = 0;
	var podcast_url_list = [];
	var podcast_file_list = [];
	var podcast_download_path = "";
	var download_done = "done";	
	var download_counter = -1;
	var podcast_action = false;

	var episode_limit = 0;
	var url_counter = -1;
	var arr_file_name = [];





///////////////////////////
///PODCAST/////////////////
///////////////////////////
//READ URLS FROM SDCARD////
///////////////////////////

function read_json()
{

	status = "podcast"
	
	var finder = new Applait.Finder({ type: "sdcard", debugMode: true });
	finder.search("audio.json");



	finder.on("empty", function (needle) 
	{
		alert("no sdcard found");
		return;
	});

	finder.on("searchComplete", function (needle, filematchcount) 
	{
		
		if(filematchcount == 0)
		{
			alert("no markers.json file found");
			return;
		}
	})

	finder.on("fileFound", function (file, fileinfo, storageName) 
	{
		//file reader

		var markers_file="";
		var reader = new FileReader()


		reader.onerror = function(event) 
				{
					alert('shit happens')
					reader.abort();
				};

				reader.onloadend = function (event) 
				{

						markers_file = event.target.result
						
						//check if json valid
						var printError = function(error, explicit) {
						console.log("[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}");
						}

						try {
						} catch(e) {
						if (e instanceof SyntaxError) {
						alert("Json file is not valid");
						return;
						} else {

						}

						}


							$("div#podcast-message").css("display","block");
							$("div#podcast-message").text("Please wait")
							$("div#finder div#app-list").css("display","none")
							$("div#finder div.button-bar div.button-left").text("")
							$("div#finder div.button-bar div.button-right").text("")



								var data = JSON.parse(markers_file);

							
								$.each(data, function (index, value) {
									
									if(value.url)
									{
										podcast_url_list.push(value.url)
										
									}

									if(value.download_path)
									{
										podcast_download_path = value.download_path;
										if(podcast_download_path == "")
											{
												alert("none download path set")
											}
									}

									
								})
								//start fetching meta data from podcast source
								if(podcast_url_list.length > 0)
								{
									podcast_xml_fetcher(podcast_url_list[0])
									

								}

								

				};
				reader.readAsText(file)
			});


}





//////////////////////////////
///PODCAST////////////////////
//////////////////////////////
//LOAD META DATA FROM URLS////
/////////////////////////////








function podcast_xml_fetcher(param_value)
{

	episode_limit = 0;

	var xhttp = new XMLHttpRequest({ mozSystem: true });

	xhttp.open('GET',param_value,true)
	xhttp.withCredentials = true;
	xhttp.responseType = 'document';
	xhttp.overrideMimeType('text/xml');

	$("div#podcast-message").text("Please wait checking "+param_value)
	


	xhttp.onload = function () {
		if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {

	
		var data = xhttp.response;


		$(data).find('item').each(function(){


			var podcast_url =  $(this).find('enclosure').attr('url')

		
				episode_limit++;
					if(episode_limit==1)
					{
					

						url_counter++;
						//check if file exist in local storage
						//only if not exist push in download list
						

						var dir = podcast_url.split('/');
						var filename  = dir[dir.length-1];

						var search_result = arr_file_name.indexOf(filename);

						if(search_result == -1 && podcast_url != "")
						{
							podcast_file_list.push(podcast_url)
						}
						
						if (url_counter < podcast_url_list.length)
						
						{

							setTimeout(function () {
							podcast_xml_fetcher(podcast_url_list[url_counter])
							}, 2000);
							
						}
						else
						{
							//ready to download podcasts
							$("div#podcast-message").text("Do you want to download "+podcast_file_list.length+ " new podcasts?")
							$("div#finder div#app-list").css("display","none")
							$("div#finder div.button-bar div.button-left").text("yes")
							$("div#finder div.button-bar div.button-right").text("none")
							
							//nothing to download
							if(podcast_file_list.length == 0)
							{

								$("div#podcast-message").text("No new podcasts to downloads")
								$("div#finder div#app-list").css("display","none")
								$("div#finder div.button-bar div.button-left").text("")
								$("div#finder div.button-bar div.button-right").text("")


								setTimeout(function () {
								$("div#podcast-message").text("")
								$("div#finder div#app-list").css("display","block")
								$("div#podcast-message").css("display","none")
								$("div#finder div.button-bar div.button-left").text("pause")
								$("div#finder div.button-bar div.button-right").text("volume")

								}, 4000);
							
							
							}

						}
					}

					else
					{
						return false;
					}
			

				})

		}
	};



	xhttp.onerror = function () {
	alert("error");
	};

	xhttp.send(null)

}




//////////////////////////////
///PODCAST////////////////////
//////////////////////////////
//DOWNLOAD FILES/////////////
/////////////////////////////
		

//////////////////
///read curl output
//to show progress
//////////////////


function read_log()
{
	var finder = new Applait.Finder({ type: "sdcard", debugMode: true });
	finder.search("log.txt");



	finder.on("empty", function (needle) 
	{
		alert("no log founded");
		return;
	});



	finder.on("fileFound", function (file, fileinfo, storageName) 
	{
		//file reader

		var markers_file="";
		var reader = new FileReader()


		reader.onerror = function(event) 
				{
					Logger.log('shit happens')
					reader.abort();
				};

				reader.onloadend = function (event) 
				{

				var output = event.target.result;

				var output_filter = output.split('#');
						var last_output  = output_filter[output_filter.length-1];

				//alert(event.target.result)
				$("div#precent").text("")
				$("div#precent").text(last_output)
								

				};
				reader.readAsText(file)
			});


	
}



function downloade_file(param_target_dir,param_url)
{


			var cmd = "cd "+param_target_dir+" && curl -kOL --progress-bar "+param_url +"> /storage/sdcard/podcast/log.txt 2>&1" +";exit";



			var extension = navigator.kaiosExtension || navigator.engmodeExtension;
				if(extension)
				{

				//alert(cmd)
				download_done = "progress";
				$("div#download-progress div#download-count").text(download_counter+" / "+podcast_file_list.length)


				var executor = extension.startUniversalCommand(cmd, true); 
				var log_output = setInterval(check_log, 1000);

				function check_log()
				{
					read_log()
				}
				
				executor.onsuccess = function(e){
					//alert('success')
					clearInterval(log_output);

					download_done = "done";
					//show progress
					if(download_counter < podcast_file_list.length)
					{
						$("div#download-progress div#download-count").text(download_counter+" / "+podcast_file_list.length)
					}


				};
				executor.onerror = function(e){
					alert('command failed')
				};

			


				

				}
				else alert('no extension object available');
				
		}
	


function download_loop()
{


var watch_var = setInterval(check_var, 4000);

function check_var() {

	//alert(download_done)
	if(download_done == "done" && download_counter <= podcast_file_list.length && podcast_file_list[download_counter] != "")
	{
		download_counter++
		downloade_file(podcast_download_path,podcast_file_list[download_counter])

		$("div#download-progress").css("display","block")


	}
	if(download_counter > podcast_file_list.length)
	{
		//alert("downloads finished")
		//stop interval
		clearInterval(watch_var);
		$("div#download-progress").css("display","none")
		$("div#podcast-message").text("downloads done");

		setTimeout(function () {
								$("div#download-progress div#download-count").text("")
								$("div#podcast-message").text("");
								$("div#finder div#app-list").css("display","block")
								$("div#finder div.button-bar div.button-left").text("pause")
								$("div#finder div.button-bar div.button-right").text("volume")
								$("div#podcast-message").css("display","none")
								$('body').find('div#finder div.items').first().focus()

								}, 4000);
		status = "player"
		var finderNav_tabindex = 0;
		finder()
	}

}



}



///////////////////
///PLAYER/////////
/////////////////
//LIST FILES////
///////////////


	//https://github.com/aadsm/jsmediatags
	var jsmediatags = window.jsmediatags;


function finder()
{
	finderNav_tabindex = -1;
	status = "player";
	$("div#app-list").empty()
	var filelist = navigator.getDeviceStorages('sdcard');

	for(var i = 0; i< filelist.length; i++)
	{
	var cursor = filelist[i].enumerate();

	

	cursor.onsuccess = function () {
	if(cursor.result) {
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
		var file_name = dir[dir.length-1];
		source_dir = dir[2];
		dir = dir[dir.length-2];

		

			if(lastDir != dir)
			{
			$("div#app-list").append('<div class="dir items-container">'+dir+'</div>');		
			}
			$("div#app-list").append('<div class="items" tabindex="'+finderNav_tabindex+'" data-content="'+file_name+'">'+file_name+'</div>');		
			lastDir = dir
			//push in array to compare later
			arr_file_name.push(file_name)

			}

			var mysrc = URL.createObjectURL(file);
			/*
			if(mysrc)
			{

jsmediatags.read(mysrc, {
  onSuccess: function(tag) {
    console.log(tag);
  },
  onError: function(error) {
    alert(error);
  }
});
		}
		*/

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

finder();


////////////////////////
//DELETE FILE
/////////////////////////

function delete_file()
{
			var sdcard = navigator.getDeviceStorages('sdcard');

			for (var i = 0; i < sdcard.length;i++)
			{


var cursor = sdcard[i].enumerate();
cursor.onsuccess = function () {

	var request = sdcard[1].delete("Vergebung.mp3");

	request.onsuccess = function () {
	  alert("File deleted");
	}

	request.onerror = function () {
	  alert("Unable to delete the file: " + this.error);
	}
  // Once we found a file we check if there is other results
  if (!this.done) {
    // Then we move to the next result, which call the
    // cursor success with the next file as result.
    this.continue();
  }
}
}

}

////////////////////////
//NAVIGATION
/////////////////////////



	function nav (move) {
		if(status == "player")
		{
			

			var selected_button = $("div#finder div:focus")[0];
			i = $(selected_button).attr("tabindex")
			var items = document.querySelectorAll('.items');
			$("div#debugger").text(i)
			
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




////SEEKING//////


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





function player_seeking_run()
{
	player.muted=true;
	player.volume=0;
}




////PAUSE//////

function pause_sound()
{
	if (player.paused && player.currentTime > 0 && !player.ended && window_status == flae) {
         player.play();
     } else {
         player.pause();
     }
}



////VOLUME CONTROL//////



function volume_control(param)
{
		
		if(status == "volume")
	{



	if(param == "up")
	{
		volume.requestUp()

		setTimeout(function() {
		status = "player";
	}, 2000);


	}



	if(param == "down")
	{
	volume.requestDown()

	setTimeout(function() {
	status = "player";
	}, 2000);
	}

}



}



/////PLAYLIST/////




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



//////MAN///////


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




function  player_play_run()
{}




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






function button_soft_right()
{
	if(status == "player")
	{
		status = "volume";
		volume.requestShow();	
	}

	

	if(status == "podcast")
	{

		$("div#finder div.button-bar div.button-left").text("pause")
		$("div#finder div.button-bar div.button-right").text("volume")
		$("div#podcast-message").css("display","none");
		$("div#finder div#app-list").css("display","block")
		status = "player"

	}

}



function button_soft_left()
{
	if(status == "player")
	{
		pause_sound();
		close_man();
	}

	if(status == "podcast")
	{
		$("div#finder div.button-bar div.button-left").text("")
		$("div#finder div.button-bar div.button-right").text("")
		download_loop();
		
		$("div#podcast-message").text("The files will now be downloaded. Please wait")
		//downloade_file2("podcast",podcast_file_list[0],"test"+download_counter+".mp3")
	}


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





			case '6':
			break;

			case '7':
			read_json()
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
				delete_file();
			break; 

			case 'ArrowRight':
				seeking("forward")
			break; 


			case 'SoftRight':
				button_soft_right()

			break;

			case 'SoftLeft':
				button_soft_left()
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



////////////////////
///////////////////
//MAYBE TRASH//////
/*
function downloade_file2(param_target_dir,param_url,param_file_name)
{
	download_counter++
	alert(podcast_file_list[0])

			$("div#download-progress").css("display","block")

			$("div#download-progress").text(download_counter+" / "+podcast_file_list.length)


			var request2 = new XMLHttpRequest({ mozSystem: true });


			//request2.addEventListener("progress", updateProgress);
			request2.addEventListener("load", transferComplete);
			request2.addEventListener("error", transferFailed);
			//request2.addEventListener("abort", transferCanceled);

			function transferFailed(evt)
			{
				alert("transfer failed")
			}

			function transferComplete(evt)
			{
				//alert("transfer finished")
				if(download_counter <= podcast_file_list.length)
				{
				downloade_file2("podcast",podcast_file_list[download_counter],"test"+download_counter+".mp3")
				}
				if(download_counter > podcast_file_list.length)
				{

				$("div#download-progress").css("display","none")
				$("div#podcast-message").text("downloads done");

				setTimeout(function () {
										$("div#download-progress").text("")
										$("div#podcast-message").text("");
										$("div#finder div#app-list").css("display","block")
										$("div#finder div.button-bar div.button-left").text("pause")
										$("div#finder div.button-bar div.button-right").text("volume")
										$("div#podcast-message").css("display","none")
										$('body').find('div#finder div.items').first().focus()


										}, 4000);
				status = "player"

				}

			}


			request2.open('GET', param_url,true);
			request2.responseType = "arraybuffer";




			request2.onloadstart = function () {
				//alert("Download underway");
			};

			request2.onload = function () {
				//$("div#download-progress").text(download_counter+1+" / "+podcast_file_list.length)

/*
				//save file 
				var sdcard = navigator.getDeviceStorages("sdcard");

				var file_blob   = new Blob([request2.response], {type: "audio/mpeg"});
				var request = sdcard[1].addNamed(file_blob,param_target_dir+"/"+param_file_name);

				request.onsuccess = function () {
					var name = this.result;
					alert('File "' + name + '" successfully wrote on the sdcard storage area');
					if(download_counter < podcast_file_list.length)
					{
						$("div#download-progress").text(download_counter+1+" / "+podcast_file_list.length)
						downloade_file2("podcast",podcast_file_list[download_counter],"test"+download_counter+".mp3")

					}

				}

				request.onerror = function () {
					alert('Unable to write the file: ' + this.error);
					download_counter++
					downloade_file2("podcast",podcast_file_list[download_counter],"test"+download_counter+".mp3")

				}
				

			};


			request2.send(null);

}

*/