/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code with PKCE oAuth2 flow to authenticate 
 * against the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

const clientId = '5c2b34cf2dd7416795d0c1851fd57ac6'; // your clientId
const redirectUrl = 'https://jdkapow.github.io/jammming' //'http://localhost:3000/'; //


const blankPlaylistsObject = {
  page:1,
  count:0,
  items:[]
}

//generic endpoints
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const searchEndpoint = "https://api.spotify.com/v1/search";
const playlistEndpoint = 'https://api.spotify.com/v1/me/playlists';

let playlistPage;

const scope = 'playlist-modify-public';

// Data structure that manages the current active token, caching it in localStorage
const currentToken = {
  get access_token() { return localStorage.getItem('access_token') || null; },
  get refresh_token() { return localStorage.getItem('refresh_token') || null; },
  get expires() { return localStorage.getItem('expires') || null },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_in', expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + (expires_in * 1000));
    localStorage.setItem('expires', expiry);
  }
};

const SpotifyManager = {
  // fetch auth code from current browser search URL
  async getInitialAuthorization() {

    /*localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh_in');
    localStorage.removeItem('expires');*/

    const args = new URLSearchParams(window.location.search);
    const code = args.get('code');

    // If we find a code, we're in a callback, do a token exchange
    if (code) {
      const token = await this.getToken(code);
      currentToken.save(token);

      // Remove code from URL so we can refresh correctly.
      const url = new URL(window.location.href);
      url.searchParams.delete("code");

      const updatedUrl = url.search ? url.href : url.href.replace('?', '');
      window.history.replaceState({}, document.title, updatedUrl);
    }

    // If we have a token, we're logged in
    if (currentToken.access_token) {
      
      //check if our token has timed out
        const now = new Date();
        const currentTime = new Date(now.getTime());
        const expireTime = new Date(currentToken.expires);
        if (currentTime > expireTime) {
          const refreshedToken = await this.refreshToken();
          currentToken.save(refreshedToken);
        };

      return await this.getUserData().catch(this.logout);
    } else { // Otherwise we're not logged in, so return null
      return null;
    }
  },

  async redirectToSpotifyAuthorize() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
  
    const code_verifier = randomString;
    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);
  
    const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  
    window.localStorage.setItem('code_verifier', code_verifier);
  
    const authUrl = new URL(authorizationEndpoint)
    const params = {
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      code_challenge_method: 'S256',
      code_challenge: code_challenge_base64,
      redirect_uri: redirectUrl,
    };
  
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
  },

  // Soptify API Calls
  async getToken(code) {
    const code_verifier = localStorage.getItem('code_verifier');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
    });

    return await response.json();
  },

  async refreshToken() {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: currentToken.refresh_token
      }),
    });   

    return await response.json();
  },

  async getUserData() {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
    });

    return await response.json();
  },

  async logout() {
    localStorage.clear();
    window.location.href = redirectUrl;
    return null;
  },

  getPlaylists(userData, newPage) {
    if (userData === null) {
      return blankPlaylistsObject;
    }
    const accessToken = currentToken.access_token;
    playlistPage = (newPage || playlistPage || 1);
    const playlistDisplayLimit = 10; //change the display limit here
    const queryText = '?limit=' + playlistDisplayLimit + '&offset=' + (playlistPage - 1) * playlistDisplayLimit;
    return fetch(playlistEndpoint + queryText, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse) {
        return blankPlaylistsObject;
      };
      if (jsonResponse.total === 0) {
        return blankPlaylistsObject;
      }
      const playlistCount = jsonResponse.total;
      const items = jsonResponse.items.map(list => ({
        name:list.name,
        id:list.id,
        trackCount:list.tracks.total,
        trackList:[]
      }));
      return {
        page: playlistPage,
        count: playlistCount,
        items: items
      };
    });
  },

  getPlaylist(playlistId) {
    const playlistEndpoint = 'https://api.spotify.com/v1/playlists/' + playlistId;
    const accessToken = currentToken.access_token;
    return fetch(playlistEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse) {
        return [];
      };
      const tracks = jsonResponse.tracks.items.map(item => ({
        title: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        id: item.track.id,
        uri: item.track.uri,
        inPlaylist: "true"
      }));
      return {
        name: jsonResponse.name,
        id: jsonResponse.id,
        snapshotId: jsonResponse.snapshot_id,
        tracks: tracks
      };
    });
  },

  search(searchTerm, playlist) {
    const searchAccessToken = currentToken.access_token;
    var queryText = "?q=" + searchTerm + "&type=track&limit=50"; //change the number of results here
    return fetch(searchEndpoint + queryText, {
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
    const userIdEndpoint = 'https://api.spotify.com/v1/me'
    const saveAccessToken = currentToken.access_token;
    const headers = { Authorization: `Bearer ${saveAccessToken}` };
    let userId;
    
    return fetch(userIdEndpoint, {
        headers: headers
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
        const playlistId = jsonResponse.id;
        const addToPlaylistEndPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        return fetch(addToPlaylistEndPoint, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify(playlistUris)
        }).then(() => {return playlistId});
      });
  },

  renamePlaylist(playlistId, newPlaylistName) {
    const accessToken = currentToken.access_token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const changeNameEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}`
    return fetch(changeNameEndpoint, {
      headers: headers,
      method: 'PUT',
      body: JSON.stringify({name:newPlaylistName})
    });
  },

  replacePlaylistTracks(playlistId, newPlaylistUris) {
    const accessToken = currentToken.access_token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const replaceTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    return fetch(replaceTracksEndpoint, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(newPlaylistUris)
    });
  },

  removePlaylistTracks(playlistId, snapshotId, removeTrackUris) {
    const accessToken = currentToken.access_token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const removeTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const uriObjects = removeTrackUris.map((removeUri) => ({uri:removeUri}));
    const body = {
      tracks: uriObjects,
      snapshot_id:snapshotId
    };
    console.log(body);
    return fetch(removeTracksEndpoint, {
      headers:headers,
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  },

  addPlaylistTracks(playlistId, addTrackUris) {
    const accessToken = currentToken.access_token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const addTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const body = {
      uris:addTrackUris,
      position:0
    };
    return fetch(addTracksEndpoint, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(body)
    })
  }
}

export default SpotifyManager;
