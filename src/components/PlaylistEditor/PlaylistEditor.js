import styles from './PlaylistEditor.module.css';
import Tracklist from '../Tracklist/Tracklist';

const PlaylistEditor = (props) => {
  const {id, name, oldName, tracks, originalTracks, onChangePlaylistName, onRemoveTrack, onSavePlaylist} = props;

  const buttonText = (id==='new' ? "Save Playlist to Spotify" : "Send Updates to Spotify")

  const handleNameChange = (e) => {
    onChangePlaylistName(e.target.value);
  }

  const selectedPlaylistChanged = () => {
    if (tracks === undefined) {
      return false;
    };
    if (tracks.length===0) {
      return false;
    };
    if (tracks.length===0) {
      return false;
    }
    if (name==='') {
      return false;
    };
    if (originalTracks === undefined) {
      return true;
    };
    if (originalTracks.length === 0) {
      return true;
    };
    if (tracks.length === originalTracks.length && name === oldName) {
      return false;
    };
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].uri !== originalTracks[i].uri) {
        return true;
      }
    }
    return false;
  };

  const headerText = () => {
    let playlistName = oldName
    if (id==="new") {
      return "New Playlist";
    }
    if (playlistName.length >= 20) {
      playlistName = playlistName.substring(0,19) + "...";
    }
    return "Edit '" + playlistName + "' Playlist";
  }

  return (
    <div>
      <div style={!id ? {display:"none"} : {}}>
        <h4 className={styles.h4}>{headerText()}</h4>
        <input type="text" id="playlist-name" value={name} onChange={handleNameChange} className={styles.input} placeholder="Name Your Playlist"></input>
        <br />
        <button onClick={onSavePlaylist} 
                className={styles.button}
                style={selectedPlaylistChanged() ? {} : {display:"none"}}>{buttonText}</button>
        <h5 className={styles.h5}
            style={name !== oldName && id !== 'new' ? {} : {display:"none"}}>Name changes take a long time to process at Spotify</h5>
        <p className={styles.p}
            style={tracks.length === 0 ? {} : {display:"none"}}>Add tracks to your new playlist</p>
      </div>
      <div className={styles["track-listing"]}>
        <Tracklist
          originalTracklist={originalTracks}
          tracklist={tracks}
          buttonText='-' // '+' means it's the search tracklist, '-' means it's the playlist tracklist
          onSelectTrack={onRemoveTrack}
        />
      </div>
    </div>
  );

};

export default PlaylistEditor;