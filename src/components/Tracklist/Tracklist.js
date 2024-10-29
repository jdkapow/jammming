import Track from '../Track/Track'

const Tracklist = ( {originalTracklist, tracklist, onSelectTrack, buttonText}) => {

  //if the user has added but not yet saved a track to a playlist,
  //we want it to be in a different color, so we flag it as an "added track"
  const isAddedTrack = (playlistTrack) => {
    const inOriginal = originalTracklist.filter(originalTrack => (originalTrack.uri === playlistTrack.uri));
    return (inOriginal.length === 0 ? "true" : "false");
  }

  return (
    <div>
      {tracklist.map((track) => (
          <Track 
            key={track.id}
            id={track.id}
            track={track}
            isNewTrack={isAddedTrack(track)}
            buttonText={buttonText}
            onSelectTrack={onSelectTrack} 
          />
      ))}
    </div>
  );
}

export default Tracklist;