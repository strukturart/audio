Audio Player app for the Nokia 88104G - [Gerda](https://gerda.tech/) 

### Features
audio player and podcast downloader


### Manual
+ **Cursor up/down** file navigation 
+ **Enter** play selected file
+ **Soft-key-left** pause
+ **Soft-key-right** volume
+ **key 1** add selected file to playlist
+ **key 4** play playlist
+ **key 5** jump to next folder
+ **key 2** jump to previous folder
+ **key 0** open man page
+ **key 7** download podcasts

Put on your sd card a file with the name audio.json with the following structure:


```
[
	
		{
			"url":"http://www.ndr.de/podcast/podcast3008.xml",
			"last_episods":"2"
		},

		{
			"url":"http://podcast.wdr.de/radio/leonardo.xml",
			"last_episods":"2"
		},

	

		{
			"download_path":"/storage/sdcard/podcast/"

		}
	
]

```
be very careful when specifying the download path: "download_path": "/storage/sdcard/podcast/"
because it can happen that if you set the wrong download path overrides your system
do a test before with adb shell!!

### to do

-download more episods
-delete files function
-solve curl https bug

### Thank you
https://tutorials.de and https://groups.google.com/forum/#!forum/bananahackers
