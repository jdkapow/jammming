import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import SearchResults from '../SearchResults/SearchResults'
import PlaylistManager from '../PlaylistManager/PlaylistManager';
import SpotifyManager from '../../util/SpotifyManager';

let userData;
try {
  userData = await SpotifyManager.getInitialAuthorization();
} catch (error) {
  userData = null;
}
console.log(userData);
let initialPlaylists = await SpotifyManager.getPlaylists(userData,1);
console.log(initialPlaylists);

function App() {
  const [searchTracklist, setSearchTracklist] = useState([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylistOriginalTracks, setSelectedPlaylistOriginalTracks] = useState([]);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]); 
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [selectedPlaylistSnapshotId, setSelectedPlaylistSnapshotId] = useState('');
  const [existingPlaylistItems, setExistingPlaylistItems] = useState(initialPlaylists.items);
  const [existingPlaylistCount, setExistingPlaylistCount] = useState(initialPlaylists.count);
  const [existingPlaylistPage, setExistingPlaylistPage] = useState(initialPlaylists.page);

  useEffect(() => {
    if(searchTracklist.length > 0) {
      let changesMade = false;
      let newTracklist = [];
      for (let i = 0; i < searchTracklist.length; i++) {
        let testTrack = ({...searchTracklist[i]});
        const inList = selectedPlaylistTracks.filter(track => (track.uri === testTrack.uri));
        if (inList.length > 0) {
          if (testTrack.inPlaylist === "false") {changesMade = true};
          testTrack.inPlaylist = "true";
        } else {
          if (testTrack.inPlaylist === "true") {changesMade = true};
          testTrack.inPlaylist = "false";
        }
        newTracklist.push(testTrack);
      };
      if (changesMade) {setSearchTracklist(newTracklist);}
    }
  },[searchTracklist, selectedPlaylistTracks])

  //helper function to return a clone of a track object
  //and set the "inPlaylist" flag
  const cloneTrack = (oldTrack, inPlaylist) => {
    const newTrack = {
      title: oldTrack.title,
      artist: oldTrack.artist,
      album: oldTrack.album,
      id: oldTrack.id,
      uri: oldTrack.uri,
      inPlaylist: inPlaylist
    }
    return newTrack;
  }

  //helper function to get a track from its uri
  const trackFromUri = (trackUri, tracklist) => {
    return tracklist.find(obj => obj.uri === trackUri);
  }

  //helper function to store playlist data after getting the list
  const storePlaylists = (playlists) => {
    setExistingPlaylistItems(playlists.items);
    setExistingPlaylistCount(playlists.count);
    setExistingPlaylistPage(playlists.page);
  }

  //function to confirm playlist update after changing it
  const waitForPlaylistUpdate = (playlistId, trackCount, playlistName) => {
    SpotifyManager.getPlaylist(playlistId).then(playlist => {
      console.log(`${playlist.name}   ${playlistName}`);
      if(playlist.name !== playlistName || 
        playlist.tracks === undefined || 
        playlist.tracks.items === undefined || 
        playlist.tracks.items.length !== trackCount) {
        waitForPlaylistUpdate(playlistId, trackCount, playlistName);
      };
    });
  }

  const doSearch = useCallback((term) => {
    SpotifyManager.search(term).then(setSearchTracklist);
  },[]);

  const getPlaylists = useCallback((page) => {
    SpotifyManager.getPlaylists(userData, page).then(storePlaylists);
  },[]);

  const clearSelectedPlaylist = () => {
    setSelectedPlaylistName('');
    setNewPlaylistName('');
    setSelectedPlaylistOriginalTracks([]);
    setSelectedPlaylistTracks([]);
    setSelectedPlaylistId('new');
    setSelectedPlaylistSnapshotId('');
  }

  const onSelectPlaylistHandler = (playlistId) => {
    if(playlistId==='' || playlistId==='new') {
      clearSelectedPlaylist();
    } else {
      SpotifyManager.getPlaylist(playlistId).then(selectedPlaylist => {
        console.log(selectedPlaylist);
        setSelectedPlaylistName(selectedPlaylist.name);
        setNewPlaylistName(selectedPlaylist.name);
        setSelectedPlaylistOriginalTracks(selectedPlaylist.tracks);
        setSelectedPlaylistTracks(selectedPlaylist.tracks);
        setSelectedPlaylistId(playlistId);
        setSelectedPlaylistSnapshotId(selectedPlaylist.snapshotId);
      });
    }
  };

  const onChangePlaylistPageHandler = (newPage) => {
    getPlaylists(newPage);
  }

  const onBeginNewPlaylistHandler = () => {
    setSelectedPlaylistName('');
    setNewPlaylistName('');
    setSelectedPlaylistOriginalTracks([]);
    setSelectedPlaylistTracks([]);
    setSelectedPlaylistId('new');
    setSelectedPlaylistSnapshotId('');
  }

  const onAddTrackHandler = (trackUri) => {
    //if the user hasn't selected a playlist or clicked the new playlist
    //button, we will do it for them
    if(selectedPlaylistId === '') {onBeginNewPlaylistHandler()};
    const newTrack = trackFromUri(trackUri, searchTracklist);
    if (trackFromUri(trackUri,selectedPlaylistTracks) === undefined) {
      newTrack.inPlaylist = "true";
      setSelectedPlaylistTracks(tracks => [newTrack, ...tracks]);
    };
  };

  const onChangePlaylistNameHandler = (playlistName) => {
    setNewPlaylistName(playlistName);
  }

  const onRemoveTrackHandler = (trackUri) => {
    if (trackFromUri(trackUri, selectedPlaylistTracks) !== undefined) {
      const replacementTracklist = [];
      for (let i=0; i<searchTracklist.length; i++) {
        const oldTrack = searchTracklist[i];
        const replacementTrack = cloneTrack(oldTrack, (oldTrack.uri === trackUri ? "false" : oldTrack.inPlaylist));
        replacementTracklist.push(replacementTrack);
      }
      setSearchTracklist(replacementTracklist);
    };
    setSelectedPlaylistTracks(tracks => tracks.filter(track => !(track.uri === trackUri)));
  };

  const onSavePlaylistHandler = () => {
    //get the uris of the tracks to go in the playlist
    const playlistUris = selectedPlaylistTracks.map(track => track.uri);
    const originalPlaylistUris = selectedPlaylistOriginalTracks.map(track => track.uri);
    const currentPlaylistId = selectedPlaylistId;

    //if this is a new playlist, we create it and save the tracks in one step
    if (selectedPlaylistId === "new") {
      SpotifyManager.savePlaylist(newPlaylistName, playlistUris).then((newListId) => {
        //now we need to reload the list of tracklists
        //and select the one we just saved
        getPlaylists(1);
        onSelectPlaylistHandler(newListId);
      });
    } else {
      //it's an existing playlist, so we update the tracks
      //first we remove all the existing tracks
      SpotifyManager.removePlaylistTracks(selectedPlaylistId, selectedPlaylistSnapshotId, originalPlaylistUris)
      .then(() => {SpotifyManager.addPlaylistTracks(selectedPlaylistId, playlistUris)})
      .then(() => {if (selectedPlaylistName !== newPlaylistName) {
        console.log(`made it to the rename! ${newPlaylistName}`);
        SpotifyManager.renamePlaylist(selectedPlaylistId, newPlaylistName);
      }}).then(() => {
        //now we need to reload the list of tracklists
        //and select the one we just saved
        waitForPlaylistUpdate(currentPlaylistId, playlistUris.length, newPlaylistName);
        getPlaylists(existingPlaylistPage);
        onSelectPlaylistHandler(currentPlaylistId);
      });
    };
  };

  async function handleLoginClick() {
    await SpotifyManager.redirectToSpotifyAuthorize();
    doSearch('');
    getPlaylists(1);
  }

  async function handleLogoutClick() {
    await SpotifyManager.logout();
  }

  return (
    <div className={styles.app}>
      <header className={styles["header-extended"]}>
        <div className={styles["header-main"]}>
          <div className={styles["jgt-logo"]}>
            <h1 className={`${styles["h1-big"]} ${styles["h1"]}`}>Jim's Giant Jammming</h1>
            <h1 className={`${styles["h1-small"]} ${styles["h1"]}`}>Jammming for Spotify</h1>
            <h2 className={styles.h2}>Tool for Creating and Exporting Spotify Playlists</h2>
          </div>
          <div className={styles["user-info-container"]}>
            <p className={styles["user-display-name"]}>{userData === null ? '' : userData.display_name}</p>
            <button id="login" 
                    className={`${styles["user-button"]} ${styles.login}`} 
                    onClick={handleLoginClick} 
                    style={userData === null ? {} : {display:"none"}}>Login</button>
            <button className={`${styles["user-button"]} ${styles.logout}`} 
                    onClick={handleLogoutClick} 
                    style={userData === null ? {display:"none"} : {}}>Logout</button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles["section-container"]}>
          <h3 className={styles.h3}>Search and Select Tracks</h3>
          <div className={styles["tracklist-container"]}>
            <SearchResults tracklist={searchTracklist} 
                            userData={userData} 
                            onSubmitForm={doSearch} 
                            onAddTrack={onAddTrackHandler}/>
          </div>
        </div>
        <div className={styles["section-container"]}>  
          <h3 className={styles.h3}>Manage Your Playlists</h3>   
          <div className={styles["playlist-container"]}>
            <PlaylistManager existingPlaylistItems={existingPlaylistItems} 
                              existingPlaylistPage={existingPlaylistPage}
                              existingPlaylistCount={existingPlaylistCount}
                              selectedPlaylistId={selectedPlaylistId} 
                              selectedPlaylistName={selectedPlaylistName}
                              selectedPlaylistOriginalTracks={selectedPlaylistOriginalTracks}
                              selectedPlaylistTracks={selectedPlaylistTracks}
                              newPlaylistName={newPlaylistName}
                              onChangePlaylistPage={onChangePlaylistPageHandler}
                              onBeginNewPlaylist={onBeginNewPlaylistHandler}
                              onSelectPlaylist={onSelectPlaylistHandler} 
                              onChangePlaylistName={onChangePlaylistNameHandler}
                              onRemoveTrack={onRemoveTrackHandler} 
                              onSavePlaylist={onSavePlaylistHandler}/>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
