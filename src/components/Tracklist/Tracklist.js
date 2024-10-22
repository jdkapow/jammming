import { useState } from 'react'
import Track from '../Track/Track'

const Tracklist = ( {tracklist, onSelectTrack, buttonText}) => {

  return (
    <div>
      {tracklist.map((track) => (
          <Track 
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