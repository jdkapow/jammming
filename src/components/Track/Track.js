import styles from './Track.module.css';

const Track = ({track, isNewTrack, buttonText, onSelectTrack}) => {

  const {uri, title, artist, album, inPlaylist} = track;

  const handleClick = (e) => {
    onSelectTrack(uri);
  }

  const containerClassName1 = styles["track-container"];
  const containerClassName2 = (buttonText === "+" 
                      ? (inPlaylist === "true" ? styles["track-container-selected"] : styles["track-container-add"]) 
                      : (isNewTrack === "true" ? styles["track-container-new"] : styles["track-container-original"]));
  const containerClassNameFull = [containerClassName1, containerClassName2].join(" ");

  return (
    <div className={containerClassNameFull}>
      <div className={styles.info}>
        <h4 className={styles.h4}>{title}</h4>
        <p className={styles.p}>{artist} | {album}</p>
      </div>
      <div className={styles["button-container"]}>
        <button 
          onClick={handleClick} 
          className={styles.button}
          style={(inPlaylist === "true" && buttonText === "+") ? {display:"none"} : {}}>{buttonText}</button>
      </div>
    </div>
  )
}

export default Track;