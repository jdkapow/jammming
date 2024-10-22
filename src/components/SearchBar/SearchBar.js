import { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ( {onSubmitForm} ) => {
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
      <label for="search">Enter Search Term:</label>
      <input type="text" id="search" value={text} onChange={handleChange} className={styles.input}></input>
      <button type="submit" className={styles.button}>Search</button>
    </form>
  );
};




export default SearchBar;