import { useState, useEffect, useCallback } from 'react';
import './App.css';
import SearchResults from '../SearchResults/SearchResults'
import PlaylistManager from '../PlaylistManager/PlaylistManager';
import SpotifyManager from '../../util/SpotifyManager';

let userData = await SpotifyManager.getInitialAuthorization();
let existingPlaylists = await SpotifyManager.getPlaylists(userData);
console.log(existingPlaylists);

function App() {

  const blankPlaylist = {
    name: "",
    id:"",
    tracks: []
  };
  
  const [tracklist, setTracklist] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(blankPlaylist);

  useEffect(() => {
    if(tracklist.length > 0) {
      let changesMade = false;
      let newTracklist = [];
      for (let i = 0; i < tracklist.length; i++) {
        let testTrack = tracklist[i];
        const inList = selectedPlaylist.filter(track => (track.uri === testTrack.uri));
        if (inList.length > 0) {
          if (testTrack.inPlaylist === "false") {changesMade = true};
          testTrack.inPlaylist = "true";
        }
        newTracklist.push(testTrack);
      };
      if (changesMade) {setTracklist(newTracklist);}
    }
  },[tracklist, selectedPlaylist])

  //helper function to get a track from its uri
  const trackFromUri = (trackUri, searchlist) => {
    return searchlist.find(obj => obj.uri === trackUri);
  }

  const doSearch = useCallback((term) => {
    SpotifyManager.search(term).then(setTracklist);
  },[]);

  /*const getPlaylists = useCallback(() => {
    SpotifyManager.getPlaylists();
    alert(playlists.count)
  },[]);*/

  const onSelectPlaylistHandler = (playlistId) => {

  }

  const onAddTrackHandler = (trackUri) => {
    const newTrack = trackFromUri(trackUri, tracklist);
    if (trackFromUri(trackUri,selectedPlaylist) === undefined) {
      newTrack.inPlaylist = "true";
      setSelectedPlaylist(tracks => [...tracks, newTrack]);
    };
  };

  const onRemoveTrackHandler = (trackUri) => {
    const trackInTracklist = trackFromUri(trackUri, tracklist)
    if (trackInTracklist !== undefined) {trackInTracklist.inPlaylist = "false"}; //this is a mutation, so slightly less than desirable
    setSelectedPlaylist(tracks => tracks.filter(track => !(track.uri === trackUri)));
  };

  async function onSavePlaylistHandler(playlistName) {
    const playlistUris = selectedPlaylist.map(track => track.uri);
    SpotifyManager.savePlaylist(playlistName, playlistUris);
    //clear playlist--do it by removing each individual track so the tracklist resets its 'inPlaylist' value appropriately
    selectedPlaylist.forEach((track) => onRemoveTrackHandler(track.uri));
    existingPlaylists = await SpotifyManager.getPlaylists(userData);
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
          <h3>Manage Your Playlists</h3>   
          <div className="list-container playlist-container">
            <PlaylistManager existingPlaylists={existingPlaylists} selectedPlaylist={selectedPlaylist} 
                              onSelectPlaylist={onSelectPlaylistHandler} onRemoveTrack={onRemoveTrackHandler} onSavePlaylist={onSavePlaylistHandler}/>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
