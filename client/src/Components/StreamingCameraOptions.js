import React, { useState } from 'react'
import Multiselect from 'multiselect-react-dropdown';

function StreamingCameraOptions() {
    const [ipcameras, setIpCameras] = useState([{name: 'Camera 1️⃣', id: 1},{name: 'Camera 2️⃣', id: 2}]);
    const [selectedIpCameras, setSelectedIpCameras] = useState([]);

    const onSelect = (selectedList, selectedItem)=>{
        setSelectedIpCameras(camera=>([...camera, selectedItem]));
    }

    const onRemove = (selectedList, removedItem)=>{
        setSelectedIpCameras(camera=>{
            return selectedIpCameras.filter(c=>c.id!==removedItem.id);
        });
    }
    console.log(selectedIpCameras)
  return (
    <div>
        <Multiselect
            options={ipcameras} 
            selectedValues={selectedIpCameras} 
            onSelect={onSelect} 
            onRemove={onRemove} 
            displayValue="name" 
            />
    </div>
  )
}

export default StreamingCameraOptions