let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    // Fetching the song from our local folder
    currFolder = folder;
    let get = await fetch(`http://127.0.0.1:3000/Projects/Spotify Clone (HTML,CSS,JS)/${folder}/`);
    let response = await get.text();

    // Putting the response as a text to a div so that we can parse the data using js
    let div = document.createElement("div");
    div.innerHTML = response;

    // Getting all the anchor tag as they have all the songs links
    let a = div.getElementsByTagName("a");

    let songs = [];

    // Getting all the songs that have an href ending with .mp3
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]); // 1 lena h cause usse pehle sara https etc filler words h
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Empty the innerHtml so only the selected folder songs are visible
    for (const song of songs) {
        let cleanSong = decodeURI(song);
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="svg/songs svg/music.svg" alt="music">
        <div class="info">
            <div>${cleanSong}</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="svg/songs svg/play.svg" alt="play">
        </div>
    </li>`;
    }


    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    });

    return songs;
}


const playMusic = (track, pause = false) => {

    currentSong.src = `http://127.0.0.1:3000/Projects/Spotify Clone (HTML,CSS,JS)/${currFolder}/` + track; // Path were the audio is stored
    // If user directly clicks the play button in the play bar, play the 1st song in the playlist
    if (!pause) {
        currentSong.play();
        play.src = "svg/songs svg/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


async function displayAlbums() {
    let getFolders = await fetch(`http://127.0.0.1:3000/Projects/Spotify Clone (HTML,CSS,JS)/songs/`);
    let response = await getFolders.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchor);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {

            let folder = e.href.split("/").slice(-2)[0];

            // Get metadata of the folders
            getFolders = await fetch(`http://127.0.0.1:3000/Projects/Spotify Clone (HTML,CSS,JS)/songs/${folder}/info.json`);
            response = await getFolders.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"
                    fill="none">
                    <g transform="translate(4, 3)">
                        <path
                            d="M15.23 6.5l-10.46-7.43c-.61-.35-1.37.13-1.37.81v14.84c0 .68.76 1.16 1.37.8l10.46-7.43z"
                            fill="#000" />
                    </g>
                </svg>
            </div>

            <img src="http://127.0.0.1:3000/Projects/Spotify Clone (HTML,CSS,JS)/songs/${folder}/cover.jpg" alt="img">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }


        // Load the playlist whenever card is clicked and play the first song in the playlist
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`) // Load the playlist whenever card is clicked
                playMusic(songs[0]); // playing the first song in the playlist
            })
        })
    }

}


async function main() {
    // Getting all the songs
    songs = await getSongs("songs/AnuvJain"); // Default album that will be loaded in the playlist
    playMusic(songs[0], true); // Play whatever song is at the 1st in the playlist, if user directly clicks the play button in the play bar

    // Display all the albums in the page
    displayAlbums();

    // Attach an event listener to play/pause , prev and next songs
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svg/songs svg/pause.svg";
        } else {
            currentSong.pause();
            play.src = "svg/songs svg/play.svg";
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; // this will move the circle of the seek bar from left to right dynamically based on the time
    })

    // Add event listener to seek bar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percentage * 100 + "%"; // To move the seekBar
        currentSong.currentTime = (currentSong.duration * percentage) / 100;
    })

    // Add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
    })

    // Add event listener to cancel
    document.querySelector(".cancel").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-140%";
    })

    // Add event listener to previous
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        // Play the prev song until it is the 1st song in the playlist
        if ((index - 1) < 0) {
            playMusic(songs[songs.length - 1]); // Play the last song when it's the first song in the playlist
        } else {
            playMusic(songs[index - 1]);
        }
    })

    // Add event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        // Play the next song until it is the last song in the playlist
        if ((index + 1) >= songs.length) {
            playMusic(songs[0]); // Play the first song when it's the last song in the playlist
        } else {
            playMusic(songs[index + 1]);
        }
    })

    // Add event listener to volume
    volrange.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "svg/songs svg/volume.svg";
        }
    })

    // Add event listener to mute the volume
    document.querySelector(".volume>img").addEventListener("click", (e) => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = "svg/songs svg/mute.svg";
            currentSong.volume = 0; // Making the volume of song to 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0; // Making the slider value 0
        } else {
            e.target.src = "svg/songs svg/volume.svg";
            currentSong.volume = 0.5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })

}

main();


