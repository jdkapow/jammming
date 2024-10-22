import SearchBar from '../SearchBar/SearchBar';
import Tracklist from '../Tracklist/Tracklist'

const SearchResults = ( {tracklist, onSubmitForm, onAddTrack}) => {

  return (
    <div>
      <div className="bar">
        <SearchBar onSubmitForm={onSubmitForm} />
      </div>
      <div>
        <Tracklist
          tracklist={tracklist}
          buttonText='+'
          onSelectTrack={onAddTrack}
        />
      </div>
    </div>
  );
}

export default SearchResults;