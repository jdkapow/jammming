import styles from './ExistingPlaylists.module.css';
import PlaylistItem from '../PlaylistItem/PlaylistItem';

const ExistingPlaylists = (props) => {
  const {existingPlaylistPage, existingPlaylistCount, existingPlaylistItems} = props;
  const {selectedPlaylistId, onChangePlaylistPage, onBeginNewPlaylist, onSelectPlaylist} = props;

  const handleClick = (e) => {
    e.preventDefault();
    onBeginNewPlaylist();
  }

  const handlePageChange = (e) => {
    const pageText = e.target.innerText;
    if (pageText === 'Prev') {
      onChangePlaylistPage(existingPlaylistPage - 1);
    } else {
      if (pageText === 'Next') {
        onChangePlaylistPage(existingPlaylistPage + 1);
      } else {
        onChangePlaylistPage(Number(pageText));
      }
    }
  }

  const listsPerPage = 10; //needs to match number set in SpotifyManager

  const pageSelector = () => {
    let maxPage;
    if(existingPlaylistCount === 0) {
      maxPage = 0;
    } else {
      maxPage = Math.floor((existingPlaylistCount-1) / listsPerPage);
    }
    const pageSelectorArray = [];
    if (existingPlaylistPage > 1) {pageSelectorArray.push(['Prev'])};
    for (let i=0; i <= maxPage; i++) {
      if(existingPlaylistPage === maxPage + 1 && i === maxPage) {
        pageSelectorArray.push([i+1])
      } else {
        pageSelectorArray.push([i+1]);
      }
    };
    if (existingPlaylistPage < maxPage + 1) {pageSelectorArray.push(['Next'])};
    return (
      <ul className={styles["page-list"]}>
        {pageSelectorArray.map((page) => (
          <li 
              key={page}
              onClick={handlePageChange}
              className={Number(page) === existingPlaylistPage ? styles["page-current"] : styles["page-other"]}>{page}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className={styles["existing-playlist-section"]}>
      <div className={styles["existing-playlist-header"]}>
        <h4 className={styles.h4}>Playlists</h4>
        <button onClick={handleClick} className={styles.button}>+</button>
      </div>
      <div>
        {pageSelector()}
      </div>
      <br />
      <ul className={styles["existing-playlist-list"]}>
        {existingPlaylistItems.map((list) => (
            <PlaylistItem 
              key={list.id}
              id={list.id}
              name={list.name}
              onSelectPlaylist={onSelectPlaylist}
              isSelected={list.id === selectedPlaylistId ? "true" : "false"}
            />
        ))}
      </ul>
  </div>
  );

};

export default ExistingPlaylists;
