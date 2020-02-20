//Global Vars
let tabindex = -1;
var status_player = "stop";
var volume = navigator.volumeManager;
var status = "player"; //player, volume, podcast,delete
var debug = false;
var lastDir = "";
var playlist = [];
var playlist_status = "";
var playlist_title = 0;

var player = new Audio();
player.mozAudioChannelType = 'content';
player.type = "audio/mpeg";
player.preload = "none";

var window_status = false;
var podcast_data_table = [];
var podcast_download_table = [];
var podcast_download_path = "";
var download_done = "done";
var download_counter = -1;
var podcast_action = false;
var files_collection = [];

var array_position = -1;
var url_counter = 0;
var arr_file_name = [];
var cmd;
var jsmediatags = window.jsmediatags;
var fileURL = "";


$(document).ready(function() {



    ///////////////////////////
    ///PODCAST/////////////////
    ///////////////////////////
    //READ URLS FROM SDCARD////
    ///////////////////////////

    function read_json() {

        status = "podcast"



        var finder = new Applait.Finder({ type: "sdcard", debugMode: true });
        finder.search("audio.json");



        finder.on("empty", function(needle) {
            alert("no sdcard found");
            return;
        });

        finder.on("searchComplete", function(needle, filematchcount) {

            if (filematchcount == 0) {
                alert("no markers.json file found");
                return;
            }
        })

        finder.on("fileFound", function(file, fileinfo, storageName) {
            //file reader

            var markers_file = "";
            var reader = new FileReader()


            reader.onerror = function(event) {
                alert('shit happens')
                reader.abort();
            };

            reader.onloadend = function(event) {

                markers_file = event.target.result

                //check if json valid
                var printError = function(error, explicit) {
                    console.log("[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}");
                }

                try {} catch (e) {
                    if (e instanceof SyntaxError) {
                        alert("Json file is not valid");
                        return;
                    } else {

                    }

                }

                $("div#podcast-message").css("display", "block");
                $("div#podcast-message").text("Please wait")
                $("div#finder div#app-list").css("display", "none")
                $("div#finder div.button-bar div.button-left").text("")
                $("div#finder div.button-bar div.button-right").text("")

                var data = JSON.parse(markers_file);

                $.when(
                    $.each(data, function(index, value) {

                        if (value.url) {
                            podcast_data_table.push([value.url, value.episodes, value.dir])

                        }

                        if (value.download_path) {
                            podcast_download_path = value.download_path;
                            if (value.podcast_download_path == "") {
                                toaster("none download path set")
                            }
                        }


                    })).then(function() {
                    //start url download when readout are finished
                    podcast_xml_fetcher(podcast_data_table[0][0], podcast_data_table[0][2]);
                });


            }

            reader.readAsText(file)

        });


    }



    //////////////////////////////
    ///PODCAST////////////////////
    //////////////////////////////
    //LOAD META DATA FROM URLS////
    //////////////////////////////


    function podcast_xml_fetcher(param_value, param_dir) {
        array_position++;
        loop_counter = -1

        //podcast_data_table[value.url,value.episodes,value.dir]
        var max_iteration = podcast_data_table[array_position][1];
        //var dir = podcast_data_table[array_position][2]



        var xhttp = new XMLHttpRequest({ mozSystem: true });

        xhttp.open('GET', param_value, true)
        xhttp.withCredentials = true;
        xhttp.responseType = 'document';
        xhttp.overrideMimeType('text/xml');

        $("div#podcast-message").text("Please wait checking " + param_value)



        xhttp.onload = function() {
            if (xhttp.status === 302) {
                alert("wrong url")
            }


            if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {


                var data = xhttp.response;


                $(data).find('item').each(function() {

                    loop_counter++
                    var podcast_url = $(this).find('enclosure').attr('url')
                    var podcast_title = $(this).find('title').text()

                    if (loop_counter < max_iteration) {


                        //check if file exist in local storage
                        //only if not exist push in download list

                        var dir = podcast_url.split('/');
                        var filename = dir[dir.length - 1];

                        var search_result = arr_file_name.indexOf(filename);

                        if (search_result == -1 && podcast_url != "") {
                            //make multiArr downloadurl and dir
                            podcast_download_table.push([podcast_url, param_dir, podcast_title])
                        }

                    }


                })

                url_counter++;

                if (url_counter < podcast_data_table.length - 1)

                {

                    setTimeout(function() {
                        podcast_xml_fetcher(podcast_data_table[url_counter][0], podcast_data_table[url_counter][2])
                    }, 2000);

                } else {
                    //ready to download podcasts
                    $("div#podcast-message").text("Do you want to download " + podcast_download_table.length + " new podcasts?")
                    $("div#finder div#app-list").css("display", "none")
                    $("div#finder div.button-bar div.button-left").text("yes")
                    $("div#finder div.button-bar div.button-right").text("no")

                    //nothing to download
                    if (podcast_download_table.length == 0) {

                        $("div#podcast-message").text("All podcasts are up to date")
                        $("div#finder div#app-list").css("display", "none")
                        $("div#finder div.button-bar div.button-left").text("")
                        $("div#finder div.button-bar div.button-right").text("")


                        setTimeout(function() {
                            $("div#podcast-message").text("")
                            $("div#finder div#app-list").css("display", "block")
                            $("div#podcast-message").css("display", "none")
                            $("div#finder div.button-bar div.button-left").text("pause")
                            $("div#finder div.button-bar div.button-right").text("volume")

                        }, 4000);


                    }

                }

            }
        };



        xhttp.onerror = function() {
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


    function print_progress() {
        var finder = new Applait.Finder({ type: "sdcard", debugMode: true });
        finder.search("log.txt");



        finder.on("empty", function(needle) {
            toaster("log.txt not found");
            return;
        });



        finder.on("fileFound", function(file, fileinfo, storageName) {
            //file reader

            var markers_file = "";
            var reader = new FileReader()


            reader.onerror = function(event) {
                toaster('shit happens')
                reader.abort();
            };

            reader.onloadend = function(event) {

                var output = event.target.result;

                var output_filter = output.split('#');
                var last_output = output_filter[output_filter.length - 1];

                if (output_filter.length > 2) {
                    $("div#precent").text("")
                    $("div#precent").text(last_output)
                }


            };
            reader.readAsText(file)
        });
    }







    function downloade_file(param_target_dir, param_url) {

        if (debug) {
            cmd = "mkdir -p " + param_target_dir + " && cd " + param_target_dir + " && curl -kOLv  " + param_url + ">> " + podcast_download_path + "log.txt 2>&1" + ";exit";
        } else {
            cmd = "mkdir -p " + param_target_dir + " && cd " + param_target_dir + " && curl -kOL --progress-bar " + param_url + ">> " + podcast_download_path + "log.txt 2>&1" + ";exit";
        }

        var extension = navigator.kaiosExtension || navigator.engmodeExtension;
        if (extension) {

            download_done = "progress";
            $("div#download-progress div#download-count").text(download_counter + " / " + podcast_download_table.length)


            var executor = extension.startUniversalCommand(cmd, true);
            var log_output = setInterval(check_log, 1000);

            function check_log() {
                print_progress()
            }

            executor.onsuccess = function(e) {
                clearInterval(log_output);

                download_done = "done";
                //show progress
                if (download_counter < podcast_download_table.length) {
                    $("div#download-progress div#download-count").text(download_counter + " / " + podcast_download_table.length)
                }

            };

            executor.onerror = function(e) {
                toaster('command failed')
            };


        } else {
            toaster('no extension object available');
        }

    }



    function download_loop() {

        var watch_var = setInterval(check_var, 4000);

        function check_var() {

            if (download_done == "done" && download_counter <= podcast_download_table.length && podcast_download_table[download_counter] != "") {
                download_counter++
                var hello = podcast_download_path + podcast_download_table[download_counter][1] + "/";
                downloade_file(hello, podcast_download_table[download_counter][0])
                $("div#download-progress").css("display", "block")


            }

            if (download_counter > podcast_download_table.length) {
                //stop interval
                clearInterval(watch_var);
                $("div#download-progress").css("display", "none")
                $("div#podcast-message").text("downloads done");
                startVibrate([1000]);



                setTimeout(function() {
                    $("div#download-progress div#download-count").text("")
                    $("div#podcast-message").text("");
                    $("div#finder div#app-list").css("display", "block")
                    $("div#finder div.button-bar div.button-left").text("pause")
                    $("div#finder div.button-bar div.button-right").text("volume")
                    $("div#podcast-message").css("display", "none")
                    status = "player";
                    var tabindex = 0;
                    finder()

                }, 4000);

            }

        }

    }


    /////////////////////////
    //style last played track
    ////////////////////////

    function styleLastPlayedTrack() {

        let elem1 = localStorage.getItem('last_played_sound');
        if (elem1 != null) {

            $("div").find("[data-content='" + elem1 + "']").addClass("last-played");

        }

    }



    ///////////////////
    ///PLAYER/////////
    /////////////////
    //LIST FILES////
    ///////////////

    var file_name_metadata;

    function finder() {
        status = "player";


        //clear array
        while (arr_file_name.length > 0) {
            arr_file_name.pop();
        }


        //clear array
        while (podcast_download_table.length > 0) {
            podcast_download_table.pop();
        }



        $("div#app-list").empty()
        var filelist = navigator.getDeviceStorages('sdcard');


        for (var i = 0; i < filelist.length; i++) {
            var cursor = filelist[i].enumerateEditable();



            cursor.onsuccess = function() {
                if (cursor.result) {
                    var file = cursor.result;

                    if (file.type.match('audio/*')) {

                        fileURL = URL.createObjectURL(file)

                        var str = file.name;
                        //get filename
                        var dir = str.split('/');
                        var file_name = dir[dir.length - 1];
                        //get parent dir
                        source_dir = dir[2];
                        dir = dir[dir.length - 2];




                        tabindex++;
                        files_collection.push([str, file_name, fileURL, dir, file])

                        if (lastDir != dir) {
                            $("div#app-list").append('<div class="dir items-container">' + dir + '</div>');
                        }
                        $("div#app-list").append('<div class="items" tabindex="' + tabindex + '" data-file-url="' + str + '" data-content="' + file_name + '" data-content2="' + fileURL + '">' + file_name + '</div>');
                        lastDir = dir
                            //push in array to compare later with podcast downlad function
                            //why not use files_collection[x][1] to compare ???
                        arr_file_name.push(file_name)

                    }


                    // Once we found a file we check if there is other results
                    if (!this.done) {
                        // Then we move to the next result, which call the
                        // cursor success with the next file as result.
                        this.continue();
                    }

                    $('div#app-list').find('div.items[tabindex=0]').focus();
                    styleLastPlayedTrack();


                }

            }


            cursor.onerror = function() {
                toaster("No file found: " + this.error);
            }





        }
    }

    finder();





    function set_tabindex() {
        items = $('div#app-list > div.items');


        for (var i = 0; i < items.length; i++) {
            $(items[i]).attr('tabindex', i)
                //pos_focus = 0
            $('div#app-list').find('div.items[tabindex=0]').focus();
        }
    }






    ////////////////
    //////DEV///////
    ////////////////


    function read_metadata2() {
        for (var i = 0; i < files_collection.length;) {
            musicmetadata(files_collection[i][5], function(err, result) {
                if (err) {
                    console.log("no metadata found")
                    i++
                }
                if (result) {
                    console.log(result.title);
                    i++
                }

            });

        }
    }

    function read_metadata() {
        for (var i = 0; i < files_collection.length;) {
            jsmediatags.read(files_collection[i][0], {
                onSuccess: function(tag) {
                    toaster(tag);
                    i++;
                },
                onError: function(error) {
                    toaster(error);
                    i++;
                }
            });

        }
    }


    ///////////////

    ////////////////////////
    //DELETE FILE
    /////////////////////////

    function delete_file() {
        status = "delete";
        $("div#time").text("");


        var selected_button = $(':focus');
        var file_name = $(selected_button).attr("data-content")
        startVibrate([500, 100, 500]);


        $("div#podcast-message").css("display", "block")
        $("div#finder div#app-list").css("display", "none")
        $("div#podcast-message").text("Do you want delete " + file_name + " ?")
        $("div#finder div#app-list").css("display", "none")
        $("div#finder div.button-bar div.button-left").text("yes")
        $("div#finder div.button-bar div.button-right").text("no")


    }

    ////////////////////////
    //NAVIGATION
    /////////////////////////



    function nav(move) {
        if (status == "player") {


            var selected_button = $("div#finder div:focus")[0];
            i = $(selected_button).attr("tabindex")
            var items = document.querySelectorAll('.items');
            $("div#debugger").text(i)

            if (move == "+1" && i < tabindex) {
                i++

                if (i <= tabindex) {
                    var items = document.querySelectorAll('.items');
                    var targetElement = items[i];
                    targetElement.focus();
                    $("div#debugger").text(i)


                }
            }

            if (move == "-1" && i > 0) {
                i--
                if (i >= 0) {
                    var items = document.querySelectorAll('.items');
                    var targetElement = items[i];
                    targetElement.focus();
                    $("div#debugger").text(i)

                }
            }
        }

    }



    function nav_dirs(param) {
        if (param == "down") {
            var selected_button = $("div#finder div:focus")[0];
            var next_dir = $(selected_button).nextAll('.dir:first').next().focus();
        }


        if (param == "up") {
            var selected_button = $("div#finder div:focus")[0];
            var prev_dir = $(selected_button).prevAll(".dir")[1];
            $(prev_dir).next().focus()
        }

    }


    //////////////////
    //PLAY
    //////////////////
    //Test get URL.createObjectURL(file) from array

    function dev_play_sound() {


        player.src = "";


        $("div#time").css("opacity", "0")
        var selected_button = $("div#finder div:focus")[0];
        if (selected_button != "undefined" && status != "delete") {
            var source = selected_button.getAttribute('data-content2');


            player.src = source
            player.play();
            //rember last played track
            localStorage.setItem('last_played_sound', selected_button.getAttribute('data-content'))



            //time duration
            $(player).on("loadedmetadata", function() {

                setInterval(function() {
                    var time = player.duration - player.currentTime;
                    var percent = (player.currentTime / player.duration) * 100;
                    var minutes = parseInt(time / 60, 10);
                    var seconds_long = parseInt(time % 60, 10);
                    var seconds;
                    if (seconds_long < 10) {
                        seconds = "0" + seconds_long;
                    } else {
                        seconds = seconds_long;
                    }
                    $("div#time").text(minutes + ":" + seconds);

                    percent = percent + "%";

                    $("div#finder div.active").css({ background: 'linear-gradient(to right, orange ' + percent + ', white 0%)' })
                    $("div#finder div.active").css('color', 'black')

                }, 1000);


            });

            player.ondurationchange = function() {
                setTimeout(function() {
                    $("div#time").css("opacity", "1");
                }, 2000);
            };


        }


        $('div.items').removeClass('active')
        $("div#finder div#app-list div.items").css("background", "black");
        $("div#finder div#app-list div.items").css("color", "white");
        $("div#finder div#app-list div.items:focus").css("color", "black!Important");
        $("div#finder div#app-list div.items:focus").css("background", "white!Important");

        $(selected_button).addClass('active')

    }


    //////////////////
    //PLAY
    //////////////////


    function play_sound() {

        player.src = "";

        $("div#time").css("opacity", "0")
        var selected_button = $("div#finder div:focus")[0];
        if (selected_button != "undefined" && status != "delete") {
            var source = selected_button.getAttribute('data-content');


            var finder = new Applait.Finder({ type: "sdcard", debugMode: false });
            finder.search(source);

            finder.on("fileFound", function(file, fileinfo, storageName) {
                var mysrc = URL.createObjectURL(file);
                player.src = mysrc;
                player.play();

                //time duration
                $(player).on("loadedmetadata", function() {

                    setInterval(function() {
                        var time = player.duration - player.currentTime;
                        var minutes = parseInt(time / 60, 10);
                        var seconds_long = parseInt(time % 60, 10);
                        var seconds;
                        if (seconds_long < 10) {
                            seconds = "0" + seconds_long;
                        } else {
                            seconds = seconds_long;
                        }
                        $("div#time").text(minutes + ":" + seconds);


                    }, 1000);


                });

                player.ondurationchange = function() {
                    setTimeout(function() {
                        $("div#time").css("opacity", "1");
                    }, 2000);
                };

                $('div.items').removeClass('active')
                $(selected_button).addClass('active')

                URL.revokeObjectURL(file);

            })


        }

        $('div.items').removeClass('active')
        $("div#finder div#app-list div.items").css("background", "black");
        $("div#finder div#app-list div.items").css("color", "white");
        $("div#finder div#app-list div.items:focus").css("color", "black!Important");
        $("div#finder div#app-list div.items:focus").css("background", "white!Important");
        $(selected_button).addClass('active')

    }






    ////SEEKING//////


    function seeking(param) {
        var step = 10;
        player.pause();
        if (param == "backward") {
            player.currentTime = player.currentTime - step++

        }


        if (param == "forward") {
            player.currentTime = player.currentTime + step++


        }
        player.play();
        //player.muted=false;

    }





    function player_seeking_run() {
        player.muted = true;
        player.volume = 0;
    }




    ////PAUSE//////

    function pause_sound() {
        if (player.paused && player.currentTime > 0 && !player.ended) {
            player.play();
        } else {
            player.pause();
        }
    }


    ////////////////////////
    ////VOLUME CONTROL//////
    ///////////////////////



    function volume_control(param) {

        if (status == "volume") {
            if (param == "up") {
                volume.requestUp()

                setTimeout(function() {
                    status = "player";
                }, 2000);
            }



            if (param == "down") {
                volume.requestDown()
                setTimeout(function() {
                    status = "player";
                }, 2000);
            }

        }



    }


    //////////////////
    /////PLAYLIST/////
    //////////////////

    function add_playlist() {
        var selected_button = $("div#finder div:focus")[0];
        var source = selected_button.getAttribute('data-content');

        if ($(selected_button).hasClass('playlist-item') == true) {
            $(selected_button).removeClass('playlist-item')
            playlist.splice($.inArray(source, playlist), 1);
        } else {
            $(selected_button).addClass('playlist-item')
            playlist.push(source)
        }

    }


    function play_playlist(param) {
        if (playlist.length == 0) {
            alert("no playlist available");
            return;
        }
        playlist_status = "playing";
        var source = playlist[param];


        var finder = new Applait.Finder({ type: "sdcard", debugMode: false });
        finder.search(source);

        finder.on("fileFound", function(file, fileinfo, storageName) {

            var mysrc = URL.createObjectURL(file);
            //time duration
            $(player).on("loadedmetadata", function() {


                setInterval(function() {
                    var time = player.duration - player.currentTime;
                    var minutes = parseInt(time / 60, 10);
                    var seconds = parseInt(time % 60, 10);
                    $("div#time").text(minutes + ":" + seconds);
                }, 1000);


            });

            player.src = mysrc;

            if (status_player == "play") {
                player.pause();
            }

            player.play();
            status_player = "play";


            $('div.items').removeClass('active')
            $("body").find("div[data-content='" + source + "']").addClass('active');


            player.mozAudioChannelType = 'content';
            URL.revokeObjectURL(file);
        })





    }





    function player_ended() {
        $("div#time").text("");
        playlist_title++
        if (playlist_status == "playing") {

            if (playlist_title > playlist.length - 1) {
                player.src = "";
            }
            if (playlist_title <= playlist.length - 1) {
                play_playlist(playlist_title)
            }


        }

    }






    function button_soft_right() {
        if (status == "player") {
            status = "volume";
            volume.requestShow();
        }



        if (status == "podcast") {

            $("div#finder div.button-bar div.button-left").text("pause")
            $("div#finder div.button-bar div.button-right").text("volume")
            $("div#podcast-message").css("display", "none");
            $("div#finder div#app-list").css("display", "block")
            status = "player"

        }


        if (status == "delete") {

            $("div#finder div.button-bar div.button-left").text("pause")
            $("div#finder div.button-bar div.button-right").text("volume")
            $("div#podcast-message").css("display", "none");
            $("div#finder div#app-list").css("display", "block")
            status = "player"

        }

    }



    function button_soft_left() {
        if (status == "player") {
            pause_sound();
        }

        if (status == "podcast") {
            $("div#finder div.button-bar div.button-left").text("")
            $("div#finder div.button-bar div.button-right").text("")
            download_loop();

            $("div#podcast-message").text("The files will now be downloaded. Please wait")
        }

        if (status == "delete") {
            var selected_button = $(':focus');
            var file_name = $(selected_button).attr("data-file-url")
            var sdcard = navigator.getDeviceStorages('sdcard');
            var request = sdcard[1].delete(file_name);

            request.onsuccess = function() {
                $("div#delete-message").css("display", "block");
                setTimeout(function() {
                    $("div#delete-message").css("display", "none")
                }, 4000);


                $("div#finder div.button-bar div.button-left").text("pause")
                $("div#finder div.button-bar div.button-right").text("volume")
                $("div#podcast-message").css("display", "none");
                $("div#finder div#app-list").css("display", "block")
                status = "player"
                finder()


            }

            request.onerror = function() {
                toaster("Unable to delete the file: " + this.error);
            }

        }


    }


    ///////////////////////
    ////long press////////


    var key_time

    function func_interval() {
        var counter = 0;
        key_time = setInterval(function() {
            counter++
            player.src = "";

            if (counter === 2) {
                delete_file()
                player.src = "";
                clearInterval(key_time)
            }

        }, 1000);

    }



    //////////////////////////
    ////KEYPAD TRIGGER////////////
    /////////////////////////


    function handleKeyUp(evt)

    {

        switch (evt.key) {
            case 'Enter':
                clearInterval(key_time);
                dev_play_sound();
                break;
        }
    }



    function handleKeyDown(evt) {


        switch (evt.key) {


            case 'Enter':
                func_interval();
                break;

            case '0':
                read_metadata();
                break;

            case '1':
                add_playlist()
                break

            case '3':
                $("div.last-played").focus();
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


            case '7':
                read_json();
                break;

            case '8':
                read_metadata()
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
                button_soft_right()

                break;

            case 'SoftLeft':
                button_soft_left()
                break;

            case 'Backspace':
                close.window()
                break;


        }

    };







    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    player.addEventListener('ended', player_ended);
    //player.addEventListener('seeking', player_seeking_run);




    //////////////////////////
    ////BUG OUTPUT////////////
    /////////////////////////
    if (debug) {

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