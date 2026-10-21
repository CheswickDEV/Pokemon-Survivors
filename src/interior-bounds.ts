// Visible sprite frames and authored solid bases, relative to their bottom centre.
// Cropping is performed by the renderer, preserving the original source PNGs.
export interface RoomPropArt {asset:string;crop:[number,number,number,number];width:number;height:number;footprint:{x:number;y:number;width:number;height:number};splitY?:number}
const art=(asset:string,crop:[number,number,number,number],foot:[number,number,number,number]):RoomPropArt=>({asset,crop,width:crop[2],height:crop[3],footprint:{x:foot[0],y:foot[1],width:foot[2],height:foot[3]}});
export const ROOM_PROP_BOUNDS:Record<string,RoomPropArt>={
 // Complete original service bay including the rear wall and work-floor layer.
 // The counter is the final 16 px row; the solid bay keeps visitors in the lobby.
 'healing-machine':{...art('center-reception',[0,0,112,64],[-56,-48,112,48]),splitY:48},
 counter:art('market-counter',[0,12,48,20],[-24,-14,48,14]),
 shelf:art('market-shelf',[0,0,48,24],[-24,-12,48,12]),
 console:art('lab-console',[0,9,32,39],[-14,-14,28,14]),
 bookshelf:art('bookshelf',[0,11,32,29],[-16,-14,32,14]),
 table:art('home-table',[0,0,64,32],[-32,-24,64,24]),
 bed:art('bed',[12,7,25,25],[-12.5,-23,25,23]),
 plant:art('plant',[0,4,16,28],[-6,-8,12,8]),
 statue:art('gym-statue',[0,0,16,32],[-7,-14,14,14]),
 bench:art('home-table',[0,0,64,32],[-32,-24,64,24]),
 'lab-table':art('table',[0,3,48,25],[-24,-14,48,14]),
 bicycle:art('bicycle',[0,0,48,32],[-22,-10,44,10]),
 rock:art('rock',[0,0,16,16],[-7,-9,14,9]),
};
