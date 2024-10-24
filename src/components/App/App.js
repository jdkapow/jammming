import { useState, useEffect, useCallback } from 'react';
import './App.css';
import SearchResults from '../SearchResults/SearchResults'
import Playlist from '../Playlist/Playlist';
import SpotifyManager from '../../util/SpotifyManager';

const userData = await SpotifyManager.getInitialAuthorization();
console.log(userData);

function App() {
  
  const [tracklist, setTracklist] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  /*localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('refresh_in');
  localStorage.removeItem('expires');*/

  //useEffect(() => doSearch(''),[]);

  useEffect(() => {
    if(tracklist.length > 0) {
      let changesMade = false;
      let newTracklist = [];
      for (let i = 0; i < tracklist.length; i++) {
        let testTrack = tracklist[i];
        const inList = playlist.filter(track => (track.uri === testTrack.uri));
        if (inList.length > 0) {
          if (testTrack.inPlaylist === "false") {changesMade = true};
          testTrack.inPlaylist = "true";
        }
        newTracklist.push(testTrack);
      };
      console.log(changesMade);
      if (changesMade) {setTracklist(newTracklist);}
    }
  },[tracklist, playlist])

  //helper function to get a track from its uri
  const trackFromUri = (trackUri, searchlist) => {
    return searchlist.find(obj => obj.uri === trackUri);
  }

  const doSearch = useCallback((term) => {
    SpotifyManager.search(term).then(setTracklist);
  },[]);

  const onAddTrackHandler = (trackUri) => {
    const newTrack = trackFromUri(trackUri, tracklist);
    if (trackFromUri(trackUri,playlist) === undefined) {
      newTrack.inPlaylist = "true";
      setPlaylist(tracks => [...tracks, newTrack]);
    };
  };

  const onRemoveTrackHandler = (trackUri) => {
    const trackInTracklist = trackFromUri(trackUri, tracklist)
    if (trackInTracklist !== undefined) {trackInTracklist.inPlaylist = "false"}; //this is a mutation, so slightly less than desirable
    setPlaylist(tracks => tracks.filter(track => !(track.uri === trackUri)));
  };

  const onSavePlaylistHandler = (playlistName) => {
    const playlistUris = playlist.map(track => track.uri);
    SpotifyManager.savePlaylist(playlistName, playlistUris);
    //clear playlist--do it by removing each individual track so the tracklist resets its 'inPlaylist' value appropriately
    playlist.forEach((track) => onRemoveTrackHandler(track.uri));
    return true;
  };

  async function handleLoginClick() {
    await SpotifyManager.redirectToSpotifyAuthorize();
    doSearch('');
  }

  async function handleLogoutClick() {
    await SpotifyManager.logout();
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo">
          <h1 className="h1-big">Jim's Giant Jammming</h1>
          <h1 className="h1-small">Jammming for Spotify</h1>
          <h2>Tool for Creating and Exporting Spotify Playlists</h2>
        </div>
        <div className="user-info-container">
          <p className="user-display-name">{userData === null ? '' : userData.display_name}</p>
          <button id="login" className = "user-button login" onClick={handleLoginClick} style={userData === null ? {} : {display:"none"}}>Login</button>
          <button className = "user-button logout" onClick={handleLogoutClick} style={userData === null ? {display:"none"} : {}}>Logout</button>
        </div>
      </header>
      <main>
        <div className="section-container">
          <h3>Search and Select Tracks</h3>
          <div className="list-container tracklist-container">
            <SearchResults tracklist={tracklist} userData={userData} onSubmitForm={doSearch} onAddTrack={onAddTrackHandler}/>
          </div>
        </div>
        <div className="section-container">  
          <h3>Build and Save Your Playlist</h3>   
          <div className="list-container playlist-container">
            <Playlist playlist={playlist} onRemoveTrack={onRemoveTrackHandler} onSavePlaylist={onSavePlaylistHandler}/>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
