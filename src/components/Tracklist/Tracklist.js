import Track from '../Track/Track'

const Tracklist = ( {tracklist, onSelectTrack, buttonText}) => {

  return (
    <div>
      {tracklist.map((track) => (
          <Track 
            key={track.id}
            id={track.id}
            track={track}
            buttonText={buttonText}
            onSelectTrack={onSelectTrack} 
          />
      ))}
    </div>
  );
}

export default Tracklist;