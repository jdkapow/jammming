import { useState, useEffect, useCallback } from 'react';
import './App.css';
import SearchResults from '../SearchResults/SearchResults'
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

function App() {
  
  const [tracklist, setTracklist] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => doSearch(''),[]);

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
    Spotify.search(term).then(setTracklist);
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
    Spotify.savePlaylist(playlistName, playlistUris);
    //clear playlist--do it by removing each individual track so the tracklist resets its 'inPlaylist' value appropriately
    playlist.forEach((track) => onRemoveTrackHandler(track.uri));
    return true;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Jim's Giant Jammming</h1>
        <h2>Tool for Creating and Exporting Spotify Playlists</h2>
      </header>
      <main>
        <div className="list-container tracklist-container">
          <SearchResults tracklist={tracklist} onSubmitForm={doSearch} onAddTrack={onAddTrackHandler}/>
        </div>
        <div className="list-container playlist-container">
          <Playlist playlist={playlist} onRemoveTrack={onRemoveTrackHandler} onSavePlaylist={onSavePlaylistHandler}/>
        </div>
      </main>
    </div>
  );
}

export default App;
