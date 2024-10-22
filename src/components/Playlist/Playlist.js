import { useState } from 'react';
import styles from './Playlist.module.css';
import Tracklist from '../Tracklist/Tracklist';

const Playlist = ( {playlist, onRemoveTrack, onSavePlaylist} ) => {
  const [playlistName, setPlaylistName] = useState('');

  const handleChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleClick =(e) => {
    if (!(playlistName === '')) {
      const success = onSavePlaylist(playlistName);
      if (success) {setPlaylistName('')};
    };
  };

  return (
    <div id="playlist-section">
      <div className="bar">
        <label for="playlist-name" className={styles.label}>Playlist Name:</label>
        <input type="text" id="playlist-name" value={playlistName} onChange={handleChange} className={styles.input}></input>
        <br />
        <button onClick={handleClick} style={(!playlist.length || playlistName==='') ? {display:"none"} : {}} className={styles.button}>Save Playlist to Spotify</button>
      </div>
      <div>
        <Tracklist
          tracklist={playlist}
          buttonText='-'
          onSelectTrack={onRemoveTrack}
        />
      </div>
    </div>
  )
};

export default Playlist;