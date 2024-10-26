import { useState } from 'react';
import styles from './PlaylistEditor.module.css';
import Tracklist from '../Tracklist/Tracklist';

const PlaylistEditor = ( {playlist, onRemoveTrack, onSavePlaylist}) => {
  const [playlistName, setPlaylistName] = useState('');

  const handleChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleClickSavePlaylist = (e) => {

  };

  return (
    <div>
      <div className="bar">
        <h4>Playlist X</h4>
        <input type="text" id="playlist-name" value={playlistName} onChange={handleChange} className={styles.input} placeholder="Name Your Playlist"></input>
        <br />
        <button onClick={handleClickSavePlaylist} className={styles.button}>Save Playlist to Spotify</button>
      </div>
      <div>
        <Tracklist
          tracklist={playlist}
          buttonText='-'
          onSelectTrack={onRemoveTrack}
        />
      </div>
    </div>
  );

};

export default PlaylistEditor;