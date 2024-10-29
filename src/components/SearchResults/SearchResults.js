import SearchBar from '../SearchBar/SearchBar';
import Tracklist from '../Tracklist/Tracklist'

const SearchResults = ( {tracklist, userData, onSubmitForm, onAddTrack}) => {

  return (
    <div>
      <div className="bar">
        <SearchBar userData={userData} onSubmitForm={onSubmitForm} />
      </div>
      <div>
        <Tracklist
          originalTracklist={[]}
          tracklist={tracklist}
          buttonText='+'
          onSelectTrack={onAddTrack}
        />
      </div>
    </div>
  );
}

export default SearchResults;