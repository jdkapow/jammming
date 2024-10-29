import styles from './PlaylistItem.module.css';

const PlaylistItem = (props) => {
  const {id, name, onSelectPlaylist, isSelected} = props;

  const handleClick = (e) => {
    onSelectPlaylist(e.target.id);
  }

  return (
    <li id={id} 
      style={isSelected === "true" ? {fontWeight:"bold"} : {}}
      onClick={handleClick}
      className={styles.li}>
        {name.length < 17 ? name : name.substring(0,16) + "..."}
    </li>
  );
};

export default PlaylistItem;