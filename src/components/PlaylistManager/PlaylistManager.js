import { useState } from 'react';
import styles from './PlaylistManager.module.css';
import Tracklist from '../Tracklist/Tracklist';
import ExistingPlaylists from '../ExistingPlaylists/ExistingPlaylists';
import PlaylistEditor from '../PlaylistEditor/PlaylistEditor';

const PlaylistManager = ( {existingPlaylists, onRemoveTrack, onSavePlaylist} ) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState({});

  const onSelectPlaylistHandler= (playlist) => {

  };

  const onSavePlaylistHandler = (selectedPlaylist) => {
    if (!(selectedPlaylist.name === '')) {
      const success = onSavePlaylist(selectedPlaylist);
      if (success) {setSelectedPlaylist({})};
    };
  };

  return (
    <div className={styles["playlist-section"]}>
      <div className={styles["existing-playlist-section"]}>
        <ExistingPlaylists playlists={existingPlaylists} onSelectPlaylist={onSelectPlaylistHandler}/>
      </div>
      <div className={styles["edit-playlist-section"]}>
        <PlaylistEditor selectedPlaylist={selectedPlaylist} onRemoveTrack={onRemoveTrack} onSavePlaylist={onSavePlaylistHandler}/>
      </div>
    </div>
  )
};

export default PlaylistManager;