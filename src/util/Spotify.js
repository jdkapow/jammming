const clientId = '5c2b34cf2dd7416795d0c1851fd57ac6'; // Insert client ID here.
const redirectUri = 'https://jdkapow.github.io/jammming'; // Have to add this to your accepted Spotify redirect URIs on the Spotify API.
let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/'); // This clears the parameters, allowing us to grab a new access token when it expires.
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  search(searchTerm, playlist) {
    const searchAccessToken = Spotify.getAccessToken();
    const endPoint = "https://api.spotify.com/v1/search";
    var queryText = "?q=" + searchTerm + "&type=track&limit=50"; //change the number of results here
    return fetch(endPoint + queryText, {
      headers: {
        Authorization: `Bearer ${searchAccessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      };
      return jsonResponse.tracks.items.map(track => ({
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        id: track.id,
        uri: track.uri,
        inPlaylist: "false"
      }));
    });
  },

  savePlaylist(playlistName, playlistUris) {
    if (!playlistName || !playlistUris.length) {
      return;
    }

    const saveAccessToken = Spotify.getAccessToken();
    const userIdEndPoint = "https://api.spotify.com/v1/me";
    const headers = { Authorization: `Bearer ${saveAccessToken}` };
    let userId;
    
    return fetch(userIdEndPoint, {
        headers: {
          Authorization: `Bearer ${saveAccessToken}`
        }
      }).then((response) => {
        return response.json();
      }).then(jsonResponse => {
        userId = jsonResponse.id;
        const createPlaylistEndPoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
        return fetch(createPlaylistEndPoint, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({name:playlistName})
        });
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        const playListId = jsonResponse.id;
        const addToPlaylistEndPoint = `https://api.spotify.com/v1/playlists/${playListId}/tracks`;
        return fetch(addToPlaylistEndPoint, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify(playlistUris)
        });
      });
  }
}


export default Spotify;
