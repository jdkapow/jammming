import styles from './PlaylistManager.module.css';
import ExistingPlaylists from '../ExistingPlaylists/ExistingPlaylists';
import PlaylistEditor from '../PlaylistEditor/PlaylistEditor';

const PlaylistManager = (props) => {
  const {existingPlaylistPage, existingPlaylistCount, existingPlaylistItems, onChangePlaylistPage} = props;
  const {selectedPlaylistId, selectedPlaylistName, newPlaylistName} = props;
  const {selectedPlaylistOriginalTracks, selectedPlaylistTracks} = props;
  const {onBeginNewPlaylist, onSelectPlaylist, onChangePlaylistName, onRemoveTrack, onSavePlaylist} = props;

  return (
    <div className={styles["playlist-section"]}>
      <div className={styles["existing-playlist-section"]}
            style={selectedPlaylistId==='' ? {borderRight:"none"} : {}}>
        <ExistingPlaylists existingPlaylistPage={existingPlaylistPage} 
                            existingPlaylistCount={existingPlaylistCount}
                            existingPlaylistItems={existingPlaylistItems}
                            selectedPlaylistId={selectedPlaylistId} 
                            onChangePlaylistPage={onChangePlaylistPage}
                            onBeginNewPlaylist={onBeginNewPlaylist}
                            onSelectPlaylist={onSelectPlaylist}/>
      </div>
      <div className={styles["edit-playlist-section"]}
            style={selectedPlaylistId==='' ? {display:"none"} : {}}>
        <PlaylistEditor id={selectedPlaylistId} 
                        oldName={selectedPlaylistName}
                        name={newPlaylistName}
                        originalTracks={selectedPlaylistOriginalTracks}
                        tracks={selectedPlaylistTracks}
                        onChangePlaylistName={onChangePlaylistName}
                        onRemoveTrack={onRemoveTrack} 
                        onSavePlaylist={onSavePlaylist}/>
      </div>
    </div>
  )
};

export default PlaylistManager;