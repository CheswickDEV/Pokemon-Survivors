export const DIFFICULTIES = [
 {id:'relaxed',name:'Entspannt',description:'Zum Erkunden. Weniger Gegner und mehr Zeit zum Ausweichen.',hp:.75,damage:.65,speed:.9,spawn:.8,warning:1.25,cadence:1.15,reward:.9},
 {id:'standard',name:'Standard',description:'Die vorgesehene Herausforderung. Bewegung und Teamaufbau entscheiden.',hp:1,damage:1,speed:1,spawn:1,warning:1,cadence:1,reward:1},
 {id:'veteran',name:'Veteran',description:'Dichtere Wellen, zähere Gegner und schnellere Bossangriffe. +20 % Münzen aus Sonderbelohnungen.',hp:1.3,damage:1.25,speed:1.1,spawn:1.25,warning:.9,cadence:.9,reward:1.2},
 {id:'master',name:'Meister',description:'Für eingespielte Teams. Hoher Druck, kurze Warnzeiten. +40 % Münzen aus Sonderbelohnungen.',hp:1.65,damage:1.5,speed:1.2,spawn:1.5,warning:.8,cadence:.8,reward:1.4}
] as const;
export type Difficulty = typeof DIFFICULTIES[number]['id'];
export const difficulty = (s:{difficulty?:Difficulty})=>DIFFICULTIES.find(d=>d.id===s.difficulty)??DIFFICULTIES[1];
export const isDifficulty=(v:unknown):v is Difficulty=>DIFFICULTIES.some(d=>d.id===v);
