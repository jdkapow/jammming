import styles from './Track.module.css';

const Track = ({track, buttonText, onSelectTrack}) => {

  const {uri, title, artist, album, inPlaylist} = track;

  const handleClick = (e) => {
    onSelectTrack(uri);
  }

  const containerClassName1 = styles.trackContainer
  const containerClassName2 = (buttonText === "+" 
                              ? (inPlaylist === "true" ? styles.trackContainerSelected : styles.trackContainerAdd) 
                              : styles.trackContainerRemove)
  const containerClassNameFull = [containerClassName1, containerClassName2].join(" ");

  return (
    <div className={containerClassNameFull}>
      <div className={styles.trackInfo}>
        <h3>{title}</h3>
        <p>{artist} | {album}</p>
      </div>
      <div className={styles.trackButton}>
        <button 
          onClick={handleClick} 
          className={styles.button}
          style={(inPlaylist === "true" && buttonText === "+") ? {display:"none"} : {}}>{buttonText}</button>
      </div>
    </div>
  )
}

export default Track;