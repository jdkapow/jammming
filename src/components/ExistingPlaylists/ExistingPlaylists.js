import styles from './ExistingPlaylists.module.css';
import PlaylistItem from '../PlaylistItem/PlaylistItem';

const ExistingPlaylists = () => {

const handleClick = (e) => {
  
}

return (
  <div className={styles["existing-playlist-section"]}>
    <h4 className={styles.h4}>Your Playlists</h4>
    <button onClick={handleClick} className={styles.button}>Add</button>
  </div>
);

};

export default ExistingPlaylists;
