

ports = [ 50000, 50001, 50002, 50003, 50004, 50005, 50006, 50007,
    50008, 50009, 50010, 50011, 50012, 50013, 50014, 50015,
    50016, 50017, 50018, 50019, 50020, 50021, 50022, 50023,
    50024, 50025, 50026, 50027, 50028, 50029, 50030, 50031,
    50032, 50033, 50034, 50035, 50036, 50037, 50038, 50039,
    50040, 50041, 50042, 50043, 50044, 50045, 50046, 50047,
    50048, 50049, 50050, 50051, 50052, 50053, 50054, 50055]

available_ports = [ 50000, 50001, 50002, 50003, 50004, 50005, 50006, 50007,50008, 50009, 50010, 50011, 50012, 50013, 50014, 50015,
    50016, 50017, 50018, 50019, 50020, 50021, 50022, 50023,
    50024, 50025, 50026, 50027, 50028, 50029, 50030, 50031,
    50032, 50033, 50034, 50035, 50036, 50037, 50038, 50039,
    50040, 50041, 50042, 50043, 50044, 50045, 50046, 50047,
    50048, 50049, 50050, 50051, 50052, 50053, 50054, 50055]

used_ports = []

exports.getPort = () => {
    if (available_ports.length > 0) {
        const port = available_ports[0]
        available_ports.splice(0 , 1);
        used_ports.push(port)
        return port;
    }
}

exports.releasePort = (port) => {
    if(used_ports.includes(port)){
        const index = used_ports.indexOf(port);
        if (index !== -1) {
            used_ports.splice(index, 1);
        }
        available_ports.push(port)
    }
    
}


exports.engagePort = (port) => {
    
    if  (available_ports.indexOf(port) > -1){
        let index = available_ports.indexOf(port);
        available_ports.splice(index, 1)
        used_ports.push(port)
    }
    
}