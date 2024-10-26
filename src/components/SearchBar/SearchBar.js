import { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ( {userData, onSubmitForm} ) => {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmitForm(text);
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <input type="text" id="search" value={text} onChange={handleChange} className={styles.input} 
            placeholder={userData === null ? "Login to Search" : "Enter Search Term"}
            style={userData === null ? {backgroundColor:"pink", pointerEvents:"none"} : {}}></input>
      <button type="submit" style={userData === null ? {display:"none"} : {}} className={styles["button-large"]}>Search</button>
      <button type="submit" style={userData === null ? {display:"none"} : {}} className={styles["button-small"]}>?</button>
    </form>
  );
};




export default SearchBar;