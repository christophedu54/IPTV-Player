document.addEventListener("DOMContentLoaded", function () {
    var videoElement = document.getElementById("videoPlayer");
    var streamList = document.getElementById("streamList");
    var streamTitle = document.getElementById("streamTitle");
    var m3uUrls = [
        "https://iptv-org.github.io/iptv/countries/fr.m3u"  // French Channels
    ];

    let streams = [];

    // Check if a stream works
    function checkStream(url) {
        return new Promise((resolve) => {
            let testVideo = document.createElement("video");
            testVideo.src = url;
            testVideo.onloadeddata = () => resolve(true);
            testVideo.onerror = () => resolve(false);
        });
    }

    // Fetch and filter working streams from multiple M3U lists
    async function loadStreams() {
        for (let m3uUrl of m3uUrls) {
            try {
                let response = await fetch(m3uUrl);
                let data = await response.text();
                let lines = data.split("\n");

                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith("#EXTINF")) {
                        let title = lines[i].split(",")[1]; // Get channel name
                        let url = lines[i + 1]?.trim(); // Get stream URL

                        if (url) {
                            let isValid = await checkStream(url);
                            if (isValid) {
                                streams.push({ title, url });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading M3U:", error);
            }
        }

        if (streams.length === 0) {
            streamList.innerHTML = "<p>No working streams found.</p>";
            return;
        }

        // Add working streams as buttons
        streams.forEach((stream, index) => {
            let button = document.createElement("button");
            button.textContent = stream.title || `Stream ${index + 1}`;
            button.onclick = () => playStream(stream);
            streamList.appendChild(button);
        });

        // Auto-play first valid stream
        playStream(streams[0]);
    }

    // Play selected stream
    function playStream(stream) {
        streamTitle.textContent = stream.title || "Unknown Stream";
        console.log("Playing:", stream.url);

        if (Hls.isSupported()) {
            let hls = new Hls();
            hls.loadSource(stream.url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                videoElement.play();
            });
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
            videoElement.src = stream.url;
            videoElement.play();
        } else {
            console.error("HLS not supported on this device.");
        }
    }

    // Load streams on page load
    loadStreams();
});
