document.addEventListener("DOMContentLoaded", function () {
    var videoElement = document.getElementById("videoPlayer");
    var streamList = document.getElementById("streamList");
    var m3uUrl = "https://iptv-org.github.io/iptv/countries/fr.m3u"; // Replace with your M3U file URL

    // Fetch and parse the M3U file
    fetch(m3uUrl)
        .then(response => response.text())
        .then(data => {
            let lines = data.split("\n");
            let streams = [];
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith("#EXTINF")) {
                    let title = lines[i].split(",")[1]; // Extract stream title
                    let url = lines[i + 1]?.trim(); // The next line is the stream URL
                    if (url) {
                        streams.push({ title, url });
                    }
                }
            }

            if (streams.length === 0) {
                console.error("No valid streams found.");
                return;
            }

            // Create buttons for each stream
            streams.forEach((stream, index) => {
                let button = document.createElement("button");
                button.textContent = stream.title || `Stream ${index + 1}`;
                button.onclick = () => playStream(stream.url);
                streamList.appendChild(button);
            });

            // Auto-play the first stream
            playStream(streams[0].url);
        })
        .catch(error => console.error("Error fetching M3U:", error));

    // Function to play a selected stream
    function playStream(url) {
        console.log("Playing:", url);

        if (Hls.isSupported()) {
            let hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                videoElement.play();
            });
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
            videoElement.src = url;
            videoElement.play();
        } else {
            console.error("HLS is not supported on this device.");
        }
    }
});
